import type { Tool } from "@/types";

/**
 * Recipe Schema Generator, a dedicated, best-in-class builder for Recipe
 * JSON-LD structured data, the markup behind Google's recipe rich result and
 * the recipe carousel. Enter ingredients, steps, prep/cook/total times, yield,
 * cuisine, nutrition calories and an aggregate rating, and the tool emits valid
 * schema.org Recipe JSON-LD live, ISO 8601 durations handled for you, empty
 * fields stripped, HowToStep instructions built automatically, with an inline
 * eligibility check for the required and recommended properties Google needs.
 * Everything runs on `lib/seo-tools/schema.ts` in the browser: no recipe,
 * ingredient list or rating data is ever uploaded. Copy is unique to recipe
 * structured data and written to rank for the queries food bloggers and recipe
 * publishers actually type.
 */
const recipeSchemaGenerator: Tool = {
  slug: "recipe-schema-generator",
  title: "Recipe Schema Generator",
  description:
    "Generate valid Recipe JSON-LD structured data for Google's recipe rich result: ingredients, steps, prep/cook times, yield, nutrition and star ratings, with a live eligibility check and copy-ready script tag. 100% in your browser.",
  category: "seo-tools",
  group: "Schema",
  icon: "ChefHat",
  accent: "amber",
  status: "live",
  featured: false,
  createdAt: "2026-06-22",

  h1: "Recipe Schema Generator, Recipe JSON-LD for Rich Results & Carousels",
  tagline:
    "Enter your ingredients, steps, times, yield, nutrition and rating once, and get valid schema.org Recipe JSON-LD instantly. We build the ISO 8601 durations and HowToStep list for you, check the properties Google needs for the recipe rich result, and hand you the exact <script> tag to paste, all in your browser, nothing uploaded.",
  longDescription:
    "The GigAI Recipe Schema Generator builds schema.org Recipe structured data as JSON-LD, the exact format Google recommends and the markup that makes a page eligible for the recipe rich result, host carousel and Guided Recipes on Google Assistant. Unlike a generic schema builder, this tool is shaped entirely around a recipe: you get proper fields for the recipe name, hero image, author, prep time, cook time and total time, yield, category and cuisine, a full ingredient list, ordered preparation steps, keywords, calories and an aggregate star rating. As you type, it emits clean JSON-LD live: each preparation step is wrapped as a schema.org HowToStep, calories become a NutritionInformation node, and the aggregate rating is assembled from your rating value and review count. Durations are entered in ISO 8601 (like PT20M for twenty minutes) with inline help, and every empty field is stripped so the output stays lean. The built-in eligibility check grades your markup against the properties Google looks for (name, image, ingredients, instructions and author) flagging what's required versus recommended so you can see at a glance whether the recipe qualifies for enhanced treatment before you publish. When you're done, copy the ready-to-paste `<script type=\"application/ld+json\">` block, download the raw JSON, or share a link that reopens the tool with your recipe pre-filled. Because generation and validation happen entirely on your device using the browser's own JSON engine, your unpublished recipes, ingredient lists and ratings never leave your machine. There is nothing for us to store, log or see.",

  ctaText: "Generate recipe schema",

  keywords: [
    "recipe schema generator",
    "recipe json-ld generator",
    "recipe structured data",
    "schema.org recipe markup",
    "recipe rich results markup",
    "recipe rich snippet generator",
    "howto recipe schema",
    "recipe seo markup",
    "food blog schema generator",
    "recipe json-ld structured data",
    "recipe carousel schema",
    "nutrition schema generator",
  ],

  seo: {
    title:
      "Recipe Schema Generator, Free Recipe JSON-LD Structured Data | GigAI Tools",
    description:
      "Free recipe schema generator: build valid Recipe JSON-LD for Google's recipe rich result. Ingredients, steps, prep/cook times, yield, nutrition & star ratings with a live eligibility check and copy-ready script tag: 100% in your browser.",
  },

  features: [
    {
      icon: "ChefHat",
      title: "Purpose-built for recipes",
      description:
        "A form shaped around a real recipe, name, hero image, author, prep/cook/total times, yield, category, cuisine, ingredients, steps, keywords, calories and rating. Not a generic schema box.",
    },
    {
      icon: "ListOrdered",
      title: "Ingredients & steps done right",
      description:
        "Add ingredients as a clean recipeIngredient list and each step is wrapped automatically as a schema.org HowToStep, exactly how Google expects ordered recipe instructions.",
    },
    {
      icon: "Timer",
      title: "ISO 8601 durations made easy",
      description:
        "Enter prep, cook and total time in ISO 8601 (PT20M, PT1H15M) with inline help and examples, so your timings parse correctly instead of silently disqualifying the markup.",
    },
    {
      icon: "ShieldCheck",
      title: "Live rich-results eligibility check",
      description:
        "Every field is graded against the properties Google needs (name, image, ingredients, instructions and author) so you instantly see whether the recipe qualifies and what is still missing.",
    },
    {
      icon: "Star",
      title: "Ratings & nutrition included",
      description:
        "Add an aggregate star rating with review count and a calorie figure, assembled into valid AggregateRating and NutritionInformation nodes for the star and nutrition enhancements.",
    },
    {
      icon: "Code2",
      title: "Copy the exact script tag",
      description:
        "Get a ready-to-paste `<script type=\"application/ld+json\">` block or download the raw JSON, plus presets, undo/redo and a share link that reopens with your recipe pre-filled.",
    },
  ],

  benefits: [
    {
      title: "Win the recipe rich result without hand-writing JSON",
      description:
        "The recipe card, star rating, cook time and calorie badge in Search all depend on correct Recipe structured data. The generator produces it cleanly so you skip the syntax errors that quietly keep a recipe out of the carousel.",
    },
    {
      title: "Know it's valid before you hit publish",
      description:
        "The inline check flags missing required properties as errors and missing recommended ones as warnings, so you fix eligibility in the tool instead of finding out later in Search Console.",
    },
    {
      title: "Consistent markup across every recipe post",
      description:
        "Share a pre-filled link or a downloaded snippet so every recipe on the blog emits the same clean Recipe shape: the kind of consistency search engines trust.",
    },
    {
      title: "Safe for unpublished recipes",
      description:
        "Because everything runs locally, you can build markup for a recipe you haven't posted yet (ingredients, method and all) without any of it leaving your browser.",
    },
  ],

  howTo: [
    {
      title: "Enter the recipe basics",
      description:
        "Add the recipe name, a hero image URL and the author. Load the example first if you want a fully-populated starting point, then edit from there, the JSON-LD updates live.",
    },
    {
      title: "Add ingredients and steps",
      description:
        "List each ingredient on its own line and add the preparation steps in order. The tool turns them into recipeIngredient and HowToStep instructions automatically.",
    },
    {
      title: "Fill in times, yield and nutrition",
      description:
        "Enter prep, cook and total time in ISO 8601 (e.g. PT20M), the yield, cuisine and category, calories, and an aggregate star rating with review count.",
    },
    {
      title: "Read the eligibility check",
      description:
        "Watch the required/recommended report: green means the recipe is valid, warnings point to recommended fields that strengthen it, and errors flag anything mandatory that's still missing.",
    },
    {
      title: "Copy the script tag & test it",
      description:
        "Copy the `<script type=\"application/ld+json\">` block (or download the JSON), paste it into the recipe page, then confirm with Google's Rich Results Test before publishing.",
    },
  ],

  formats: {
    input: ["Form"],
    output: ["JSON-LD", "HTML"],
  },

  useCases: [
    {
      audience: "Food blogger",
      title: "Get recipe cards into Search",
      description:
        "Mark up each post with ingredients, steps, cook time, calories and a star rating so recipes become eligible for the rich result and host carousel that drive recipe traffic.",
    },
    {
      audience: "Recipe site editor",
      title: "Standardise markup across the library",
      description:
        "Hand writers a validated Recipe snippet and share links so every recipe in the CMS emits the same clean shape, instead of a dozen slightly-different hand-written blocks.",
    },
    {
      audience: "SEO specialist",
      title: "Audit and fix recipe eligibility",
      description:
        "Rebuild a page's Recipe markup in the generator to see exactly which required or recommended properties are missing, then hand developers a correct block to ship.",
    },
    {
      audience: "Restaurant / brand marketer",
      title: "Publish signature recipes with rich cards",
      description:
        "Turn a brand's featured recipes into properly-structured content with nutrition and ratings, improving how those pages present in search results.",
    },
  ],

  troubleshooting: [
    {
      problem: "The check shows an error for the recipe name.",
      solution:
        "A Recipe requires a name: it's the one mandatory property. Fill in the recipe name and the error clears. Without it the markup isn't eligible for the recipe rich result.",
    },
    {
      problem: "My prep or cook time isn't being accepted.",
      solution:
        "Durations must be ISO 8601, not plain text: 20 minutes is PT20M, an hour and a quarter is PT1H15M, 90 seconds is PT1M30S. Use the inline examples and Google will parse the timing correctly.",
    },
    {
      problem: "My star rating doesn't appear as a warning-free field.",
      solution:
        "An aggregate rating needs a rating value to be built at all. A review count is recommended alongside it. Enter both so the AggregateRating node is complete and strengthens rich-result eligibility.",
    },
    {
      problem: "Google's test flags an issue my tool didn't.",
      solution:
        "This tool is a pragmatic linter for Recipe's required/recommended properties, not a full schema.org shape validator. Always confirm with Google's Rich Results Test, which layers its own recipe-specific eligibility rules on top of valid JSON-LD.",
    },
  ],

  tips: [
    "List each ingredient separately (\"250g 00 flour\", \"160ml water\") rather than as one blob: Google reads recipeIngredient as distinct entries.",
    "Write each step as its own instruction. The tool wraps them as ordered HowToStep items, which is what the recipe rich result expects.",
    "Add a total time as well as prep and cook time, recipes with clear timings tend to present better in Search.",
    "Only mark up a recipe that's actually visible on the page. Ratings must reflect real, on-page reviews or you risk a manual action.",
    "After copying, always run the markup through Google's Rich Results Test. Passing this tool's check is necessary, but Google adds recipe-specific eligibility rules of its own.",
  ],

  security:
    "Your recipe is generated and validated entirely in your browser using its native JSON engine: nothing is uploaded to any server. No recipe names, ingredient lists, methods, nutrition figures or ratings are stored, logged or transmitted, so you can safely build markup for unpublished recipes. Close the tab and every trace is gone.",

  faq: [
    {
      question: "What is recipe schema markup and why do I need it?",
      answer:
        "Recipe schema markup is structured data that describes your recipe (its name, ingredients, steps, times, yield, nutrition and rating) using the shared schema.org vocabulary, written as JSON-LD. Google reads it to understand the page as a recipe and to show the recipe rich result: a card with the photo, star rating, cook time and calories, and inclusion in the recipe carousel. Correct markup is the prerequisite for those enhanced listings, which can significantly lift visibility and click-through for food content.",
    },
    {
      question: "What properties does a valid recipe need?",
      answer:
        "At minimum a Recipe needs a name. To be genuinely eligible and competitive, Google looks for a hero image, the ingredient list (recipeIngredient), the ordered steps (recipeInstructions) and an author, plus useful extras like prep/cook/total time, yield, nutrition calories and an aggregate rating. This generator marks the name as required and the others as recommended, and shows you exactly which are still missing.",
    },
    {
      question: "How do I write prep and cook times correctly?",
      answer:
        "Recipe times use ISO 8601 duration format, not plain words. Twenty minutes is PT20M, one hour is PT1H, an hour and fifteen minutes is PT1H15M, and ninety seconds is PT1M30S. The generator shows these examples inline. Enter your times that way and Google will parse and display them in the recipe card.",
    },
    {
      question: "Can I add a star rating to my recipe?",
      answer:
        "Yes. Enter an aggregate rating value (for example 4.7) and the number of reviews it's based on, and the tool builds a valid AggregateRating node that can drive the star display in the recipe rich result. Important: the rating must reflect genuine reviews shown on the page. Inventing ratings can trigger a manual action from Google.",
    },
    {
      question: "Does adding this schema guarantee a recipe rich result?",
      answer:
        "No tool can guarantee a rich result, Google decides whether and when to show one based on markup validity, content quality and its own eligibility rules. What this generator guarantees is syntactically valid Recipe JSON-LD with the required properties present, which is the necessary starting point. Always confirm final eligibility with Google's Rich Results Test.",
    },
    {
      question: "Where do I put the generated recipe script tag?",
      answer:
        "Paste the `<script type=\"application/ld+json\">` block into the HTML of the recipe page it describes: either in the `<head>` or anywhere in the `<body>` is fine for Google. In WordPress or another CMS, add it through a custom-HTML block, a theme template or an SEO plugin field. Put each recipe's markup on that specific recipe page, and make sure the data matches what's visible on the page.",
    },
    {
      question: "Is this the same as the full Schema Markup Generator?",
      answer:
        "It's the recipe-focused version of it. The main Schema Markup Generator is a hub covering twelve schema types. This tool zooms in on Recipe with a form tailored to ingredients, steps, timings, nutrition and ratings, plus recipe-specific guidance. Use this one when you're marking up recipes and the hub when you need other types like Article, Product or FAQ.",
    },
    {
      question: "Is my recipe data sent anywhere?",
      answer:
        "No. All generation and validation happen locally in your browser using its built-in JSON engine. Your recipe names, ingredient lists, methods, nutrition figures and ratings never leave your device: there's nothing for us to upload, store or log. It's completely safe to build markup for recipes you haven't published yet.",
    },
  ],

  changelog: [
    {
      date: "2026-06-22",
      change:
        "Initial release, dedicated Recipe JSON-LD generator with ingredients, ordered HowToStep instructions, prep/cook/total times, yield, category, cuisine, keywords, nutrition calories and aggregate rating, plus a live required/recommended eligibility check, copy-ready script tag, download, presets, undo/redo and share links.",
    },
    {
      date: "2026-06-27",
      change:
        "Added inline ISO 8601 duration help and examples, a minified-output toggle, and a second worked example (a slow-cooker recipe) alongside the classic-pizza preset.",
    },
  ],

  relatedTools: [
    "schema-generator",
    "faq-schema-generator",
    "article-schema-generator",
    "meta-tag-generator",
    "json-formatter",
  ],
};

export default recipeSchemaGenerator;
