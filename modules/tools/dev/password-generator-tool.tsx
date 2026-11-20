"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { accentStyle } from "@/lib/design";
import type { WorkspaceToolData } from "@/types";
import { estimateStrength } from "@/lib/dev/password";
import {
  download,
  Field,
  SegmentedControl,
  SelectField,
  ShortcutsHelp,
  StatBadge,
  Toggle,
  Toolbar,
  ToolbarButton,
  ToolbarDivider,
  ToolbarSpacer,
  useShareState,
  useShortcuts,
  type ShortcutHint,
} from "@/components/tool/dev";

/* ------------------------------------------------------------------ *
 * Crypto-secure primitives (unbiased draws via rejection sampling).
 * Kept local because this tool needs require-each-class, a distinct
 * exclude-similar set and a passphrase mode beyond lib/dev/password.
 * ------------------------------------------------------------------ */

const SETS = {
  upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lower: "abcdefghijklmnopqrstuvwxyz",
  digits: "0123456789",
  symbols: "!@#$%^&*()-_=+[]{};:,.<>?/~",
} as const;

/** Visually confusable characters removed when "exclude look-alikes" is on. */
const SIMILAR = new Set("O0oIl1|`'\"S5B8Z2G6");

type SetKey = keyof typeof SETS;

/** Unbiased random integer in [0, max) via rejection sampling. */
function randomIndex(max: number): number {
  if (max <= 0) return 0;
  const limit = Math.floor(0x1_0000_0000 / max) * max;
  const buf = new Uint32Array(1);
  let x = 0;
  do {
    crypto.getRandomValues(buf);
    x = buf[0] ?? 0;
  } while (x >= limit);
  return x % max;
}

/** Cryptographically shuffle in place (Fisher–Yates, unbiased). */
function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = randomIndex(i + 1);
    const a = arr[i];
    const b = arr[j];
    if (a !== undefined && b !== undefined) {
      arr[i] = b;
      arr[j] = a;
    }
  }
  return arr;
}

function pick(pool: string): string {
  return pool[randomIndex(pool.length)] ?? "";
}

interface CharOptions {
  length: number;
  sets: Record<SetKey, boolean>;
  excludeSimilar: boolean;
  requireEach: boolean;
}

type GenResult =
  | { ok: true; value: string; entropyBits: number }
  | { ok: false; error: string };

/** Build the pool for a set, honouring the exclude-similar filter. */
function poolFor(key: SetKey, excludeSimilar: boolean): string {
  const raw = SETS[key];
  return excludeSimilar ? [...raw].filter((c) => !SIMILAR.has(c)).join("") : raw;
}

function generatePasswordLocal(opts: CharOptions): GenResult {
  const enabled = (Object.keys(SETS) as SetKey[]).filter((k) => opts.sets[k]);
  if (enabled.length === 0) {
    return { ok: false, error: "Enable at least one character set." };
  }
  const pools = enabled.map((k) => poolFor(k, opts.excludeSimilar));
  const fullPool = pools.join("");
  if (fullPool.length === 0) {
    return {
      ok: false,
      error: "Every character was excluded: turn off look-alikes or enable another set.",
    };
  }
  if (opts.length < enabled.length && opts.requireEach) {
    return {
      ok: false,
      error: `Length must be at least ${enabled.length} to require every selected set.`,
 };
 }

 const chars: string[] = [];
 if (opts.requireEach) {
 for (const p of pools) chars.push(pick(p));
 }
 while (chars.length < opts.length) chars.push(pick(fullPool));
 shuffle(chars);

 const value = chars.join("");
 const entropyBits = Math.round(opts.length * Math.log2(fullPool.length) * 10) / 10;
 return { ok: true, value, entropyBits };
}

/* ---- Passphrase mode -------------------------------------------------- */

/**
 * Compact, curated word list (readable, unambiguous, 4–7 letters). ~256 words
 * gives 8 bits/word, four words ≈ 32 bits from the list alone, and capital /
 * digit options add more. Kept inline so the tool stays 100% client-side with
 * no fetch and no heavy dependency.
 */
