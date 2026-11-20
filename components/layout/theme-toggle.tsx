"use client";

import { useTheme } from "next-themes";

import { useMounted } from "@/hooks/use-mounted";
import { Icon } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ThemeToggleProps {
  className?: string;
}

/**
 * Light/dark toggle. Renders a stable placeholder until mounted so the
 * server and client markup match (next-themes can only know the resolved
 * theme in the browser), avoiding a hydration mismatch.
 */
export function ThemeToggle({ className }: ThemeToggleProps) {
  const mounted = useMounted();
  const { resolvedTheme, setTheme } = useTheme();

  const isDark = resolvedTheme === "dark";

  function toggle() {
    setTheme(isDark ? "light" : "dark");
  }

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        aria-hidden="true"
        tabIndex={-1}
        className={cn("text-muted-foreground", className)}
      >
        <Icon name="Sun" size={18} />
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggle}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      title={isDark ? "Switch to light theme" : "Switch to dark theme"}
      className={cn("text-muted-foreground hover:text-foreground", className)}
    >
      <Icon
        name={isDark ? "Moon" : "Sun"}
        size={18}
        className="transition-transform duration-300"
      />
    </Button>
  );
}
