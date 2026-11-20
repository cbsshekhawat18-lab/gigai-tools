/**
 * GigAI Tools: QR content builders.
 *
 * Turns structured, per-type input into the exact QR PAYLOAD STRING a scanner
 * will read. Every builder is pure, synchronous and dependency-free; they only
 * assemble/escape strings, they do NOT render anything. Rendering lives in
 * render.ts and consumes the string these produce.
 *
 * Escaping notes:
 * - WIFI / VCARD / VEVENT use back-slash escaping for the special chars in
 *  their own micro-formats (`\ ; , : "` etc.), done honestly per each spec.
 * - URL-shaped payloads (whatsapp, upi, geo query, store links…) percent-encode
 *   their dynamic parts with encodeURIComponent so spaces/`&` never break them.
 *
 * Unknown/blank fields are omitted rather than emitted empty, so a partial form
 * still yields a valid, minimal payload.
 */

/** Every content type the studio can encode. */
export type QRContentType =
  | "url"
  | "text"
  | "phone"
  | "email"
  | "sms"
  | "whatsapp"
  | "wifi"
  | "upi"
  | "paypal"
  | "bitcoin"
  | "vcard"
  | "geo"
  | "googleMaps"
  | "calendar"
  | "youtube"
  | "spotify"
  | "zoom"
  | "discord"
  | "telegram"
  | "facebook"
  | "instagram"
  | "linkedin"
  | "appStore"
  | "googlePlay"
  | "appDownload"
  | "pdf"
  | "image"
  | "video";

/** A loose field bag; each builder reads only the keys it needs. */
export type QRFields = Record<string, string | number | boolean | undefined>;

/* ----------------------------------------------------------------------- *
 * Small string helpers
 * ----------------------------------------------------------------------- */

/** Coerce a field to a trimmed string ("" when missing). */
function str(v: string | number | boolean | undefined): string {
  if (v === undefined || v === null) return "";
  return String(v).trim();
}

/** True when the field has meaningful content. */
function has(v: string | number | boolean | undefined): boolean {
  return str(v).length > 0;
}

/** Percent-encode a value for use inside a URL query/path. */
function enc(v: string | number | boolean | undefined): string {
  return encodeURIComponent(str(v));
}

/**
 * Escape a value for the WIFI: / MECARD micro-format, where `\ ; , : "` are
 * reserved and must be back-slash escaped.
 */
