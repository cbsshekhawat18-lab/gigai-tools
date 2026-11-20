"use client";

import * as React from "react";
import Link from "next/link";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { accentStyle } from "@/lib/design";
import type { ImageToolProps } from "@/components/tool/types";
import { Field, StatBadge, type Example } from "@/components/tool/dev";
import {
  GeneratorWithPreview,
  ScorePanel,
  CheckList,
  gradeForScore,
  type CheckItem,
} from "@/components/tool/seo";
import {
  buildBreadcrumbList,
  type SchemaOutput,
  type BreadcrumbItem,
} from "@/lib/seo-tools/schema";
import { formatDisplayUrl } from "@/lib/seo-tools/preview";

/* -------------------------------------------------------------------------- */
/*  State                                                                     */
/* -------------------------------------------------------------------------- */

/** A single crumb row in the editor. `id` is a stable React key only. */
interface Crumb {
  id: string;
  name: string;
  url: string;
}

/** Full generator state = the ordered list of crumbs. */
interface BreadcrumbState {
  crumbs: Crumb[];
}

let ID = 0;
function nextId(): string {
  ID += 1;
  return `c${ID}`;
}

function crumb(name = "", url = ""): Crumb {
  return { id: nextId(), name, url };
}

const INITIAL_STATE: BreadcrumbState = {
  crumbs: [crumb(), crumb()],
};

/** A realistic, fully-valid example trail (loaded as a preset). */
const EXAMPLE_STATE: BreadcrumbState = {
  crumbs: [
    crumb("Home", "https://example.com"),
    crumb("Blog", "https://example.com/blog"),
    crumb("SEO", "https://example.com/blog/seo"),
    crumb(
      "Breadcrumb Schema Guide",
      "https://example.com/blog/seo/breadcrumb-schema-guide",
    ),
  ],
};

/* -------------------------------------------------------------------------- */
/*  Derivation                                                                */
/* -------------------------------------------------------------------------- */

/** Crumbs that carry at least a name or a URL (what actually gets emitted). */
function nonEmpty(crumbs: Crumb[]): Crumb[] {
  return crumbs.filter((c) => c.name.trim() || c.url.trim());
}

/** Build the BreadcrumbList output from the current crumbs. */
function buildOutput(crumbs: Crumb[]): SchemaOutput {
  const items: BreadcrumbItem[] = nonEmpty(crumbs).map((c) => ({
    name: c.name.trim(),
    url: c.url.trim(),
  }));
  return buildBreadcrumbList(items);
}

/** Per-crumb validity + an overall score, mirroring the schema hub's model. */
function validate(crumbs: Crumb[]): {
  checks: CheckItem[];
  score: number;
  errorCount: number;
  ok: boolean;
} {
  const items = nonEmpty(crumbs);
  const checks: CheckItem[] = [];
  let errors = 0;

  if (items.length === 0) {
    return { checks, score: 0, errorCount: 0, ok: false };
  }

  items.forEach((c, i) => {
    const pos = i + 1;
    const missingName = !c.name.trim();
    const missingUrl = !c.url.trim();
    const badUrl = !missingUrl && !isLikelyUrl(c.url.trim());

    if (missingName || missingUrl || badUrl) {
      if (missingName) errors += 1;
      if (missingUrl || badUrl) errors += 1;
      const problems: string[] = [];
      if (missingName) problems.push("no name");
      if (missingUrl) problems.push("no URL");
      else if (badUrl) problems.push("URL isn't absolute (needs http/https)");
      checks.push({
        id: `crumb-${c.id}`,
        status: missingName || missingUrl ? "fail" : "warn",
        label: (
          <span>
            Crumb {pos}
            {c.name.trim() ? (
              <>
                {" "}
                - <span className="font-medium">{c.name.trim()}</span>
              </>
            ) : null}
          </span>
        ),
        detail: `Fix: ${problems.join("; ")}.`,
        fix:
          missingName || missingUrl
            ? "Every crumb needs both a name and an absolute URL to be valid."
            : "Use an absolute URL like https://example.com/blog so Google can resolve the link.",
        group: "Crumbs",
      });
    } else {
      checks.push({
        id: `crumb-${c.id}`,
        status: "pass",
        label: (
          <span>
            Crumb {pos} - <span className="font-medium">{c.name.trim()}</span>
          </span>
        ),
        detail: c.url.trim(),
        group: "Crumbs",
      });
    }
  });

  if (items.length === 1) {
    checks.push({
      id: "single",
      status: "warn",
      label: "Only one crumb in the trail",
      detail:
        "A breadcrumb usually has at least two levels (e.g. Home › Page). Add more crumbs to describe the path.",
      group: "Structure",
    });
  }

  const errPenalty = errors * 20;
  const warnPenalty =
    checks.filter((c) => c.status === "warn").length * 8;
  const score = Math.max(0, Math.min(100, 100 - errPenalty - warnPenalty));
  return { checks, score, errorCount: errors, ok: errors === 0 };
}

