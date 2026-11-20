"use client";

import * as React from "react";
import Link from "next/link";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { accentStyle } from "@/lib/design";
import type { ImageToolProps } from "@/components/tool/types";
import { StatBadge, type Example } from "@/components/tool/dev";
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
import { buildFaqPage, validateJsonLd } from "@/lib/seo-tools/schema";

/* -------------------------------------------------------------------------- */
/*  State                                                                     */
/* -------------------------------------------------------------------------- */

/** One question/answer pair as collected from the form. */
interface QaPair {
  question: string;
  answer: string;
}

/** Full generator state: the repeatable list of Q&A pairs. */
interface FaqState {
  items: QaPair[];
}

const INITIAL_STATE: FaqState = {
  items: [
    { question: "", answer: "" },
  ],
};

/** A realistic, valid FAQPage preset. */
const EXAMPLE: FaqState = {
  items: [
    {
      question: "Is the FAQ schema generator free?",
      answer:
        "Yes. Every tool is completely free and runs entirely in your browser. No account, no sign-up and no usage limits.",
    },
    {
      question: "Do I need to install anything?",
      answer:
        "No installation is required. It works in any modern browser, and your questions and answers never leave your device.",
    },
    {
      question: "How do I add the markup to my page?",
      answer:
        "Copy the generated script tag and paste it into the HTML of the page that shows the same visible FAQ, either in the head or the body.",
    },
    {
      question: "Will this make an FAQ rich result appear in Google?",
      answer:
        "The markup is valid FAQPage structured data, but Google now limits the FAQ rich result mainly to authoritative government and health sites.",
    },
  ],
};

/* -------------------------------------------------------------------------- */
/*  Form spec                                                                 */
/* -------------------------------------------------------------------------- */

const FIELDS: ReadonlyArray<FieldSpec> = [
  {
    name: "items",
    label: "Questions & answers",
    type: "group",
    repeatable: true,
    addLabel: "Add question",
    full: true,
    fields: [
      {
        name: "question",
        label: "Question",
        type: "text",
        required: true,
        placeholder: "Is the tool free?",
        full: true,
      },
      {
        name: "answer",
        label: "Answer",
        type: "textarea",
        rows: 3,
        required: true,
        placeholder:
          "Yes: every tool is 100% free and runs entirely in your browser.",
        full: true,
      },
    ],
  },
];

/* -------------------------------------------------------------------------- */
/*  Value readers / bridges between FaqState and SchemaValues                 */
/* -------------------------------------------------------------------------- */

function str(v: FieldValue | undefined): string {
  return typeof v === "string" ? v : "";
}

/** Read the repeatable group rows out of a SchemaValues bag. */
function readRows(values: SchemaValues): QaPair[] {
  const raw = values.items;
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(
      (x): x is SchemaValues =>
        !!x && typeof x === "object" && !Array.isArray(x),
    )
    .map((row) => ({ question: str(row.question), answer: str(row.answer) }));
}

/** Project FaqState into the SchemaValues shape SchemaForm expects. */
function toValues(state: FaqState): SchemaValues {
  return {
    items: state.items.map((it) => ({
      question: it.question,
      answer: it.answer,
    })),
  };
}

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */

