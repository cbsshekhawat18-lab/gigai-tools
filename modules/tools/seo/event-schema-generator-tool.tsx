"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { accentStyle } from "@/lib/design";
import type { ImageToolProps } from "@/components/tool/types";
import { Field, SelectField, StatBadge, type Example } from "@/components/tool/dev";
import {
  GeneratorWithPreview,
  SchemaForm,
  ScorePanel,
  CheckList,
  gradeForScore,
  type FieldSpec,
  type SchemaValues,
  type FieldValue,
  type CheckItem,
} from "@/components/tool/seo";
import {
  buildEvent,
  buildGeneric,
  validateJsonLd,
  type SchemaOutput,
} from "@/lib/seo-tools/schema";

/* -------------------------------------------------------------------------- */
/*  Small, type-safe value readers                                            */
/* -------------------------------------------------------------------------- */

function str(v: FieldValue | undefined): string {
  return typeof v === "string" ? v : "";
}
function opt(v: FieldValue | undefined): string | undefined {
  const s = str(v).trim();
  return s ? s : undefined;
}

/* -------------------------------------------------------------------------- */
/*  Attendance modes + statuses                                               */
/* -------------------------------------------------------------------------- */

/** How the audience attends: drives which location fields matter. */
type AttendanceMode = "Offline" | "Online" | "Mixed";

const ATTENDANCE_OPTS: ReadonlyArray<{ value: AttendanceMode; label: string; hint: string }> = [
  { value: "Offline", label: "In-person (offline)", hint: "A physical venue with a postal address." },
  { value: "Online", label: "Virtual (online)", hint: "A remote event reached at a URL." },
  { value: "Mixed", label: "Hybrid (offline + online)", hint: "Both a physical venue and a virtual URL." },
];

/** schema.org enum value for each mode (expanded to a full URL by the engine). */
const ATTENDANCE_ENUM: Record<AttendanceMode, string> = {
  Offline: "OfflineEventAttendanceMode",
  Online: "OnlineEventAttendanceMode",
  Mixed: "MixedEventAttendanceMode",
};

const STATUS_OPTS = [
  { value: "EventScheduled", label: "Scheduled" },
  { value: "EventCancelled", label: "Cancelled" },
  { value: "EventPostponed", label: "Postponed" },
  { value: "EventRescheduled", label: "Rescheduled" },
  { value: "EventMovedOnline", label: "Moved online" },
];

const CURRENCY_OPTS = [
  { value: "", label: "—" },
  { value: "USD", label: "USD" },
  { value: "EUR", label: "EUR" },
  { value: "GBP", label: "GBP" },
  { value: "INR", label: "INR" },
  { value: "CAD", label: "CAD" },
  { value: "AUD", label: "AUD" },
  { value: "JPY", label: "JPY" },
];

const AVAILABILITY_OPTS = [
  { value: "", label: "—" },
  { value: "InStock", label: "Tickets available (InStock)" },
  { value: "PreOrder", label: "Pre-order" },
  { value: "SoldOut", label: "Sold out" },
];

/* -------------------------------------------------------------------------- */
/*  Form spec: shared basics + location fields toggled by mode */
/* -------------------------------------------------------------------------- */

const BASE_FIELDS: ReadonlyArray<FieldSpec> = [
  { name: "name", label: "Event name", type: "text", required: true, full: true, placeholder: "GigAI SEO Summit 2026" },
  { name: "description", label: "Description", type: "textarea", rows: 2, full: true, placeholder: "A one-day summit on structured data, Core Web Vitals and modern search." },
  { name: "startDate", label: "Start date & time", type: "datetime", required: true },
  { name: "endDate", label: "End date & time", type: "datetime" },
  { name: "url", label: "Event page URL", type: "url", placeholder: "https://example.com/events/seo-summit-2026" },
  { name: "image", label: "Image URL", type: "url", placeholder: "https://example.com/events/summit.jpg" },
];

const PHYSICAL_FIELDS: ReadonlyArray<FieldSpec> = [
  { name: "locationName", label: "Venue name", type: "text", required: true, placeholder: "Metro Convention Center" },
  { name: "streetAddress", label: "Street address", type: "text", placeholder: "500 Congress Ave" },
  { name: "addressLocality", label: "City", type: "text", placeholder: "Austin" },
  { name: "addressRegion", label: "Region / state", type: "text", placeholder: "TX" },
  { name: "postalCode", label: "Postal code", type: "text", placeholder: "78701" },
  { name: "addressCountry", label: "Country", type: "text", placeholder: "US" },
];

