"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { accentStyle } from "@/lib/design";
import type { ImageToolProps } from "@/components/tool/types";
import { Field, SelectField, Toggle, StatBadge, type Example } from "@/components/tool/dev";
import {
  GeneratorWithPreview,
  ScorePanel,
  CheckList,
  gradeForScore,
  type CheckItem,
} from "@/components/tool/seo";
import {
  buildLocalBusiness,
  validateJsonLd,
  type LocalBusinessInput,
  type OpeningHoursInput,
  type SchemaOutput,
} from "@/lib/seo-tools/schema";

/* -------------------------------------------------------------------------- */
/*  Static option catalogues                                                  */
/* -------------------------------------------------------------------------- */

/** The most useful schema.org LocalBusiness subtypes (all inherit LocalBusiness). */
const TYPE_OPTIONS = [
  { value: "LocalBusiness", label: "LocalBusiness (generic)" },
  { value: "Restaurant", label: "Restaurant" },
  { value: "CafeOrCoffeeShop", label: "Cafe / Coffee shop" },
  { value: "BarOrPub", label: "Bar / Pub" },
  { value: "Bakery", label: "Bakery" },
  { value: "Store", label: "Store / Shop" },
  { value: "GroceryStore", label: "Grocery store" },
  { value: "ClothingStore", label: "Clothing store" },
  { value: "Hotel", label: "Hotel / Lodging" },
  { value: "Dentist", label: "Dentist" },
  { value: "MedicalClinic", label: "Medical clinic" },
  { value: "Physician", label: "Physician" },
  { value: "Attorney", label: "Attorney / Legal" },
  { value: "HairSalon", label: "Hair salon" },
  { value: "BeautySalon", label: "Beauty salon" },
  { value: "HealthClub", label: "Gym / Health club" },
  { value: "AutoRepair", label: "Auto repair" },
  { value: "RealEstateAgent", label: "Real estate agent" },
  { value: "ProfessionalService", label: "Professional service" },
] as const;

type BusinessType = (typeof TYPE_OPTIONS)[number]["value"];

const PRICE_RANGE_OPTIONS = [
  { value: "", label: "- none -" },
  { value: "$", label: "$ (budget)" },
  { value: "$$", label: "$$ (moderate)" },
  { value: "$$$", label: "$$$ (upscale)" },
  { value: "$$$$", label: "$$$$ (fine)" },
] as const;

/** The seven days as schema.org DayOfWeek values, in week order. */
const DAYS = [
  { key: "Monday", short: "Mon" },
  { key: "Tuesday", short: "Tue" },
  { key: "Wednesday", short: "Wed" },
  { key: "Thursday", short: "Thu" },
  { key: "Friday", short: "Fri" },
  { key: "Saturday", short: "Sat" },
  { key: "Sunday", short: "Sun" },
] as const;

type DayKey = (typeof DAYS)[number]["key"];

/* -------------------------------------------------------------------------- */
/*  State model                                                               */
/* -------------------------------------------------------------------------- */

/** One time range (a shift). A day may have one or two ranges (split shift). */
interface Shift {
  opens: string;
  closes: string;
}

/** Per-day hours: whether open, and its shift(s). */
interface DayHours {
  open: boolean;
  shifts: Shift[];
}

interface LbState {
  type: BusinessType;
  name: string;
  url: string;
  image: string;
  telephone: string;
  priceRange: string;
  streetAddress: string;
  addressLocality: string;
  addressRegion: string;
  postalCode: string;
  addressCountry: string;
  latitude: string;
  longitude: string;
  ratingValue: string;
  reviewCount: string;
  sameAs: string;
  hours: Record<DayKey, DayHours>;
}

const CLOSED: DayHours = { open: false, shifts: [{ opens: "09:00", closes: "17:00" }] };

