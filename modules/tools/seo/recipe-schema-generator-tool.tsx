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
import { buildRecipe, validateJsonLd, type SchemaOutput } from "@/lib/seo-tools/schema";

/* -------------------------------------------------------------------------- */
/*  Value readers (terse + type-safe)                                         */
/* -------------------------------------------------------------------------- */

function str(v: FieldValue | undefined): string {
  return typeof v === "string" ? v : "";
}
function opt(v: FieldValue | undefined): string | undefined {
  const s = str(v).trim();
  return s ? s : undefined;
}
function list(v: FieldValue | undefined): string[] {
  return Array.isArray(v) && v.every((x) => typeof x === "string") ? (v as string[]) : [];
}
function optList(v: FieldValue | undefined): string[] | undefined {
  const l = list(v).map((s) => s.trim()).filter(Boolean);
  return l.length ? l : undefined;
}

/* -------------------------------------------------------------------------- */
/*  Form spec, tailored entirely to a Recipe */
/* -------------------------------------------------------------------------- */

const CUISINE_OPTS = [
  { value: "", label: "—" },
  { value: "Italian", label: "Italian" },
  { value: "American", label: "American" },
  { value: "Mexican", label: "Mexican" },
  { value: "Indian", label: "Indian" },
  { value: "Chinese", label: "Chinese" },
  { value: "Japanese", label: "Japanese" },
  { value: "Thai", label: "Thai" },
  { value: "French", label: "French" },
  { value: "Mediterranean", label: "Mediterranean" },
  { value: "Middle Eastern", label: "Middle Eastern" },
];

const CATEGORY_OPTS = [
  { value: "", label: "—" },
  { value: "Appetizer", label: "Appetizer" },
  { value: "Breakfast", label: "Breakfast" },
  { value: "Lunch", label: "Lunch" },
  { value: "Dinner", label: "Dinner" },
  { value: "Main course", label: "Main course" },
  { value: "Side dish", label: "Side dish" },
  { value: "Dessert", label: "Dessert" },
  { value: "Snack", label: "Snack" },
  { value: "Drink", label: "Drink" },
];

const FIELDS: ReadonlyArray<FieldSpec> = [
  {
    name: "name",
    label: "Recipe name",
    type: "text",
    required: true,
    full: true,
    placeholder: "Classic Margherita Pizza",
    hint: "The one required property: the dish's title, exactly as shown on the page.",
  },
  {
    name: "description",
    label: "Description",
    type: "textarea",
    rows: 2,
    full: true,
    placeholder: "A blistered Neapolitan-style pizza with San Marzano tomatoes and fresh mozzarella.",
  },
  {
    name: "image",
    label: "Hero image URL",
    type: "url",
    full: true,
    placeholder: "https://example.com/recipes/margherita.jpg",
    hint: "A high-quality photo of the finished dish: strongly recommended for the recipe card.",
  },
  {
    name: "authorName",
    label: "Author",
    type: "text",
    placeholder: "Sofia Bianchi",
  },
  {
    name: "datePublished",
    label: "Date published",
    type: "date",
  },
  {
    name: "recipeCategory",
    label: "Category",
    type: "select",
    options: CATEGORY_OPTS,
  },
  {
    name: "recipeCuisine",
    label: "Cuisine",
    type: "select",
    options: CUISINE_OPTS,
  },
  {
    name: "prepTime",
    label: "Prep time (ISO 8601)",
    type: "text",
    placeholder: "PT20M",
    hint: "20 min = PT20M · 1 h 15 m = PT1H15M",
  },
  {
    name: "cookTime",
    label: "Cook time (ISO 8601)",
    type: "text",
    placeholder: "PT15M",
    hint: "Time on the stove / in the oven.",
  },
  {
    name: "totalTime",
    label: "Total time (ISO 8601)",
    type: "text",
    placeholder: "PT35M",
    hint: "Prep + cook + resting, end to end.",
  },
  {
    name: "recipeYield",
    label: "Yield",
    type: "text",
    placeholder: "2 pizzas",
    hint: "Servings or quantity produced.",
  },
  {
    name: "ingredients",
    label: "Ingredients",
    type: "list",
    full: true,
    itemLabel: "ingredient",
    itemPlaceholder: "250g 00 flour",
  },
  {
    name: "instructions",
    label: "Steps",
    type: "list",
    full: true,
    itemLabel: "step",
    itemPlaceholder: "Make the dough and rest for 8 hours.",
  },
  {
    name: "keywords",
    label: "Keywords",
    type: "text",
    full: true,
    placeholder: "pizza, neapolitan, vegetarian",
    hint: "Comma-separated terms describing the dish.",
  },
  {
    name: "nutritionCalories",
    label: "Calories (per serving)",
    type: "text",
    placeholder: "270 calories",
  },
  {
    name: "ratingValue",
    label: "Aggregate rating",
    type: "text",
    placeholder: "4.7",
    hint: "Average star rating from real, on-page reviews.",
  },
  {
    name: "reviewCount",
    label: "Review count",
    type: "text",
    placeholder: "128",
  },
];