const VIRTUAL_FIELDS: ReadonlyArray<FieldSpec> = [
  { name: "virtualUrl", label: "Virtual location URL", type: "url", required: true, full: true, placeholder: "https://example.com/live/summit" },
];

const PEOPLE_FIELDS: ReadonlyArray<FieldSpec> = [
  { name: "organizer", label: "Organizer", type: "text", placeholder: "Example Inc." },
  { name: "performer", label: "Performer", type: "text", placeholder: "Jordan Rivera" },
];

const OFFER_FIELDS: ReadonlyArray<FieldSpec> = [
  { name: "price", label: "Ticket price", type: "text", placeholder: "199" },
  { name: "priceCurrency", label: "Currency", type: "select", options: CURRENCY_OPTS },
  { name: "availability", label: "Ticket availability", type: "select", options: AVAILABILITY_OPTS },
  { name: "offerUrl", label: "Ticket / registration URL", type: "url", full: true, placeholder: "https://example.com/events/seo-summit-2026/tickets" },
  { name: "priceValidUntil", label: "Offer valid until", type: "date" },
];

/** The subset of location fields visible for the active mode. */
function locationFields(mode: AttendanceMode): ReadonlyArray<FieldSpec> {
  switch (mode) {
    case "Online":
      return VIRTUAL_FIELDS;
    case "Mixed":
      return [...PHYSICAL_FIELDS, ...VIRTUAL_FIELDS];
    default:
      return PHYSICAL_FIELDS;
  }
}

/* -------------------------------------------------------------------------- */
/*  State                                                                     */
/* -------------------------------------------------------------------------- */

interface EventState {
  mode: AttendanceMode;
  status: string;
  values: SchemaValues;
}

const INITIAL_STATE: EventState = {
  mode: "Offline",
  status: "EventScheduled",
  values: {
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    url: "",
    image: "",
    locationName: "",
    streetAddress: "",
    addressLocality: "",
    addressRegion: "",
    postalCode: "",
    addressCountry: "",
    virtualUrl: "",
    organizer: "",
    performer: "",
    price: "",
    priceCurrency: "",
    availability: "",
    offerUrl: "",
    priceValidUntil: "",
  },
};

const EXAMPLE: EventState = {
  mode: "Mixed",
  status: "EventScheduled",
  values: {
    name: "GigAI SEO Summit 2026",
    description:
      "A one-day summit on structured data, Core Web Vitals and modern search, in person in Austin and live online worldwide.",
    startDate: "2026-09-15T09:00",
    endDate: "2026-09-15T17:00",
    url: "https://example.com/events/seo-summit-2026",
    image: "https://example.com/events/summit.jpg",
    locationName: "Metro Convention Center",
    streetAddress: "500 Congress Ave",
    addressLocality: "Austin",
    addressRegion: "TX",
    postalCode: "78701",
    addressCountry: "US",
    virtualUrl: "https://example.com/live/seo-summit-2026",
    organizer: "Example Inc.",
    performer: "Jordan Rivera",
    price: "199",
    priceCurrency: "USD",
    availability: "InStock",
    offerUrl: "https://example.com/events/seo-summit-2026/tickets",
    priceValidUntil: "2026-09-14",
  },
};

/* -------------------------------------------------------------------------- */
/*  Build JSON-LD from state                                                  */
/* -------------------------------------------------------------------------- */

/**
 * Build the Event output. `buildEvent` covers physical location + offers +
 * status/mode; we splice in a schema.org VirtualLocation for online/hybrid
 * events, which the base builder doesn't model directly.
 */
function buildEventOutput(state: EventState): SchemaOutput {
  const v = state.values;
  const hasPhysical = state.mode === "Offline" || state.mode === "Mixed";
  const hasVirtual = state.mode === "Online" || state.mode === "Mixed";
  const virtualUrl = opt(v.virtualUrl);

  const base = buildEvent({
    name: str(v.name),
    description: opt(v.description),
    startDate: opt(v.startDate),
    endDate: opt(v.endDate),
    url: opt(v.url),
    image: opt(v.image),
    performer: opt(v.performer),
    organizer: opt(v.organizer),
    eventStatus: state.status || undefined,
    eventAttendanceMode: ATTENDANCE_ENUM[state.mode],
    locationName: hasPhysical ? opt(v.locationName) : undefined,
    address: hasPhysical
      ? {
          streetAddress: opt(v.streetAddress),
          addressLocality: opt(v.addressLocality),
          addressRegion: opt(v.addressRegion),
          postalCode: opt(v.postalCode),
          addressCountry: opt(v.addressCountry),
        }
      : undefined,
    offers:
      opt(v.price) || opt(v.priceCurrency) || opt(v.availability) || opt(v.offerUrl)
        ? {
            price: opt(v.price),
            priceCurrency: opt(v.priceCurrency),
            availability: opt(v.availability),
            url: opt(v.offerUrl) ?? opt(v.url),
            priceValidUntil: opt(v.priceValidUntil),
          }
        : undefined,
  });

  // If there's no virtual leg, the base output is exactly right.
  if (!hasVirtual || !virtualUrl) return base;

  // Attach a VirtualLocation. For a hybrid event, Google expects an array of
  // two locations (the physical Place + the VirtualLocation); for a pure online
  // event, just the VirtualLocation.
  const jsonLd = { ...base.jsonLd } as Record<string, unknown>;
  const virtual = { "@type": "VirtualLocation", url: virtualUrl };
  const physical = jsonLd.location;

  jsonLd.location =
    hasPhysical && physical ? [physical, virtual] : virtual;

  // Re-emit through buildGeneric to reuse the engine's empty-stripping + output
  // shaping, preserving @type/@context ordering.
  const { "@type": type, "@context": _ctx, ...rest } = jsonLd;
  return buildGeneric(typeof type === "string" ? type : "Event", rest);
}