function emptyHours(): Record<DayKey, DayHours> {
  return {
    Monday: { ...CLOSED, shifts: [{ ...CLOSED.shifts[0]! }] },
    Tuesday: { ...CLOSED, shifts: [{ ...CLOSED.shifts[0]! }] },
    Wednesday: { ...CLOSED, shifts: [{ ...CLOSED.shifts[0]! }] },
    Thursday: { ...CLOSED, shifts: [{ ...CLOSED.shifts[0]! }] },
    Friday: { ...CLOSED, shifts: [{ ...CLOSED.shifts[0]! }] },
    Saturday: { ...CLOSED, shifts: [{ ...CLOSED.shifts[0]! }] },
    Sunday: { ...CLOSED, shifts: [{ ...CLOSED.shifts[0]! }] },
  };
}

const INITIAL_STATE: LbState = {
  type: "LocalBusiness",
  name: "",
  url: "",
  image: "",
  telephone: "",
  priceRange: "",
  streetAddress: "",
  addressLocality: "",
  addressRegion: "",
  postalCode: "",
  addressCountry: "",
  latitude: "",
  longitude: "",
  ratingValue: "",
  reviewCount: "",
  sameAs: "",
  hours: emptyHours(),
};

/* -------------------------------------------------------------------------- */
/*  Examples                                                                  */
/* -------------------------------------------------------------------------- */

/** Build a weekly hours record from a compact spec (day → [open, close] or null). */
function hoursFrom(
  spec: Partial<Record<DayKey, [string, string] | [string, string][] | null>>,
): Record<DayKey, DayHours> {
  const out = emptyHours();
  for (const { key } of DAYS) {
    const entry = spec[key];
    if (!entry) {
      out[key] = { open: false, shifts: [{ opens: "09:00", closes: "17:00" }] };
      continue;
    }
    const ranges = Array.isArray(entry[0]) ? (entry as [string, string][]) : [entry as [string, string]];
    out[key] = { open: true, shifts: ranges.map(([opens, closes]) => ({ opens, closes })) };
  }
  return out;
}

const WEEKDAYS_9_5: Partial<Record<DayKey, [string, string]>> = {
  Monday: ["09:00", "17:00"],
  Tuesday: ["09:00", "17:00"],
  Wednesday: ["09:00", "17:00"],
  Thursday: ["09:00", "17:00"],
  Friday: ["09:00", "17:00"],
};

const RESTAURANT_EXAMPLE: LbState = {
  type: "Restaurant",
  name: "The Corner Bistro",
  url: "https://cornerbistro.example.com",
  image: "https://cornerbistro.example.com/storefront.jpg",
  telephone: "+1-555-0142",
  priceRange: "$$",
  streetAddress: "123 Main St",
  addressLocality: "Springfield",
  addressRegion: "IL",
  postalCode: "62704",
  addressCountry: "US",
  latitude: "39.7817",
  longitude: "-89.6501",
  ratingValue: "4.6",
  reviewCount: "312",
  sameAs:
    "https://www.google.com/maps/place/corner-bistro\nhttps://www.facebook.com/cornerbistro\nhttps://www.instagram.com/cornerbistro",
  hours: hoursFrom({
    Monday: null,
    Tuesday: [["11:30", "14:30"], ["17:30", "22:00"]],
    Wednesday: [["11:30", "14:30"], ["17:30", "22:00"]],
    Thursday: [["11:30", "14:30"], ["17:30", "22:00"]],
    Friday: [["11:30", "14:30"], ["17:30", "23:00"]],
    Saturday: [["17:30", "23:00"]],
    Sunday: [["17:30", "21:00"]],
  }),
};

