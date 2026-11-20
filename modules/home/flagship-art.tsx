/**
 * Flagship-card diagrams: a one-glance "what this does" figure per product.
 *
 * Inline SVG on purpose, not screenshots: screenshots turn to unreadable murk
 * at 260×64 in a dark card and go stale on every redesign, while a drawn
 * source → result diagram stays crisp at any size and inherits the theme for
 * free via `currentColor`. The source side renders muted; the RESULT, the
 * payoff the card is selling, carries the card's accent color.
 *
 * Server-component safe: pure markup, no hooks. Decorative, so aria-hidden.
 */

export type FlagshipArtKind = "fit" | "verify" | "video-work" | "transcribe" | "iconlab";

/** Arrow between the source and result halves of a diagram. */
function Arrow({ x }: { x: number }) {
  return (
    <g>
      <path d={`M${x} 32h26`} />
      <path d={`M${x + 19} 25l8 7-8 7`} />
    </g>
  );
}

const ART: Record<FlagshipArtKind, (accentClass: string) => React.ReactNode> = {
  /* Big file → small file inside a size target. */
  fit: (accent) => (
    <>
      <g>
        <rect x="10" y="8" width="52" height="48" rx="7" />
        <path d="M20 22h32M20 32h32M20 42h20" />
      </g>
      <Arrow x={78} />
      <g className={accent}>
        <circle cx="192" cy="32" r="26" strokeDasharray="4 5" />
        <rect x="177" y="19" width="30" height="26" rx="5" />
        <path d="M184 28h16M184 36h10" />
      </g>
    </>
  ),

  /* Photo under a magnifier → evidence rows. */
  verify: (accent) => (
    <>
      <g>
        <rect x="10" y="10" width="54" height="44" rx="7" />
        <circle cx="24" cy="23" r="4" />
        <path d="M14 48l14-14 9 9 11-12 12 13" />
        <circle cx="60" cy="46" r="11" />
        <path d="M68 54l8 7" />
      </g>
      <Arrow x={92} />
      <g>
        <circle cx="152" cy="16" r="6" className={accent} />
        <path d="M149.5 16l2 2 3.5-4" className={accent} />
        <path d="M166 16h76" />
        <circle cx="152" cy="34" r="6" className={accent} />
        <path d="M152 31v4M152 37.5v.5" className={accent} />
        <path d="M166 34h60" />
        <circle cx="152" cy="52" r="6" />
        <path d="M166 52h68" />
      </g>
    </>
  ),

  /* Recording → ticked task list. */
  "video-work": (accent) => (
    <>
      <g>
        <rect x="10" y="12" width="56" height="40" rx="7" />
        <path d="M32 24l14 8-14 8z" />
      </g>
      <Arrow x={82} />
      <g>
        <rect x="146" y="8" width="104" height="48" rx="7" />
        <g className={accent}>
          <rect x="154" y="15" width="9" height="9" rx="2.5" />
          <path d="M156 19.5l2 2 4-4.5" />
        </g>
        <path d="M170 19.5h68" />
        <g className={accent}>
          <rect x="154" y="28" width="9" height="9" rx="2.5" />
          <path d="M156 32.5l2 2 4-4.5" />
        </g>
        <path d="M170 32.5h56" />
        <rect x="154" y="41" width="9" height="9" rx="2.5" />
        <path d="M170 45.5h62" />
      </g>
    </>
  ),

  /* Waveform → transcript lines. */
  transcribe: (accent) => (
    <>
      <g>
        <path d="M14 32v0.01M24 24v16M34 14v36M44 20v24M54 27v10M64 17v30M74 24v16M84 30v4" />
      </g>
      <Arrow x={98} />
      <g>
        <circle cx="152" cy="16" r="4" className={accent} />
        <path d="M162 16h84" />
        <circle cx="152" cy="33" r="4" className={accent} />
        <path d="M162 33h66" />
        <circle cx="152" cy="50" r="4" className={accent} />
        <path d="M162 50h76" />
      </g>
    </>
  ),

  /* One designed tile → a matching family grid. */
  iconlab: (accent) => (
    <>
      <g>
        <rect x="12" y="12" width="40" height="40" rx="9" />
        <path d="M32 22l3.2 6.4 7 1-5 5 1.2 7-6.4-3.4-6.4 3.4 1.2-7-5-5 7-1z" />
      </g>
      <Arrow x={68} />
      <g className={accent}>
        <rect x="136" y="10" width="20" height="20" rx="5" />
        <circle cx="146" cy="20" r="4" />
        <rect x="162" y="10" width="20" height="20" rx="5" />
        <path d="M167 20h10M172 15v10" />
        <rect x="188" y="10" width="20" height="20" rx="5" />
        <path d="M193 24l4-8 4 8" />
        <rect x="136" y="34" width="20" height="20" rx="5" />
        <path d="M141 44l3 3 6-6" />
        <rect x="162" y="34" width="20" height="20" rx="5" />
        <path d="M167 39l10 10M177 39l-10 10" />
        <rect x="188" y="34" width="20" height="20" rx="5" />
        <path d="M193 39h10v10h-10z" />
      </g>
    </>
  ),
};

export function FlagshipArt({
  kind,
  accentClass,
  className,
}: {
  kind: FlagshipArtKind;
  accentClass: string;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 260 64"
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {ART[kind](accentClass)}
    </svg>
  );
}