function escapeWifi(v: string): string {
  return v.replace(/([\\;,:"])/g, "\\$1");
}

/**
 * Escape a value for a vCard 3.0 property, per RFC 6350-style rules:
 * back-slash, comma, semicolon are escaped and newlines become `\n`.
 */
function escapeVCard(v: string): string {
  return v
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

/**
 * Escape a value for an iCalendar TEXT value (RFC 5545): back-slash, semicolon,
 * comma escaped; newlines → `\n`.
 */
function escapeICal(v: string): string {
  return v
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,");
}

/** Keep digits and a single leading `+` for tel/wa numbers. */
function normalizePhone(v: string | number | boolean | undefined): string {
  const s = str(v);
  const plus = s.startsWith("+") ? "+" : "";
  return plus + s.replace(/[^\d]/g, "");
}

/** Digits only (for wa.me, which wants an intl number with no `+`). */
function digitsOnly(v: string | number | boolean | undefined): string {
  return str(v).replace(/[^\d]/g, "");
}

/**
 * Ensure a value looks like an absolute URL; if it has no scheme, prefix
 * `https://`. Blank stays blank.
 */
function ensureUrl(v: string | number | boolean | undefined): string {
  const s = str(v);
  if (!s) return "";
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(s) || /^(mailto|tel):/i.test(s)) return s;
  return `https://${s}`;
}

/** Format `YYYYMMDDTHHMMSSZ` (UTC basic) from a datetime-local or ISO string. */
function toICalDate(v: string | number | boolean | undefined): string {
  const s = str(v);
  if (!s) return "";
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

/** Join non-empty lines with CRLF (the line terminator vCard/iCal require). */
function crlf(lines: (string | false | null | undefined)[]): string {
  return lines.filter((l): l is string => typeof l === "string" && l.length > 0).join("\r\n");
}

/* ----------------------------------------------------------------------- *
 * Per-type builders
 * ----------------------------------------------------------------------- */

function buildUrl(f: QRFields): string {
  return ensureUrl(f.url ?? f.value);
}

function buildText(f: QRFields): string {
  return str(f.text ?? f.value);
}

function buildPhone(f: QRFields): string {
  const n = normalizePhone(f.phone ?? f.number ?? f.value);
  return n ? `tel:${n}` : "";
}

/**
 * Email. Default is a `mailto:` (with optional subject/body), the most widely
 * scannable form. Pass `format:"matmsg"` to emit the legacy MATMSG block some
 * older readers prefer.
 */
function buildEmail(f: QRFields): string {
  const to = str(f.email ?? f.to ?? f.value);
  const subject = str(f.subject);
  const body = str(f.body);
  if (!to) return "";
  if (str(f.format).toLowerCase() === "matmsg") {
    return `MATMSG:TO:${to};SUB:${subject};BODY:${body};;`;
  }
  const q: string[] = [];
  if (subject) q.push(`subject=${enc(subject)}`);
  if (body) q.push(`body=${enc(body)}`);
  return `mailto:${to}${q.length ? `?${q.join("&")}` : ""}`;
}

function buildSms(f: QRFields): string {
  const n = normalizePhone(f.phone ?? f.number ?? f.value);
  const msg = str(f.message ?? f.body);
  if (!n) return "";
  return msg ? `SMSTO:${n}:${msg}` : `SMSTO:${n}`;
}

function buildWhatsapp(f: QRFields): string {
  const n = digitsOnly(f.phone ?? f.number ?? f.value);
  if (!n) return "";
  const text = str(f.message ?? f.text);
  return `https://wa.me/${n}${text ? `?text=${enc(text)}` : ""}`;
}

/**
 * Wi-Fi join payload: `WIFI:T:<auth>;S:<ssid>;P:<pass>;H:<hidden>;;`
 * auth ∈ WPA | WEP | nopass. SSID/password are WIFI-escaped.
 */
function buildWifi(f: QRFields): string {
  const ssid = str(f.ssid ?? f.value);
  if (!ssid) return "";
  const rawAuth = str(f.encryption ?? f.auth ?? "WPA").toUpperCase();
  const auth = rawAuth === "NONE" || rawAuth === "NOPASS" ? "nopass" : rawAuth === "WEP" ? "WEP" : "WPA";
  const pass = str(f.password);
  const hidden = f.hidden === true || str(f.hidden).toLowerCase() === "true";
  const parts = [`WIFI:T:${auth}`, `S:${escapeWifi(ssid)}`];
  if (auth !== "nopass" && pass) parts.push(`P:${escapeWifi(pass)}`);
  if (hidden) parts.push("H:true");
  return `${parts.join(";")};;`;
}

/** UPI (India) pay intent: `upi://pay?pa=&pn=&am=&cu=INR&tn=`. */
function buildUpi(f: QRFields): string {
  const pa = str(f.vpa ?? f.pa ?? f.value);
  if (!pa) return "";
  const q: string[] = [`pa=${enc(pa)}`];
  if (has(f.name ?? f.pn)) q.push(`pn=${enc(f.name ?? f.pn)}`);
  if (has(f.amount ?? f.am)) q.push(`am=${enc(f.amount ?? f.am)}`);
  q.push(`cu=${enc(str(f.currency ?? f.cu ?? "INR"))}`);
  if (has(f.note ?? f.tn)) q.push(`tn=${enc(f.note ?? f.tn)}`);
  return `upi://pay?${q.join("&")}`;
}

/** PayPal.Me link. Amount/currency append the standard path suffix. */
function buildPaypal(f: QRFields): string {
  const handle = str(f.username ?? f.handle ?? f.value).replace(/^@/, "").replace(/^https?:\/\/(www\.)?paypal\.me\//i, "");
  if (!handle) return "";
  const amount = str(f.amount);
  const currency = str(f.currency);
  let path = `https://www.paypal.me/${encodeURIComponent(handle)}`;
  if (amount) path += `/${enc(amount)}${currency ? enc(currency) : ""}`;
  return path;
}

/** Bitcoin URI: `bitcoin:<address>?amount=&label=&message=`. */
function buildBitcoin(f: QRFields): string {
  const address = str(f.address ?? f.value);
  if (!address) return "";
  const q: string[] = [];
  if (has(f.amount)) q.push(`amount=${enc(f.amount)}`);
  if (has(f.label)) q.push(`label=${enc(f.label)}`);
  if (has(f.message)) q.push(`message=${enc(f.message)}`);
  return `bitcoin:${address}${q.length ? `?${q.join("&")}` : ""}`;
}

/** Full vCard 3.0. Only populated fields are emitted. */
function buildVCard(f: QRFields): string {
  const first = str(f.firstName ?? f.first);
  const last = str(f.lastName ?? f.last);
  const fullName = str(f.fullName ?? f.name) || [first, last].filter(Boolean).join(" ");
  if (!fullName && !first && !last) return "";
  const e = escapeVCard;
  const adr = [
    str(f.street),
    str(f.city),
    str(f.state),
    str(f.zip),
    str(f.country),
  ];
  const hasAdr = adr.some((p) => p.length > 0);
  return crlf([
    "BEGIN:VCARD",
    "VERSION:3.0",
    `N:${e(last)};${e(first)};;;`,
    `FN:${e(fullName)}`,
    has(f.org) && `ORG:${e(str(f.org))}`,
    has(f.title) && `TITLE:${e(str(f.title))}`,
    has(f.phone) && `TEL;TYPE=CELL:${normalizePhone(f.phone)}`,
    has(f.workPhone) && `TEL;TYPE=WORK:${normalizePhone(f.workPhone)}`,
    has(f.email) && `EMAIL:${e(str(f.email))}`,
    has(f.website) && `URL:${ensureUrl(f.website)}`,
    hasAdr && `ADR;TYPE=WORK:;;${e(adr[0] ?? "")};${e(adr[1] ?? "")};${e(adr[2] ?? "")};${e(adr[3] ?? "")};${e(adr[4] ?? "")}`,
    has(f.note) && `NOTE:${e(str(f.note))}`,
    "END:VCARD",
  ]);
}

/** Geo point: `geo:<lat>,<lng>` (optionally `?q=` label). */
function buildGeo(f: QRFields): string {
  const lat = str(f.lat ?? f.latitude);
  const lng = str(f.lng ?? f.longitude ?? f.lon);
  if (!lat || !lng) return "";
  const label = str(f.label ?? f.query);
  return `geo:${lat},${lng}${label ? `?q=${enc(label)}` : ""}`;
}

/** Google Maps link, from an explicit query, or lat/lng, or a raw URL. */
function buildGoogleMaps(f: QRFields): string {
  if (has(f.url)) return ensureUrl(f.url);
  const query = str(f.query ?? f.address ?? f.value);
  if (query) return `https://www.google.com/maps/search/?api=1&query=${enc(query)}`;
  const lat = str(f.lat ?? f.latitude);
  const lng = str(f.lng ?? f.longitude ?? f.lon);
  if (lat && lng) return `https://www.google.com/maps/search/?api=1&query=${enc(`${lat},${lng}`)}`;
  return "";
}

/** Calendar event as a single VEVENT (BEGIN:VEVENT … END:VEVENT). */
function buildCalendar(f: QRFields): string {
  const summary = str(f.title ?? f.summary ?? f.value);
  const start = toICalDate(f.start ?? f.dtstart);
  if (!summary || !start) return "";
  const end = toICalDate(f.end ?? f.dtend) || start;
  const allDay = f.allDay === true || str(f.allDay).toLowerCase() === "true";
  const dt = (label: "DTSTART" | "DTEND", value: string) =>
    allDay ? `${label};VALUE=DATE:${value.slice(0, 8)}` : `${label}:${value}`;
  return crlf([
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "BEGIN:VEVENT",
    `SUMMARY:${escapeICal(summary)}`,
    dt("DTSTART", start),
    dt("DTEND", end),
    has(f.location) && `LOCATION:${escapeICal(str(f.location))}`,
    has(f.description) && `DESCRIPTION:${escapeICal(str(f.description))}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ]);
}

/** A builder that simply normalizes a URL from a chosen field. */
function urlFrom(...keys: string[]): (f: QRFields) => string {
  return (f) => {
    for (const k of keys) {
      if (has(f[k])) return ensureUrl(f[k]);
    }
    return ensureUrl(f.value);
  };
}

/**
 * App-download smart link. If a single unified URL is given, use it; otherwise
 * prefer the store link for the field that is present (iOS first, then Android),
 * so at minimum the QR points somewhere real. A truly platform-aware redirect
 * needs a hosted lander (not available on this static platform), documented in
 * the appDownload tool page, not faked here.
 */
function buildAppDownload(f: QRFields): string {
  if (has(f.url)) return ensureUrl(f.url);
  if (has(f.ios ?? f.appStore)) return ensureUrl(f.ios ?? f.appStore);
  if (has(f.android ?? f.googlePlay)) return ensureUrl(f.android ?? f.googlePlay);
  return "";
}

/* ----------------------------------------------------------------------- *
 * Dispatch table
 * ----------------------------------------------------------------------- */

const BUILDERS: Record<QRContentType, (f: QRFields) => string> = {
  url: buildUrl,
  text: buildText,
  phone: buildPhone,
  email: buildEmail,
  sms: buildSms,
  whatsapp: buildWhatsapp,
  wifi: buildWifi,
  upi: buildUpi,
  paypal: buildPaypal,
  bitcoin: buildBitcoin,
  vcard: buildVCard,
  geo: buildGeo,
  googleMaps: buildGoogleMaps,
  calendar: buildCalendar,
  youtube: urlFrom("url", "video"),
  spotify: urlFrom("url", "uri"),
  zoom: urlFrom("url", "link"),
  discord: urlFrom("url", "invite"),
  telegram: (f) => {
    if (has(f.url)) return ensureUrl(f.url);
    const handle = str(f.username ?? f.handle ?? f.value).replace(/^@/, "");
    return handle ? `https://t.me/${encodeURIComponent(handle)}` : "";
  },
  facebook: urlFrom("url", "profile"),
  instagram: (f) => {
    if (has(f.url)) return ensureUrl(f.url);
    const handle = str(f.username ?? f.handle ?? f.value).replace(/^@/, "");
    return handle ? `https://instagram.com/${encodeURIComponent(handle)}` : "";
  },
  linkedin: urlFrom("url", "profile"),
  appStore: urlFrom("url", "link"),
  googlePlay: urlFrom("url", "link"),
  appDownload: buildAppDownload,
  pdf: urlFrom("url", "file"),
  image: urlFrom("url", "file"),
  video: urlFrom("url", "file"),
};

/**
 * Build the QR payload string for a content type from its structured fields.
 * Pure and synchronous. Returns "" when required fields are missing so callers
 * can treat empty as "nothing to render yet" without a thrown error.
 */
export function buildPayload(type: QRContentType, fields: QRFields): string {
  const builder = BUILDERS[type];
  return builder ? builder(fields) : "";
}

/** All content types, for iterating in a UI picker. */
export const QR_CONTENT_TYPES: QRContentType[] = Object.keys(BUILDERS) as QRContentType[];