const CAFE_EXAMPLE: LbState = {
  type: "CafeOrCoffeeShop",
  name: "Daybreak Coffee",
  url: "https://daybreak.example.com",
  image: "https://daybreak.example.com/cafe.jpg",
  telephone: "+1-555-0188",
  priceRange: "$",
  streetAddress: "8 Elm Avenue",
  addressLocality: "Portland",
  addressRegion: "OR",
  postalCode: "97205",
  addressCountry: "US",
  latitude: "45.5202",
  longitude: "-122.6819",
  ratingValue: "4.8",
  reviewCount: "540",
  sameAs: "https://www.instagram.com/daybreakcoffee",
  hours: hoursFrom({
    Monday: ["06:30", "18:00"],
    Tuesday: ["06:30", "18:00"],
    Wednesday: ["06:30", "18:00"],
    Thursday: ["06:30", "18:00"],
    Friday: ["06:30", "19:00"],
    Saturday: ["07:00", "19:00"],
    Sunday: ["07:00", "16:00"],
  }),
};

const DENTIST_EXAMPLE: LbState = {
  type: "Dentist",
  name: "Bright Smile Dental",
  url: "https://brightsmile.example.com",
  image: "https://brightsmile.example.com/office.jpg",
  telephone: "+1-555-0170",
  priceRange: "$$$",
  streetAddress: "500 Oak Boulevard, Suite 210",
  addressLocality: "Austin",
  addressRegion: "TX",
  postalCode: "78701",
  addressCountry: "US",
  latitude: "30.2672",
  longitude: "-97.7431",
  ratingValue: "4.9",
  reviewCount: "128",
  sameAs: "https://www.google.com/maps/place/bright-smile-dental",
  hours: hoursFrom(WEEKDAYS_9_5),
};

const STORE_EXAMPLE: LbState = {
  type: "Store",
  name: "North Ridge Outdoors",
  url: "https://northridge.example.com",
  image: "https://northridge.example.com/shop.jpg",
  telephone: "+1-555-0155",
  priceRange: "$$",
  streetAddress: "42 Summit Way",
  addressLocality: "Denver",
  addressRegion: "CO",
  postalCode: "80202",
  addressCountry: "US",
  latitude: "39.7392",
  longitude: "-104.9903",
  ratingValue: "4.5",
  reviewCount: "97",
  sameAs: "https://www.facebook.com/northridgeoutdoors",
  hours: hoursFrom({
    Monday: ["10:00", "20:00"],
    Tuesday: ["10:00", "20:00"],
    Wednesday: ["10:00", "20:00"],
    Thursday: ["10:00", "20:00"],
    Friday: ["10:00", "21:00"],
    Saturday: ["09:00", "21:00"],
    Sunday: ["11:00", "18:00"],
  }),
};

/* -------------------------------------------------------------------------- */
/*  State → engine input                                                      */
/* -------------------------------------------------------------------------- */

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

function trimmed(v: string): string | undefined {
  const s = v.trim();
  return s ? s : undefined;
}

function splitLines(v: string): string[] | undefined {
  const list = v
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter(Boolean);
  return list.length ? list : undefined;
}

/** Collect all valid OpeningHoursSpecification entries from the hours table. */
function collectHours(hours: Record<DayKey, DayHours>): OpeningHoursInput[] {
  const out: OpeningHoursInput[] = [];
  for (const { key } of DAYS) {
    const day = hours[key];
    if (!day.open) continue;
    for (const shift of day.shifts) {
      if (TIME_RE.test(shift.opens) && TIME_RE.test(shift.closes)) {
        out.push({ dayOfWeek: key, opens: shift.opens, closes: shift.closes });
      }
    }
  }
  return out;
}

function toInput(s: LbState): LocalBusinessInput {
  const lat = trimmed(s.latitude);
  const lng = trimmed(s.longitude);
  const hasGeo =
    lat !== undefined && lng !== undefined && Number.isFinite(Number(lat)) && Number.isFinite(Number(lng));

  const address: LocalBusinessInput["address"] = {
    streetAddress: trimmed(s.streetAddress),
    addressLocality: trimmed(s.addressLocality),
    addressRegion: trimmed(s.addressRegion),
    postalCode: trimmed(s.postalCode),
    addressCountry: trimmed(s.addressCountry),
  };
  const hasAddress = Object.values(address).some(Boolean);

  const openingHours = collectHours(s.hours);
  const rating = trimmed(s.ratingValue);

  return {
    name: s.name.trim(),
    type: s.type,
    url: trimmed(s.url),
    image: trimmed(s.image),
    telephone: trimmed(s.telephone),
    priceRange: trimmed(s.priceRange),
    address: hasAddress ? address : undefined,
    geo: hasGeo ? { latitude: lat!, longitude: lng! } : undefined,
    openingHours: openingHours.length ? openingHours : undefined,
    sameAs: splitLines(s.sameAs),
    aggregateRating: rating ? { ratingValue: rating, reviewCount: trimmed(s.reviewCount) } : undefined,
  };
}

