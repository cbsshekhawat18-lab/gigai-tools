"use client";

import * as React from "react";

import { api, getSession, setSession } from "@/lib/devapi/client";

/**
 * Session gate for account-only pages. Sends a signed-out visitor to the login
 * page with `?next=` so they land back here afterwards; a dead token is
 * cleared first. Shared by the developer dashboard and the poster pages so
 * there is exactly one place that knows how a session is checked.
 */
export function useDevSession(loginPath = "/developers/login"): { ready: boolean; email: string | null } {
  const [email, setEmail] = React.useState<string | null>(null);
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    const toLogin = () => {
      const next = encodeURIComponent(window.location.pathname + window.location.search);
      window.location.href = `${loginPath}?next=${next}`;
    };
    if (!getSession()) {
      toLogin();
      return;
    }
    void api<{ email: string }>("/account").then((r) => {
      if (r.ok) {
        setEmail(r.data.email);
        setReady(true);
      } else if (r.error.code === "unauthorized") {
        setSession(null);
        toLogin();
      } else {
        setReady(true);
      }
    });
  }, [loginPath]);

  return { ready, email };
}

/** Only same-origin paths may be used as a post-login destination. */
export function safeNext(raw: string | null | undefined, fallback: string): string {
  if (raw && raw.startsWith("/") && !raw.startsWith("//") && !raw.includes("\\")) return raw;
  return fallback;
}
