"""Image provenance parsing for GigAI Verify — C2PA, EXIF and generator fields.

Reads what a file says about itself. This is the strongest evidence available,
because it is a matter of record rather than of style — with one caveat that is
repeated everywhere it applies:

    WE DETECT A C2PA MANIFEST. WE DO NOT VALIDATE ITS SIGNATURE.

Verifying a Content Credential properly means checking a certificate chain
against the C2PA trust list. Presence is still meaningful, and an unsigned or
tampered manifest is still a fact worth surfacing — but calling an unverified
manifest "verified" would be exactly the overclaim this product exists to avoid.

Mirrors ``GigAI Verify/src/analysis/provenance.ts``; the server path exists
because a browser extension cannot always fetch a cross-origin image, while this
service can (subject to the SSRF guard below).
"""

from __future__ import annotations

import ipaddress
import logging
import re
import socket
import struct
import zlib
from dataclasses import dataclass, field
from typing import Final
from urllib.parse import urlparse

from app.schemas.verify import (
    EvidenceItem,
    EvidenceKind,
    Signal,
    SignalDirection,
    SignalFamily,
)

logger = logging.getLogger("app.services.verify.provenance")

#: Largest image the server will retrieve for parsing.
MAX_IMAGE_BYTES: Final[int] = 24 * 1024 * 1024

FETCH_TIMEOUT_SECONDS: Final[float] = 12.0

# ── EXIF tags we care about ───────────────────────────────────────────────────

_TAG_MAKE: Final[int] = 0x010F
_TAG_MODEL: Final[int] = 0x0110
_TAG_SOFTWARE: Final[int] = 0x0131
_TAG_ARTIST: Final[int] = 0x013B
_TAG_EXIF_IFD: Final[int] = 0x8769
_TAG_DATETIME_ORIGINAL: Final[int] = 0x9003
_TAG_LENS_MODEL: Final[int] = 0xA434
_TAG_EXPOSURE: Final[int] = 0x829A
_TAG_ISO: Final[int] = 0x8827

#: Generative tools, matched in Software / claim-generator / PNG text fields.
AI_TOOL_PATTERNS: Final[tuple[tuple[re.Pattern[str], str], ...]] = (
    (re.compile(r"stable\s?diffusion|automatic1111|comfyui|invokeai", re.I), "Stable Diffusion"),
    (re.compile(r"midjourney", re.I), "Midjourney"),
    (re.compile(r"dall[\s·.-]?e|openai|sora", re.I), "OpenAI"),
    (re.compile(r"adobe\s?firefly|firefly", re.I), "Adobe Firefly"),
    (re.compile(r"imagen|gemini|nano\s?banana", re.I), "Google"),
    (re.compile(r"flux(?:\.\d)?\b|black\s?forest\s?labs", re.I), "FLUX"),
    (re.compile(r"leonardo\.?ai", re.I), "Leonardo.Ai"),
    (re.compile(r"ideogram", re.I), "Ideogram"),
    (re.compile(r"runway(?:ml)?", re.I), "Runway"),
    (re.compile(r"novelai", re.I), "NovelAI"),
    (re.compile(r"grok|\bxai\b", re.I), "xAI"),
)

_GENERATOR_TEXT_KEYS: Final[re.Pattern[str]] = re.compile(
    r"^(parameters|prompt|workflow|sd-metadata|dream|negative_prompt)$", re.I
)

_IPTC_SOURCE_TYPE: Final[re.Pattern[str]] = re.compile(
    r"digitalsourcetype/([a-zA-Z]+)"
    r'|"(trainedAlgorithmicMedia|compositeWithTrainedAlgorithmicMedia|algorithmicMedia|digitalCapture)"'
)


def match_ai_tool(value: str | None) -> str | None:
    if not value:
        return None
    for pattern, name in AI_TOOL_PATTERNS:
        if pattern.search(value):
            return name
    return None


# ── Parsed shapes ─────────────────────────────────────────────────────────────


@dataclass(slots=True)
class Exif:
    make: str | None = None
    model: str | None = None
    software: str | None = None
    artist: str | None = None
    date_time_original: str | None = None
    lens_model: str | None = None
    has_camera_fields: bool = False


@dataclass(slots=True)
class C2pa:
    present: bool = False
    claim_generator: str | None = None
    digital_source_type: str | None = None
    #: Always False here. See the module docstring.
    signature_verified: bool = False


