"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { Field, NumberStepper, SelectField } from "@/components/tool/dev";

/**
 * A declarative form renderer for structured-data (schema.org) generators. Feed
 * it a `fields` spec, text, textarea, number, date, url, email, select, a
 * string `list`, or a `group` of nested fields (optionally `repeatable`), and
 * it renders a labelled, accessible form and emits a plain object of the
 * current values via `onChange`. One component powers every schema generator
 * (Article, FAQ, Product, Breadcrumb, LocalBusiness, …), keeping each tool tiny.
 */

/** A single value in an emitted schema-form record. */
export type FieldValue = string | number | string[] | SchemaValues | SchemaValues[];

/** The object shape emitted by {@link SchemaForm}. */
export type SchemaValues = { [key: string]: FieldValue };

/** Shared props on every field spec. */
interface BaseField {
  /** Object key the value is emitted under. */
  name: string;
  /** Visible label. */
  label: string;
  /** Help text shown via an info icon / hint line. */
  hint?: string;
  /** Placeholder for text-like inputs. */
  placeholder?: string;
  /** Marks the field visually as required (validation is the tool's job). */
  required?: boolean;
  /** Take a full row in the responsive grid. Default depends on type. */
  full?: boolean;
}

export type FieldSpec =
  | (BaseField & { type: "text" | "url" | "email"; maxLength?: number })
  | (BaseField & { type: "textarea"; rows?: number; maxLength?: number })
  | (BaseField & { type: "number"; min?: number; max?: number; step?: number })
  | (BaseField & { type: "date" | "datetime" })
  | (BaseField & { type: "select"; options: ReadonlyArray<{ value: string; label: string }> })
  | (BaseField & { type: "list"; itemLabel?: string; itemPlaceholder?: string })
  | (BaseField & {
      type: "group";
      fields: ReadonlyArray<FieldSpec>;
      /** Allow multiple entries (e.g. FAQ Q&A pairs). */
      repeatable?: boolean;
      /** Label for the "add" button, e.g. "Add question". */
      addLabel?: string;
    });

/** Props for {@link SchemaForm}. */
export interface SchemaFormProps {
  fields: ReadonlyArray<FieldSpec>;
  /** Current values (controlled). */
  value: SchemaValues;
  /** Emitted whenever any field changes. */
  onChange: (values: SchemaValues) => void;
  className?: string;
  /** Compact single-column layout regardless of width. Default false. */
  singleColumn?: boolean;
  idPrefix?: string;
}

/** A default empty value for a field type. Keeps the emitted object well-typed. */
function emptyValue(spec: FieldSpec): FieldValue {
  switch (spec.type) {
    case "number":
      return spec.min ?? 0;
    case "list":
      return [];
    case "group":
      return spec.repeatable ? [] : emptyGroup(spec.fields);
    default:
      return "";
  }
}

function emptyGroup(fields: ReadonlyArray<FieldSpec>): SchemaValues {
  const out: SchemaValues = {};
  for (const f of fields) out[f.name] = emptyValue(f);
  return out;
}

/** Whether a field type should span the full grid width by default. */
function isFullWidth(spec: FieldSpec): boolean {
  if (spec.full !== undefined) return spec.full;
  return spec.type === "textarea" || spec.type === "list" || spec.type === "group";
}

const inputClass =
  "w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50";

export function SchemaForm({
  fields,
  value,
  onChange,
  className,
  singleColumn = false,
  idPrefix,
}: SchemaFormProps) {
  const autoId = React.useId();
  const prefix = idPrefix ?? autoId;

  const setField = React.useCallback(
    (name: string, next: FieldValue) => {
      onChange({ ...value, [name]: next });
    },
    [value, onChange],
  );

  return (
    <div
      className={cn(
        "grid gap-x-4 gap-y-3",
        singleColumn ? "grid-cols-1" : "sm:grid-cols-2",
        className,
      )}
    >
      {fields.map((spec) => (
        <div
          key={spec.name}
          className={cn(
            (isFullWidth(spec) || singleColumn) && "sm:col-span-2",
            "min-w-0",
          )}
        >
          <FieldControl
            spec={spec}
            id={`${prefix}-${spec.name}`}
            value={value[spec.name]}
            onChange={(v) => setField(spec.name, v)}
          />
        </div>
      ))}
    </div>
  );
}