const WORDS =
 "able acid aged also arch army atom aunt aura auto away axis baby back bake bald band bank barn base bath beam bean bear beat beef been bell belt bend best bike bill bird bite blue boat bold bolt bone book boot born boss both bowl bulk bull burn bush busy cafe cage cake calm camp cane cape card care cart case cash cast cave cell chef chin chip city clam claw clay clip club coal coat code coin cold comb cone cook cool cope copy cord core corn cost crab crew crop cube cure curl dark dart dash data date dawn deal dear deck deep deer dent desk dial dice diet dime dine disk dive dock does dome door dose dove down drag draw drum dual duck dune dusk dust duty each earn ease east easy edge fact fade fair fall fame farm fast fate fear feat feed feel fern file fill film find fine fire fish five flag flat flax fled flew flip flow foam fold fond food fork form fort foul four fuel full fund gain game gate gaze gear geek gift girl give glad glow goal goat gold golf gone good gown grab gray grew grid grim grin grip grow gulf hail hair half hall halt hand hare harm hawk haze head heal heap heat herb herd hero hide high hike hill hint hire hive hold hole holy home hood hoof hook hope horn host hour huge hull hunt hurl hush icon idea inch iris iron item jade jazz jeep join joke jolt jump keel keen keep kelp kept kick kind king kiss kite knee knew knot lace lake lamp land lane lark last late lava lawn lazy leaf leak lean leap left lend lens lift lily lime limp line link lion list lite load loaf loan lock loft logo lone long look loop lord lore loud love luck lump lung lush lynx maid mail main make male mall malt mane many map maze meal mean meat melt menu mesh mild mile milk mill mind mint mist moat mode mole monk mood moon moss most moth move much mule muse mute myth name navy near neat neon nest news next nice node nook noon nose note noun oak oath obey odor okay omit once only onto opal open oval oven owns pace pack pact page pail pair palm park part past path peak peal pear peel pine pink pint plan play plot plum plus poem poet pole pond pony pool pope pork port pose posy pour prep prey prom prop pull pump punk pure push quad quay quiz race rack raft rage rail rain rake ramp rank rare rate rave read real reap rein rely rest rice rich ride rift ring ripe rise risk road roam roar robe rock rode role roll roof room root rope rose ruby ruin rule rune rush rust sack safe sage sail sake salt sand save scan seal seat seed seek self sell semi send sift sign silk sing sink site size skin skip sky slab slam sled slid slim slip slot slow snap snow soak soap soda sofa soft soil sold sole solo song sort soul soup sour span spin spot spur star stay stem step stir stop stow stub stun such suit sung sunk sure surf swam swan swap sway swim tail take tale talk tall tame tank tape task team tear tech teen tell tend tent term test text than that thaw them then they thin this tide tidy tile time tiny toad toe toil told toll tomb tone took tool tops torn tour town trap tray tree trek trim trip trod true tube tuck tuna tune turf turn twig twin type unit upon urge used user vale vary vase vast veil vein vent verb very vest vibe vice view vine visa vita void volt vote wade wage wait wake walk wall wand want ward ware warm warn wart wash wasp watt wave weak wear weed week weld well went were west wide wife wild will wind wine wing wink wire wise wish with wolf wood wool word wore work worm worn wrap yard yarn yawn year yell yoga yolk zero zest zinc zone zoom".split(
 " ",
 );

type Separator = "-" | "." | "_" | " " | "";

const SEP_OPTIONS: ReadonlyArray<{ value: Separator; label: string }> = [
 { value: "-", label: "Hyphen ( - )" },
 { value: ".", label: "Dot (. )" },
 { value: "_", label: "Underscore ( _ )" },
 { value: " ", label: "Space ( )" },
 { value: "", label: "None" },
];

interface PhraseOptions {
 words: number;
 separator: Separator;
 capitalize: boolean;
 appendDigit: boolean;
}

function generatePassphrase(opts: PhraseOptions): GenResult {
 if (opts.words < 2) return { ok: false, error: "Use at least 2 words." };
 const chosen: string[] = [];
 for (let i = 0; i < opts.words; i += 1) {
 let w = WORDS[randomIndex(WORDS.length)] ?? "word";
 if (opts.capitalize) w = w.charAt(0).toUpperCase() + w.slice(1);
 chosen.push(w);
 }
 let value = chosen.join(opts.separator);
 let extraBits = 0;
 if (opts.appendDigit) {
 value += opts.separator + String(randomIndex(1000)).padStart(3, "0");
 extraBits = Math.log2(1000);
 }
 const perWord = Math.log2(WORDS.length);
 const entropyBits = Math.round((opts.words * perWord + extraBits) * 10) / 10;
 return { ok: true, value, entropyBits };
}

