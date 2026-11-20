import type { Tool } from "@/types";

/**
 * SVG to Vue: the Vue 3 counterpart of the SVG converter suite. It turns raw
 * SVG markup into a clean Single-File Component (`.vue`) that uses `<script
 * setup>`, keeps SVG's native kebab-case attributes exactly as Vue's template
 * compiler expects them, and forwards every caller attribute onto the root via
 * `v-bind="$attrs"`: rendered live next to a real preview, entirely in the
 * browser. All copy below is written uniquely for the SVG→Vue workflow and the
 * exact queries developers type when a pasted icon breaks their SFC.
 */
const svgToVue: Tool = {
  slug: "svg-to-vue",
  title: "SVG to Vue",
  category: "svg-tools",
  group: "Convert",
  icon: "Braces",
  accent: "emerald",
  status: "live",
  createdAt: "2026-06-22",

  description:
    "Convert SVG to a clean Vue 3 Single-File Component in your browser, a <script setup> SFC with attributes intact and $attrs pass-through, TypeScript or JavaScript, plus a live preview. Nothing is uploaded.",

  h1: "SVG to Vue 3 Component Converter",
  tagline:
    "Paste any SVG and get a ready-to-drop Vue 3 SFC instantly, a <script setup> block, native SVG attributes preserved, and every caller attribute forwarded through $attrs. Live preview, one-click copy, 100% in your browser.",
  longDescription:
    "The GigAI SVG to Vue converter transforms raw SVG markup into an idiomatic Vue 3 Single-File Component you can save as a.vue file and import straight away. No wrestling with the template compiler or hand-wiring attribute forwarding. Unlike React, Vue's template syntax keeps SVG attributes in their native kebab-case (stroke-width, fill-rule, xlink:href all stay exactly as written), so the artwork drops into a <template> untouched and renders on the first try. The converter wraps that template in a modern <script setup> block (TypeScript or plain JavaScript, your choice) and adds v-bind=\"$attrs\" to the root <svg> so any width, height, fill, class, aria-label or @click a parent passes flows through to the element without you declaring a single prop. You get a custom PascalCase component name for the download filename and the SFC comment, a syntax-highlighted code pane, and a live checkerboard preview of the real icon beside it, so you can confirm the shape and viewBox before you copy or download. Because parsing and generation run entirely on your device with the browser's native SVG engine, your assets (brand marks, unreleased icons, client artwork) are never uploaded, stored or logged. It's the fast, private path from a designer's export to a Vue component that just works.",

  ctaText: "Convert SVG to Vue",

  keywords: [
    "svg to vue",
    "svg to vue component",
    "convert svg to vue",
    "svg to vue 3",
    "svg to sfc",
    "vue svg component",
    "svg to script setup",
    "svg vue converter",
    "svg to vue single file component",
    "inline svg vue",
    "vue svg icon component",
    "svg to vue typescript",
  ],

  seo: {
    title: "SVG to Vue, Convert SVG to a Vue 3 SFC Component Online | GigAI Tools",
    description:
      "Free online SVG to Vue converter. Paste SVG, get a clean Vue 3 Single-File Component with <script setup>, native attributes and $attrs pass-through, TypeScript or JS, plus a live preview: 100% in your browser, no uploads.",
  },

  formats: {
    input: ["SVG"],
    output: ["Vue"],
  },

  features: [
    {
      icon: "FileCode2",
      title: "Modern <script setup> SFC",
      description:
        "The output is a Vue 3 Single-File Component built around <script setup> (the current, recommended composition style) not a legacy Options-API render function. Save it as a.vue file and import it anywhere.",
    },
    {
      icon: "CheckCheck",
      title: "Attributes kept native",
      description:
        "Vue's template compiler understands SVG's kebab-case attributes directly, so stroke-width, fill-rule and xlink:href stay exactly as written. No camelCasing, no renames, no broken paths, the artwork compiles unchanged.",
    },
    {
      icon: "Share2",
      title: "Pass-through via $attrs",
      description:
        "The root <svg> gets v-bind=\"$attrs\", so a parent can pass width, height, fill, class, style, aria-label or @click and it flows straight to the element, one component that serves every size, color and handler.",
    },
    {
      icon: "FileType2",
      title: "TypeScript or JavaScript",
      description:
        "Flip one toggle to emit <script setup lang=\"ts\"> for a typed SFC or a plain <script setup> for JavaScript. The block header adjusts to match your project's setup.",
    },
    {
      icon: "Tag",
      title: "Custom component name",
      description:
        "Name the component in PascalCase and it becomes both the download filename and the identifying comment in the SFC, so it lands in your components directory ready to register.",
    },
    {
      icon: "Eye",
      title: "Live preview beside the code",
      description:
        "A checkerboard preview renders the actual SVG next to the generated SFC, with light/dark backgrounds and zoom, so you catch a clipped viewBox or a thin stroke before it ships.",
    },
  ],

  benefits: [
    {
      title: "Drop-in Vue icons, no fixups",
      description:
        "Because Vue keeps SVG attributes native, the pasted markup lands in a <template> and renders immediately. You skip the attribute-renaming that trips up other frameworks and get a working SFC in one click.",
    },
    {
      title: "One component, every variant",
      description:
        "With v-bind=\"$attrs\" on the root, a single generated component covers every size and color you need: pass class for utility CSS, fill for theming, or aria-label for accessibility at the call site, no forks required.",
    },
    {
      title: "Composition API ready",
      description:
        "The <script setup> output matches how modern Vue 3 apps are written, so it slots cleanly into a Vite + Vue project alongside your other SFCs without a style mismatch.",
    },
    {
      title: "Private by design",
      description:
        "Conversion happens locally in your browser. Unreleased logos, client artwork and internal icons never leave your machine. Nothing is uploaded, stored or logged.",
    },
  ],

  howTo: [
    {
      title: "Paste or import your SVG",
      description:
        "Paste SVG markup into the editor, drop a .svg file anywhere on the workspace, or load a built-in example to see the SFC output instantly.",
    },
    {
      title: "Set the component options",
      description:
        "Name the component and choose TypeScript or JavaScript for the <script setup> block. The SFC regenerates live as you change anything.",
    },
    {
      title: "Check the live preview",
      description:
        "Confirm the icon still renders correctly in the preview pane, switch backgrounds or zoom to inspect a thin stroke or a transparent fill.",
    },
    {
      title: "Copy or download the SFC",
      description:
        "Copy the .vue source to your clipboard or download it as a file named after your component, then register it in your Vue app.",
    },
  ],

  useCases: [
    {
      audience: "Vue frontend developer",
      title: "Turn a Figma export into an SFC",
      description:
        "Paste the SVG a designer handed off and get a <script setup> Single-File Component that drops into your components folder and renders without touching the markup.",
    },
    {
      audience: "Design-system engineer",
      title: "Build a themeable icon set",
      description:
        "Convert each icon to a component with $attrs pass-through, so consumers restyle size, color and class from the outside and every icon stays consistent across the app.",
    },
    {
      audience: "Nuxt developer",
      title: "Drop icons into a Nuxt project",
      description:
        "Generate SFCs you can save under components/ for Nuxt's auto-import, keeping a clean Vue 3 icon library without a build-time SVG loader.",
    },
    {
      audience: "Student / bootcamp learner",
      title: "See how SVG maps into a Vue template",
      description:
        "Watch a real icon become a <template> + <script setup> SFC and learn how $attrs forwards attributes, using genuine artwork instead of a contrived snippet.",
    },
  ],

  tips: [
    "Run your SVG through the SVG Optimizer first, fewer nodes and no editor metadata means a smaller, cleaner SFC.",
    "Set fill=\"currentColor\" in the source so the icon inherits the surrounding text color and adapts to light and dark themes automatically.",
    "Give the component a descriptive PascalCase name (IconArrowRight, LogoMark). It becomes the download filename and the SFC comment.",
    "Because $attrs forwards to the root, style the icon from the parent, <MyIcon class=\"h-6 w-6 text-blue-500\" />, instead of editing the component.",
    "Prefer <script setup lang=\"ts\">? Leave TypeScript on so the SFC matches a typed Vite + Vue project out of the box.",
  ],

  troubleshooting: [
    {
      problem: "The converter can't find an <svg> element.",
      solution:
        "The input must contain a single well-formed <svg>…</svg> root. Strip any leading XML prolog, doctype or surrounding HTML, and make sure every tag is closed. Running the markup through the SVG Validator first will pinpoint the issue.",
    },
    {
      problem: "The icon renders black or ignores my color.",
      solution:
        "If the SVG hard-codes fill or stroke, that value wins over CSS. Set fill=\"currentColor\" (or stroke=\"currentColor\") in the source so the icon inherits color from its surroundings, then re-convert.",
    },
    {
      problem: "Passing width or fill from the parent has no effect.",
      solution:
        "Attributes forward through v-bind=\"$attrs\" only if the source doesn't hard-code the same attribute on the root. Remove a fixed width/height/fill from the <svg> tag if you want the parent's value to take over.",
    },
    {
      problem: "Vue warns about an id colliding across icons.",
      solution:
        "SVGs that use defs with fixed ids (gradients, clipPaths) can clash when several are on one page. Give each source unique ids before converting, or run it through the Optimizer with id removal where the ids aren't referenced.",
    },
  ],

  security:
    "Every conversion runs entirely in your browser using its native SVG parser. Your markup is never uploaded to any server. Nothing is stored, logged or transmitted, so you can safely convert unreleased logos, client artwork or internal icons. Close the tab and every trace is gone.",

  faq: [
    {
      question: "Is my SVG uploaded to a server?",
      answer:
        "No. Parsing and code generation happen entirely in your browser with its built-in SVG engine. Your artwork never leaves your device, so there's nothing for us to store, log or see, it's safe to convert confidential logos or unreleased icons.",
    },
    {
      question: "What kind of Vue component does it generate?",
      answer:
        "A Vue 3 Single-File Component (.vue) built around <script setup>, the modern, recommended composition style. The artwork lives in a <template> and the root <svg> gets v-bind=\"$attrs\" so callers can pass attributes through. It's ready to save and register in a Vite + Vue or Nuxt project.",
    },
    {
      question: "Why doesn't it camelCase the attributes like the React tool?",
      answer:
        "Because Vue doesn't need it. Vue's template compiler reads SVG's native kebab-case attributes directly, so stroke-width, fill-rule and xlink:href stay exactly as written and the icon renders unchanged. Renaming them, as React requires, would actually break a Vue template.",
    },
    {
      question: "How does $attrs pass-through work?",
      answer:
        "The generated root <svg> includes v-bind=\"$attrs\", which spreads any attribute a parent passes (width, height, fill, class, style, aria-label, @click and more) onto the element. That means one component serves every size, color and event handler without you declaring props.",
    },
    {
      question: "Can I get a TypeScript SFC?",
      answer:
        "Yes. Toggle TypeScript to emit <script setup lang=\"ts\">, matching a typed Vite + Vue project. Toggle it off for a plain <script setup> block in JavaScript. Either way the template is identical.",
    },
    {
      question: "How do I make the icon inherit my text color?",
      answer:
        "Set fill=\"currentColor\" (and/or stroke=\"currentColor\") in the SVG source before converting. The generated component then adopts the CSS color of its surroundings, so the same icon adapts to light and dark themes without editing the file.",
    },
    {
      question: "Will it work with Nuxt?",
      answer:
        "Yes. Save the generated .vue file under your components/ directory and Nuxt's auto-import will pick it up, or register it manually in a plain Vite + Vue app. The output is standard Vue 3 SFC syntax with no framework-specific dependencies.",
    },
    {
      question: "Why won't my SVG convert?",
      answer:
        "The input needs a single, well-formed <svg> element. Remove any XML prolog, doctype or surrounding HTML, and ensure all tags are closed. If it still fails, run the markup through the SVG Validator to find the malformed part.",
    },
  ],

  changelog: [
    {
      date: "2026-06-22",
      change:
        "Initial release: live SVG→Vue conversion producing a Vue 3 <script setup> SFC with native attributes and $attrs pass-through, TypeScript/JavaScript toggle, custom component name, live preview, and copy/download.",
    },
    {
      date: "2026-06-27",
      change:
        "Added undo/redo history, keyboard shortcuts, curated examples, and a shareable-link option that reopens the tool with your SVG pre-loaded.",
    },
    {
      date: "2026-06-30",
      change:
        "Clearer errors when the input isn't a single well-formed <svg> root, and tidier indentation in the generated <template>.",
    },
  ],

  relatedTools: [
    "svg-to-react",
    "svg-optimizer",
    "svg-viewer",
    "svg-to-data-uri",
    "json-formatter",
  ],
};

export default svgToVue;