@dataclass(slots=True)
class ImageProvenance:
    image_format: str = "unknown"
    byte_length: int = 0
    exif: Exif = field(default_factory=Exif)
    xmp: str | None = None
    c2pa: C2pa = field(default_factory=C2pa)
    text_fields: dict[str, str] = field(default_factory=dict)


# ── Container walking ─────────────────────────────────────────────────────────


def detect_format(data: bytes) -> str:
    if len(data) < 12:
        return "unknown"
    if data[:2] == b"\xff\xd8":
        return "jpeg"
    if data[1:4] == b"PNG":
        return "png"
    if data[:4] == b"RIFF" and data[8:12] == b"WEBP":
        return "webp"
    if data[:3] == b"GIF":
        return "gif"
    return "unknown"


def _parse_tiff(data: bytes, base: int) -> Exif:
    """Parse a TIFF block. Pointers are relative to ``base`` — the classic
    source of off-by-one bugs in EXIF parsing."""
    exif = Exif()
    if base + 8 > len(data):
        return exif

    order = data[base : base + 2]
    if order == b"II":
        endian = "<"
    elif order == b"MM":
        endian = ">"
    else:
        return exif

    if struct.unpack_from(f"{endian}H", data, base + 2)[0] != 42:
        return exif

    strings: dict[int, str] = {}
    saw_exposure = False

    def read_ifd(offset: int, depth: int) -> None:
        nonlocal saw_exposure
        if depth > 2:
            return
        start = base + offset
        if start + 2 > len(data):
            return

        count = struct.unpack_from(f"{endian}H", data, start)[0]
        if count > 512:  # corrupt pointer
            return

        for index in range(count):
            entry = start + 2 + index * 12
            if entry + 12 > len(data):
                return

            tag, field_type, length = struct.unpack_from(f"{endian}HHI", data, entry)

            if tag == _TAG_EXIF_IFD and field_type in (3, 4):
                read_ifd(struct.unpack_from(f"{endian}I", data, entry + 8)[0], depth + 1)
                continue
            if tag in (_TAG_EXPOSURE, _TAG_ISO):
                saw_exposure = True
                continue
            if field_type != 2 or length == 0 or length > 512:
                continue

            if length <= 4:
                value_offset = entry + 8
            else:
                value_offset = base + struct.unpack_from(f"{endian}I", data, entry + 8)[0]
            if value_offset + length > len(data):
                continue

            raw = data[value_offset : value_offset + length]
            text = raw.split(b"\x00")[0].decode("utf-8", "ignore").strip()
            if text:
                strings[tag] = text

    read_ifd(struct.unpack_from(f"{endian}I", data, base + 4)[0], 0)

    exif.make = strings.get(_TAG_MAKE)
    exif.model = strings.get(_TAG_MODEL)
    exif.software = strings.get(_TAG_SOFTWARE)
    exif.artist = strings.get(_TAG_ARTIST)
    exif.date_time_original = strings.get(_TAG_DATETIME_ORIGINAL)
    exif.lens_model = strings.get(_TAG_LENS_MODEL)
    # Cameras write make+model plus exposure data; generators write neither.
    # Note that platforms strip EXIF on upload, so ABSENCE proves nothing.
    exif.has_camera_fields = bool(
        (exif.make and exif.model)
        or exif.lens_model
        or (saw_exposure and exif.date_time_original)
    )
    return exif


def _walk_jpeg(data: bytes, out: ImageProvenance) -> list[bytes]:
    payloads: list[bytes] = []
    offset = 2
    while offset + 4 <= len(data):
        if data[offset] != 0xFF:
            break
        marker = data[offset + 1]
        if marker in (0xDA, 0xD9):  # start of scan / end of image
            break

        length = struct.unpack_from(">H", data, offset + 2)[0]
        if length < 2:
            break
        start = offset + 4
        size = length - 2
        if start + size > len(data):
            break

        segment = data[start : start + size]
        if marker == 0xE1:
            if segment.startswith(b"Exif\x00\x00"):
                out.exif = _parse_tiff(data, start + 6)
            elif segment.startswith(b"http://ns.adobe.com/xap/1.0/"):
                out.xmp = segment[29:].decode("utf-8", "ignore")
        elif marker == 0xEB and segment[:2] == b"JP":
            # APP11: "JP" + box instance/sequence, then a JUMBF chunk.
            payloads.append(segment[8:])

        offset = start + size
    return payloads


