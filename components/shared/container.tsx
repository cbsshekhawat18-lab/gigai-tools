import * as React from "react";

import { cn } from "@/lib/utils";

type ContainerSize = "default" | "wide" | "narrow" | "prose";

const SIZE_MAX_WIDTH: Record<ContainerSize, string> = {
  wide: "max-w-7xl",
  default: "max-w-6xl",
  narrow: "max-w-3xl",
  prose: "max-w-2xl",
};

export interface ContainerProps extends React.ComponentProps<"div"> {
  size?: ContainerSize;
}

/**
 * Horizontally-centered content wrapper with responsive gutters.
 * The single source of truth for page width across the platform.
 */
export function Container({
  children,
  className,
  size = "default",
  ...props
}: ContainerProps) {
  return (
    <div
      className={cn("mx-auto w-full container-px", SIZE_MAX_WIDTH[size], className)}
      {...props}
    >
      {children}
    </div>
  );
}
