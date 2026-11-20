"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { accentStyle } from "@/lib/design";
import type { ImageToolProps } from "@/components/tool/types";
import {
  parseSubtitles,
  shiftCues,
  cleanCues,
  serialise,
  type Format,
} from "@/lib/subtitles";
import {
  CodePane,
  CopyButton,
  DownloadButton,
  SegmentedControl,
  StatBadge,
  Toggle,
  Toolbar,
  ToolbarButton,
  ToolbarGroup,
  ToolbarSpacer,
} from "@/components/tool/dev";

const SAMPLE = `1
00:00:01,000 --> 00:00:04,000
Welcome to the show.

2
00:00:05,500 --> 00:00:08,250
Today we're talking subtitles, and how to fix the sync.`;

/**
 * Subtitle Converter & Retimer; paste or drop an SRT/VTT file, convert between
 * the two formats, and shift every caption by an offset to fix out-of-sync
 * audio. Pure string processing in the browser; nothing is uploaded.
 */
export default function SubtitleConverterTool({ tool }: ImageToolProps) {
  const accent = accentStyle(tool.accent);
  const [input, setInput] = React.useState("");
  const [target, setTarget] = React.useState<Format>("vtt");
  const [offsetSec, setOffsetSec] = React.useState(0);
  const [cleanup, setCleanup] = React.useState(true);
  const fileRef = React.useRef<HTMLInputElement>(null);

  const parsed = React.useMemo(() => parseSubtitles(input), [input]);
  const output = React.useMemo(() => {
    let cues = shiftCues(parsed.cues, Math.round(offsetSec * 1000));
    if (cleanup) cues = cleanCues(cues);
    return serialise(cues, target);
  }, [parsed.cues, offsetSec, cleanup, target]);

  const hasCues = parsed.cues.length > 0;

  const onFile = (file: File | undefined) => {
    if (!file) return;
    file.text().then(setInput).catch(() => undefined);
  };

  return (
    <section aria-label="Subtitle converter and retimer" className="flex flex-col gap-4">
      <input
        ref={fileRef}
        type="file"
        accept=".srt,.vtt,text/vtt,text/plain"
        className="hidden"
        onChange={(e) => onFile(e.target.files?.[0])}
      />

      <Toolbar>
        <ToolbarGroup>
          <ToolbarButton icon="Upload" label="Upload .srt / .vtt" onClick={() => fileRef.current?.click()} />
          <ToolbarButton icon="FlaskConical" label="Sample" onClick={() => setInput(SAMPLE)} />
          <ToolbarButton icon="Trash2" label="Clear" onClick={() => setInput("")} disabled={!input} />
        </ToolbarGroup>
        <ToolbarSpacer />
        {input.trim() ? (
          <div className="flex flex-wrap items-center gap-2">
            <StatBadge icon="FileType2" label="Detected" value={parsed.format.toUpperCase()} />
            <StatBadge icon="Captions" label="Captions" value={String(parsed.cues.length)} tone={hasCues ? "info" : undefined} />
          </div>
        ) : null}
      </Toolbar>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 rounded-xl border border-border bg-muted/30 p-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">Convert to</span>
          <SegmentedControl<Format>
            value={target}
            onChange={setTarget}
            ariaLabel="Target format"
            options={[
              { value: "vtt", label: "WebVTT" },
              { value: "srt", label: "SRT" },
            ]}
          />
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="offset" className="flex items-center gap-1.5 text-sm font-medium text-foreground">
            <Icon name="Clock" size={15} className={accent.text} />
            Shift timing
          </label>
          <div className="relative">
            <input
              id="offset"
              type="number"
              step={0.1}
              value={offsetSec || ""}
              onChange={(e) => setOffsetSec(Number(e.target.value) || 0)}
              placeholder="0"
              className={cn(
                "h-9 w-28 rounded-lg border border-border bg-background pl-3 pr-8 text-sm tabular-nums outline-none",
                "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                accent.ring,
              )}
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">s</span>
          </div>
          <span className="text-xs text-muted-foreground">+ later, − earlier</span>
        </div>
        <Toggle checked={cleanup} onChange={setCleanup} label="Sort & renumber" />
      </div>

      {/* Input + output */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label htmlFor="sub-in" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Paste subtitles (SRT or VTT)
          </label>
          <textarea
            id="sub-in"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            spellCheck={false}
            placeholder="Paste your .srt or .vtt content, or upload a file… format is detected automatically."
            className={cn(
              "min-h-[280px] w-full resize-y rounded-xl border border-border bg-background p-4 font-mono text-xs leading-relaxed outline-none",
              "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              accent.ring,
            )}
          />
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {target.toUpperCase()} output
            </span>
            <ToolbarSpacer />
            <CopyButton getValue={() => output} disabled={!hasCues} label="Copy" />
            <DownloadButton
              filename={`subtitles.${target}`}
              getValue={() => output}
              mime={target === "vtt" ? "text/vtt;charset=utf-8" : "application/x-subrip;charset=utf-8"}
              disabled={!hasCues}
              label="Download"
            />
          </div>
          <CodePane value={hasCues ? output : ""} readOnly wrap ariaLabel="Converted subtitles" minHeight={280} maxHeight={480} />
        </div>
      </div>

      {input.trim() && !hasCues ? (
        <p className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-sm text-amber-600">
          No captions found. Make sure the text is valid SRT or WebVTT with timing lines like{" "}
          <code className="font-mono">00:00:01,000 --&gt; 00:00:04,000</code>.
        </p>
      ) : null}

      <p className="text-xs text-muted-foreground">
        <Icon name="Lock" size={12} className="mr-1 inline align-[-1px]" />
        Everything runs in your browser: your subtitle file is never uploaded. WebVTT uses a &ldquo;.&rdquo; before
        milliseconds and an SRT uses &ldquo;,&rdquo;; this handles the conversion, retiming and renumbering for you.
      </p>
    </section>
  );
}
