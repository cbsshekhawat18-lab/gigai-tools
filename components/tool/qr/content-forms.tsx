"use client";

/**
 * QR Studio, content forms.
 *
 * A data-driven form per {@link QRContentType}. Each spec lists the input fields
 * (keyed to the exact field names the engine's `buildPayload` builders read in
 * `lib/qr/content.ts`), so a single <ContentForm> component renders any type and
 * the payload comes straight from the engine. No per-type JSX duplication.
 *
 * `contentFormFor(type)` returns the spec; <ContentForm> renders it. The studio
 * owns the field values (a `QRFields` bag) and passes them down.
 */

import * as React from "react";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import type { QRContentType, QRFields } from "@/lib/qr/content";
import { Field, SelectField, type SelectOption } from "@/components/tool/dev";

/* ────────────────────────── field + spec model ────────────────────────── */

/** Input affordance for a content field. */
export type FieldKind =
  | "text"
  | "textarea"
  | "email"
  | "tel"
  | "url"
  | "number"
  | "select"
  | "checkbox"
  | "date"
  | "datetime-local";

/** One input in a content form. `key` matches a field the engine builder reads. */
export interface ContentFieldSpec {
  key: string;
  label: string;
  kind?: FieldKind;
  placeholder?: string;
  hint?: string;
  required?: boolean;
  /** Span the full width instead of sharing the 2-col grid. */
  wide?: boolean;
  options?: ReadonlyArray<SelectOption<string>>;
}

/** A complete content type: menu metadata + fields + sample values. */
export interface ContentFormSpec {
  type: QRContentType;
  label: string;
  icon: string;
  description: string;
  fields: ReadonlyArray<ContentFieldSpec>;
  /** Values that make the type render something instantly (sample loader). */
  sample?: QRFields;
}

/* ────────────────────────── field helpers ────────────────────────── */

const t = (key: string, label: string, extra: Partial<ContentFieldSpec> = {}): ContentFieldSpec => ({
  key,
  label,
  ...extra,
});

const AUTH_OPTIONS: ReadonlyArray<SelectOption<string>> = [
  { value: "WPA", label: "WPA / WPA2 / WPA3" },
  { value: "WEP", label: "WEP" },
  { value: "nopass", label: "No password (open)" },
];

/* ────────────────────────── the registry ────────────────────────── */

