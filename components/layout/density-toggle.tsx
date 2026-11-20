"use client";

import * as React from "react";

import { useMounted } from "@/hooks/use-mounted";
import { Icon } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { getDensity, setDensity, subscribeDensity, type Density } from "@/lib/density";
import { Button } from "@/components/ui/button";

interface DensityToggleProps {
  className?: string;
}

/**
 * Comfortable/compact density toggle (see lib/density). Mirrors ThemeToggle:
 * renders a stable placeholder until mounted so server and client markup
 * match. The real density is only known in the browser.
 */
export function DensityToggle({ className }: DensityToggleProps) {
  const mounted = useMounted();
  const density = React.useSyncExternalStore<Density>(
    subscribeDensity,
    getDensity,
    () => "comfortable",
  );

  const isCompact = density === "compact";

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        aria-hidden="true"
        tabIndex={-1}
        className={cn("text-muted-foreground", className)}
      >
        <Icon name="Rows3" size={18} />
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setDensity(isCompact ? "comfortable" : "compact")}
      aria-pressed={isCompact}
      aria-label={isCompact ? "Switch to comfortable spacing" : "Switch to compact mode"}
      title={isCompact ? "Switch to comfortable spacing" : "Switch to compact mode"}
      className={cn("text-muted-foreground hover:text-foreground", className)}
    >
      <Icon
        name={isCompact ? "Rows4" : "Rows3"}
        size={18}
        className="transition-transform duration-300"
      />
    </Button>
  );
}
