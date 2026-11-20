/**
 * GigAI Tools: PDF form filling (AcroForm).
 *
 * SCOPE, decided deliberately and stated in the UI: this fills and flattens the
 * fields a PDF **already has**. It does not author new fields onto a flat page.
 * Authoring is a different product (you'd be placing widgets on a canvas) and
 * pretending a text box drawn over a scan is a "form field" is exactly the kind
 * of half-truth this platform avoids. A PDF with no fields is reported as such,
 * with a pointer at PDF Editor for adding text to a flat page.
 *
 * Flattening matters more than it sounds: an un-flattened filled form still
 * carries the field objects, so a recipient can edit the answers or read the
 * previous value. Flattening bakes the values into the page and removes the
 * fields, which is what people mean by "send the completed form".
 */

import { pdfDocToBlob } from "./core";
import type { NamedBlob, PdfInput } from "./types";
import { namedBlob } from "./types";

export type FieldKind = "text" | "checkbox" | "radio" | "dropdown" | "optionlist" | "button";

export interface FormField {
  name: string;
  kind: FieldKind;
  /** Current value: string for text/dropdown, boolean for checkbox. */
  value: string | boolean;
  /** Selectable options for radio/dropdown/optionlist. */
  options?: string[];
  readOnly: boolean;
  /** Max characters, when the field declares one. */
  maxLength?: number;
}

async function loadPdfLib() {
  return import("pdf-lib");
}

async function loadForm(input: PdfInput, password?: string) {
  const { PDFDocument } = await loadPdfLib();
  const doc = await PDFDocument.load(await input.file.arrayBuffer(), {
    ignoreEncryption: true,
    password,
  } as Parameters<typeof PDFDocument.load>[1]);
  return { doc, form: doc.getForm() };
}

/** Read every fillable field, with its current value and options. */
export async function readFormFields(
  input: PdfInput,
  password?: string,
): Promise<FormField[]> {
  const { form } = await loadForm(input, password);
  const lib = await loadPdfLib();
  const out: FormField[] = [];

  for (const field of form.getFields()) {
    const name = field.getName();
    const readOnly = field.isReadOnly();

    if (field instanceof lib.PDFTextField) {
      out.push({
        name,
        kind: "text",
        value: field.getText() ?? "",
        readOnly,
        maxLength: field.getMaxLength() ?? undefined,
      });
    } else if (field instanceof lib.PDFCheckBox) {
      out.push({ name, kind: "checkbox", value: field.isChecked(), readOnly });
    } else if (field instanceof lib.PDFRadioGroup) {
      out.push({
        name,
        kind: "radio",
        value: field.getSelected() ?? "",
        options: field.getOptions(),
        readOnly,
      });
    } else if (field instanceof lib.PDFDropdown) {
      out.push({
        name,
        kind: "dropdown",
        value: field.getSelected()[0] ?? "",
        options: field.getOptions(),
        readOnly,
      });
    } else if (field instanceof lib.PDFOptionList) {
      out.push({
        name,
        kind: "optionlist",
        value: field.getSelected()[0] ?? "",
        options: field.getOptions(),
        readOnly,
      });
    } else {
      out.push({ name, kind: "button", value: "", readOnly });
    }
  }

  return out;
}

export interface FillOptions {
  /**
   * Bake the values into the page and remove the fields. Default true, because
   * an un-flattened form can still be edited (and its old values read) by
   * whoever you send it to.
   */
  flatten?: boolean;
  password?: string;
}

/**
 * Fill fields by name and return the completed PDF.
 *
 * Unknown names are ignored rather than throwing: a form's internal field names
 * routinely differ from its visible labels, and failing the whole document
 * because one name drifted would lose the user all their other answers.
 */
export async function fillFormFields(
  input: PdfInput,
  values: Record<string, string | boolean>,
  opts: FillOptions = {},
): Promise<NamedBlob> {
  const { flatten = true } = opts;
  const { doc, form } = await loadForm(input, opts.password);
  const lib = await loadPdfLib();

  if (form.getFields().length === 0) {
    throw new Error(
      "This PDF has no fillable form fields. It's most likely a flat page or a scan. Use PDF Editor to type directly onto it instead.",
    );
  }

  for (const [name, value] of Object.entries(values)) {
    let field;
    try {
      field = form.getField(name);
    } catch {
      continue; // name no longer present. Keep the rest of the answers
    }
    if (field.isReadOnly()) continue;

    try {
      if (field instanceof lib.PDFTextField) {
        field.setText(String(value));
      } else if (field instanceof lib.PDFCheckBox) {
        if (value === true || value === "true") field.check();
        else field.uncheck();
      } else if (field instanceof lib.PDFRadioGroup) {
        if (value) field.select(String(value));
      } else if (field instanceof lib.PDFDropdown) {
        if (value) field.select(String(value));
      } else if (field instanceof lib.PDFOptionList) {
        if (value) field.select(String(value));
      }
    } catch {
      // A value the field rejects (an option that isn't in its list) shouldn't
      // cost the user every other answer, skip it and carry on.
      continue;
    }
  }

  if (flatten) {
    // Appearances must exist before flattening or the baked page can come out
    // blank in some viewers.
    try {
      form.updateFieldAppearances();
    } catch {
      /* fonts unavailable for appearance generation, flatten anyway */
    }
    form.flatten();
  }

  const blob = await pdfDocToBlob(doc);
  const suffix = flatten ? "-completed.pdf" : "-filled.pdf";
  return namedBlob(input.name.replace(/\.pdf$/i, "") + suffix, blob);
}
