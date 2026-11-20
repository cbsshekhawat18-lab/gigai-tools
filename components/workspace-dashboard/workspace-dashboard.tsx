"use client";

import Link from "next/link";
import { type ReactNode, useCallback } from "react";

import type { ToolCardData } from "@/types";
import { ROUTES } from "@/config/constants";
import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { useMounted } from "@/hooks/use-mounted";
import {
  useFavorites,
  usePinned,
  useRecentTools,
  useClearAllPersonalization,
} from "@/hooks/use-personalization";
import { usePopularSlugs, useUsageSummary } from "@/hooks/use-usage";
import { exportUsage, clearUsage } from "@/lib/usage/store";
import { clearVitals } from "@/lib/vitals/store";
import { clearSearchStats } from "@/lib/usage/search-stats";
import { Button } from "@/components/ui/button";
import { ToolGrid } from "@/components/shared/tool-grid";
import { RecommendedForYou } from "@/components/personalization/recommended-for-you";
import { DeviceVitals } from "@/components/workspace-dashboard/device-vitals";
import { MissedSearches } from "@/components/workspace-dashboard/missed-searches";

export interface WorkspaceDashboardProps {
  /** Registry-free lookup of every live tool, built server-side. */
  lookup: Record<string, ToolCardData>;
}

/**
 * My Workspace, the visitor's personal, local-first productivity dashboard.
 * Composes the personalization store (favorites / pinned / recently-used) and
 * the usage engine (stats / most-used) into one page. Everything is read from
 * localStorage in THIS browser. No account, no server, nothing uploaded.
 *
 * Nothing is personalised on the server, so the whole dashboard is gated behind
 * `useMounted`: it renders a light skeleton on the server + first paint, then
 * the real data once mounted. No hydration mismatch, and the page is noindex.
 */