const SPECS: Partial<Record<QRContentType, ContentFormSpec>> = {
  url: {
    type: "url",
    label: "URL",
    icon: "Link",
    description: "Open a website, landing page, or any link.",
    fields: [t("url", "Website URL", { kind: "url", placeholder: "https://example.com/page", required: true, wide: true })],
    sample: { url: "https://gigai.tools" },
  },
  text: {
    type: "text",
    label: "Text",
    icon: "Type",
    description: "Encode any plain text, a note, code, or message.",
    fields: [t("text", "Plain text", { kind: "textarea", placeholder: "Any text to encode…", required: true, wide: true })],
    sample: { text: "GigAI QR Studio, the best QR codes on the web." },
  },
  email: {
    type: "email",
    label: "Email",
    icon: "Mail",
    description: "Pre-compose an email to a recipient.",
    fields: [
      t("email", "To", { kind: "email", placeholder: "hello@example.com", required: true, wide: true }),
      t("subject", "Subject", { placeholder: "Optional subject", wide: true }),
      t("body", "Message", { kind: "textarea", placeholder: "Optional message body…", wide: true }),
    ],
    sample: { email: "hello@example.com", subject: "Hello" },
  },
  phone: {
    type: "phone",
    label: "Phone",
    icon: "Phone",
    description: "Dial a phone number in one tap.",
    fields: [t("phone", "Phone number", { kind: "tel", placeholder: "+1 555 123 4567", required: true, wide: true })],
    sample: { phone: "+15551234567" },
  },
  sms: {
    type: "sms",
    label: "SMS",
    icon: "MessageSquare",
    description: "Open a text message with an optional pre-filled body.",
    fields: [
      t("phone", "Phone number", { kind: "tel", placeholder: "+1 555 123 4567", required: true }),
      t("message", "Message", { kind: "textarea", placeholder: "Optional pre-filled message…", wide: true }),
    ],
    sample: { phone: "+15551234567", message: "Hi!" },
  },
  whatsapp: {
    type: "whatsapp",
    label: "WhatsApp",
    icon: "MessageCircle",
    description: "Start a WhatsApp chat with a pre-filled message.",
    fields: [
      t("phone", "Phone (with country code)", { kind: "tel", placeholder: "15551234567", required: true, hint: "Digits only. No + or spaces." }),
      t("message", "Message", { kind: "textarea", placeholder: "Hi! I'd like to…", wide: true }),
    ],
    sample: { phone: "15551234567", message: "Hello!" },
  },
  wifi: {
    type: "wifi",
    label: "Wi-Fi",
    icon: "Wifi",
    description: "Let guests join your network without typing a password.",
    fields: [
      t("ssid", "Network name (SSID)", { placeholder: "My Café Wi-Fi", required: true }),
      t("encryption", "Security", { kind: "select", options: AUTH_OPTIONS }),
      t("password", "Password", { placeholder: "Network password" }),
      t("hidden", "Hidden network (SSID not broadcast)", { kind: "checkbox" }),
    ],
    sample: { ssid: "GigAI-Guest", password: "welcome123", encryption: "WPA" },
  },
  vcard: {
    type: "vcard",
    label: "vCard",
    icon: "Contact",
    description: "Share a full contact card: saved to the phone's address book.",
    fields: [
      t("firstName", "First name", { placeholder: "Ada" }),
      t("lastName", "Last name", { placeholder: "Lovelace" }),
      t("org", "Organization", { placeholder: "Analytical Engines Ltd" }),
      t("title", "Job title", { placeholder: "Lead Engineer" }),
      t("phone", "Phone", { kind: "tel", placeholder: "+1 555 123 4567" }),
      t("email", "Email", { kind: "email", placeholder: "ada@example.com" }),
      t("website", "Website", { kind: "url", placeholder: "https://example.com", wide: true }),
      t("street", "Street", { placeholder: "1 Innovation Way", wide: true }),
      t("city", "City", { placeholder: "London" }),
      t("state", "State / region", { placeholder: "Greater London" }),
      t("zip", "Postcode", { placeholder: "EC1A 1BB" }),
      t("country", "Country", { placeholder: "United Kingdom" }),
      t("note", "Note", { kind: "textarea", placeholder: "Optional note…", wide: true }),
    ],
    sample: { firstName: "Ada", lastName: "Lovelace", phone: "+15551234567", email: "ada@example.com", org: "Engines Ltd" },
  },
  upi: {
    type: "upi",
    label: "UPI Pay",
    icon: "IndianRupee",
    description: "A UPI payment request (India), opens the payer's UPI app.",
    fields: [
      t("vpa", "UPI ID (VPA)", { placeholder: "name@bank", required: true }),
      t("name", "Payee name", { placeholder: "Gigai Kripa Services" }),
      t("amount", "Amount (₹)", { kind: "number", placeholder: "Optional fixed amount" }),
      t("note", "Note", { placeholder: "Optional payment note", wide: true }),
    ],
    sample: { vpa: "gigai@upi", name: "Gigai Kripa Services" },
  },
  paypal: {
    type: "paypal",
    label: "PayPal.Me",
    icon: "DollarSign",
    description: "A PayPal.Me payment link with an optional amount.",
    fields: [
      t("username", "PayPal.Me username", { placeholder: "gigai", required: true }),
      t("amount", "Amount", { kind: "number", placeholder: "Optional amount" }),
      t("currency", "Currency", { placeholder: "USD" }),
    ],
    sample: { username: "gigai" },
  },
  bitcoin: {
    type: "bitcoin",
    label: "Bitcoin",
    icon: "Bitcoin",
    description: "A Bitcoin payment URI (BIP-21).",
    fields: [
      t("address", "Wallet address", { placeholder: "bc1q…", required: true, wide: true }),
      t("amount", "Amount (BTC)", { kind: "number", placeholder: "Optional amount" }),
      t("label", "Label", { placeholder: "Optional label" }),
      t("message", "Message", { placeholder: "Optional message", wide: true }),
    ],
    sample: { address: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh" },
  },
  geo: {
    type: "geo",
    label: "Location",
    icon: "MapPin",
    description: "Drop a map pin at exact coordinates.",
    fields: [
      t("lat", "Latitude", { kind: "number", placeholder: "51.5007", required: true }),
      t("lng", "Longitude", { kind: "number", placeholder: "-0.1246", required: true }),
      t("label", "Label", { placeholder: "Optional place name", wide: true }),
    ],
    sample: { lat: "51.5007", lng: "-0.1246" },
  },
  googleMaps: {
    type: "googleMaps",
    label: "Google Maps",
    icon: "Map",
    description: "Open a place or address in Google Maps.",
    fields: [
      t("query", "Place or address", { placeholder: "Bengaluru, India", required: true, wide: true }),
    ],
    sample: { query: "India Gate, New Delhi" },
  },
  calendar: {
    type: "calendar",
    label: "Calendar",
    icon: "CalendarPlus",
    description: "Add an event to the phone's calendar (iCalendar).",
    fields: [
      t("title", "Event title", { placeholder: "Product Launch", required: true, wide: true }),
      t("location", "Location", { placeholder: "Bengaluru", wide: true }),
      t("start", "Starts", { kind: "datetime-local" }),
      t("end", "Ends", { kind: "datetime-local" }),
      t("description", "Description", { kind: "textarea", placeholder: "Optional details…", wide: true }),
    ],
    sample: { title: "GigAI Launch" },
  },
  youtube: {
    type: "youtube",
    label: "YouTube",
    icon: "Youtube",
    description: "Open a YouTube video or channel.",
    fields: [t("url", "Video or channel URL", { kind: "url", placeholder: "https://youtube.com/@gigai", required: true, wide: true })],
    sample: { url: "https://youtube.com" },
  },
  spotify: {
    type: "spotify",
    label: "Spotify",
    icon: "Music",
    description: "Open a Spotify track, album, or playlist.",
    fields: [t("url", "Spotify URL", { kind: "url", placeholder: "https://open.spotify.com/…", required: true, wide: true })],
    sample: { url: "https://open.spotify.com" },
  },
  zoom: {
    type: "zoom",
    label: "Zoom",
    icon: "Video",
    description: "Join a Zoom meeting from the QR.",
    fields: [t("url", "Meeting invite URL", { kind: "url", placeholder: "https://zoom.us/j/1234567890", required: true, wide: true })],
    sample: { url: "https://zoom.us/j/1234567890" },
  },
  discord: {
    type: "discord",
    label: "Discord",
    icon: "MessagesSquare",
    description: "Open a Discord server invite.",
    fields: [t("url", "Invite URL", { kind: "url", placeholder: "https://discord.gg/abcdef", required: true, wide: true })],
    sample: { url: "https://discord.gg/gigai" },
  },
  telegram: {
    type: "telegram",
    label: "Telegram",
    icon: "Send",
    description: "Open a Telegram profile or channel.",
    fields: [t("username", "Username", { placeholder: "gigai", required: true, wide: true, hint: "Without the @." })],
    sample: { username: "gigai" },
  },
  facebook: {
    type: "facebook",
    label: "Facebook",
    icon: "Facebook",
    description: "Open a Facebook page or profile.",
    fields: [t("url", "Page or profile URL", { kind: "url", placeholder: "https://facebook.com/gigai", required: true, wide: true })],
    sample: { url: "https://facebook.com/gigai" },
  },
  instagram: {
    type: "instagram",
    label: "Instagram",
    icon: "Instagram",
    description: "Open an Instagram profile.",
    fields: [t("username", "Username", { placeholder: "gigai", required: true, wide: true, hint: "Without the @." })],
    sample: { username: "gigai" },
  },
  linkedin: {
    type: "linkedin",
    label: "LinkedIn",
    icon: "Linkedin",
    description: "Open a LinkedIn profile or company page.",
    fields: [t("url", "Profile or company URL", { kind: "url", placeholder: "https://linkedin.com/in/…", required: true, wide: true })],
    sample: { url: "https://linkedin.com/company/gigai" },
  },
  appStore: {
    type: "appStore",
    label: "App Store",
    icon: "Apple",
    description: "Link straight to your iOS App Store page.",
    fields: [t("url", "App Store URL", { kind: "url", placeholder: "https://apps.apple.com/app/id…", required: true, wide: true })],
    sample: { url: "https://apps.apple.com" },
  },
  googlePlay: {
    type: "googlePlay",
    label: "Google Play",
    icon: "Play",
    description: "Link straight to your Google Play listing.",
    fields: [t("url", "Google Play URL", { kind: "url", placeholder: "https://play.google.com/store/apps/…", required: true, wide: true })],
    sample: { url: "https://play.google.com" },
  },
  appDownload: {
    type: "appDownload",
    label: "App Download",
    icon: "Smartphone",
    description: "One QR for both stores. Note: a truly platform-aware redirect needs a hosted lander. This points to the first store link you provide.",
    fields: [
      t("ios", "iOS App Store URL", { kind: "url", placeholder: "https://apps.apple.com/…", wide: true }),
      t("android", "Google Play URL", { kind: "url", placeholder: "https://play.google.com/…", wide: true }),
      t("url", "Or a single unified URL", { kind: "url", placeholder: "https://your.app/download", wide: true, hint: "If set, this is used directly." }),
    ],
    sample: { ios: "https://apps.apple.com" },
  },
  pdf: {
    type: "pdf",
    label: "PDF",
    icon: "FileText",
    description: "Link to a hosted PDF (menu, brochure, ticket).",
    fields: [t("url", "PDF URL", { kind: "url", placeholder: "https://example.com/menu.pdf", required: true, wide: true })],
    sample: { url: "https://example.com/menu.pdf" },
  },
  image: {
    type: "image",
    label: "Image",
    icon: "Image",
    description: "Link to a hosted image.",
    fields: [t("url", "Image URL", { kind: "url", placeholder: "https://example.com/photo.jpg", required: true, wide: true })],
    sample: { url: "https://example.com/photo.jpg" },
  },
  video: {
    type: "video",
    label: "Video",
    icon: "Film",
    description: "Link to a hosted video.",
    fields: [t("url", "Video URL", { kind: "url", placeholder: "https://example.com/clip.mp4", required: true, wide: true })],
    sample: { url: "https://example.com/clip.mp4" },
  },
};

/** Content types in menu order (only those with a form spec). */
export const CONTENT_FORM_TYPES: ReadonlyArray<QRContentType> = [
  "url",
  "text",
  "wifi",
  "vcard",
  "email",
  "phone",
  "sms",
  "whatsapp",
  "upi",
  "paypal",
  "bitcoin",
  "geo",
  "googleMaps",
  "calendar",
  "instagram",
  "facebook",
  "linkedin",
  "youtube",
  "spotify",
  "telegram",
  "discord",
  "zoom",
  "appStore",
  "googlePlay",
  "appDownload",
  "pdf",
  "image",
  "video",
].filter((type): type is QRContentType => Boolean(SPECS[type as QRContentType]));

/** Look up the form spec for a content type (falls back to URL). */
export function contentFormFor(type: QRContentType): ContentFormSpec {
  return SPECS[type] ?? SPECS.url!;
}

/** Every registered form spec, in menu order. */
export const CONTENT_FORM_SPECS: ReadonlyArray<ContentFormSpec> = CONTENT_FORM_TYPES.map((tp) => SPECS[tp]!);

/* ────────────────────────── field input primitives ────────────────────────── */

const inputBase =
  "h-9 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus-visible:ring-2 focus-visible:ring-ring";

function FieldInput({
  spec,
  value,
  onChange,
}: {
  spec: ContentFieldSpec;
  value: string;
  onChange: (v: string) => void;
}) {
  const id = `qr-field-${spec.key}`;
  const kind = spec.kind ?? "text";

  if (kind === "checkbox") {
    return (
      <label className="flex h-9 cursor-pointer items-center gap-2 text-sm text-muted-foreground">
        <input
          id={id}
          type="checkbox"
          checked={value === "true"}
          onChange={(e) => onChange(e.target.checked ? "true" : "")}
          className="h-4 w-4 rounded border-border accent-primary"
        />
        {spec.label}
      </label>
    );
  }

  if (kind === "select") {
    return (
      <SelectField<string>
        id={id}
        value={value || (spec.options?.[0]?.value ?? "")}
        onChange={onChange}
        ariaLabel={spec.label}
        options={spec.options ?? []}
        className="w-full"
      />
    );
  }

  if (kind === "textarea") {
    return (
      <textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={spec.placeholder}
        aria-label={spec.label}
        rows={3}
        className="w-full resize-y rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus-visible:ring-2 focus-visible:ring-ring"
      />
    );
  }

  const htmlType =
    kind === "email" ? "email" : kind === "tel" ? "tel" : kind === "url" ? "url" : kind === "number" ? "number" : kind === "date" ? "date" : kind === "datetime-local" ? "datetime-local" : "text";

  return (
    <input
      id={id}
      type={htmlType}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={spec.placeholder}
      aria-label={spec.label}
      inputMode={kind === "number" ? "decimal" : undefined}
      spellCheck={kind === "url" || kind === "email" ? false : undefined}
      className={inputBase}
    />
  );
}

/* ────────────────────────── the form component ────────────────────────── */

/** Props for {@link ContentForm}. */
export interface ContentFormProps {
  type: QRContentType;
  values: QRFields;
  onChange: (key: string, value: string) => void;
  className?: string;
}

/**
 * Renders the input form for a content type. Checkbox fields render their own
 * label; every other field is wrapped in a labelled {@link Field}. Full-width
 * fields (`wide`) span both grid columns.
 */
export function ContentForm({ type, values, onChange, className }: ContentFormProps) {
  const spec = contentFormFor(type);
  return (
    <div className={cn("grid grid-cols-1 gap-4 sm:grid-cols-2", className)}>
      {spec.fields.map((f) => {
        const raw = values[f.key];
        const value = raw == null ? "" : String(raw);
        const kind = f.kind ?? "text";
        const wide = f.wide || kind === "textarea";
        const id = `qr-field-${f.key}`;

        if (kind === "checkbox") {
          return (
            <div key={f.key} className={cn(wide && "sm:col-span-2")}>
              <FieldInput spec={f} value={value} onChange={(v) => onChange(f.key, v)} />
            </div>
          );
        }

        return (
          <div key={f.key} className={cn(wide && "sm:col-span-2")}>
            <Field
              label={
                <span className="flex items-center gap-1">
                  {f.label}
                  {f.required && <span className="text-destructive" aria-hidden>*</span>}
                </span>
              }
              htmlFor={id}
              hint={f.hint}
            >
              <FieldInput spec={f} value={value} onChange={(v) => onChange(f.key, v)} />
            </Field>
          </div>
        );
      })}
    </div>
  );
}

/** Header block (icon + label + description) for a content type. */
export function ContentFormHeader({ type }: { type: QRContentType }) {
  const spec = contentFormFor(type);
  return (
    <div className="flex items-start gap-2">
      <Icon name={spec.icon} size={18} className="mt-0.5 shrink-0 text-primary" />
      <div className="min-w-0">
        <p className="text-sm font-semibold text-foreground">{spec.label}</p>
        <p className="text-sm text-muted-foreground">{spec.description}</p>
      </div>
    </div>
  );
}
