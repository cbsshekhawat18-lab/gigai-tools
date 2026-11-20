"use client";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { useMounted } from "@/hooks/use-mounted";
import { useToolPersonalization } from "@/hooks/use-personalization";

/* ── Shared toggle button primitive ──────────────────────────────────────── */

interface ToggleButtonProps {
  slug: string;
  className?: string;
  /** Icon-only round button vs. icon + label pill. */
  variant?: "icon" | "pill";
  size?: number;
}

interface ToggleVisual extends ToggleButtonProps {
  active: boolean;
  onToggle: () => boolean;
  /** lucide icon name when active / inactive (may be the same, filled via CSS). */
  icon: string;
  /** Accessible labels. */
  labelOn: string; // action when currently OFF (e.g. "Add to favorites")
  labelOff: string; // action when currently ON (e.g. "Remove from favorites")
  /** Visible pill text. */
  textOn: string;
  textOff: string;
  /** Active accent classes (icon color + tint). */
  activeClass: string;
}

function ToggleButton({
  slug,
  className,
  variant = "icon",
  size = 18,
  active,
  onToggle,
  icon,
  labelOn,
  labelOff,
  textOn,
  textOff,
  activeClass,
}: ToggleVisual) {
  const mounted = useMounted();

  // Until mounted, render the neutral (inactive) state so SSR/CSR markup match.
  const on = mounted && active;
  const label = on ? labelOff : labelOn;

  const handleClick = () => {
    onToggle();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={on}
      aria-label={label}
      title={label}
      data-slug={slug}
      className={cn(
        "group inline-flex items-center justify-center gap-1.5 rounded-full outline-none transition-colors",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        variant === "icon"
          ? "size-11 border border-border bg-card hover:bg-accent"
          : "h-11 border border-border bg-card px-3.5 text-sm font-medium hover:bg-accent",
        on && activeClass,
        className,
      )}
    >
      {/* Keyed remount pops the icon on each toggle via tw-animate-css (no JS). */}
      <span
        key={on ? "on" : "off"}
        className={cn(
          "inline-flex",
          mounted && "animate-in fade-in zoom-in-50 duration-200 motion-reduce:animate-none",
        )}
      >
        <Icon
          name={icon}
          size={size}
          className={cn(
            "transition-colors",
            on ? "fill-current" : "fill-none",
          )}
        />
      </span>
      {variant === "pill" ? <span>{on ? textOff : textOn}</span> : null}
    </button>
  );
}

/* ── Favorite ────────────────────────────────────────────────────────────── */

/**
 * Toggle a tool as a favorite. State is *local to this browser* (localStorage).
 * Animated heart, keyboard-accessible, `aria-pressed` reflects state. Renders
 * the neutral state during SSR/first paint to avoid hydration mismatch.
 */
export function FavoriteButton({ slug, className, variant = "icon", size = 18 }: ToggleButtonProps) {
  const { isFavorite, toggleFavorite } = useToolPersonalization(slug);
  return (
    <ToggleButton
      slug={slug}
      className={className}
      variant={variant}
      size={size}
      active={isFavorite}
      onToggle={toggleFavorite}
      icon="Heart"
      labelOn="Add to favorites"
      labelOff="Remove from favorites"
      textOn="Favorite"
      textOff="Favorited"
      activeClass="border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400"
    />
  );
}

/* ── Pin ─────────────────────────────────────────────────────────────────── */

/**
 * Pin a tool for quick access. State is *local to this browser* (localStorage).
 * Same interaction contract as FavoriteButton.
 */
export function PinButton({ slug, className, variant = "icon", size = 18 }: ToggleButtonProps) {
  const { isPinned, togglePinned } = useToolPersonalization(slug);
  return (
    <ToggleButton
      slug={slug}
      className={className}
      variant={variant}
      size={size}
      active={isPinned}
      onToggle={togglePinned}
      icon="Pin"
      labelOn="Pin this tool"
      labelOff="Unpin this tool"
      textOn="Pin"
      textOff="Pinned"
      activeClass="border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400"
    />
  );
}
