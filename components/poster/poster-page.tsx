"use client";

import {
  BadgeCheck, Camera, Check, Download, Link2, RefreshCw, RotateCcw, RotateCw, Share2, SlidersHorizontal, Upload, ZoomIn, ZoomOut,
} from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { toast } from "sonner";

import { posterApi, trackEvent } from "@/lib/poster/api";
import {
  canShareFiles, detectFaceCenter, downloadBlob, ensureFonts, fileToImage, loadImage, renderToBlob, safeFilename,
} from "@/lib/poster/export";
import { posterBody, posterDisplay, posterFontFamilies } from "@/lib/poster/fonts";
import { stringsFor, type PosterStrings } from "@/lib/poster/locales";
import { panForFace, zoneRect } from "@/lib/poster/render";
import { INITIAL_SUPPORTER, LIMITS, themeOf, type Banner, type PosterPage as PageData, type SupporterState } from "@/lib/poster/types";
import { cn } from "@/lib/utils";

import { PreviewCanvas } from "./preview-canvas";
import { BigButton, IconButton, Slider, StepCard, WhatsAppGlyph } from "./ui";

/**
 * The public supporter page (reference: puneet.socialchowk.com). Everything
 * the visitor adds - photo, name, area - stays in this tab; only anonymous
 * counters go to the server. One PreviewCanvas renders the poster; the
 * thumbnails are the same component at 240px with a frozen supporter state
 * so slider drags never repaint four extra canvases.
 */

type Load = { state: "loading" } | { state: "missing" } | { state: "ready"; page: PageData };

const THUMB_STATE: SupporterState = INITIAL_SUPPORTER;

function slugFromLocation(): string | null {
  const m = /^\/p\/([a-z0-9-]+)\/?$/.exec(window.location.pathname);
  return m?.[1] ?? new URLSearchParams(window.location.search).get("slug"); // ?slug= keeps `next dev` usable
}

function previewSize(b: Banner): { w: number; h: number } {
  const s = Math.min(1080 / b.width, 1350 / b.height, 1);
  return { w: Math.round(b.width * s), h: Math.round(b.height * s) };
}

function thumbSize(b: Banner): { w: number; h: number } {
  return { w: 240, h: Math.round((240 * b.height) / b.width) };
}

const wrapRotation = (deg: number): number => ((((deg + 180) % 360) + 360) % 360) - 180;