/* -------------------------------------------------------------------------- */
/*  Examples                                                                  */
/* -------------------------------------------------------------------------- */

const PIZZA_EXAMPLE: SchemaValues = {
  name: "Classic Margherita Pizza",
  description:
    "A blistered Neapolitan-style pizza with San Marzano tomatoes, fresh mozzarella and basil.",
  image: "https://example.com/recipes/margherita.jpg",
  authorName: "Sofia Bianchi",
  datePublished: "2026-06-01",
  recipeCategory: "Main course",
  recipeCuisine: "Italian",
  prepTime: "PT20M",
  cookTime: "PT15M",
  totalTime: "PT8H35M",
  recipeYield: "2 pizzas",
  ingredients: [
    "250g 00 flour",
    "160ml water",
    "5g salt",
    "3g fresh yeast",
    "200g San Marzano tomatoes",
    "125g fresh mozzarella",
    "Fresh basil",
    "Extra-virgin olive oil",
  ],
  instructions: [
    "Mix flour, water, salt and yeast into a dough and knead until smooth.",
    "Rest the dough covered for 8 hours at room temperature.",
    "Divide into two balls and stretch each by hand into a round base.",
    "Top with crushed tomatoes, torn mozzarella and a drizzle of olive oil.",
    "Bake at 250°C for 12–15 minutes until the crust is blistered.",
    "Finish with fresh basil and serve immediately.",
  ],
  keywords: "pizza, neapolitan, margherita, vegetarian",
  nutritionCalories: "270 calories",
  ratingValue: "4.8",
  reviewCount: "214",
};

const SLOW_COOKER_EXAMPLE: SchemaValues = {
  name: "Slow-Cooker Beef Chili",
  description:
    "A rich, smoky beef chili that simmers all day in the slow cooker, perfect for a crowd.",
  image: "https://example.com/recipes/beef-chili.jpg",
  authorName: "Marcus Reed",
  datePublished: "2026-05-14",
  recipeCategory: "Dinner",
  recipeCuisine: "American",
  prepTime: "PT20M",
  cookTime: "PT8H",
  totalTime: "PT8H20M",
  recipeYield: "6 servings",
  ingredients: [
    "900g ground beef",
    "2 cans kidney beans, drained",
    "1 can crushed tomatoes",
    "1 onion, diced",
    "3 cloves garlic, minced",
    "2 tbsp chili powder",
    "1 tbsp smoked paprika",
    "1 tsp ground cumin",
    "Salt and pepper to taste",
  ],
  instructions: [
    "Brown the ground beef in a pan and drain the excess fat.",
    "Add the beef, beans, tomatoes, onion, garlic and spices to the slow cooker.",
    "Stir well, cover and cook on low for 8 hours.",
    "Taste, adjust the seasoning, and serve with your favorite toppings.",
  ],
  keywords: "chili, beef, slow cooker, one pot",
  nutritionCalories: "410 calories",
  ratingValue: "4.6",
  reviewCount: "89",
};