def _walk_png(data: bytes, out: ImageProvenance) -> list[bytes]:
    payloads: list[bytes] = []
    offset = 8  # skip signature
    while offset + 12 <= len(data):
        length = struct.unpack_from(">I", data, offset)[0]
        chunk_type = data[offset + 4 : offset + 8].decode("ascii", "ignore")
        start = offset + 8
        if length > len(data) or start + length > len(data):
            break

        chunk = data[start : start + length]

        if chunk_type == "tEXt" and b"\x00" in chunk:
            key, _, value = chunk.partition(b"\x00")
            out.text_fields[key.decode("latin1")] = value.decode("utf-8", "ignore")
        elif chunk_type == "zTXt" and b"\x00" in chunk:
            key, _, rest = chunk.partition(b"\x00")
            try:
                out.text_fields[key.decode("latin1")] = zlib.decompress(rest[1:]).decode(
                    "utf-8", "ignore"
                )
            except zlib.error:
                pass
        elif chunk_type == "iTXt" and b"\x00" in chunk:
            key, _, rest = chunk.partition(b"\x00")
            compressed = len(rest) > 0 and rest[0] == 1
            # Skip compression method, then language and translated-keyword.
            body = rest[2:]
            for _ in range(2):
                _, _, body = body.partition(b"\x00")
            try:
                text = (zlib.decompress(body) if compressed else body).decode("utf-8", "ignore")
            except zlib.error:
                text = ""
            if text:
                name = key.decode("latin1")
                out.text_fields[name] = text
                if name.lower() == "xml:com.adobe.xmp":
                    out.xmp = text
        elif chunk_type == "eXIf":
            out.exif = _parse_tiff(data, start)
        elif chunk_type == "caBX":
            payloads.append(chunk)
        elif chunk_type == "IEND":
            break

        offset = start + length + 4  # + CRC
    return payloads


def _walk_webp(data: bytes, out: ImageProvenance) -> list[bytes]:
    payloads: list[bytes] = []
    offset = 12
    while offset + 8 <= len(data):
        chunk_type = data[offset : offset + 4].decode("ascii", "ignore")
        length = struct.unpack_from("<I", data, offset + 4)[0]
        start = offset + 8
        if start + length > len(data):
            break

        chunk = data[start : start + length]
        if chunk_type == "EXIF":
            out.exif = _parse_tiff(data, start + 6 if chunk.startswith(b"Exif\x00\x00") else start)
        elif chunk_type == "XMP ":
            out.xmp = chunk.decode("utf-8", "ignore")
        elif chunk_type == "C2PA":
            payloads.append(chunk)

        offset = start + length + (length % 2)  # RIFF pads to even
    return payloads


def _read_c2pa_claims(payload: bytes) -> tuple[str | None, str | None]:
    """Pull readable claims out of a manifest.

    A C2PA manifest is CBOR, but the two fields we surface are CBOR *text*
    strings and so appear verbatim in the bytes. Reading them this way avoids a
    CBOR dependency for two fields, and cannot fabricate a value — absent means
    None.
    """
    text = payload.decode("utf-8", "ignore")

    generator = re.search(r"claim_generator(?:_info)?[\"\s:]*([A-Za-z0-9 ._/-]{3,60})", text)
    if not generator:
        generator = re.search(r'"(?:name|softwareAgent)"[\s:]*"([A-Za-z0-9 ._/-]{3,60})"', text)

    source = _IPTC_SOURCE_TYPE.search(text)
    source_type = (source.group(1) or source.group(2)) if source else None

    return (generator.group(1).strip() if generator else None, source_type)


def parse(data: bytes) -> ImageProvenance:
    """Parse every provenance record readable from an image container."""
    out = ImageProvenance(image_format=detect_format(data), byte_length=len(data))

    try:
        if out.image_format == "jpeg":
            payloads = _walk_jpeg(data, out)
        elif out.image_format == "png":
            payloads = _walk_png(data, out)
        elif out.image_format == "webp":
            payloads = _walk_webp(data, out)
        else:
            payloads = []
    except (struct.error, IndexError, ValueError):
        # A malformed file is normal on the open web: degrade to "unreadable"
        # rather than failing the whole check.
        logger.info("verify: image container could not be parsed")
        payloads = []

    if payloads:
        generator, source_type = _read_c2pa_claims(b"".join(payloads))
        out.c2pa = C2pa(present=True, claim_generator=generator, digital_source_type=source_type)

    if out.c2pa.digital_source_type is None and out.xmp:
        match = _IPTC_SOURCE_TYPE.search(out.xmp)
        if match:
            out.c2pa.digital_source_type = match.group(1) or match.group(2)

    return out