export function PosterPage() {
  const [load, setLoad] = React.useState<Load>({ state: "loading" });
  const [bannerId, setBannerId] = React.useState<string | null>(null);
  const [images, setImages] = React.useState<Record<string, HTMLImageElement>>({});
  const [photo, setPhoto] = React.useState<HTMLImageElement | null>(null);
  const [supporter, setSupporter] = React.useState<SupporterState>(INITIAL_SUPPORTER);
  const [busy, setBusy] = React.useState(false);
  const hdCache = React.useRef<Record<string, HTMLImageElement>>({});
  const uploadRef = React.useRef<HTMLInputElement>(null);
  const cameraRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    const slug = slugFromLocation();
    if (!slug) {
      setLoad({ state: "missing" });
      return;
    }
    void (async () => {
      const r = await posterApi.page(slug);
      if (!r.ok) {
        setLoad({ state: "missing" });
        return;
      }
      const page = r.data;
      if (page.slug !== slug && window.location.pathname.startsWith("/p/")) {
        window.history.replaceState(null, "", `/p/${page.slug}${window.location.search}`);
      }
      const wanted = new URLSearchParams(window.location.search).get("t");
      const first = page.banners.find((b) => b.id === wanted) ?? page.banners[0];
      setBannerId(first?.id ?? null);
      setLoad({ state: "ready", page });
      void ensureFonts(posterFontFamilies);
      for (const b of [first, ...page.banners.filter((b) => b !== first)]) {
        if (!b) continue;
        loadImage(b.preview_url).then((img) => setImages((m) => ({ ...m, [b.id]: img }))).catch(() => undefined);
      }
      const key = `poster-visit:${page.id}`;
      try {
        if (sessionStorage.getItem(key)) return;
        sessionStorage.setItem(key, "1");
      } catch {
        /* storage blocked: count anyway */
      }
      trackEvent(page.id, first?.id ?? null, "visit");
    })();
  }, []);

  const page = load.state === "ready" ? load.page : null;
  const t: PosterStrings = React.useMemo(() => stringsFor(page?.lang), [page?.lang]);
  const banner = page?.banners.find((b) => b.id === bannerId) ?? page?.banners[0] ?? null;
  const theme = page ? themeOf(page) : { primary: "#FF671F", secondary: "#138808" };
  const labels = React.useMemo(
    () => ({ name: page?.defaults.supporter_label || t.supporter, area: page?.defaults.supporter_area || page?.area || "" }),
    [page, t],
  );
  const size = banner ? previewSize(banner) : { w: 1080, h: 1350 };

  const patch = (p: Partial<SupporterState>) => setSupporter((s) => ({ ...s, ...p }));
  const setScale = (v: number) => patch({ scale: Math.min(LIMITS.scale.max, Math.max(LIMITS.scale.min, v)) });
  const reset = () => {
    setSupporter((s) => ({ ...INITIAL_SUPPORTER, name: s.name, area: s.area }));
    toast(t.toast.reset);
  };

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error(t.toast.onlyImages);
      return;
    }
    try {
      const img = await fileToImage(file);
      setPhoto(img);
      let pan = { panX: 0, panY: 0 };
      const zone = banner?.zones.photos[0];
      const face = await detectFaceCenter(img);
      if (face && zone) {
        const zr = zoneRect(zone, size.w, size.h);
        pan = panForFace(face.fx, face.fy, img.naturalWidth, img.naturalHeight, zr.w, zr.h);
      }
      setSupporter((s) => ({ ...INITIAL_SUPPORTER, ...pan, name: s.name, area: s.area }));
      toast.success(t.toast.photoSet);
    } catch {
      toast.error(t.toast.onlyImages);
    }
  };

  const exportPoster = async (): Promise<{ blob: Blob; w: number; h: number; name: string } | null> => {
    if (!page || !banner) {
      toast.error(t.toast.noBanners);
      return null;
    }
    let hd = hdCache.current[banner.id];
    if (!hd) {
      hd = await loadImage(banner.hd_url);
      hdCache.current[banner.id] = hd;
    }
    const w = hd.naturalWidth;
    const h = hd.naturalHeight;
    const blob = await renderToBlob({
      width: w, height: h, banner: hd, zones: banner.zones, photo,
      photoSize: photo ? { w: photo.naturalWidth, h: photo.naturalHeight } : null,
      supporter, labels, fonts: posterFontFamilies, accent: theme.primary,
    });
    const name = `${safeFilename(page.display_name)}_${safeFilename(supporter.name || t.supporter)}_${w}x${h}.jpg`;
    return { blob, w, h, name };
  };

  const withBusy = async (fn: () => Promise<void>) => {
    if (busy) return;
    setBusy(true);
    try {
      await fn();
    } catch (err) {
      if (!(err instanceof DOMException && err.name === "AbortError")) toast.error(t.toast.shareFailed);
    } finally {
      setBusy(false);
    }
  };

  const download = () =>
    withBusy(async () => {
      toast(t.toast.preparing);
      const r = await exportPoster();
      if (!r || !page || !banner) return;
      downloadBlob(r.blob, r.name);
      toast.success(t.toast.downloaded(r.w, r.h));
      trackEvent(page.id, banner.id, "download");
    });

  const shareText = () => (page ? page.defaults.whatsapp_text || t.whatsappText(page.display_name, page.url) : "");

  const shareWhatsApp = () =>
    withBusy(async () => {
      toast(t.toast.preparing);
      const r = await exportPoster();
      if (!r || !page || !banner) return;
      const file = new File([r.blob], r.name, { type: "image/jpeg" });
      if (canShareFiles([file])) {
        await navigator.share({ files: [file], title: page.display_name, text: shareText() });
      } else {
        downloadBlob(r.blob, r.name);
        window.open(`https://wa.me/?text=${encodeURIComponent(shareText())}`, "_blank", "noopener");
      }
      trackEvent(page.id, banner.id, "share");
    });

  const copyLink = async () => {
    if (!page) return;
    const url = banner ? `${page.url}?t=${banner.id}` : page.url;
    try {
      await navigator.clipboard.writeText(url);
      toast.success(t.toast.copied);
      trackEvent(page.id, banner?.id ?? null, "copy");
    } catch {
      window.prompt(t.copyLink, url);
    }
  };

  const shareNative = () =>
    withBusy(async () => {
      if (!page) return;
      if (typeof navigator.share === "function") {
        await navigator.share({ title: page.display_name, text: shareText(), url: page.url });
        trackEvent(page.id, banner?.id ?? null, "share");
      } else {
        await copyLink();
      }
    });

  const root = cn(posterDisplay.variable, posterBody.variable, "min-h-screen bg-[#eef1f5] text-slate-900 font-[family-name:var(--font-poster-body)]");
  const style = { "--pp": theme.primary, "--ps": theme.secondary } as React.CSSProperties;

  if (!page || load.state !== "ready") {
    return (
      <div className={root} style={style}>
        <div className="mx-auto max-w-md px-4 py-24 text-center">
          {load.state === "missing" ? (
            <>
              <h1 className="text-xl font-bold">{t.notFound}</h1>
              <p className="mt-2 text-sm text-slate-600">{t.notFoundBody}</p>
              <Link href="/" className="mt-6 inline-block text-sm font-semibold text-[var(--pp)] underline">gigai.tools</Link>
            </>
          ) : (
            <p className="text-sm text-slate-500">{t.loading}</p>
          )}
        </div>
      </div>
    );
  }

  const slogans = page.defaults.slogans ?? [];
  const announcement = page.defaults.announcement || [page.tagline, t.stripDefault].filter(Boolean).join(" ");

  return (
    <div className={root} style={style}>
      <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/95 shadow-sm backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid size-14 shrink-0 place-items-center overflow-hidden rounded-full border-2 border-[var(--pp)] bg-white">
              {page.logo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={page.logo_url} alt="" className="size-full object-cover" />
              ) : (
                <span className="text-xl font-extrabold text-[var(--pp)]">{page.display_name.slice(0, 1)}</span>
              )}
            </span>
            <div className="min-w-0">
              <p className="flex items-center gap-1.5 truncate text-lg font-extrabold leading-tight font-[family-name:var(--font-poster-display)] sm:text-xl">
                <span className="truncate">{page.display_name}</span>
                <BadgeCheck className="size-5 shrink-0 fill-sky-500 text-white" aria-label={t.verified} />
              </p>
              <p className="mt-0.5 flex flex-wrap items-center gap-2 text-sm text-slate-600">
                {page.designation ? <span>{page.designation}</span> : null}
                {page.area ? (
                  <span className="rounded-full bg-[color-mix(in_srgb,var(--pp)_12%,white)] px-2.5 py-0.5 text-xs font-bold text-[var(--pp)]">{page.area}</span>
                ) : null}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => void shareNative()}
            className="inline-flex shrink-0 items-center gap-2 rounded-full border border-[color-mix(in_srgb,var(--pp)_40%,white)] bg-[color-mix(in_srgb,var(--pp)_8%,white)] px-4 py-2 text-sm font-bold text-[var(--pp)]"
          >
            <Share2 className="size-4" />
            <span className="hidden sm:inline">{t.share}</span>
          </button>
        </div>
      </header>

      {page.status !== "live" ? (
        <div className="bg-amber-100 px-4 py-2 text-center text-sm font-semibold text-amber-900">{t.preview}</div>
      ) : null}
      <div className="bg-[linear-gradient(90deg,var(--pp),var(--ps))] px-4 py-3 text-center text-base font-bold text-white sm:text-lg">
        {announcement}
      </div>

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-6">
        <StepCard
          n={1}
          title={t.stepTemplate}
          subtitle={t.designsAvailable(page.banners.length)}
          aside={
            <div className="flex w-full gap-3 overflow-x-auto pb-1 lg:w-auto lg:max-w-[600px]">
              {page.banners.map((b, i) => {
                const selected = b.id === banner?.id;
                return (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => setBannerId(b.id)}
                    aria-pressed={selected}
                    aria-label={`Design ${i + 1}`}
                    className={cn(
                      "relative w-[124px] shrink-0 overflow-hidden rounded-xl border-[3px] bg-slate-100 transition",
                      selected ? "border-[var(--pp)] shadow-md" : "border-slate-200 hover:border-slate-300",
                    )}
                  >
                    <PreviewCanvas banner={images[b.id] ?? null} size={thumbSize(b)} zones={b.zones} supporter={THUMB_STATE} photo={photo} labels={labels} fonts={posterFontFamilies} accent={theme.primary} />
                    {selected ? (
                      <span className="absolute right-1.5 top-1.5 grid size-6 place-items-center rounded-full bg-[var(--pp)] text-white shadow">
                        <Check className="size-4" />
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          }
        />

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
          <section className="rounded-[22px] border border-slate-200/70 bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,0.06)] sm:p-6">
            <div className="mx-auto max-w-[560px] overflow-hidden rounded-2xl bg-slate-100 shadow-lg">
              {banner ? (
                <PreviewCanvas
                  banner={images[banner.id] ?? null}
                  size={size}
                  zones={banner.zones}
                  supporter={supporter}
                  photo={photo}
                  labels={labels}
                  fonts={posterFontFamilies}
                  accent={theme.primary}
                  onPan={(dx, dy) => setSupporter((s) => ({ ...s, panX: s.panX + dx, panY: s.panY + dy }))}
                  label={page.display_name}
                />
              ) : (
                <p className="p-10 text-center text-sm text-slate-500">{t.toast.noBanners}</p>
              )}
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5">
              <span className="flex items-center gap-2 text-sm font-bold text-slate-700">
                <SlidersHorizontal className="size-4" />
                {t.tools}
              </span>
              <div className="flex gap-2">
                <IconButton label={t.zoomOut} onClick={() => setScale(supporter.scale - 0.15)}><ZoomOut className="size-4" /></IconButton>
                <IconButton label={t.zoomIn} onClick={() => setScale(supporter.scale + 0.15)}><ZoomIn className="size-4" /></IconButton>
                <IconButton label={t.rotateLeft} onClick={() => patch({ rotation: wrapRotation(supporter.rotation - 90) })}><RotateCcw className="size-4" /></IconButton>
                <IconButton label={t.rotateRight} onClick={() => patch({ rotation: wrapRotation(supporter.rotation + 90) })}><RotateCw className="size-4" /></IconButton>
                <IconButton label={t.reset} onClick={reset}><RefreshCw className="size-4" /></IconButton>
              </div>
            </div>
          </section>

          <div className="space-y-6">
            <StepCard n={2} title={t.stepPhoto}>
              <div className="grid grid-cols-2 gap-3">
                <button type="button" onClick={() => uploadRef.current?.click()} className="flex flex-col items-center gap-1.5 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-6 text-center hover:bg-slate-100">
                  <Upload className="size-7 text-[var(--pp)]" />
                  <span className="text-base font-bold">{t.upload}</span>
                  <span className="text-xs text-slate-500">{t.uploadSub}</span>
                </button>
                <button type="button" onClick={() => cameraRef.current?.click()} className="flex flex-col items-center gap-1.5 rounded-2xl border border-[color-mix(in_srgb,var(--pp)_40%,white)] bg-[color-mix(in_srgb,var(--pp)_8%,white)] px-3 py-6 text-center hover:bg-[color-mix(in_srgb,var(--pp)_14%,white)]">
                  <Camera className="size-7 text-[var(--pp)]" />
                  <span className="text-base font-bold">{t.camera}</span>
                  <span className="text-xs text-slate-500">{t.cameraSub}</span>
                </button>
              </div>
              <input ref={uploadRef} type="file" accept="image/*" className="sr-only" onChange={(e) => void onFile(e)} />
              <input ref={cameraRef} type="file" accept="image/*" capture="user" className="sr-only" onChange={(e) => void onFile(e)} />
            </StepCard>

            <StepCard n={3} title={t.stepDetails}>
              <label className="block text-sm font-bold text-slate-800">
                {t.yourName}
                <input value={supporter.name} onChange={(e) => patch({ name: e.target.value.slice(0, 40) })} placeholder={t.namePlaceholder} className="mt-1.5 h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-base font-normal outline-none focus:border-[var(--pp)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--pp)_25%,white)]" />
              </label>
              <label className="mt-4 block text-sm font-bold text-slate-800">
                {t.areaLabel}
                <input value={supporter.area} onChange={(e) => patch({ area: e.target.value.slice(0, 60) })} placeholder={t.areaPlaceholder} className="mt-1.5 h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-base font-normal outline-none focus:border-[var(--pp)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--pp)_25%,white)]" />
              </label>
            </StepCard>

            <StepCard n={4} title={t.stepAdjust}>
              <div className="space-y-5">
                <Slider label={t.zoom} value={supporter.scale} display={`${supporter.scale.toFixed(1)}x`} min={LIMITS.scale.min} max={LIMITS.scale.max} step={LIMITS.scale.step} onChange={setScale} leftIcon={<ZoomOut className="size-4" />} rightIcon={<ZoomIn className="size-4" />} onLeft={() => setScale(supporter.scale - 0.15)} onRight={() => setScale(supporter.scale + 0.15)} leftLabel={t.zoomOut} rightLabel={t.zoomIn} />
                <Slider label={t.rotation} value={supporter.rotation} display={`${supporter.rotation}°`} min={LIMITS.rotation.min} max={LIMITS.rotation.max} step={1} onChange={(v) => patch({ rotation: v })} leftIcon={<RotateCcw className="size-4" />} rightIcon={<RotateCw className="size-4" />} onLeft={() => patch({ rotation: wrapRotation(supporter.rotation - 90) })} onRight={() => patch({ rotation: wrapRotation(supporter.rotation + 90) })} leftLabel={t.rotateLeft} rightLabel={t.rotateRight} />
              </div>
            </StepCard>

            <StepCard n={5} title={t.stepShare}>
              <div className="space-y-3">
                <BigButton tone="primary" icon={<Download className="size-5" />} onClick={() => void download()} disabled={busy || !banner}>{t.download}</BigButton>
                <BigButton tone="whatsapp" icon={<WhatsAppGlyph />} onClick={() => void shareWhatsApp()} disabled={busy || !banner}>{t.whatsapp}</BigButton>
                <div className="grid grid-cols-2 gap-3">
                  <BigButton tone="outline" icon={<Share2 className="size-4" />} onClick={() => void shareNative()} disabled={busy} className="min-h-11 text-sm">{t.shareOther}</BigButton>
                  <BigButton tone="outline" icon={<Link2 className="size-4" />} onClick={() => void copyLink()} className="min-h-11 text-sm">{t.copyLink}</BigButton>
                </div>
              </div>
            </StepCard>
          </div>
        </div>
      </main>

      <footer className="mt-6 border-t border-slate-200 bg-white px-4 py-8 text-center">
        <p className="text-lg font-extrabold text-[var(--pp)] font-[family-name:var(--font-poster-display)]">
          {[page.tagline, ...slogans].filter(Boolean).join(" • ")}
        </p>
        <p className="mt-1 text-sm text-slate-600">{[page.org_name, page.area].filter(Boolean).join(" | ")}</p>
        <p className="mt-2 text-xs text-slate-500">© {new Date().getFullYear()} {page.display_name}. {t.rights}</p>
        <Link href="/create" className="mt-4 inline-block text-xs font-semibold text-slate-500 underline hover:text-slate-800">{t.createOwn}</Link>
      </footer>
    </div>
  );
}