/* -------------------------------------------------------------------------- */
/*  Validity, graded against LocalBusiness rules (robust to subtypes) */
/* -------------------------------------------------------------------------- */

interface Validity {
  checks: CheckItem[];
  score: number;
  passCount: number;
  warnCount: number;
  failCount: number;
  summary: string;
}

function computeValidity(state: LbState, input: LocalBusinessInput, jsonLd: Record<string, unknown>): Validity {
  const checks: CheckItem[] = [];

  // Base JSON-LD sanity via the engine (catches missing @type/@context edge cases).
  const base = validateJsonLd(jsonLd);

  // --- Required: name ---
  const hasName = Boolean(input.name);
  checks.push({
    id: "req-name",
    status: hasName ? "pass" : "fail",
    label: "Business name",
    detail: hasName ? "Present, the one required property for LocalBusiness." : "name is required for LocalBusiness.",
    fix: hasName ? undefined : "Enter your business name above.",
    group: "Required",
  });

  if (!base.types.includes(state.type) && hasName) {
    // Should never happen, but surface engine-level errors if they appear.
    for (const e of base.errors) {
      checks.push({
        id: `base-${e.path ?? e.message}`,
        status: "fail",
        label: e.path ?? "Structured data",
        detail: e.message,
        group: "Required",
      });
    }
  }

  // --- Recommended local-SEO properties ---
  const addr = input.address;
  const addrParts = addr ? Object.values(addr).filter(Boolean).length : 0;
  const addrComplete = Boolean(
    addr?.streetAddress && addr.addressLocality && addr.postalCode && addr.addressCountry,
  );
  checks.push({
    id: "rec-address",
    status: addrComplete ? "pass" : addrParts > 0 ? "warn" : "warn",
    label: "Postal address",
    detail: addrComplete
      ? "Complete street, city, postal code and country."
      : addrParts > 0
        ? `Partial, ${addrParts} of 5 address fields filled. Add street, city, postal code and country.`
        : "Missing. A full address is the strongest local-SEO signal.",
    fix: addrComplete ? undefined : "Fill the street, city, region, postal code and country fields.",
    group: "Recommended",
  });

  const hasPhone = Boolean(input.telephone);
  checks.push({
    id: "rec-phone",
    status: hasPhone ? "pass" : "warn",
    label: "Telephone",
    detail: hasPhone ? "Present." : "Recommended: add a phone number in international format (e.g. +1-555-0100).",
    group: "Recommended",
  });

  const hoursCount = input.openingHours?.length ?? 0;
  checks.push({
    id: "rec-hours",
    status: hoursCount > 0 ? "pass" : "warn",
    label: "Opening hours",
    detail:
      hoursCount > 0
        ? `${hoursCount} opening-hours ${hoursCount === 1 ? "specification" : "specifications"} generated.`
        : "Recommended, mark at least one day open with valid opens/closes times.",
    group: "Recommended",
  });

  const hasImage = Boolean(input.image);
  checks.push({
    id: "rec-image",
    status: hasImage ? "pass" : "warn",
    label: "Image",
    detail: hasImage ? "Present." : "Recommended: a storefront or logo image URL enriches local results.",
    group: "Recommended",
  });

  // --- Optional but valuable extras ---
  const hasGeo = Boolean(input.geo);
  checks.push({
    id: "opt-geo",
    status: hasGeo ? "pass" : "info",
    label: "Geo coordinates",
    detail: hasGeo
      ? "GeoCoordinates present, precise map pin."
      : "Optional. Add exact latitude/longitude for an unambiguous location.",
    group: "Optional",
  });

  const sameAsCount = input.sameAs?.length ?? 0;
  checks.push({
    id: "opt-sameas",
    status: sameAsCount > 0 ? "pass" : "info",
    label: "sameAs profiles",
    detail:
      sameAsCount > 0
        ? `${sameAsCount} profile ${sameAsCount === 1 ? "URL" : "URLs"} linked.`
        : "Optional: link your Google Business Profile and social pages.",
    group: "Optional",
  });

  // --- Data-quality warnings that don't fit required/recommended ---
  // Flag any open day that has an invalid or missing time (silently dropped).
  const brokenDays: string[] = [];
  for (const { key } of DAYS) {
    const day = state.hours[key];
    if (!day.open) continue;
    const anyValid = day.shifts.some((sh) => TIME_RE.test(sh.opens) && TIME_RE.test(sh.closes));
    if (!anyValid) brokenDays.push(key);
  }
  if (brokenDays.length) {
    checks.push({
      id: "warn-hours-format",
      status: "warn",
      label: "Invalid opening-hours time",
      detail: `${brokenDays.join(", ")} ${brokenDays.length === 1 ? "is" : "are"} marked open but ${brokenDays.length === 1 ? "has" : "have"} no valid 24-hour time. That ${brokenDays.length === 1 ? "day is" : "days are"} omitted from the output.`,
      fix: "Use HH:MM in 24-hour format, e.g. 09:00 and 17:30.",
      group: "Recommended",
    });
  }

  const passCount = checks.filter((c) => c.status === "pass").length;
  const warnCount = checks.filter((c) => c.status === "warn").length;
  const failCount = checks.filter((c) => c.status === "fail").length;

  // Score: required failures dominate; recommended warnings shave points.
  const raw = 100 - failCount * 40 - warnCount * 9;
  const score = !hasName ? (input.name === "" ? 0 : 20) : Math.max(0, Math.min(100, raw));

  const summary = !hasName
    ? "Add a business name, it's the one required property."
    : failCount > 0
      ? `${failCount} required ${failCount === 1 ? "property is" : "properties are"} missing.`
      : warnCount === 0
        ? "Complete. All recommended local-SEO properties are present."
        : `Valid: ${warnCount} recommended ${warnCount === 1 ? "property" : "properties"} would strengthen it.`;

  return { checks, score, passCount, warnCount, failCount, summary };
}

