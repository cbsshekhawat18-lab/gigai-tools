"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { getSession } from "@/lib/devapi/client";

/**
 * Header auth controls. Signed out: Sign in + Sign up. Signed in (developer
 * session in this browser): a single Dashboard link. Renders nothing until
 * the client knows which, so there is no hydration flicker, and hides on
 * small screens where header room is scarce (the /developers pages carry
 * their own entry points).
 */
export function AuthButtons() {
  const [state, setState] = useState<"unknown" | "out" | "in">("unknown");

  useEffect(() => {
    setState(getSession() ? "in" : "out");
  }, []);

  if (state === "unknown") {
    return <div className="hidden w-[132px] sm:block" aria-hidden />;
  }

  if (state === "in") {
    return (
      <Link
        href="/developers/dashboard"
        className="hidden shrink-0 items-center rounded-lg bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground sm:inline-flex"
      >
        Dashboard
      </Link>
    );
  }

  return (
    <span className="hidden shrink-0 items-center gap-1.5 sm:inline-flex">
      <Link
        href="/developers/login"
        className="rounded-lg px-2.5 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        Sign in
      </Link>
      <Link
        href="/developers/signup"
        className="rounded-lg bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground"
      >
        Sign up
      </Link>
    </span>
  );
}