/* -------------------------------------------------------------------------- */
/*  Event-specific validity check (physical vs. virtual aware)                */
/* -------------------------------------------------------------------------- */

interface EventCheck {
  checks: CheckItem[];
  score: number;
  errorCount: number;
  warnCount: number;
  ok: boolean;
}

function checkEvent(state: EventState, jsonLd: Record<string, unknown>): EventCheck {
  const v = state.values;
  const hasPhysical = state.mode === "Offline" || state.mode === "Mixed";
  const hasVirtual = state.mode === "Online" || state.mode === "Mixed";

  const checks: CheckItem[] = [];
  let errors = 0;
  let warns = 0;

  const req = (ok: boolean, label: string, detail: string, fix: string, group: string) => {
    checks.push({
      status: ok ? "pass" : "fail",
      label,
      detail,
      fix: ok ? undefined : fix,
      group,
    });
    if (!ok) errors += 1;
  };
  const rec = (ok: boolean, label: string, detail: string, fix: string, group: string) => {
    checks.push({
      status: ok ? "pass" : "warn",
      label,
      detail,
      fix: ok ? undefined : fix,
      group,
    });
    if (!ok) warns += 1;
  };

  /* -- Required ----------------------------------------------------------- */
  req(
    Boolean(opt(v.name)),
    "Event name",
    opt(v.name) ? "Present." : "Required: every event needs a name.",
    "Add the event name above.",
    "Required",
  );
  req(
    Boolean(opt(v.startDate)),
    "Start date & time",
    opt(v.startDate) ? "Present." : "Required, include a start with a time and timezone.",
    "Set the start date & time above.",
    "Required",
  );

  if (hasPhysical && !hasVirtual) {
    req(
      Boolean(opt(v.locationName) || opt(v.streetAddress)),
      "Physical location",
      opt(v.locationName) || opt(v.streetAddress)
        ? "A venue name/address is present."
        : "Required for in-person events: add a venue name and address.",
      "Add the venue name and street address above.",
      "Required",
    );
  } else if (hasVirtual && !hasPhysical) {
    req(
      Boolean(opt(v.virtualUrl)),
      "Virtual location URL",
      opt(v.virtualUrl) ? "Present." : "Required for online events. Add the URL attendees join at.",
      "Add the virtual location URL above.",
      "Required",
    );
  } else {
    // Hybrid: needs BOTH a physical place and a virtual URL.
    req(
      Boolean(opt(v.locationName) || opt(v.streetAddress)),
      "Physical location (hybrid)",
      opt(v.locationName) || opt(v.streetAddress)
        ? "A venue name/address is present."
        : "Required for a hybrid event. Add the physical venue.",
      "Add the venue name and address above.",
      "Required",
    );
    req(
      Boolean(opt(v.virtualUrl)),
      "Virtual location URL (hybrid)",
      opt(v.virtualUrl) ? "Present." : "Required for a hybrid event: add the online join URL.",
      "Add the virtual location URL above.",
      "Required",
    );
  }

  /* -- Recommended -------------------------------------------------------- */
  rec(
    Boolean(opt(v.endDate)),
    "End date & time",
    opt(v.endDate) ? "Present." : "Recommended, helps Google show the event's duration.",
    "Add an end date & time above.",
    "Recommended",
  );
  rec(
    Boolean(opt(v.image)),
    "Image",
    opt(v.image) ? "Present." : "Recommended. Events with an image are more prominent.",
    "Add an image URL above.",
    "Recommended",
  );
  rec(
    Boolean(opt(v.description)),
    "Description",
    opt(v.description) ? "Present." : "Recommended, a short summary helps searchers and Google.",
    "Add a description above.",
    "Recommended",
  );
  rec(
    Boolean(opt(v.organizer)),
    "Organizer",
    opt(v.organizer) ? "Present." : "Recommended. Name who runs the event.",
    "Add the organizer above.",
    "Recommended",
  );
  rec(
    Boolean(opt(v.price) || opt(v.availability) || opt(v.offerUrl)),
    "Ticket offer",
    opt(v.price) || opt(v.availability) || opt(v.offerUrl)
      ? "Present."
      : "Recommended: an offer (price, availability or ticket URL) enables the tickets treatment.",
    "Add a ticket price, availability or registration URL above.",
    "Recommended",
  );

  // Fold in the engine's structural validation as extra safety (dates etc.).
  const engine = validateJsonLd(jsonLd);
  for (const e of engine.errors) {
    checks.push({
      status: "fail",
      label: e.path ? `Structural: ${e.path}` : "Structural error",
      detail: e.message,
      group: "Required",
    });
    errors += 1;
  }

  const errPenalty = errors * 22;
  const warnPenalty = warns * 6;
  const anyInput = Boolean(opt(v.name) || opt(v.startDate));
  const score = !anyInput ? 0 : Math.max(0, Math.min(100, 100 - errPenalty - warnPenalty));

  return { checks, score, errorCount: errors, warnCount: warns, ok: errors === 0 && anyInput };
}

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */

export default function EventSchemaGeneratorTool({ tool }: ImageToolProps) {
  const style = accentStyle(tool.accent ?? "violet");
  const [state, setState] = React.useState<EventState>(INITIAL_STATE);
  const [minified, setMinified] = React.useState(false);

  const output = React.useMemo<SchemaOutput>(() => buildEventOutput(state), [state]);
  const report = React.useMemo(
    () => checkEvent(state, output.jsonLd as Record<string, unknown>),
    [state, output.jsonLd],
  );

  const code = minified
    ? `<script type="application/ld+json">${output.minified}</script>`
    : output.scriptTag;

  const grade = gradeForScore(report.score);
  const summary = report.ok
    ? report.warnCount === 0
      ? "Valid: all required and recommended properties are present."
      : `Valid. ${report.warnCount} recommended ${report.warnCount === 1 ? "property" : "properties"} would strengthen it.`
    : `${report.errorCount} required ${report.errorCount === 1 ? "property is" : "properties are"} missing.`;

  /* -- handlers ----------------------------------------------------------- */
  const setValues = React.useCallback((next: SchemaValues) => {
    setState((s) => ({ ...s, values: { ...s.values, ...next } }));
  }, []);

  const setMode = React.useCallback((mode: AttendanceMode) => {
    setState((s) => ({ ...s, mode }));
  }, []);

  const setStatus = React.useCallback((status: string) => {
    setState((s) => ({ ...s, status }));
  }, []);

  const loadExample = React.useCallback(() => setState(EXAMPLE), []);

  const examples = React.useMemo<ReadonlyArray<Example<EventState>>>(
    () => [
      {
        label: "Hybrid conference",
        description: "In-person + online summit with tickets and a performer.",
        icon: "CalendarDays",
        value: EXAMPLE,
      },
      {
        label: "Free online webinar",
        description: "Virtual-only event with a join URL, no venue.",
        icon: "Globe2",
        value: {
          mode: "Online",
          status: "EventScheduled",
          values: {
            ...INITIAL_STATE.values,
            name: "State of Structured Data, Live Webinar",
            description: "A free 45-minute webinar on winning rich results in 2026.",
            startDate: "2026-08-05T18:00",
            endDate: "2026-08-05T18:45",
            url: "https://example.com/webinars/structured-data",
            image: "https://example.com/webinars/structured-data.jpg",
            virtualUrl: "https://example.com/live/structured-data",
            organizer: "Example Inc.",
            price: "0",
            priceCurrency: "USD",
            availability: "InStock",
            offerUrl: "https://example.com/webinars/structured-data/register",
          },
        },
      },
    ],
    [],
  );

  const serialize = React.useCallback((s: EventState) => JSON.stringify(s), []);
  const deserialize = React.useCallback((raw: string): EventState | null => {
    try {
      const parsed = JSON.parse(raw) as EventState;
      if (
        parsed &&
        typeof parsed === "object" &&
        (parsed.mode === "Offline" || parsed.mode === "Online" || parsed.mode === "Mixed") &&
        typeof parsed.status === "string" &&
        parsed.values &&
        typeof parsed.values === "object"
      ) {
        return { ...INITIAL_STATE, ...parsed, values: { ...INITIAL_STATE.values, ...parsed.values } };
      }
    } catch {
      /* ignore */
    }
    return null;
  }, []);

  const modeHint = ATTENDANCE_OPTS.find((m) => m.value === state.mode)?.hint ?? "";
  const locFields = locationFields(state.mode);

  /* -- form --------------------------------------------------------------- */
  const form = (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Attendance mode" htmlFor="event-mode" hint={modeHint}>
          <SelectField<AttendanceMode>
            id="event-mode"
            className="w-full"
            ariaLabel="Attendance mode"
            value={state.mode}
            onChange={setMode}
            options={ATTENDANCE_OPTS.map((m) => ({ value: m.value, label: m.label }))}
          />
        </Field>
        <Field label="Event status" htmlFor="event-status" hint="Update if the event changes.">
          <SelectField<string>
            id="event-status"
            className="w-full"
            ariaLabel="Event status"
            value={state.status}
            onChange={setStatus}
            options={STATUS_OPTS}
          />
        </Field>
      </div>

      <button
        type="button"
        onClick={loadExample}
        className={cn(
          "inline-flex w-fit items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
          style.soft,
        )}
      >
        <Icon name="Sparkles" size={13} />
        Fill with example
      </button>

      <div className="h-px bg-border" />

      <SchemaForm
        fields={BASE_FIELDS}
        value={state.values}
        onChange={setValues}
        idPrefix="event-base"
      />

      <div className="flex items-center gap-2 pt-1">
        <Icon
          name={state.mode === "Online" ? "Globe2" : state.mode === "Mixed" ? "Radio" : "MapPin"}
          size={14}
          className={style.text}
        />
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {state.mode === "Online" ? "Virtual location" : state.mode === "Mixed" ? "Location (physical + virtual)" : "Venue"}
        </h3>
      </div>
      <SchemaForm
        // Remount when the mode changes so the visible location fields reset cleanly.
        key={state.mode}
        fields={locFields}
        value={state.values}
        onChange={setValues}
        idPrefix={`event-loc-${state.mode}`}
      />

      <div className="flex items-center gap-2 pt-1">
        <Icon name="Users" size={14} className={style.text} />
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Organizer &amp; performer
        </h3>
      </div>
      <SchemaForm fields={PEOPLE_FIELDS} value={state.values} onChange={setValues} idPrefix="event-people" />

      <div className="flex items-center gap-2 pt-1">
        <Icon name="Ticket" size={14} className={style.text} />
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Tickets (offer)
        </h3>
      </div>
      <SchemaForm fields={OFFER_FIELDS} value={state.values} onChange={setValues} idPrefix="event-offer" />
    </div>
  );

  /* -- preview ------------------------------------------------------------ */
  const preview = (
    <div className="flex flex-col gap-4">
      <ScorePanel
        score={report.score}
        grade={grade}
        summary={summary}
        counts={{
          pass: report.checks.filter((c) => c.status === "pass").length,
          warn: report.warnCount,
          fail: report.errorCount,
        }}
      />
      <CheckList
        items={report.checks}
        grouped
        emptyLabel="Add an event name and start date to validate your markup."
      />
      <p className="flex items-start gap-1.5 text-xs leading-relaxed text-muted-foreground">
        <Icon name="Info" size={13} className={cn("mt-0.5 shrink-0", style.text)} />
        <span>
          This is a pragmatic required/recommended check for events. Confirm final eligibility with{" "}
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

  const stats = (
    <>
      <StatBadge
        icon={state.mode === "Online" ? "Globe2" : state.mode === "Mixed" ? "Radio" : "MapPin"}
        label="Mode"
        value={state.mode}
        tone="info"
        title="Event attendance mode"
      />
      <StatBadge
        icon="Ruler"
        label="Size"
        value={`${output.minified.length.toLocaleString()} B`}
        title="Minified JSON-LD byte length"
      />
      <StatBadge
        icon={report.ok ? "CircleCheck" : "XCircle"}
        label="Status"
        value={report.ok ? "Valid" : `${report.errorCount} error${report.errorCount === 1 ? "" : "s"}`}
        tone={report.ok ? "success" : "danger"}
        title="Required-property validity"
      />
    </>
  );

  return (
    <GeneratorWithPreview<EventState>
      value={state}
      onChange={setState}
      initialValue={INITIAL_STATE}
      code={code}
      language="JSON-LD"
      form={form}
      preview={preview}
      previewLabel="Validity & rich-results check"
      downloadName="event-schema.json"
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