/* ------------------------------------------------------------------ *
 * Strength meter helpers.
 * ------------------------------------------------------------------ */

const STRENGTH_TONE: Record<
 ReturnType<typeof estimateStrength>["label"],
 { tone: "danger" | "warning" | "info" | "success"; bar: string; pct: number }
> = {
 "Very weak": { tone: "danger", bar: "bg-red-500", pct: 20 },
 Weak: { tone: "danger", bar: "bg-orange-500", pct: 40 },
 Fair: { tone: "warning", bar: "bg-amber-500", pct: 60 },
 Strong: { tone: "info", bar: "bg-lime-500", pct: 80 },
 "Very strong": { tone: "success", bar: "bg-emerald-500", pct: 100 },
};

type Mode = "password" | "passphrase";
const MAX_COUNT = 50;

interface ShareShape {
 mode: Mode;
 length: number;
 sets: Record<SetKey, boolean>;
 excludeSimilar: boolean;
 requireEach: boolean;
 words: number;
 separator: Separator;
 capitalize: boolean;
 appendDigit: boolean;
 count: number;
}

/**
 * Password Generator, crypto-secure random passwords and memorable passphrases
 * generated entirely in the browser. Custom layout composes the harness
 * primitives around local Web-Crypto generation so it can offer
 * require-each-class, exclude-look-alikes and a diceware passphrase mode with a
 * live entropy/strength meter, bulk output, per-row copy, share and shortcuts.
 */