/** Cheap absolute-URL sniff (no throw). Accepts http/https only. */
function isLikelyUrl(value: string): boolean {
  try {
    const u = new URL(value);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */

export default function BreadcrumbSchemaGeneratorTool({ tool }: ImageToolProps) {
  const style = accentStyle(tool.accent ?? "amber");
  const [state, setState] = React.useState<BreadcrumbState>(INITIAL_STATE);
  const [minified, setMinified] = React.useState(false);

  const crumbs = state.crumbs;

  const output = React.useMemo<SchemaOutput>(
    () => buildOutput(crumbs),
    [crumbs],
  );
  const report = React.useMemo(() => validate(crumbs), [crumbs]);

  const emitted = React.useMemo(() => nonEmpty(crumbs), [crumbs]);

  const code = minified
    ? `<script type="application/ld+json">${output.minified}</script>`
    : output.scriptTag;

  const grade = gradeForScore(report.score);
  const summary =
    emitted.length === 0
      ? "Add at least one crumb with a name and URL to build your breadcrumb."
      : report.ok
        ? `Valid: ${emitted.length} crumb${emitted.length === 1 ? "" : "s"}, positions numbered ${emitted
            .map((_, i) => i + 1)
            .join(", ")}.`
        : `${report.errorCount} field${report.errorCount === 1 ? " is" : "s are"} missing. Every crumb needs a name and an absolute URL.`;

  /* -- crumb mutations (each is a controlled onChange = one undo step) ------ */
  const update = React.useCallback((next: Crumb[]) => {
    setState({ crumbs: next });
  }, []);

  const setField = React.useCallback(
    (id: string, key: "name" | "url", value: string) => {
      update(crumbs.map((c) => (c.id === id ? { ...c, [key]: value } : c)));
    },
    [crumbs, update],
  );

  const addCrumb = React.useCallback(() => {
    update([...crumbs, crumb()]);
  }, [crumbs, update]);

  const removeCrumb = React.useCallback(
    (id: string) => {
      update(crumbs.filter((c) => c.id !== id));
    },
    [crumbs, update],
  );

  const move = React.useCallback(
    (index: number, dir: -1 | 1) => {
      const target = index + dir;
      if (target < 0 || target >= crumbs.length) return;
      const next = crumbs.slice();
      const a = next[index];
      const b = next[target];
      if (!a || !b) return;
      next[index] = b;
      next[target] = a;
      update(next);
    },
    [crumbs, update],
  );

  /* -- share + presets ----------------------------------------------------- */
  const serialize = React.useCallback(
    (s: BreadcrumbState) =>
      JSON.stringify(s.crumbs.map((c) => ({ name: c.name, url: c.url }))),
    [],
  );
  const deserialize = React.useCallback(
    (raw: string): BreadcrumbState | null => {
      try {
        const parsed = JSON.parse(raw) as unknown;
        if (!Array.isArray(parsed)) return null;
        const next = parsed
          .filter(
            (x): x is { name?: unknown; url?: unknown } =>
              !!x && typeof x === "object",
          )
          .map((x) =>
            crumb(
              typeof x.name === "string" ? x.name : "",
              typeof x.url === "string" ? x.url : "",
            ),
          );
        return next.length ? { crumbs: next } : null;
      } catch {
        return null;
      }
    },
    [],
  );

  const examples = React.useMemo<ReadonlyArray<Example<BreadcrumbState>>>(
    () => [
      {
        label: "Blog article trail",
        description: "Home › Blog › SEO › Article: a 4-level example.",
        value: {
          crumbs: EXAMPLE_STATE.crumbs.map((c) => crumb(c.name, c.url)),
        },
      },
      {
        label: "E-commerce product trail",
        description: "Home › Department › Category › Product.",
        value: {
          crumbs: [
            crumb("Home", "https://shop.example.com"),
            crumb("Men", "https://shop.example.com/men"),
            crumb("Shoes", "https://shop.example.com/men/shoes"),
            crumb(
              "Trail Runner GTX",
              "https://shop.example.com/men/shoes/trail-runner-gtx",
            ),
          ],
        },
      },
      {
        label: "Minimal two-level trail",
        description: "Home › Page: the simplest valid breadcrumb.",
        value: {
          crumbs: [
            crumb("Home", "https://example.com"),
            crumb("Pricing", "https://example.com/pricing"),
          ],
        },
      },
    ],
    [],
  );

  /* -- form: the ordered crumb editor -------------------------------------- */
  const form = (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            Breadcrumb trail
          </h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            List pages from your home page down to the current page. Positions
            are numbered automatically.
          </p>
        </div>
        <button
          type="button"
          onClick={() => update(EXAMPLE_STATE.crumbs.map((c) => crumb(c.name, c.url)))}
          className={cn(
            "inline-flex shrink-0 items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
            style.soft,
          )}
        >
          <Icon name="Sparkles" size={13} />
          Fill with example
        </button>
      </div>

      <div className="h-px bg-border" />

      {crumbs.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border px-4 py-8 text-center">
          <Icon
            name="ChevronRight"
            size={22}
            className={cn("mx-auto mb-2", style.text)}
          />
          <p className="text-sm font-medium text-foreground">
            No crumbs yet
          </p>
          <p className="mx-auto mt-1 max-w-xs text-xs text-muted-foreground">
            Add the first crumb, usually your home page, then work down to the
            current page.
          </p>
          <button
            type="button"
            onClick={addCrumb}
            className={cn(
              "mt-3 inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
              style.soft,
            )}
          >
            <Icon name="Plus" size={13} />
            Add first crumb
          </button>
        </div>
      ) : (
        <ol className="flex flex-col gap-3">
          {crumbs.map((c, i) => {
            const isEmitted = !!(c.name.trim() || c.url.trim());
            const position = isEmitted
              ? nonEmpty(crumbs.slice(0, i + 1)).length
              : null;
            return (
              <li
                key={c.id}
                className="rounded-lg border border-border bg-muted/30 p-3"
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span
                    className={cn(
                      "inline-flex h-5 min-w-5 items-center justify-center rounded px-1 text-[11px] font-semibold tabular-nums",
                      position !== null
                        ? style.soft
                        : "bg-muted text-muted-foreground",
                    )}
                    title={
                      position !== null
                        ? `ListItem position ${position}`
                        : "Empty crumb. Not emitted"
                    }
                  >
                    {position ?? "–"}
                  </span>
                  <div className="flex items-center gap-0.5">
                    <IconBtn
                      label={`Move crumb ${i + 1} up`}
                      icon="ChevronUp"
                      disabled={i === 0}
                      onClick={() => move(i, -1)}
                    />
                    <IconBtn
                      label={`Move crumb ${i + 1} down`}
                      icon="ChevronDown"
                      disabled={i === crumbs.length - 1}
                      onClick={() => move(i, 1)}
                    />
                    <IconBtn
                      label={`Remove crumb ${i + 1}`}
                      icon="Trash2"
                      onClick={() => removeCrumb(c.id)}
                    />
                  </div>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <Field label="Name" htmlFor={`crumb-name-${c.id}`}>
                    <input
                      id={`crumb-name-${c.id}`}
                      type="text"
                      value={c.name}
                      onChange={(e) => setField(c.id, "name", e.target.value)}
                      placeholder={i === 0 ? "Home" : "Blog"}
                      className="w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </Field>
                  <Field label="URL" htmlFor={`crumb-url-${c.id}`}>
                    <input
                      id={`crumb-url-${c.id}`}
                      type="url"
                      inputMode="url"
                      value={c.url}
                      onChange={(e) => setField(c.id, "url", e.target.value)}
                      placeholder={
                        i === 0
                          ? "https://example.com"
                          : "https://example.com/blog"
                      }
                      className="w-full rounded-md border border-border bg-background px-2.5 py-1.5 font-mono text-xs outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </Field>
                </div>
              </li>
            );
          })}
        </ol>
      )}

      {crumbs.length > 0 && (
        <button
          type="button"
          onClick={addCrumb}
          className="inline-flex items-center justify-center gap-1.5 rounded-md border border-dashed border-border px-3 py-2 text-xs font-medium text-muted-foreground outline-none transition-colors hover:border-foreground/30 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Icon name="Plus" size={13} />
          Add crumb
        </button>
      )}

      <Link
        href="/schema-generator"
        className="inline-flex items-center gap-1.5 self-start rounded-md border border-border px-2.5 py-1.5 text-xs font-medium text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Icon name="Braces" size={13} />
        Need other schema types? Open the Schema hub
        <Icon name="ArrowUpRight" size={12} />
      </Link>
    </div>
  );

  /* -- preview: Google-style trail + validity ------------------------------ */
  const preview = (
    <div className="flex flex-col gap-4">
      <div className="rounded-lg border border-border bg-background p-3">
        <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          Breadcrumb in Google
        </p>
        {emitted.length ? (
          <nav aria-label="Breadcrumb preview">
            <ol className="flex flex-wrap items-center gap-x-1 gap-y-0.5">
              {emitted.map((c, i) => (
                <li key={c.id} className="flex items-center gap-1">
                  {i > 0 && (
                    <Icon
                      name="ChevronRight"
                      size={13}
                      className="text-muted-foreground/60"
                    />
                  )}
                  <span
                    className={cn(
                      "text-[13px] leading-5",
                      i === emitted.length - 1
                        ? "font-medium text-foreground"
                        : "text-muted-foreground",
                    )}
                    title={c.url.trim() || undefined}
                  >
                    {c.name.trim() ||
                      (c.url.trim()
                        ? formatDisplayUrl(c.url.trim())
                        : "(unnamed)")}
                  </span>
                </li>
              ))}
            </ol>
          </nav>
        ) : (
          <p className="text-[13px] leading-5 text-muted-foreground">
            Your breadcrumb trail will render here as you add crumbs.
          </p>
        )}
      </div>

      <ScorePanel
        score={report.score}
        grade={grade}
        summary={summary}
        counts={{
          pass: report.checks.filter((c) => c.status === "pass").length,
          warn: report.checks.filter((c) => c.status === "warn").length,
          fail: report.checks.filter((c) => c.status === "fail").length,
        }}
      />
      <CheckList
        items={report.checks}
        grouped
        emptyLabel="Add a crumb with a name and URL to validate your breadcrumb."
      />
      <p className="flex items-start gap-1.5 text-xs leading-relaxed text-muted-foreground">
        <Icon
          name="Info"
          size={13}
          className={cn("mt-0.5 shrink-0", style.text)}
        />
        <span>
          This checks the name and URL each crumb requires. Confirm final
          eligibility with{" "}
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
        icon="ListOrdered"
        label="Crumbs"
        value={String(emitted.length)}
        tone="info"
        title="Crumbs emitted into the BreadcrumbList"
      />
      <StatBadge
        icon="Ruler"
        label="Size"
        value={`${output.minified.length.toLocaleString()} B`}
        title="Minified JSON-LD byte length"
      />
      <StatBadge
        icon={report.ok && emitted.length ? "CircleCheck" : "XCircle"}
        label="Status"
        value={
          emitted.length === 0
            ? "Empty"
            : report.ok
              ? "Valid"
              : `${report.errorCount} error${report.errorCount === 1 ? "" : "s"}`
        }
        tone={report.ok && emitted.length ? "success" : "danger"}
        title="Required-property validity"
      />
    </>
  );

  return (
    <GeneratorWithPreview<BreadcrumbState>
      value={state}
      onChange={setState}
      initialValue={INITIAL_STATE}
      code={code}
      language="JSON-LD"
      form={form}
      preview={preview}
      previewLabel="Trail preview & validity check"
      downloadName="breadcrumb-schema.json"
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

/* -------------------------------------------------------------------------- */
/*  Small local control                                                       */
/* -------------------------------------------------------------------------- */

function IconBtn({
  label,
  icon,
  onClick,
  disabled,
}: {
  label: string;
  icon: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-40"
    >
      <Icon name={icon} size={14} />
    </button>
  );
}
