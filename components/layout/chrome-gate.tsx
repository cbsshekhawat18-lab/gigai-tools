"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { isChromeless } from "@/lib/chromeless";

/** Renders its children everywhere except chrome-less routes (see lib/chromeless). */
export function ChromeGate({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return isChromeless(pathname) ? null : <>{children}</>;
}
