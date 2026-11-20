"use client";

import * as React from "react";
import Link from "next/link";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { accentStyle } from "@/lib/design";
import { fillFormFields, readFormFields, type FormField } from "@/lib/pdf/forms";
import type { ImageToolProps } from "@/components/tool/types";
import {
  usePdfTool,
  type NamedBlob,
  type PdfInput,
} from "@/components/tool/pdf/use-pdf-tool";
import { PdfWorkspace } from "@/components/tool/pdf/pdf-workspace";

/**
 * PDF Forms, fill the fields a PDF already has, then flatten them.
 *
 * Fields are read as soon as a file is queued so the user sees the real form
 * immediately rather than after pressing a button. A PDF with no AcroForm is
 * called out explicitly and pointed at PDF Editor, because "nothing happened"
 * is the worst possible response to a flat scan.
 */
export default function PdfFormsTool({ tool }: ImageToolProps) {
  const style = accentStyle(tool.accent);

  const [fields, setFields] = React.useState<FormField[] | null>(null);
  const [values, setValues] = React.useState<Record<string, string | boolean>>({});
  const [reading, setReading] = React.useState(false);
  const [flatten, setFlatten] = React.useState(true);

  const valuesRef = React.useRef(values);
  const flattenRef = React.useRef(flatten);
  React.useEffect(() => {
    valuesRef.current = values;
  }, [values]);
  React.useEffect(() => {
    flattenRef.current = flatten;
  }, [flatten]);

  const state = usePdfTool({
    slug: tool.slug,
    accept: "application/pdf",
    multiple: false,
    zipName: "form-gigai",
    process: async (files: PdfInput[]): Promise<NamedBlob[]> => {
      const input = files[0];
      if (!input) throw new Error("Add the PDF form you want to fill.");
      return [await fillFormFields(input, valuesRef.current, { flatten: flattenRef.current })];
    },
  });

  // Read the form as soon as a file arrives, and clear it when the queue does.
  const source = state.files[0];
  React.useEffect(() => {
    if (!source) {
      setFields(null);
      setValues({});
      return;
    }
    let cancelled = false;
    setReading(true);

    void (async () => {
      try {
        const found = await readFormFields(source);
        if (cancelled) return;
        setFields(found);
        setValues(
          Object.fromEntries(found.filter((f) => f.kind !== "button").map((f) => [f.name, f.value])),
        );
      } catch {
        if (!cancelled) setFields([]);
      } finally {
        if (!cancelled) setReading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [source]);

  const fillable = (fields ?? []).filter((f) => f.kind !== "button");

  return (
    <PdfWorkspace
      state={state}
      accent={tool.accent}
      accept="application/pdf"
      multiple={false}
      dropIcon="ClipboardList"
      dropHint="Select a fillable PDF form"
      processLabel={flatten ? "Fill & flatten form" : "Fill form"}
      resultHint="Filled in your browser. The form is never uploaded."
    >
      {reading ? (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Icon name="LoaderCircle" size={16} className="animate-spin" />
          Reading the form fields…
        </p>
      ) : null}

      {fields !== null && !reading && fillable.length === 0 ? (
        <div className="flex items-start gap-2 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-sm">
          <Icon name="TriangleAlert" size={16} className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400" />
          <span className="text-muted-foreground">
            <strong className="font-medium text-foreground">This PDF has no fillable fields.</strong>{" "}
            It&apos;s a flat page or a scan; the boxes you can see are printed
            on, not real form fields. Use{" "}
            <Link href="/pdf-editor" className={cn("underline underline-offset-4", style.text)}>
              PDF Editor
            </Link>{" "}
            to type directly onto it instead.
          </span>
        </div>
      ) : null}

      {fillable.length > 0 ? (
        <>
          <fieldset className="flex flex-col gap-3">
            <legend className="text-sm font-medium text-foreground">
              {fillable.length} field{fillable.length === 1 ? "" : "s"} found
            </legend>
            <div className="flex flex-col gap-3">
              {fillable.map((field) => (
                <FieldRow
                  key={field.name}
                  field={field}
                  value={values[field.name]}
                  onChange={(v) => setValues((p) => ({ ...p, [field.name]: v }))}
                  accent={tool.accent}
                />
              ))}
            </div>
          </fieldset>

          <label
            className={cn(
              "flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors",
              flatten ? cn(style.border, style.soft) : "border-border hover:bg-muted/40",
            )}
          >
            <input
              type="checkbox"
              checked={flatten}
              onChange={(e) => setFlatten(e.target.checked)}
              className={cn("mt-0.5 size-4 shrink-0 accent-current", style.text)}
            />
            <span className="flex min-w-0 flex-col text-sm">
              <span className="font-medium text-foreground">Flatten when done (recommended)</span>
              <span className="text-muted-foreground">
                Bakes your answers into the page and removes the fields. Without
                this, whoever receives the form can still edit your answers, and
                read what was there before.
              </span>
            </span>
          </label>
        </>
      ) : null}
    </PdfWorkspace>
  );
}

function FieldRow({
  field,
  value,
  onChange,
  accent,
}: {
  field: FormField;
  value: string | boolean | undefined;
  onChange: (v: string | boolean) => void;
  accent: ImageToolProps["tool"]["accent"];
}) {
  const style = accentStyle(accent);
  const id = `field-${field.name.replace(/[^a-zA-Z0-9_-]/g, "-")}`;
  const inputCls = cn(
    "w-full rounded-lg border bg-card px-3 py-2 text-sm text-foreground outline-none transition-colors",
    "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    style.ring,
    "border-border",
    field.readOnly && "cursor-not-allowed opacity-60",
  );

  if (field.kind === "checkbox") {
    return (
      <label className="flex items-center gap-3 text-sm">
        <input
          id={id}
          type="checkbox"
          checked={value === true}
          disabled={field.readOnly}
          onChange={(e) => onChange(e.target.checked)}
          className={cn("size-4 shrink-0 accent-current", style.text)}
        />
        <span className="font-medium text-foreground">{field.name}</span>
        {field.readOnly ? <span className="text-xs text-muted-foreground">(read-only)</span> : null}
      </label>
    );
  }

  const options = field.options ?? [];

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="flex items-center gap-2 text-sm font-medium text-foreground">
        {field.name}
        {field.readOnly ? <span className="text-xs font-normal text-muted-foreground">(read-only)</span> : null}
      </label>
      {options.length > 0 ? (
        <select
          id={id}
          value={String(value ?? "")}
          disabled={field.readOnly}
          onChange={(e) => onChange(e.target.value)}
          className={inputCls}
        >
          <option value="">- not set -</option>
          {options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={id}
          type="text"
          value={String(value ?? "")}
          disabled={field.readOnly}
          maxLength={field.maxLength}
          onChange={(e) => onChange(e.target.value)}
          className={inputCls}
        />
      )}
    </div>
  );
}
