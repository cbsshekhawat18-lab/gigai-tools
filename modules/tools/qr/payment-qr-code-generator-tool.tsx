"use client";

/**
 * Payment QR Code Generator, the interactive workspace.
 *
 * The tool's one bespoke idea is a three-way *payment-method* selector: UPI,
 * PayPal.me or Bitcoin. Rather than expose the full 28-type studio picker (which
 * would drown a payment tool in URL/vCard/geo/etc.) or lock to a single type, we
 * render the reused, desktop-grade {@link QRStudio} once per chosen method,
 * locked to that method's content type and seeded with a sensible example.
 *
 * Everything else: live preview, color/gradient/dot/eye customization, logo
 * drop-in, real-time scan/contrast validation, drag-drop/paste/copy/share and
 * every print-ready export (PNG, transparent PNG, SVG, PDF, JPG, WEBP, EPS up to
 * 4096px): is the shared studio, untouched. Each method builds the exact,
 * standard payload wallets expect (`upi://pay?…`, a `paypal.me/…` link, or a
 * BIP-21 `bitcoin:` URI), entirely in the browser; no payee detail is uploaded
 * and no payment is ever processed here.
 */

import * as React from "react";

import type { ImageToolProps } from "@/components/tool/types";
import type { AccentKey } from "@/types";
import type { QRContentType, QRFields } from "@/lib/qr/content";
import type { QRStyleConfig } from "@/lib/qr/style";
import { QRStudio } from "@/components/tool/qr";
import { Icon, type IconProps } from "@/lib/icons";
import { accentStyle } from "@/lib/design";
import { cn } from "@/lib/utils";

/** One selectable payment method and the studio preset it drives. */
interface PaymentMethod {
  /** Stable id used as the selector key + studio remount key. */
  id: "upi" | "paypal" | "bitcoin";
  /** Short label for the selector button. */
  label: string;
  /** Lucide icon name (resolved via @/lib/icons). */
  icon: IconProps["name"];
  /** One-line honest description of what this method's QR does. */
  blurb: string;
  /** The QR content type the studio locks to for this method. */
  contentType: QRContentType;
  /** Seed field values so the preview renders a real code immediately. */
  defaultFields: QRFields;
  /** Base download file name (no extension) for this method. */
  filename: string;
}

/**
 * The three payment methods. Field keys match `buildPayload`'s reader for each
 * content type (`upi`, `paypal`, `bitcoin`), so the studio's per-type form and
 * the encoded payload line up exactly.
 */
const METHODS = [
  {
    id: "upi",
    label: "UPI",
    icon: "IndianRupee",
    blurb:
      "India's instant bank-to-bank payments. Encodes a upi://pay link that Google Pay, PhonePe, Paytm and BHIM open to a pre-filled payment screen.",
    contentType: "upi",
    defaultFields: {
      vpa: "yourname@bank",
      name: "Your Business",
      amount: "",
      note: "",
    },
    filename: "upi-payment-qr-code",
  },
  {
    id: "paypal",
    label: "PayPal.me",
    icon: "DollarSign",
    blurb:
      "A shareable PayPal payment link used worldwide. Encodes your paypal.me/you link, optionally with an amount and currency pre-filled.",
    contentType: "paypal",
    defaultFields: {
      username: "yourhandle",
      amount: "",
      currency: "USD",
    },
    filename: "paypal-payment-qr-code",
  },
  {
    id: "bitcoin",
    label: "Bitcoin",
    icon: "Bitcoin",
    blurb:
      "An on-chain Bitcoin address. Encodes a standard BIP-21 bitcoin: URI so the payer's wallet opens with the address, and any amount, already filled in.",
    contentType: "bitcoin",
    defaultFields: {
      address: "bc1qexampleaddressreplacewithyours",
      amount: "",
      label: "",
      message: "",
    },
    filename: "bitcoin-payment-qr-code",
  },
] as const satisfies readonly PaymentMethod[];

/** The default/fallback method, first entry, guaranteed defined for typing. */
const DEFAULT_METHOD = METHODS[0];

/**
 * A soft, on-brand default look tuned for a printed "scan to pay" card. Every
 * value stays fully editable in the studio's Design tab; error correction starts
 * at Q so a centred business logo keeps the payment code scannable.
 */
const PAYMENT_STYLE: Partial<QRStyleConfig> = {
  dotStyle: "rounded",
  eyeFrameStyle: "rounded",
  errorCorrection: "Q",
};

export default function PaymentQrCodeGeneratorTool({ tool }: ImageToolProps) {
  const accent = (tool.accent ?? "emerald") as AccentKey;
  const style0 = accentStyle(accent);

  const [methodId, setMethodId] = React.useState<PaymentMethod["id"]>("upi");
  const active = METHODS.find((m) => m.id === methodId) ?? DEFAULT_METHOD;

  return (
    <div className="flex flex-col gap-4">
      {/* Payment-method selector - the tool's one bespoke control. */}
      <div
        role="radiogroup"
        aria-label="Payment method"
        className="rounded-lg border border-border bg-card/60 p-3"
      >
        <div className="mb-2 flex items-center gap-2 px-1">
          <Icon name="Wallet" size={15} className={style0.text} />
          <span className="text-sm font-semibold text-foreground">Payment method</span>
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {METHODS.map((m) => {
            const selected = m.id === active.id;
            return (
              <button
                key={m.id}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => setMethodId(m.id)}
                className={cn(
                  "flex flex-col gap-1 rounded-md border p-3 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
                  selected
                    ? cn("border-transparent", style0.soft)
                    : "border-border bg-background/40 text-muted-foreground hover:bg-accent hover:text-foreground",
                )}
              >
                <span className="flex items-center gap-2 text-sm font-semibold">
                  <Icon name={m.icon} size={16} className={selected ? undefined : style0.text} />
                  {m.label}
                </span>
                <span className="text-xs leading-snug text-muted-foreground">{m.blurb}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Honest, method-specific note: we never process the payment. */}
      <p className="flex items-start gap-2 rounded-md border border-border bg-muted/30 px-3 py-2 text-xs leading-relaxed text-muted-foreground">
        <Icon name="Info" size={14} className={cn("mt-0.5 shrink-0", style0.text)} />
        <span>
          This creates a <strong className="font-medium text-foreground">static</strong> payment QR that
          pre-fills your payee details. It never processes, holds or confirms the payment, money moves inside
          the payer&rsquo;s own {active.label} app, and your details are encoded locally in your browser (never
          uploaded). Verify your{" "}
          {active.id === "upi" ? "VPA" : active.id === "paypal" ? "PayPal handle" : "wallet address"} before you
          print and share it.
        </span>
      </p>

      {/*
        The reused, desktop-grade studio - locked to the active method's content
        type. `key` remounts it on method change so the form, seeded example and
        live preview reset cleanly to the chosen payment type.
      */}
      <QRStudio
        key={active.id}
        contentType={active.contentType}
        lockType
        defaultFields={active.defaultFields}
        defaultStyle={PAYMENT_STYLE}
        accent={accent}
        filename={active.filename}
      />
    </div>
  );
}