/** Renders one field spec against its current value. */
function FieldControl({
  spec,
  id,
  value,
  onChange,
}: {
  spec: FieldSpec;
  id: string;
  value: FieldValue | undefined;
  onChange: (v: FieldValue) => void;
}) {
  const label = (
    <span className="flex items-center gap-1">
      {spec.label}
      {spec.required && <span className="text-destructive">*</span>}
    </span>
  );

  switch (spec.type) {
    case "text":
    case "url":
    case "email": {
      const v = typeof value === "string" ? value : "";
      return (
        <Field label={label} htmlFor={id} hint={spec.hint}>
          <input
            id={id}
            type={spec.type === "text" ? "text" : spec.type}
            className={inputClass}
            placeholder={spec.placeholder}
            maxLength={spec.maxLength}
            value={v}
            onChange={(e) => onChange(e.target.value)}
          />
        </Field>
      );
    }

    case "textarea": {
      const v = typeof value === "string" ? value : "";
      return (
        <Field label={label} htmlFor={id} hint={spec.hint}>
          <textarea
            id={id}
            rows={spec.rows ?? 3}
            className={cn(inputClass, "resize-y font-sans")}
            placeholder={spec.placeholder}
            maxLength={spec.maxLength}
            value={v}
            onChange={(e) => onChange(e.target.value)}
          />
        </Field>
      );
    }

    case "number": {
      const v = typeof value === "number" ? value : spec.min ?? 0;
      return (
        <Field label={label} htmlFor={id} hint={spec.hint}>
          <NumberStepper
            id={id}
            value={v}
            min={spec.min}
            max={spec.max}
            step={spec.step}
            ariaLabel={spec.label}
            onChange={onChange}
          />
        </Field>
      );
    }

    case "date":
    case "datetime": {
      const v = typeof value === "string" ? value : "";
      return (
        <Field label={label} htmlFor={id} hint={spec.hint}>
          <input
            id={id}
            type={spec.type === "date" ? "date" : "datetime-local"}
            className={inputClass}
            value={v}
            onChange={(e) => onChange(e.target.value)}
          />
        </Field>
      );
    }

    case "select": {
      const first = spec.options[0]?.value ?? "";
      const v = typeof value === "string" && value ? value : first;
      return (
        <Field label={label} htmlFor={id} hint={spec.hint}>
          <SelectField
            id={id}
            className="w-full"
            ariaLabel={spec.label}
            value={v}
            onChange={onChange}
            options={spec.options}
          />
        </Field>
      );
    }

    case "list": {
      const items = Array.isArray(value) && value.every((x) => typeof x === "string")
        ? (value as string[])
        : [];
      return (
        <ListField
          spec={spec}
          id={id}
          label={label}
          items={items}
          onChange={onChange}
        />
      );
    }

    case "group":
      return <GroupField spec={spec} id={id} label={label} value={value} onChange={onChange} />;

    default:
      return null;
  }
}

/** A repeatable list of plain string values (e.g. keywords, image URLs). */
function ListField({
  spec,
  id,
  label,
  items,
  onChange,
}: {
  spec: Extract<FieldSpec, { type: "list" }>;
  id: string;
  label: React.ReactNode;
  items: string[];
  onChange: (v: string[]) => void;
}) {
  const update = (i: number, val: string) => {
    const next = items.slice();
    next[i] = val;
    onChange(next);
  };
  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i));
  const add = () => onChange([...items, ""]);

  return (
    <Field label={label} hint={spec.hint}>
      <div className="flex flex-col gap-1.5">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <input
              id={i === 0 ? id : undefined}
              className={inputClass}
              placeholder={spec.itemPlaceholder ?? spec.placeholder}
              value={item}
              aria-label={`${spec.itemLabel ?? spec.label} ${i + 1}`}
              onChange={(e) => update(i, e.target.value)}
            />
            <RemoveButton onClick={() => remove(i)} label={`Remove ${spec.itemLabel ?? "item"} ${i + 1}`} />
          </div>
        ))}
        <AddButton onClick={add} label={`Add ${spec.itemLabel ?? "item"}`} />
      </div>
    </Field>
  );
}

/** A single or repeatable group of nested fields. */
function GroupField({
  spec,
  id,
  label,
  value,
  onChange,
}: {
  spec: Extract<FieldSpec, { type: "group" }>;
  id: string;
  label: React.ReactNode;
  value: FieldValue | undefined;
  onChange: (v: SchemaValues | SchemaValues[]) => void;
}) {
  if (spec.repeatable) {
    const rows = Array.isArray(value) && value.every((x) => typeof x === "object")
      ? (value as SchemaValues[])
      : [];
    const updateRow = (i: number, next: SchemaValues) => {
      const copy = rows.slice();
      copy[i] = next;
      onChange(copy);
    };
    const removeRow = (i: number) => onChange(rows.filter((_, idx) => idx !== i));
    const addRow = () => onChange([...rows, emptyGroup(spec.fields)]);

    return (
      <fieldset className="rounded-lg border border-border bg-muted/30 p-3">
        <legend className="px-1 text-sm font-medium text-muted-foreground">{label}</legend>
        <div className="flex flex-col gap-3">
          {rows.map((row, i) => (
            <div key={i} className="rounded-md border border-border bg-card p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  {spec.label} {i + 1}
                </span>
                <RemoveButton onClick={() => removeRow(i)} label={`Remove ${spec.label} ${i + 1}`} />
              </div>
              <SchemaForm
                fields={spec.fields}
                value={row}
                onChange={(next) => updateRow(i, next)}
                idPrefix={`${id}-${i}`}
              />
            </div>
          ))}
          <AddButton onClick={addRow} label={spec.addLabel ?? `Add ${spec.label}`} />
        </div>
      </fieldset>
    );
  }

  const obj = value && typeof value === "object" && !Array.isArray(value)
    ? (value as SchemaValues)
    : emptyGroup(spec.fields);
  return (
    <fieldset className="rounded-lg border border-border bg-muted/30 p-3">
      <legend className="px-1 text-sm font-medium text-muted-foreground">{label}</legend>
      <SchemaForm fields={spec.fields} value={obj} onChange={onChange} idPrefix={id} />
    </fieldset>
  );
}

function AddButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex w-fit items-center gap-1.5 rounded-md border border-dashed border-border px-2.5 py-1.5 text-sm font-medium text-muted-foreground outline-none transition-colors hover:border-primary/50 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
    >
      <Icon name="Plus" size={14} />
      {label}
    </button>
  );
}

function RemoveButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label} title={label}
      className="grid size-10 shrink-0 place-items-center rounded-md text-muted-foreground outline-none transition-colors hover:bg-destructive/10 hover:text-destructive focus-visible:ring-2 focus-visible:ring-ring"
    >
      <Icon name="Trash2" size={15} />
    </button>
  );
}