# ── Signals ───────────────────────────────────────────────────────────────────


def _value(label: str, value: str) -> EvidenceItem:
    return EvidenceItem(kind=EvidenceKind.VALUE, label=label, value=value)


def to_signals(prov: ImageProvenance) -> list[Signal]:
    signals: list[Signal] = []
    c2pa, exif = prov.c2pa, prov.exif

    if c2pa.present:
        issued = f" Issued by {c2pa.claim_generator}." if c2pa.claim_generator else ""
        source_type = c2pa.digital_source_type or ""

        if re.search(r"trainedAlgorithmicMedia|algorithmicMedia", source_type, re.I):
            signals.append(
                Signal(
                    id="provenance.c2pa-ai",
                    label="Content Credentials declare AI generation",
                    detail=(
                        f"The image carries a C2PA manifest whose source type is "
                        f"“{source_type}” — the creator declared it as AI-generated.{issued} "
                        "The manifest signature was not cryptographically verified."
                    ),
                    direction=SignalDirection.AI,
                    weight=0.95,
                    family=SignalFamily.PROVENANCE,
                    evidence=[
                        _value("Digital source type", source_type),
                        _value("Signature", "Present, not verified"),
                    ],
                )
            )
        elif re.search(r"digitalCapture", source_type, re.I):
            signals.append(
                Signal(
                    id="provenance.c2pa-camera",
                    label="Content Credentials declare camera capture",
                    detail=(
                        f"The C2PA manifest records this as a digital capture from a "
                        f"camera.{issued} The signature was not cryptographically verified."
                    ),
                    direction=SignalDirection.HUMAN,
                    weight=0.85,
                    family=SignalFamily.PROVENANCE,
                    evidence=[_value("Digital source type", source_type)],
                )
            )
        else:
            signals.append(
                Signal(
                    id="provenance.c2pa-present",
                    label="Content Credentials present",
                    detail=(
                        "The image carries a C2PA manifest, but it does not declare how "
                        f"the image was made.{issued}"
                    ),
                    direction=SignalDirection.NEUTRAL,
                    weight=0.0,
                    family=SignalFamily.PROVENANCE,
                    evidence=[_value("Manifest", "Present, source type not declared")],
                )
            )

    tool = match_ai_tool(exif.software)
    if tool:
        signals.append(
            Signal(
                id="image.ai-tool-metadata",
                label="AI image tool named in file metadata",
                detail=f"The file's Software field names {tool}.",
                direction=SignalDirection.AI,
                weight=0.9,
                family=SignalFamily.PROVENANCE,
                evidence=[_value("Software", exif.software or "")],
            )
        )

    generator_field = next(
        (
            (key, value)
            for key, value in prov.text_fields.items()
            if _GENERATOR_TEXT_KEYS.match(key) and value.strip()
        ),
        None,
    )
    if generator_field:
        key, value = generator_field
        signals.append(
            Signal(
                id="image.ai-tool-metadata",
                label="Generation parameters embedded in the file",
                detail=(
                    f"The PNG carries a “{key}” block — the prompt and settings that "
                    "image-generation tools write into their output."
                ),
                direction=SignalDirection.AI,
                weight=0.92,
                family=SignalFamily.PROVENANCE,
                evidence=[_value(key, value[:300])],
            )
        )

    if exif.has_camera_fields:
        camera = " ".join(part for part in (exif.make, exif.model) if part).strip()
        evidence = [_value("Camera", camera)] if camera else []
        if exif.lens_model:
            evidence.append(_value("Lens", exif.lens_model))
        if exif.date_time_original:
            evidence.append(_value("Captured", exif.date_time_original))

        signals.append(
            Signal(
                id="provenance.camera-exif",
                label="Camera metadata present",
                detail=(
                    f"The file carries EXIF data from {camera}, including capture settings "
                    "a camera writes."
                    if camera
                    else "The file carries camera-written EXIF capture data."
                ),
                direction=SignalDirection.HUMAN,
                weight=0.7,
                family=SignalFamily.PROVENANCE,
                evidence=evidence,
            )
        )
    elif not c2pa.present and not tool and not generator_field:
        signals.append(
            Signal(
                id="image.no-metadata",
                label="No camera or provenance metadata",
                detail=(
                    "The image carries no EXIF, no Content Credentials and no generator "
                    "fields. On its own this means little — most platforms strip metadata "
                    "on upload — so it is reported, not counted as evidence."
                ),
                direction=SignalDirection.NEUTRAL,
                weight=0.0,
                family=SignalFamily.PROVENANCE,
                evidence=[
                    EvidenceItem(kind=EvidenceKind.ABSENCE, label="EXIF", value="Not present"),
                    EvidenceItem(
                        kind=EvidenceKind.ABSENCE, label="Content Credentials", value="Not present"
                    ),
                ],
            )
        )

    if exif.software and not tool:
        signals.append(
            Signal(
                id="image.editor-software",
                label="Edited in image software",
                detail=(
                    f"The file records {exif.software.strip()} as the last software to write "
                    "it, indicating a human editing step."
                ),
                direction=SignalDirection.HUMAN,
                weight=0.25,
                family=SignalFamily.PROVENANCE,
                evidence=[_value("Software", exif.software)],
            )
        )

    return signals