/* -------------------------------------------------------------------------- */
/*  UI helpers                                                                */
/* -------------------------------------------------------------------------- */

const inputCls =
  "w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-sm outline-none transition-colors placeholder:text-muted-foreground/60 focus-visible:ring-2 focus-visible:ring-ring";

function TextInput({
  id,
  value,
  onChange,
  placeholder,
  type = "text",
  inputMode,
  ariaLabel,
}: {
  id?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  inputMode?: "text" | "numeric" | "decimal" | "tel" | "url";
  ariaLabel?: string;
}) {
  return (
    <input
      id={id}
      type={type}
      value={value}
      inputMode={inputMode}
      aria-label={ariaLabel}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className={inputCls}
    />
  );
}

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */

export default function LocalBusinessSchemaGeneratorTool({ tool }: ImageToolProps) {
  const style = accentStyle(tool.accent ?? "amber");
  const [state, setState] = React.useState<LbState>(INITIAL_STATE);
  const [minified, setMinified] = React.useState(false);

  const patch = React.useCallback(
    (part: Partial<LbState>) => setState((s) => ({ ...s, ...part })),
    [],
  );

  const setDay = React.useCallback((key: DayKey, next: DayHours) => {
    setState((s) => ({ ...s, hours: { ...s.hours, [key]: next } }));
  }, []);

  const input = React.useMemo(() => toInput(state), [state]);
  const output = React.useMemo<SchemaOutput>(() => buildLocalBusiness(input), [input]);
  const validity = React.useMemo(
    () => computeValidity(state, input, output.jsonLd),
    [state, input, output.jsonLd],
  );

  const code = minified
    ? `<script type="application/ld+json">${output.minified}</script>`
    : output.scriptTag;

  const grade = gradeForScore(validity.score);

  /* -- examples (whole-state presets) --------------------------------------- */
  const examples = React.useMemo<ReadonlyArray<Example<LbState>>>(
    () => [
      { label: "Restaurant (split shifts)", description: "Lunch + dinner service, rating & socials", icon: "UtensilsCrossed", value: RESTAURANT_EXAMPLE },
      { label: "Coffee shop", description: "Daily hours, single shift", icon: "Coffee", value: CAFE_EXAMPLE },
      { label: "Retail store", description: "Extended weekend hours", icon: "ShoppingBag", value: STORE_EXAMPLE },
      { label: "Dentist", description: "Weekday 9–5 professional service", icon: "Stethoscope", value: DENTIST_EXAMPLE },
    ],
    [],
  );

  const serialize = React.useCallback((s: LbState) => JSON.stringify(s), []);
  const deserialize = React.useCallback((raw: string): LbState | null => {
    try {
      const parsed = JSON.parse(raw) as Partial<LbState>;
      if (parsed && typeof parsed === "object" && typeof parsed.name === "string" && parsed.hours) {
        // Merge onto the initial state so any missing key is safely defaulted.
        return { ...INITIAL_STATE, ...parsed, hours: { ...emptyHours(), ...parsed.hours } };
      }
    } catch {
      /* ignore */
    }
    return null;
  }, []);

  /* -- form ------------------------------------------------------------------ */
  const form = (
    <div className="flex flex-col gap-5">
      {/* Business type + name */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Business type" htmlFor="lb-type" hint="The schema.org @type. Pick the most specific match.">
          <SelectField<BusinessType>
            id="lb-type"
            className="w-full"
            ariaLabel="Business type"
            value={state.type}
            onChange={(v) => patch({ type: v })}
            options={TYPE_OPTIONS}
          />
        </Field>
        <Field label="Business name" htmlFor="lb-name" hint="Required. Match your Google Business Profile exactly.">
          <TextInput id="lb-name" value={state.name} onChange={(v) => patch({ name: v })} placeholder="The Corner Bistro" />
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Website URL" htmlFor="lb-url">
          <TextInput id="lb-url" type="url" inputMode="url" value={state.url} onChange={(v) => patch({ url: v })} placeholder="https://example.com" />
        </Field>
        <Field label="Image URL" htmlFor="lb-image" hint="Storefront photo or logo.">
          <TextInput id="lb-image" type="url" inputMode="url" value={state.image} onChange={(v) => patch({ image: v })} placeholder="https://example.com/storefront.jpg" />
        </Field>
        <Field label="Telephone" htmlFor="lb-phone" hint="International format is safest.">
          <TextInput id="lb-phone" type="tel" inputMode="tel" value={state.telephone} onChange={(v) => patch({ telephone: v })} placeholder="+1-555-0100" />
        </Field>
        <Field label="Price range" htmlFor="lb-price">
          <SelectField<string>
            id="lb-price"
            className="w-full"
            ariaLabel="Price range"
            value={state.priceRange}
            onChange={(v) => patch({ priceRange: v })}
            options={PRICE_RANGE_OPTIONS}
          />
        </Field>
      </div>

      {/* Address */}
      <fieldset className="flex flex-col gap-3 rounded-lg border border-border p-3">
        <legend className="flex items-center gap-1.5 px-1 text-xs font-semibold text-foreground">
          <Icon name="MapPin" size={13} className={style.text} />
          Address
        </legend>
        <Field label="Street address" htmlFor="lb-street">
          <TextInput id="lb-street" value={state.streetAddress} onChange={(v) => patch({ streetAddress: v })} placeholder="123 Main St" />
        </Field>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="City" htmlFor="lb-city">
            <TextInput id="lb-city" value={state.addressLocality} onChange={(v) => patch({ addressLocality: v })} placeholder="Springfield" />
          </Field>
          <Field label="Region / state" htmlFor="lb-region">
            <TextInput id="lb-region" value={state.addressRegion} onChange={(v) => patch({ addressRegion: v })} placeholder="IL" />
          </Field>
          <Field label="Postal code" htmlFor="lb-zip">
            <TextInput id="lb-zip" value={state.postalCode} onChange={(v) => patch({ postalCode: v })} placeholder="62704" />
          </Field>
          <Field label="Country" htmlFor="lb-country" hint="ISO code or name, e.g. US.">
            <TextInput id="lb-country" value={state.addressCountry} onChange={(v) => patch({ addressCountry: v })} placeholder="US" />
          </Field>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Latitude" htmlFor="lb-lat" hint="Decimal degrees. South is negative.">
            <TextInput id="lb-lat" inputMode="decimal" value={state.latitude} onChange={(v) => patch({ latitude: v })} placeholder="39.7817" />
          </Field>
          <Field label="Longitude" htmlFor="lb-lng" hint="Decimal degrees. West is negative.">
            <TextInput id="lb-lng" inputMode="decimal" value={state.longitude} onChange={(v) => patch({ longitude: v })} placeholder="-89.6501" />
          </Field>
        </div>
      </fieldset>

      {/* Opening hours */}
      <fieldset className="flex flex-col gap-2 rounded-lg border border-border p-3">
        <legend className="flex items-center gap-1.5 px-1 text-xs font-semibold text-foreground">
          <Icon name="Clock" size={13} className={style.text} />
          Opening hours
        </legend>
        <div className="flex flex-col divide-y divide-border">
          {DAYS.map(({ key, short }) => {
            const day = state.hours[key];
            return (
              <div key={key} className="flex flex-col gap-2 py-2 first:pt-0 last:pb-0">
                <div className="flex items-center justify-between gap-2">
                  <Toggle
                    checked={day.open}
                    onChange={(open) => setDay(key, { ...day, open })}
                    label={<span className="w-9 text-sm font-medium tabular-nums">{short}</span>}
                    id={`lb-day-${key}`}
                  />
                  {day.open ? (
                    <button
                      type="button"
                      onClick={() =>
                        setDay(key, {
                          ...day,
                          shifts:
                            day.shifts.length >= 2
                              ? [day.shifts[0]!]
                              : [...day.shifts, { opens: "18:00", closes: "22:00" }],
                        })
                      }
                      className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <Icon name={day.shifts.length >= 2 ? "Minus" : "Plus"} size={12} />
                      {day.shifts.length >= 2 ? "Single shift" : "Split shift"}
                    </button>
                  ) : (
                    <span className="text-xs text-muted-foreground/70">Closed</span>
                  )}
                </div>
                {day.open && (
                  <div className="flex flex-col gap-1.5 pl-1">
                    {day.shifts.map((shift, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <input
                          type="time"
                          aria-label={`${key} shift ${i + 1} opens`}
                          value={shift.opens}
                          onChange={(e) =>
                            setDay(key, {
                              ...day,
                              shifts: day.shifts.map((sh, j) => (j === i ? { ...sh, opens: e.target.value } : sh)),
                            })
                          }
                          className={cn(inputCls, "max-w-[8rem]")}
                        />
                        <span className="text-xs text-muted-foreground">to</span>
                        <input
                          type="time"
                          aria-label={`${key} shift ${i + 1} closes`}
                          value={shift.closes}
                          onChange={(e) =>
                            setDay(key, {
                              ...day,
                              shifts: day.shifts.map((sh, j) => (j === i ? { ...sh, closes: e.target.value } : sh)),
                            })
                          }
                          className={cn(inputCls, "max-w-[8rem]")}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </fieldset>

      {/* Rating + sameAs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Rating value" htmlFor="lb-rating" hint="Aggregate star rating, e.g. 4.6.">
          <TextInput id="lb-rating" inputMode="decimal" value={state.ratingValue} onChange={(v) => patch({ ratingValue: v })} placeholder="4.6" />
        </Field>
        <Field label="Review count" htmlFor="lb-reviews">
          <TextInput id="lb-reviews" inputMode="numeric" value={state.reviewCount} onChange={(v) => patch({ reviewCount: v })} placeholder="215" />
        </Field>
      </div>

      <Field
        label="sameAs, profile URLs"
        htmlFor="lb-sameas"
        hint="One per line: Google Business Profile, Facebook, Instagram…"
      >
        <textarea
          id="lb-sameas"
          rows={3}
          value={state.sameAs}
          onChange={(e) => patch({ sameAs: e.target.value })}
          placeholder={"https://www.google.com/maps/place/…\nhttps://www.facebook.com/yourbusiness"}
          className={cn(inputCls, "resize-y font-mono text-xs leading-relaxed")}
        />
      </Field>
    </div>
  );

  /* -- preview: validity panel ---------------------------------------------- */
  const preview = (
    <div className="flex flex-col gap-4">
      <ScorePanel
        score={validity.score}
        grade={grade}
        summary={validity.summary}
        counts={{ pass: validity.passCount, warn: validity.warnCount, fail: validity.failCount }}
      />
      <CheckList items={validity.checks} grouped emptyLabel="Enter a business name to start validating." />
      <p className="flex items-start gap-1.5 text-xs leading-relaxed text-muted-foreground">
        <Icon name="Info" size={13} className={cn("mt-0.5 shrink-0", style.text)} />
        <span>
          This is a pragmatic required/recommended check for LocalBusiness. Confirm final eligibility with{" "}
          <a
            href="https://search.google.com/test/rich-results"
            target="_blank"
            rel="noopener noreferrer"
            className={cn("font-medium underline underline-offset-2", style.text)}
          >
            Google&rsquo;s Rich Results Test
          </a>{" "}
          before publishing.
        </span>
      </p>
    </div>
  );

  const hoursCount = input.openingHours?.length ?? 0;
  const stats = (
    <>
      <StatBadge icon="Store" label="Type" value={state.type} tone="info" title="Active schema.org @type" />
      <StatBadge
        icon="Clock"
        label="Hours"
        value={`${hoursCount} spec${hoursCount === 1 ? "" : "s"}`}
        title="OpeningHoursSpecification nodes generated"
      />
      <StatBadge icon="Ruler" label="Size" value={`${output.minified.length.toLocaleString()} B`} title="Minified JSON-LD byte length" />
      <StatBadge
        icon={validity.failCount === 0 && state.name.trim() ? "CircleCheck" : "XCircle"}
        label="Status"
        value={validity.failCount === 0 && state.name.trim() ? "Valid" : "Incomplete"}
        tone={validity.failCount === 0 && state.name.trim() ? "success" : "danger"}
        title="Required-property validity"
      />
    </>
  );

  return (
    <GeneratorWithPreview<LbState>
      value={state}
      onChange={setState}
      initialValue={INITIAL_STATE}
      code={code}
      language="JSON-LD"
      form={form}
      preview={preview}
      previewLabel="Validity & local-SEO check"
      downloadName="localbusiness-schema.json"
      downloadMime="application/ld+json;charset=utf-8"
      examples={examples}
      serialize={serialize}
      deserialize={deserialize}
      stats={stats}
      toolbarExtras={
        <button
          type="button"
          onClick={() => setMinified((m) => !m)}
          aria-pressed={minified}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
            minified ? style.soft : "text-muted-foreground hover:text-foreground",
          )}
          title="Toggle minified output"
        >
          <Icon name={minified ? "Minimize2" : "Maximize2"} size={13} />
          {minified ? "Minified" : "Pretty"}
        </button>
      }
    />
  );
}
