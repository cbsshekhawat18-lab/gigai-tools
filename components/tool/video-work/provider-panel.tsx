"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CopyButton } from "@/components/tool/dev";
import { RECOMMENDED_MODELS, setupSteps } from "@/lib/video-work/ollama";
import {
  setOllamaHost,
  setOllamaModel,
  setProviderChoice,
  type ProviderCapability,
  type ProviderChoice,
} from "@/lib/video-work/provider";

interface ProviderPanelProps {
  capability: ProviderCapability | null;
  busy: boolean;
  onChanged: () => void;
  /** Compact form for the export/settings tab vs the full setup guide. */
  variant?: "full" | "inline";
}

/**
 * Where the analysis runs, and what that means for the client's video.
 *
 * This is a privacy control, so it is written as one: each option states the
 * actual data movement rather than a brand name, and the local option is
 * presented as the better default it is. The setup steps are shown inline with
 * copyable commands, because "install Ollama" is only actionable if the three
 * commands that follow it are right there.
 */
export function ProviderPanel({
  capability,
  busy,
  onChanged,
  variant = "full",
}: ProviderPanelProps) {
  const [host, setHost] = React.useState("");
  const [checking, setChecking] = React.useState(false);

  React.useEffect(() => {
    if (typeof window !== "undefined") setHost(localStorage.getItem("gigai.video-work.ollama-host") ?? "");
  }, []);

  if (!capability) {
    return (
      <div className="rounded-xl border p-4 text-sm text-muted-foreground">
        <Icon name="LoaderCircle" className="mr-2 inline size-4 animate-spin" />
        Checking what&rsquo;s available…
      </div>
    );
  }

  const { ollama, localModel, serverConfigured, serverModel, serverFreeTier, resolved, choice } =
    capability;
  const localReady = ollama.reachable && localModel !== "";

  const pick = (next: ProviderChoice) => {
    setProviderChoice(next);
    onChanged();
  };

  const recheck = async () => {
    setChecking(true);
    setOllamaHost(host);
    onChanged();
    // The parent re-probes; give it a beat so the spinner is honest.
    setTimeout(() => setChecking(false), 600);
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold">Where analysis runs</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          {serverConfigured
            ? "Your video never leaves your device either way. What differs is whether the transcript and screenshots do."
            : "This site runs analysis on your own machine, free, unmetered, and nothing about your recordings leaves it."}
        </p>
      </div>

      <div className={cn("grid gap-2", serverConfigured && "sm:grid-cols-2")}>
        <ProviderOption
          active={choice === "local" || (choice === "auto" && resolved === "local")}
          selected={choice === "local"}
          disabled={busy}
          onClick={() => pick("local")}
          icon="HardDrive"
          title="On my machine"
          badge={localReady ? "Ready" : "Needs setup"}
          badgeTone={localReady ? "good" : "warn"}
          points={[
            "Nothing leaves your device. Not even the transcript",
            "Free, unmetered, works offline",
            "Rougher output than a frontier model",
          ]}
          footer={localReady ? localModel : "Ollama not detected"}
        />

        {/* A hosted tier costs the site owner per analysis, so it only appears
            when this deployment actually has it. Showing a permanently-greyed
            "Not configured" card would read as a half-finished product rather
            than a deliberate local-first design. */}
        {serverConfigured ? (
          <ProviderOption
            active={choice === "server" || (choice === "auto" && resolved === "server")}
            selected={choice === "server"}
            disabled={busy}
            onClick={() => pick("server")}
            icon="Cloud"
            title={serverFreeTier ? "Free hosted tier" : "Hosted model"}
            badge={serverFreeTier ? "Shared limit" : "Available"}
            badgeTone={serverFreeTier ? "warn" : "good"}
            points={
              serverFreeTier
                ? [
                    "Nothing to install. Works straight away",
                    "Transcript and a few screenshots are sent, then discarded",
                    "Rate limits are shared by everyone on this site",
                  ]
                : [
                    "Transcript and screenshots are sent, then discarded",
                    "The video itself is still never uploaded",
                    "Sharpest requirements and acceptance criteria",
                  ]
            }
            footer={serverModel}
          />
        ) : null}
      </div>

      {serverFreeTier ? (
        <p className="text-xs text-muted-foreground">
          <Icon name="Info" className="mr-1 inline size-3.5 align-text-bottom" />
          The free hosted tier is a shared allowance across everyone using this site, so it can hit
          its limit at busy times. Running a model on your own machine has no limit, and no
          queue.
        </p>
      ) : null}

      {serverConfigured ? (
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <Button
            size="sm"
            variant={choice === "auto" ? "default" : "outline"}
            onClick={() => pick("auto")}
          >
            Choose automatically
          </Button>
          <span className="text-muted-foreground">
            {choice === "auto"
              ? "Prefers your machine when a local model is available."
              : "Pinned to your choice above."}
          </span>
        </div>
      ) : null}

      {/* ── Local model picker ─────────────────────────────────────────── */}
      {localReady && ollama.visionModels.length > 1 ? (
        <div className="rounded-lg border p-3">
          <p className="mb-2 text-xs font-medium">Local vision model</p>
          <div className="flex flex-wrap gap-1.5">
            {ollama.visionModels.map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => {
                  setOllamaModel(name);
                  onChanged();
                }}
                className={cn(
                  "rounded-full border px-2.5 py-1 font-mono text-xs transition-colors",
                  name === localModel
                    ? "border-primary bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted",
                )}
              >
                {name}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {/* ── Setup ───────────────────────────────────────────────────────── */}
      {!localReady && variant === "full" ? <OllamaSetup capability={capability} /> : null}

      {/* ── Host + recheck ──────────────────────────────────────────────── */}
      {variant === "full" ? (
        <div className="space-y-2">
          <p className="text-xs font-medium">Ollama address</p>
          <div className="flex gap-2">
            <Input
              value={host}
              onChange={(e) => setHost(e.target.value)}
              placeholder="http://localhost:11434"
              className="font-mono text-xs"
              aria-label="Ollama host"
            />
            <Button size="sm" variant="outline" onClick={() => void recheck()} disabled={checking}>
              {checking ? <Icon name="LoaderCircle" className="size-3.5 animate-spin" /> : "Re-check"}
            </Button>
          </div>
          {ollama.reachable && ollama.visionModels.length === 0 && ollama.allModels.length > 0 ? (
            <p className="text-xs text-amber-600 dark:text-amber-400">
              Ollama is running, but none of your {ollama.allModels.length} installed models can read
              images. Pull a vision model to analyse screenshots.
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

/* ── Setup guide ──────────────────────────────────────────────────────────── */

function OllamaSetup({ capability }: { capability: ProviderCapability }) {
  const origin = typeof window !== "undefined" ? window.location.origin : "https://gigai.tools";
  const steps = setupSteps(origin);

  return (
    <div className="space-y-3 rounded-lg border bg-muted/30 p-3">
      <div className="flex items-start gap-2">
        <Icon name="Info" className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
        <div>
          <p className="text-sm font-medium">Run the analysis on your own machine</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Three one-time steps. After this, client recordings are analysed entirely offline  -
            nothing about them ever reaches a server, ours or anyone else&rsquo;s.
          </p>
        </div>
      </div>

      <ol className="space-y-2">
        {steps.map((step, index) => (
          <li key={step.label} className="flex gap-2.5">
            <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-muted text-[11px] font-semibold">
              {index + 1}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium">{step.label}</p>
              <div className="mt-1 flex items-center gap-1.5">
                <code className="min-w-0 flex-1 truncate rounded bg-background px-2 py-1 font-mono text-[11px]">
                  {step.command}
                </code>
                <CopyButton value={step.command} label="Copy" />
              </div>
            </div>
          </li>
        ))}
      </ol>

      <details className="text-xs">
        <summary className="flex min-h-11 items-center cursor-pointer text-muted-foreground hover:text-foreground">
          Which model should I pull?
        </summary>
        <ul className="mt-2 space-y-1.5">
          {RECOMMENDED_MODELS.map((model) => (
            <li key={model.name}>
              <code className="font-mono text-[11px]">{model.name}</code>{" "}
              <span className="text-muted-foreground">
                (~{model.sizeGb}GB) - {model.note}
              </span>
            </li>
          ))}
        </ul>
      </details>

      {capability.ollama.hint ? (
        <p className="text-xs text-muted-foreground">
          <strong>Status:</strong> {capability.ollama.hint}
        </p>
      ) : null}
    </div>
  );
}

/* ── Option card ──────────────────────────────────────────────────────────── */

function ProviderOption({
  active,
  selected,
  disabled,
  onClick,
  icon,
  title,
  badge,
  badgeTone,
  points,
  footer,
}: {
  active: boolean;
  selected: boolean;
  disabled: boolean;
  onClick: () => void;
  icon: string;
  title: string;
  badge: string;
  badgeTone: "good" | "warn";
  points: string[];
  footer: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "rounded-xl border p-3 text-left transition-colors disabled:opacity-60",
        active ? "border-primary bg-primary/5" : "hover:bg-muted/50",
      )}
    >
      <div className="flex items-center gap-2">
        <Icon name={icon} className="size-4" />
        <span className="text-sm font-medium">{title}</span>
        <span
          className={cn(
            "ml-auto rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
            badgeTone === "good"
              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              : "bg-amber-500/10 text-amber-700 dark:text-amber-400",
          )}
        >
          {badge}
        </span>
      </div>

      <ul className="mt-2 space-y-1">
        {points.map((point) => (
          <li key={point} className="flex gap-1.5 text-xs text-muted-foreground">
            <Icon name="Dot" className="mt-0.5 size-3 shrink-0" />
            <span>{point}</span>
          </li>
        ))}
      </ul>

      <p className="mt-2 truncate font-mono text-[11px] text-muted-foreground">{footer}</p>
      {selected ? (
        <p className="mt-1 text-[11px] font-medium text-primary">Selected</p>
      ) : null}
    </button>
  );
}