/* -------------------------------------------------------------------------- */
/*  Empty state + builder                                                     */
/* -------------------------------------------------------------------------- */

const EMPTY: SchemaValues = {
  name: "",
  description: "",
  image: "",
  authorName: "",
  datePublished: "",
  recipeCategory: "",
  recipeCuisine: "",
  prepTime: "",
  cookTime: "",
  totalTime: "",
  recipeYield: "",
  ingredients: [],
  instructions: [],
  keywords: "",
  nutritionCalories: "",
  ratingValue: "",
  reviewCount: "",
};

function buildFromValues(v: SchemaValues): SchemaOutput {
  return buildRecipe({
    name: str(v.name),
    description: opt(v.description),
    image: opt(v.image),
    authorName: opt(v.authorName),
    datePublished: opt(v.datePublished),
    recipeCategory: opt(v.recipeCategory),
    recipeCuisine: opt(v.recipeCuisine),
    prepTime: opt(v.prepTime),
    cookTime: opt(v.cookTime),
    totalTime: opt(v.totalTime),
    recipeYield: opt(v.recipeYield),
    ingredients: optList(v.ingredients),
    instructions: optList(v.instructions),
    keywords: opt(v.keywords),
    nutritionCalories: opt(v.nutritionCalories),
    aggregateRating: opt(v.ratingValue)
      ? { ratingValue: str(v.ratingValue), reviewCount: opt(v.reviewCount) }
      : undefined,
  });
}

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */

export default function RecipeSchemaGeneratorTool({ tool }: ImageToolProps) {
  const style = accentStyle(tool.accent ?? "amber");
  const [values, setValues] = React.useState<SchemaValues>(EMPTY);
  const [minified, setMinified] = React.useState(false);

  const output = React.useMemo<SchemaOutput>(() => buildFromValues(values), [values]);
  const validation = React.useMemo(() => validateJsonLd(output.jsonLd), [output.jsonLd]);

  const code = minified
    ? `<script type="application/ld+json">${output.minified}</script>`
    : output.scriptTag;

  /* -- derive checks + score from the validator ---------------------------- */
  const { checks, score } = React.useMemo(() => {
    const items: CheckItem[] = [];
    for (const e of validation.errors) {
      items.push({
        id: `err-${e.path ?? e.message}`,
        status: "fail",
        label: e.path ? <code className="font-mono text-xs">{e.path}</code> : "Required property",
        detail: e.message,
        fix: "This property is required for a valid recipe rich result, fill it in above.",
        group: "Required",
      });
    }
    for (const w of validation.warnings) {
      items.push({
        id: `warn-${w.path ?? w.message}`,
        status: "warn",
        label: w.path ? <code className="font-mono text-xs">{w.path}</code> : "Recommended property",
        detail: w.message,
        fix: "Optional, but adding it strengthens the recipe rich result.",
        group: "Recommended",
      });
    }
    if (validation.ok && validation.warnings.length === 0 && validation.types.length > 0) {
      items.push({
        id: "all-good",
        status: "pass",
        label: "All required & recommended properties present",
        detail: "Valid Recipe markup: ready to publish.",
        group: "Required",
      });
    } else if (validation.ok && validation.types.length > 0) {
      items.push({
        id: "required-ok",
        status: "pass",
        label: "Required property present",
        detail: "Valid Recipe markup: add the recommended fields to strengthen it.",
        group: "Required",
      });
    }

    const errPenalty = validation.errors.length * 30;
    const warnPenalty = validation.warnings.length * 8;
    const raw = 100 - errPenalty - warnPenalty;
    const s = validation.types.length === 0 ? 0 : Math.max(0, Math.min(100, raw));
    return { checks: items, score: s };
  }, [validation]);

  const grade = gradeForScore(score);
  const summary = validation.ok
    ? validation.warnings.length === 0
      ? "Valid. All required and recommended properties are present."
      : `Valid. ${validation.warnings.length} recommended ${validation.warnings.length === 1 ? "property" : "properties"} would strengthen it.`
    : `${validation.errors.length} required ${validation.errors.length === 1 ? "property is" : "properties are"} missing.`;

  /* -- ingredient / step counts for the toolbar --------------------------- */
  const ingredientCount = optList(values.ingredients)?.length ?? 0;
  const stepCount = optList(values.instructions)?.length ?? 0;

  /* -- share serialization ------------------------------------------------- */
  const serialize = React.useCallback((v: SchemaValues) => JSON.stringify(v), []);
  const deserialize = React.useCallback((raw: string): SchemaValues | null => {
    try {
      const parsed = JSON.parse(raw) as unknown;
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        return { ...EMPTY, ...(parsed as SchemaValues) };
      }
    } catch {
      /* ignore */
    }
    return null;
  }, []);

  const examples = React.useMemo<ReadonlyArray<Example<SchemaValues>>>(
    () => [
      {
        label: "Margherita pizza",
        description: "A fully-valid recipe with ingredients, steps, timings, nutrition and rating.",
        icon: "Pizza",
        value: PIZZA_EXAMPLE,
      },
      {
        label: "Slow-cooker chili",
        description: "A long-cook recipe showing a multi-hour ISO 8601 duration.",
        icon: "Soup",
        value: SLOW_COOKER_EXAMPLE,
      },
    ],
    [],
  );

  const loadPizza = React.useCallback(() => setValues(PIZZA_EXAMPLE), []);

  /* -- form ---------------------------------------------------------------- */
  const form = (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={loadPizza}
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
        value={values}
        onChange={setValues}
        idPrefix="recipe-schema"
      />

      <p className="flex items-start gap-1.5 text-xs leading-relaxed text-muted-foreground">
        <Icon name="Timer" size={13} className={cn("mt-0.5 shrink-0", style.text)} />
        <span>
          Times use ISO 8601 durations: <code className="font-mono">PT20M</code> is 20 minutes,{" "}
          <code className="font-mono">PT1H15M</code> is 1 hour 15 minutes,{" "}
          <code className="font-mono">PT1M30S</code> is 90 seconds.
        </span>
      </p>
    </div>
  );

  /* -- preview: eligibility panel ----------------------------------------- */
  const preview = (
    <div className="flex flex-col gap-4">
      <ScorePanel
        score={score}
        grade={grade}
        summary={summary}
        counts={{
          pass: checks.filter((c) => c.status === "pass").length,
          warn: validation.warnings.length,
          fail: validation.errors.length,
        }}
      />
      <CheckList
        items={checks}
        grouped
        emptyLabel="Enter a recipe name to start validating your markup."
      />
      <p className="flex items-start gap-1.5 text-xs leading-relaxed text-muted-foreground">
        <Icon name="Info" size={13} className={cn("mt-0.5 shrink-0", style.text)} />
        <span>
          This is a pragmatic required/recommended check for Recipe. Confirm final eligibility with{" "}
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
        icon="ListChecks"
        label="Ingredients"
        value={String(ingredientCount)}
        tone="info"
        title="Distinct recipeIngredient entries"
      />
      <StatBadge
        icon="ListOrdered"
        label="Steps"
        value={String(stepCount)}
        tone="info"
        title="HowToStep instructions"
      />
      <StatBadge
        icon="Ruler"
        label="Size"
        value={`${output.minified.length.toLocaleString()} B`}
        title="Minified JSON-LD byte length"
      />
      <StatBadge
        icon={validation.ok ? "CircleCheck" : "XCircle"}
        label="Status"
        value={validation.ok ? "Valid" : `${validation.errors.length} error${validation.errors.length === 1 ? "" : "s"}`}
        tone={validation.ok ? "success" : "danger"}
        title="Required-property validity"
      />
    </>
  );

  return (
    <GeneratorWithPreview<SchemaValues>
      value={values}
      onChange={setValues}
      initialValue={EMPTY}
      code={code}
      language="JSON-LD"
      form={form}
      preview={preview}
      previewLabel="Recipe eligibility check"
      downloadName="recipe-schema.json"
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
