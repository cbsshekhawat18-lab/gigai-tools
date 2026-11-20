"use client";

import { downloadBlob } from "./export";
import { stringsFor } from "./locales";
import type { PosterPage } from "./types";

/** Owner's WhatsApp share: custom text if set, else the page-language default with the link. */
export function whatsappHref(page: PosterPage): string {
  const text = page.defaults.whatsapp_text || stringsFor(page.lang).whatsappText(page.display_name, page.url);
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

export async function downloadQr(page: PosterPage): Promise<void> {
  const QRCode = (await import("qrcode")).default;
  const dataUrl = await QRCode.toDataURL(page.url, { width: 1024, margin: 2 });
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = `${page.slug}-qr.png`;
  a.click();
}

export async function downloadPromo(page: PosterPage): Promise<void> {
  const { renderPromo } = await import("./promo");
  downloadBlob(await renderPromo(page), `${page.slug}-promo-1080.jpg`);
}
