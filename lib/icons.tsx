import type { SVGProps } from "react";

import { cn } from "@/lib/utils";
import { ICON_MAP, type LucideIcon } from "./icons.generated";

/**
 * Resolve a lucide-react icon by its PascalCase name (e.g. "FileText").
 * Names come from data (config/tools.ts, categories.ts, navigation.ts), so this
 * is the single, safe place icons are looked up. Feature components must render
 * icons through <Icon name="..." /> rather than importing lucide directly.
 *
 * PERFORMANCE: we resolve against `ICON_MAP`: a build-generated map of ONLY the
 * ~436 icons this app actually references. NOT the full lucide `icons` barrel
 * (~1,544 icons / ~106 kB gz). Importing the barrel defeats tree-shaking and put
 * the whole set on 23 routes. Regenerate the map with `node scripts/gen-icons.mjs`
 * whenever a new icon name is introduced in config/components.
 */
const REGISTRY = ICON_MAP;

/** Shown when a name is missing/misspelled so the UI never breaks. */
const FALLBACK_ICON: LucideIcon = ICON_MAP["Wrench"]!;

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, "ref"> {
  /** PascalCase lucide icon name; falls back to a generic icon if unknown. */
  name: string;
  className?: string;
  size?: number;
  strokeWidth?: number;
}

export function Icon({ name, className, size = 20, strokeWidth = 2, ...rest }: IconProps) {
  const Resolved = REGISTRY[name] ?? FALLBACK_ICON;

  return (
    <Resolved
      aria-hidden="true"
      focusable="false"
      className={cn("shrink-0", className)}
      size={size}
      strokeWidth={strokeWidth}
      {...rest}
    />
  );
}

/** Programmatic check, handy for validating config in tests/build scripts. */
export function hasIcon(name: string): boolean {
  return name in REGISTRY;
}