export default function PasswordGeneratorTool({ tool }: { tool: WorkspaceToolData }) {
 const style = accentStyle(tool.accent);

 // Shared
 const [mode, setMode] = React.useState<Mode>("password");
 const [count, setCount] = React.useState(1);

 // Password mode
 const [length, setLength] = React.useState(20);
 const [sets, setSets] = React.useState<Record<SetKey, boolean>>({
 upper: true,
 lower: true,
 digits: true,
 symbols: true,
 });
 const [excludeSimilar, setExcludeSimilar] = React.useState(false);
 const [requireEach, setRequireEach] = React.useState(true);

 // Passphrase mode
 const [words, setWords] = React.useState(4);
 const [separator, setSeparator] = React.useState<Separator>("-");
 const [capitalize, setCapitalize] = React.useState(true);
 const [appendDigit, setAppendDigit] = React.useState(true);

 const [items, setItems] = React.useState<string[]>([]);
 const [error, setError] = React.useState<string | null>(null);
 const [copiedRow, setCopiedRow] = React.useState<number | null>(null);
 const [copiedAll, setCopiedAll] = React.useState(false);

 const enabledCount = (Object.keys(SETS) as SetKey[]).filter((k) => sets[k]).length;
 const requireEachPossible = length >= enabledCount && enabledCount > 0;

 const toggleSet = React.useCallback((key: SetKey) => {
 setSets((prev) => {
 const next = {...prev, [key]: !prev[key] };
 // Never allow all sets off.
 if (!Object.values(next).some(Boolean)) return prev;
 return next;
 });
 }, []);

 const genOne = React.useCallback((): GenResult => {
 if (mode === "passphrase") {
 return generatePassphrase({ words, separator, capitalize, appendDigit });
 }
 return generatePasswordLocal({
 length,
 sets,
 excludeSimilar,
 requireEach: requireEach && requireEachPossible,
 });
 }, [
 mode,
 words,
 separator,
 capitalize,
 appendDigit,
 length,
 sets,
 excludeSimilar,
 requireEach,
 requireEachPossible,
 ]);

 const regenerate = React.useCallback(() => {
 const out: string[] = [];
 const n = Math.min(Math.max(1, count), MAX_COUNT);
 for (let i = 0; i < n; i += 1) {
 const r = genOne();
 if (!r.ok) {
 setError(r.error);
 setItems([]);
 return;
 }
 out.push(r.value);
 }
 setError(null);
 setItems(out);
 }, [count, genOne]);

 // Live regenerate whenever any option changes.
 React.useEffect(() => {
 regenerate();
 // eslint-disable-next-line react-hooks/exhaustive-deps
 }, [
 mode,
 count,
 length,
 sets,
 excludeSimilar,
 requireEach,
 requireEachPossible,
 words,
 separator,
 capitalize,
 appendDigit,
 ]);

 // Strength: measured on the first live item (representative of the batch).
 const sample = items[0] ?? "";
 const strength = React.useMemo(() => estimateStrength(sample), [sample]);
 const meta = STRENGTH_TONE[strength.label];

 const allText = React.useMemo(() => items.join("\n"), [items]);

 const copyRow = React.useCallback(async (i: number, value: string) => {
 try {
 await navigator.clipboard.writeText(value);
 setCopiedRow(i);
 window.setTimeout(() => setCopiedRow((c) => (c === i ? null: c)), 1500);
 } catch {
 setError("Couldn't access the clipboard. Use the TXT export instead.");
 }
 }, []);

 const copyAll = React.useCallback(async () => {
 if (!allText) return;
 try {
 await navigator.clipboard.writeText(allText);
 setCopiedAll(true);
 window.setTimeout(() => setCopiedAll(false), 1500);
 } catch {
 setError("Couldn't access the clipboard. Use the TXT export instead.");
 }
 }, [allText]);

 const doExport = React.useCallback(() => {
 if (!allText) return;
 download(
 mode === "passphrase" ? "passphrases-gigai.txt": "passwords-gigai.txt",
 allText,
 "text/plain;charset=utf-8",
 );
 }, [allText, mode]);

 // Share
 const shareShape: ShareShape = {
 mode,
 length,
 sets,
 excludeSimilar,
 requireEach,
 words,
 separator,
 capitalize,
 appendDigit,
 count,
 };
 const { copyShareLink, justCopied: linkCopied, shareError } = useShareState({
 onInit: (v) => {
 try {
 const s = JSON.parse(v) as Partial<ShareShape>;
 if (s.mode === "password" || s.mode === "passphrase") setMode(s.mode);
 if (typeof s.length === "number") setLength(clamp(s.length, 4, 128));
 if (s.sets && typeof s.sets === "object") {
 setSets((prev) => ({...prev,...s.sets }));
 }
 if (typeof s.excludeSimilar === "boolean") setExcludeSimilar(s.excludeSimilar);
 if (typeof s.requireEach === "boolean") setRequireEach(s.requireEach);
 if (typeof s.words === "number") setWords(clamp(s.words, 2, 12));
 if (typeof s.separator === "string") setSeparator(s.separator as Separator);
 if (typeof s.capitalize === "boolean") setCapitalize(s.capitalize);
 if (typeof s.appendDigit === "boolean") setAppendDigit(s.appendDigit);
 if (typeof s.count === "number") setCount(clamp(s.count, 1, MAX_COUNT));
 } catch {
 /* ignore malformed share payloads */
 }
 },
 });

 useShortcuts({
 "mod+enter": () => regenerate(),
 "mod+c": () => void copyAll(),
 "mod+s": doExport,
 });

 const shortcuts: ShortcutHint[] = [
 { combo: "mod+enter", description: "Generate a fresh set" },
 { combo: "mod+c", description: "Copy all" },
 { combo: "mod+s", description: "Export TXT" },
 ];

 const isBulk = items.length > 1;

 return (
 <div className="flex flex-col gap-4">
 {/* Options */}
 <div className="rounded-lg border border-border bg-card/60 p-4">
 <div className="flex flex-wrap items-end gap-x-6 gap-y-4">
 <Field label="Mode" htmlFor="pw-mode">
 <SegmentedControl<Mode>
 value={mode}
 onChange={setMode}
 ariaLabel="Generator mode"
 options={[
 { value: "password", label: "Password", icon: "KeyRound" },
 { value: "passphrase", label: "Passphrase", icon: "MessageSquareText" },
 ]}
 />
 </Field>

 <Field
 label="How many"
 htmlFor="pw-count"
 hint={`Up to ${MAX_COUNT} at once.`}
          >
            <div className="flex h-8 items-center gap-3">
              <input
                id="pw-count"
                type="range"
                min={1}
                max={MAX_COUNT}
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
                aria-label="Number to generate"
                className={cn("h-1.5 w-28 cursor-pointer appearance-none rounded-full bg-muted accent-current", style.text)}
              />
              <span className="w-8 text-right font-mono text-sm tabular-nums text-foreground">
                {count}
              </span>
            </div>
          </Field>
        </div>

        <div className="my-4 h-px bg-border" />

        {mode === "password" ? (
          <div className="flex flex-col gap-4">
            <Field label={`Length - ${length} characters`} htmlFor="pw-length">
              <div className="flex items-center gap-3">
                <input
                  id="pw-length"
                  type="range"
                  min={4}
                  max={128}
                  value={length}
                  onChange={(e) => setLength(Number(e.target.value))}
                  aria-label="Password length"
                  className={cn(
                    "h-2 w-full max-w-md cursor-pointer appearance-none rounded-full bg-muted accent-current",
                    style.text,
                  )}
                />
                <span className="w-10 shrink-0 text-right font-mono text-sm tabular-nums text-foreground">
                  {length}
                </span>
              </div>
            </Field>

            <Field label="Character sets" htmlFor="pw-upper">
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                <Toggle id="pw-upper" checked={sets.upper} onChange={() => toggleSet("upper")} label="A–Z" />
                <Toggle id="pw-lower" checked={sets.lower} onChange={() => toggleSet("lower")} label="a–z" />
                <Toggle id="pw-digits" checked={sets.digits} onChange={() => toggleSet("digits")} label="0–9" />
                <Toggle id="pw-symbols" checked={sets.symbols} onChange={() => toggleSet("symbols")} label="!@#$" />
              </div>
            </Field>

            <Field label="Rules" htmlFor="pw-similar">
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                <Toggle
                  id="pw-similar"
                  checked={excludeSimilar}
                  onChange={setExcludeSimilar}
                  label="Exclude look-alikes (O/0, l/1)"
                />
                <Toggle
                  id="pw-require"
                  checked={requireEach && requireEachPossible}
                  onChange={setRequireEach}
                  label="Require each selected set"
                  disabled={!requireEachPossible}
                />
              </div>
            </Field>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <Field label={`Words - ${words}`} htmlFor="pw-words">
              <div className="flex items-center gap-3">
                <input
                  id="pw-words"
                  type="range"
                  min={2}
                  max={12}
                  value={words}
                  onChange={(e) => setWords(Number(e.target.value))}
                  aria-label="Number of words"
                  className={cn(
                    "h-2 w-full max-w-md cursor-pointer appearance-none rounded-full bg-muted accent-current",
                    style.text,
                  )}
                />
                <span className="w-8 shrink-0 text-right font-mono text-sm tabular-nums text-foreground">
                  {words}
                </span>
              </div>
            </Field>

            <div className="flex flex-wrap items-end gap-x-6 gap-y-4">
              <Field label="Separator" htmlFor="pw-sep">
                <SelectField<Separator>
                  value={separator}
                  onChange={setSeparator}
                  options={SEP_OPTIONS}
                  ariaLabel="Word separator"
                />
              </Field>
              <Field label="Style" htmlFor="pw-cap">
                <div className="flex h-8 items-center gap-4">
                  <Toggle id="pw-cap" checked={capitalize} onChange={setCapitalize} label="Capitalize" />
                  <Toggle id="pw-digit" checked={appendDigit} onChange={setAppendDigit} label="Add number" />
                </div>
              </Field>
            </div>
          </div>
        )}

        {/* Live strength meter */}
        <div className="mt-4 flex flex-col gap-1.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-muted-foreground">Strength</span>
            <div className="flex items-center gap-2">
              <StatBadge value={strength.label} tone={meta.tone} icon="Gauge" />
              <StatBadge
                value={`${strength.entropyBits} bits`}
                tone="info"
                icon="Sigma"
                title="Estimated entropy of a generated secret"
              />
            </div>
          </div>
          <div
            className="h-2 w-full overflow-hidden rounded-full bg-muted"
            role="progressbar"
            aria-valuenow={meta.pct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Strength: ${strength.label}`}
          >
            <div
              className={cn("h-full rounded-full transition-all duration-300", meta.bar)}
              style={{ width: `${meta.pct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <Toolbar>
        <ToolbarButton
          icon="RefreshCw"
          label={items.length > 0 ? "Regenerate" : "Generate"}
          kbd="mod+enter"
          variant="primary"
          onClick={regenerate}
        />
        <ToolbarDivider />
        <ToolbarButton
          icon={copiedAll ? "Check" : "Copy"}
          label={copiedAll ? "Copied!" : isBulk ? "Copy all" : "Copy"}
          kbd="mod+c"
          variant={copiedAll ? "active" : "default"}
          onClick={() => void copyAll()}
          disabled={items.length === 0}
        />
        <ToolbarButton
          icon="Download"
          label="Export TXT"
          kbd="mod+s"
          onClick={doExport}
          disabled={items.length === 0}
        />
        <ToolbarButton
          icon={linkCopied ? "Check" : "Link"}
          label={linkCopied ? "Copied!" : "Share options"}
          variant={linkCopied ? "active" : "default"}
          onClick={() => void copyShareLink(JSON.stringify(shareShape))}
        />
        <ToolbarSpacer />
        <ShortcutsHelp shortcuts={shortcuts} />
      </Toolbar>

      {/* Error surface */}
      {(error || shareError) && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          <Icon name="TriangleAlert" size={16} className="mt-0.5 shrink-0" />
          <span className="min-w-0 flex-1">{error ?? shareError}</span>
          <button
            type="button"
            onClick={() => setError(null)}
            aria-label="Dismiss error"
            className="shrink-0 rounded p-0.5 outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Icon name="X" size={14} />
          </button>
        </div>
      )}

      {/* Output */}
      <div className="rounded-lg border border-border bg-card shadow-sm">
        <div className="flex items-center justify-between gap-2 border-b border-border bg-muted/40 px-3 py-1.5">
          <span className="text-xs font-medium text-muted-foreground">
            {items.length > 0
              ? `${items.length} ${mode === "passphrase" ? "passphrase" : "password"}${items.length === 1 ? "" : "s"}`
              : "Output"}
          </span>
          <StatBadge
            value={mode === "passphrase" ? "words" : "random"}
            icon={mode === "passphrase" ? "MessageSquareText" : "KeyRound"}
            tone="info"
          />
        </div>

        <div className="p-3">
          {items.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-10 text-center">
              <Icon name="KeyRound" size={28} className={cn("opacity-60", style.text)} />
              <p className="text-sm text-muted-foreground">
                Nothing generated yet. A strong one looks like:
              </p>
              <code className="rounded bg-muted/60 px-2 py-1 font-mono text-xs text-foreground">
                {mode === "passphrase" ? "Harbor-Violet-Cactus-Mellow-207" : "K7#vq!Lm2$Rt9xPz"}
              </code>
              <button
                type="button"
                onClick={regenerate}
                className={cn(
                  "mt-1 inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
                  style.soft,
                )}
              >
                <Icon name="Sparkles" size={14} />
                Generate one
              </button>
            </div>
          ) : (
            <ul className="flex max-h-[26rem] flex-col gap-1 overflow-y-auto">
              {items.map((value, i) => (
                <li key={`${i}-${value}`}>
                  <div className="group flex items-center gap-3 rounded-md bg-muted/40 px-2.5 py-2 hover:bg-muted/70">
                    {isBulk && (
                      <span className="w-8 shrink-0 select-none text-right font-mono text-[11px] tabular-nums text-muted-foreground/70">
                        {i + 1}
                      </span>
                    )}
                    <code className="min-w-0 flex-1 break-all font-mono text-sm text-foreground">
                      {value}
                    </code>
                    <button
                      type="button"
                      onClick={() => void copyRow(i, value)}
                      aria-label={copiedRow === i ? "Copied" : `Copy ${i + 1}`}
                      className="shrink-0 rounded p-1 text-muted-foreground opacity-0 outline-none transition-opacity hover:text-foreground focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-ring group-hover:opacity-100"
                    >
                      <Icon name={copiedRow === i ? "Check" : "Copy"} size={14} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Honest note */}
      <p className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
        <Icon name="ShieldCheck" size={14} className={cn("mt-0.5 shrink-0", style.text)} />
        <span>
          Generated with the browser&apos;s Web Crypto engine and unbiased rejection sampling  -
          never uploaded, logged or stored. The strength estimate is an entropy heuristic, not a
          crack-time model, so a word that&apos;s personal to you can still be a poor choice.
        </span>
      </p>
    </div>
  );
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(Math.max(n, min), max);
}