export default function FaqSchemaGeneratorTool({ tool }: ImageToolProps) {
  const style = accentStyle(tool.accent ?? "violet");
  const [state, setState] = React.useState<FaqState>(INITIAL_STATE);
  const [minified, setMinified] = React.useState(false);

  /** Pairs that carry at least some content; what actually gets built. */
  const filled = React.useMemo(
    () => state.items.filter((it) => it.question.trim() || it.answer.trim()),
    [state.items],
  );

  /** Build FAQPage JSON-LD from the filled pairs. */
  const output = React.useMemo(
    () =>
      buildFaqPage(
        filled.map((it) => ({ question: it.question, answer: it.answer })),
      ),
    [filled],
  );

  const validation = React.useMemo(
    () => validateJsonLd(output.jsonLd),
    [output.jsonLd],
  );

  const code = minified
    ? `<script type="application/ld+json">${output.minified}</script>`
    : output.scriptTag;

  /* -- per-entry checks + score --------------------------------------------- */
  const { checks, score } = React.useMemo(() => {
    const items: CheckItem[] = [];

    if (filled.length === 0) {
      return { checks: items, score: 0 };
    }

    let complete = 0;
    filled.forEach((it, i) => {
      const q = it.question.trim();
      const a = it.answer.trim();
      const label = q ? q.slice(0, 60) : `Question ${i + 1}`;
      if (!q && !a) return;
      if (!q) {
        items.push({
          id: `q-${i}`,
          status: "fail",
          label,
          detail: "This pair has an answer but no question text (name).",
          fix: "Add the question. Every Question needs a name to be valid.",
          group: "Questions",
        });
      } else if (!a) {
        items.push({
          id: `q-${i}`,
          status: "fail",
          label,
          detail: "This question has no answer text.",
          fix: "Add an accepted answer. A Question needs answer text to be valid.",
          group: "Questions",
        });
      } else if (a.length < 25) {
        complete += 1;
        items.push({
          id: `q-${i}`,
          status: "warn",
          label,
          detail: "The answer is very short.",
          fix: "A fuller, self-contained answer reads better and matches the visible FAQ.",
          group: "Questions",
        });
      } else {
        complete += 1;
        items.push({
          id: `q-${i}`,
          status: "pass",
          label,
          detail: "Complete question and answer.",
          group: "Questions",
        });
      }
    });

    // Structural errors from the schema validator (e.g. an empty mainEntity).
    for (const e of validation.errors) {
      items.push({
        id: `err-${e.path ?? e.message}`,
        status: "fail",
        label: e.path ? (
          <code className="font-mono text-xs">{e.path}</code>
        ) : (
          "Required property"
        ),
        detail: e.message,
        group: "Structure",
      });
    }

    // Score: any incomplete pair or structural error weighs heavily; short
    // answers shave a little. All-complete with no warnings scores 100.
    const total = filled.length || 1;
    const badPairs = filled.filter(
      (it) => !it.question.trim() || !it.answer.trim(),
    ).length;
    const shortPairs = filled.filter(
      (it) => it.question.trim() && it.answer.trim() && it.answer.trim().length < 25,
    ).length;
    const raw =
      100 -
      Math.round((badPairs / total) * 70) -
      shortPairs * 6 -
      validation.errors.length * 15;
    const s = complete === 0 ? 0 : Math.max(0, Math.min(100, raw));
    return { checks: items, score: s };
  }, [filled, validation.errors]);

  const grade = gradeForScore(score);

  const badPairs = filled.filter(
    (it) => !it.question.trim() || !it.answer.trim(),
  ).length;

  const summary =
    filled.length === 0
      ? "Add at least one question and answer to generate FAQPage markup."
      : badPairs > 0
        ? `${badPairs} ${badPairs === 1 ? "pair is" : "pairs are"} missing a question or answer.`
        : validation.ok
          ? `Valid FAQPage with ${filled.length} ${filled.length === 1 ? "question" : "questions"}, ready to publish.`
          : "The markup structure needs attention, see the checks below.";

  /* -- handlers -------------------------------------------------------------- */
  const setValues = React.useCallback((next: SchemaValues) => {
    setState({ items: readRows(next) });
  }, []);

  const loadExample = React.useCallback(() => {
    setState({ items: EXAMPLE.items.map((it) => ({ ...it })) });
  }, []);

  /* -- presets / share ------------------------------------------------------- */
  const examples = React.useMemo<ReadonlyArray<Example<FaqState>>>(
    () => [
      {
        label: "Sample FAQ (4 questions)",
        description: "A fully-populated, valid FAQPage to start from.",
        icon: "HelpCircle",
        value: { items: EXAMPLE.items.map((it) => ({ ...it })) },
      },
    ],
    [],
  );

  const serialize = React.useCallback((s: FaqState) => JSON.stringify(s), []);
  const deserialize = React.useCallback((raw: string): FaqState | null => {
    try {
      const parsed = JSON.parse(raw) as FaqState;
      if (parsed && Array.isArray(parsed.items)) {
        return {
          items: parsed.items.map((it) => ({
            question: typeof it?.question === "string" ? it.question : "",
            answer: typeof it?.answer === "string" ? it.answer : "",
          })),
        };
      }
    } catch {
      /* ignore */
    }
    return null;
  }, []);

  /* -- form ------------------------------------------------------------------ */
  const form = (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={loadExample}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
            style.soft,
          )}
        >
          <Icon name="Sparkles" size={13} />
          Fill with example
        </button>
        <Link
          href="/schema-generator"
          className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs font-medium text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Icon name="Braces" size={13} />
          Need another type? Open the Schema hub
          <Icon name="ArrowUpRight" size={12} />
        </Link>
      </div>

      <div className="h-px bg-border" />

      <SchemaForm
        fields={FIELDS}
        value={toValues(state)}
        onChange={setValues}
        idPrefix="faq-schema"
        singleColumn
      />
    </div>
  );

  /* -- preview: score + per-entry validity ----------------------------------- */
  const preview = (
    <div className="flex flex-col gap-4">
      <ScorePanel
        score={score}
        grade={grade}
        summary={summary}
        counts={{
          pass: checks.filter((c) => c.status === "pass").length,
          warn: checks.filter((c) => c.status === "warn").length,
          fail: checks.filter((c) => c.status === "fail").length,
        }}
      />
      <CheckList
        items={checks}
        grouped
        emptyLabel="Add a question and answer to validate your FAQPage markup."
      />
      <p className="flex items-start gap-1.5 text-xs leading-relaxed text-muted-foreground">
        <Icon
          name="Info"
          size={13}
          className={cn("mt-0.5 shrink-0", style.text)}
        />
        <span>
          Google now limits the FAQ rich result mainly to authoritative
          government and health sites: the markup is still valid and useful.
          Confirm parsing with{" "}
          <a
            href="https://search.google.com/test/rich-results"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "font-medium underline underline-offset-2",
              style.text,
            )}
          >
            Google&rsquo;s Rich Results Test
          </a>
          .
        </span>
      </p>
    </div>
  );

  const stats = (
    <>
      <StatBadge
        icon="HelpCircle"
        label="Questions"
        value={String(filled.length)}
        tone="info"
        title="Question/answer pairs with content"
      />
      <StatBadge
        icon="Ruler"
        label="Size"
        value={`${output.minified.length.toLocaleString()} B`}
        title="Minified JSON-LD byte length"
      />
      <StatBadge
        icon={validation.ok && badPairs === 0 ? "CircleCheck" : "XCircle"}
        label="Status"
        value={
          filled.length === 0
            ? "Empty"
            : badPairs > 0
              ? `${badPairs} incomplete`
              : validation.ok
                ? "Valid"
                : "Invalid"
        }
        tone={
          filled.length === 0
            ? "default"
            : validation.ok && badPairs === 0
              ? "success"
              : "danger"
        }
        title="FAQPage validity"
      />
    </>
  );

  return (
    <GeneratorWithPreview<FaqState>
      value={state}
      onChange={setState}
      initialValue={INITIAL_STATE}
      code={code}
      language="JSON-LD"
      form={form}
      preview={preview}
      previewLabel="Validity & rich-results check"
      downloadName="faqpage-schema.json"
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