export function WorkspaceDashboard({ lookup }: WorkspaceDashboardProps) {
  const mounted = useMounted();
  const summary = useUsageSummary();
  const favorites = useFavorites();
  const pinned = usePinned();
  const recent = useRecentTools();
  const topSlugs = usePopularSlugs("all", 8);
  const clearAllPersonalization = useClearAllPersonalization();

  const resolve = useCallback(
    (slugs: string[], limit?: number): ToolCardData[] =>
      (limit ? slugs.slice(0, limit) : slugs)
        .map((s) => lookup[s])
        .filter((t): t is ToolCardData => Boolean(t)),
    [lookup],
  );

  const exportData = useCallback(() => {
    const payload = {
      exportedAt: new Date().toISOString(),
      favorites: favorites.slugs,
      pinned: pinned.slugs,
      recent: recent.slugs,
      usage: exportUsage(),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "gigai-workspace-backup.json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }, [favorites.slugs, pinned.slugs, recent.slugs]);

  const clearEverything = useCallback(() => {
    if (
      typeof window !== "undefined" &&
      !window.confirm(
        "Clear all your local workspace data (favorites, pins, history and usage)? This cannot be undone.",
      )
    )
      return;
    clearAllPersonalization();
    clearUsage();
    clearSearchStats();
    clearVitals();
  }, [clearAllPersonalization]);

  if (!mounted) return <DashboardSkeleton />;

  const stats = [
    { icon: "Wrench", label: "Tools used", value: summary.toolsUsed },
    { icon: "Download", label: "Downloads", value: summary.downloads },
    { icon: "Star", label: "Favorites", value: favorites.slugs.length },
    { icon: "Pin", label: "Pinned", value: pinned.slugs.length },
  ] as const;

  const hasAnything =
    pinned.slugs.length > 0 ||
    favorites.slugs.length > 0 ||
    recent.slugs.length > 0 ||
    summary.toolsUsed > 0;

  return (
    <div className="flex flex-col gap-12">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="flex flex-col gap-1 rounded-2xl border border-border bg-card p-4 sm:p-5"
          >
            <span className="inline-flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Icon name={s.icon} size={18} />
            </span>
            <span className="mt-2 text-2xl font-bold tabular-nums tracking-tight">
              {s.value}
            </span>
            <span className="text-xs font-medium text-muted-foreground">{s.label}</span>
          </div>
        ))}
      </div>

      {/* First-run guidance */}
      {!hasAnything ? (
        <EmptyDashboard />
      ) : (
        <>
          <Section
            icon="Pin"
            title="Pinned tools"
            description="Your quick-launch shelf: pin a tool from its page."
            tools={resolve(pinned.slugs)}
            emptyIcon="Pin"
            emptyText="Nothing pinned yet. Open a tool and hit “Pin” to keep it here."
          />
          <Section
            icon="Star"
            title="Favorites"
            description="Everything you’ve favorited, newest first."
            tools={resolve(favorites.slugs, 12)}
            emptyIcon="Star"
            emptyText="No favorites yet. Tap the star on any tool to save it."
          />
          <Section
            icon="History"
            title="Recently used"
            description="Pick up where you left off."
            tools={resolve(recent.slugs, 8)}
            emptyIcon="History"
            emptyText="Tools you open will appear here."
            action={
              recent.slugs.length > 0 ? (
                <button
                  type="button"
                  onClick={recent.clear}
                  className="rounded-md px-1.5 py-0.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  Clear
                </button>
              ) : undefined
            }
          />
          {topSlugs.length > 0 ? (
            <Section
              icon="TrendingUp"
              title="Your most-used tools"
              description="Ranked by how much you use them on this device."
              tools={resolve(topSlugs)}
            />
          ) : null}
          <RecommendedForYou lookup={lookup} />
          <DeviceVitals />
        </>
      )}

      {/* Outside the first-run gate: renders as soon as a zero-result search
          exists, even before any tool usage (it self-hides when empty). */}
      <MissedSearches />

      {/* Privacy footer */}
      <div className="flex flex-col gap-4 rounded-2xl border border-border bg-muted/30 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex items-start gap-3">
          <Icon name="ShieldCheck" size={20} className="mt-0.5 shrink-0 text-primary" />
          <div>
            <p className="text-sm font-semibold text-foreground">
              Everything here stays on your device
            </p>
            <p className="text-sm text-muted-foreground">
              No account, no sync, no upload. Back it up or wipe it any time.
            </p>
          </div>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button variant="outline" size="sm" onClick={exportData}>
            <Icon name="Download" size={15} />
            Export
          </Button>
          <Button variant="ghost" size="sm" onClick={clearEverything}>
            <Icon name="Trash2" size={15} />
            Clear all
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ── Section ──────────────────────────────────────────────────────────────── */

function Section({
  icon,
  title,
  description,
  tools,
  emptyIcon,
  emptyText,
  action,
}: {
  icon: string;
  title: string;
  description: string;
  tools: ToolCardData[];
  emptyIcon?: string;
  emptyText?: string;
  action?: ReactNode;
}) {
  // Hide entirely if empty and no empty-state copy was provided.
  if (tools.length === 0 && !emptyText) return null;
  return (
    <section className="flex flex-col gap-5">
      <div className="flex items-end justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight">
            <Icon name={icon} size={18} className="text-primary" />
            {title}
          </h2>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        {action}
      </div>
      {tools.length > 0 ? (
        <ToolGrid tools={tools} columns={4} />
      ) : (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border px-6 py-10 text-center">
          {emptyIcon ? (
            <Icon name={emptyIcon} size={22} className="text-muted-foreground" />
          ) : null}
          <p className="max-w-sm text-sm text-muted-foreground">{emptyText}</p>
        </div>
      )}
    </section>
  );
}

/* ── Empty dashboard (first run) ─────────────────────────────────────────── */

function EmptyDashboard() {
  return (
    <div className="flex flex-col items-center gap-5 rounded-2xl border border-dashed border-border px-6 py-16 text-center">
      <span className="inline-flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Icon name="Sparkles" size={26} />
      </span>
      <div className="flex flex-col gap-1.5">
        <h2 className="text-xl font-semibold tracking-tight">Your workspace is ready</h2>
        <p className="mx-auto max-w-md text-sm text-muted-foreground">
          Open a tool, star your go-tos and pin your daily drivers. They’ll all
          gather here automatically, privately, on this device.
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        <Button asChild>
          <Link href={ROUTES.home}>
            <Icon name="LayoutGrid" size={16} />
            Browse tools
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href={ROUTES.search}>
            <Icon name="Search" size={16} />
            Search
          </Link>
        </Button>
      </div>
    </div>
  );
}

/* ── Skeleton (server + pre-mount) ───────────────────────────────────────── */

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-12" aria-hidden="true">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-28 rounded-2xl border border-border bg-card",
              "animate-pulse motion-reduce:animate-none",
            )}
          />
        ))}
      </div>
      <div className="h-64 rounded-2xl border border-dashed border-border" />
    </div>
  );
}
