import type { Tool } from "@/types";

/**
 * QR Code Tools registry (Phase 4, the QR studio).
 *
 * The single source of truth for the 36-tool QR suite. Add a tool by dropping a
 * file under `config/tools/qr/<slug>.ts` (each exporting a `Tool` default),
 * importing it here, and listing it below in internal-linking order. Everything
 * else (routes, metadata, JSON-LD, cards, the /qr-tools landing, search,
 * sitemap, and the generated branded illustration) is derived automatically: a
 * QR tool lives in the `qr-tools` category and its slug seeds
 * `lib/qr/illustrations`.
 *
 * The order below is the canonical internal-linking order used across the site.
 */

// ── Generators ────────────────────────────────────────────────────────────────
import qrCodeGenerator from "./qr-code-generator";
import qrCodeWithLogo from "./qr-code-with-logo";
import dynamicQrCodeGenerator from "./dynamic-qr-code-generator";
import staticQrCodeGenerator from "./static-qr-code-generator";
import bulkQrCodeGenerator from "./bulk-qr-code-generator";
import wifiQrCodeGenerator from "./wifi-qr-code-generator";
import vcardQrCodeGenerator from "./vcard-qr-code-generator";
import businessCardQrCodeGenerator from "./business-card-qr-code-generator";
import upiQrCodeGenerator from "./upi-qr-code-generator";
import paymentQrCodeGenerator from "./payment-qr-code-generator";
import emailQrCodeGenerator from "./email-qr-code-generator";
import smsQrCodeGenerator from "./sms-qr-code-generator";
import phoneQrCodeGenerator from "./phone-qr-code-generator";
import whatsappQrCodeGenerator from "./whatsapp-qr-code-generator";
import telegramQrCodeGenerator from "./telegram-qr-code-generator";
import facebookQrCodeGenerator from "./facebook-qr-code-generator";
import instagramQrCodeGenerator from "./instagram-qr-code-generator";
import linkedinQrCodeGenerator from "./linkedin-qr-code-generator";
import youtubeQrCodeGenerator from "./youtube-qr-code-generator";
import spotifyQrCodeGenerator from "./spotify-qr-code-generator";
import locationQrCodeGenerator from "./location-qr-code-generator";
import googleMapsQrCodeGenerator from "./google-maps-qr-code-generator";
import eventQrCodeGenerator from "./event-qr-code-generator";
import calendarQrCodeGenerator from "./calendar-qr-code-generator";
import menuQrCodeGenerator from "./menu-qr-code-generator";
import pdfQrCodeGenerator from "./pdf-qr-code-generator";
import imageQrCodeGenerator from "./image-qr-code-generator";
import videoQrCodeGenerator from "./video-qr-code-generator";
import appDownloadQrCodeGenerator from "./app-download-qr-code-generator";
import googlePlayQrCodeGenerator from "./google-play-qr-code-generator";
import appStoreQrCodeGenerator from "./app-store-qr-code-generator";
import zoomQrCodeGenerator from "./zoom-qr-code-generator";
import discordQrCodeGenerator from "./discord-qr-code-generator";

// ── Scanners / decoders ───────────────────────────────────────────────────────
import qrCodeScanner from "./qr-code-scanner";
import qrCodeReader from "./qr-code-reader";
import qrCodeDecoder from "./qr-code-decoder";

/** Live QR tools, in the internal-linking order used across the site. */
export const QR_TOOLS: Tool[] = [
  qrCodeGenerator,
  qrCodeWithLogo,
  dynamicQrCodeGenerator,
  staticQrCodeGenerator,
  bulkQrCodeGenerator,
  wifiQrCodeGenerator,
  vcardQrCodeGenerator,
  businessCardQrCodeGenerator,
  upiQrCodeGenerator,
  paymentQrCodeGenerator,
  emailQrCodeGenerator,
  smsQrCodeGenerator,
  phoneQrCodeGenerator,
  whatsappQrCodeGenerator,
  telegramQrCodeGenerator,
  facebookQrCodeGenerator,
  instagramQrCodeGenerator,
  linkedinQrCodeGenerator,
  youtubeQrCodeGenerator,
  spotifyQrCodeGenerator,
  locationQrCodeGenerator,
  googleMapsQrCodeGenerator,
  eventQrCodeGenerator,
  calendarQrCodeGenerator,
  menuQrCodeGenerator,
  pdfQrCodeGenerator,
  imageQrCodeGenerator,
  videoQrCodeGenerator,
  appDownloadQrCodeGenerator,
  googlePlayQrCodeGenerator,
  appStoreQrCodeGenerator,
  zoomQrCodeGenerator,
  discordQrCodeGenerator,
  qrCodeScanner,
  qrCodeReader,
  qrCodeDecoder,
];