# ── Fetching ──────────────────────────────────────────────────────────────────


class FetchError(Exception):
    """Raised with a message that is safe to show a user."""


def _is_public_address(hostname: str) -> bool:
    """Reject anything that resolves to a non-public address.

    This endpoint takes a URL from an untrusted client and fetches it, which is
    a server-side request forgery primitive if left open: without this check a
    caller could aim the engine at cloud metadata services (169.254.169.254),
    internal admin panels or localhost and read the response through the error
    surface. Every resolved address must be public — a hostname with one public
    and one private A record is rejected too.
    """
    try:
        infos = socket.getaddrinfo(hostname, None)
    except socket.gaierror:
        return False

    for info in infos:
        raw = info[4][0]
        try:
            address = ipaddress.ip_address(raw)
        except ValueError:
            return False
        if (
            address.is_private
            or address.is_loopback
            or address.is_link_local
            or address.is_reserved
            or address.is_multicast
            or address.is_unspecified
        ):
            return False

    return True


def _require_public(url: str) -> None:
    parsed = urlparse(url)
    if parsed.scheme not in ("http", "https") or not parsed.hostname:
        raise FetchError("That image address could not be used.")
    if not _is_public_address(parsed.hostname):
        raise FetchError("That image address could not be reached.")


#: Redirect hops followed. Each one is re-validated; see the note in fetch_image.
_MAX_REDIRECTS: Final[int] = 3


async def fetch_image(url: str) -> bytes:
    """Retrieve an image for parsing, with size, scheme and SSRF guards.

    Redirects are followed MANUALLY rather than by httpx, because
    ``follow_redirects=True`` would validate only the first URL: a public host
    could then 302 the engine to 169.254.169.254 and defeat the guard entirely.
    Every hop is re-checked with ``_require_public`` before it is requested.
    """
    import httpx

    _require_public(url)
    current = url

    try:
        async with httpx.AsyncClient(timeout=FETCH_TIMEOUT_SECONDS, follow_redirects=False) as client:
            for _ in range(_MAX_REDIRECTS + 1):
                async with client.stream("GET", current) as response:
                    if response.is_redirect:
                        location = response.headers.get("location")
                        if not location:
                            raise FetchError("The image could not be downloaded for analysis.")
                        current = str(httpx.URL(current).join(location))
                        _require_public(current)
                        continue

                    if response.status_code >= 400:
                        raise FetchError("The image could not be downloaded for analysis.")

                    chunks: list[bytes] = []
                    total = 0
                    async for chunk in response.aiter_bytes():
                        total += len(chunk)
                        if total > MAX_IMAGE_BYTES:
                            raise FetchError("That image is too large to analyse.")
                        chunks.append(chunk)

                    return b"".join(chunks)

            raise FetchError("That image address redirected too many times.")
    except FetchError:
        raise
    except Exception as exc:  # noqa: BLE001
        raise FetchError("The image could not be downloaded for analysis.") from exc
