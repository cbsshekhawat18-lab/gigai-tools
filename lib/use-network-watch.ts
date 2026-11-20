"use client";

/**
 * The "0 bytes of your files sent" indicator, backed by a REAL observer:
 * counts fetch/XHR resource entries after arm() - so the zero-upload claim
 * on /ask-file and /ask is checkable, not just promised.
 */

import * as React from "react";

export type NetState = { requests: number; armed: boolean; hosts: string[] };

export function useNetworkWatch(): [NetState, () => void] {
  const [state, setState] = React.useState<NetState>({ requests: 0, armed: false, hosts: [] });
  const armedRef = React.useRef(false);
  React.useEffect(() => {
    const observer = new PerformanceObserver((list) => {
      if (!armedRef.current) return;
      const real = list.getEntries().filter((e) => {
        const r = e as PerformanceResourceTiming;
        return r.initiatorType === "fetch" || r.initiatorType === "xmlhttprequest";
      });
      if (real.length) {
        setState((s) => {
          const hosts = new Set(s.hosts);
          for (const e of real) {
            try { hosts.add(new URL(e.name).host); } catch { /* opaque entry */ }
          }
          return { ...s, requests: s.requests + real.length, hosts: [...hosts] };
        });
      }
    });
    observer.observe({ entryTypes: ["resource"] });
    return () => observer.disconnect();
  }, []);
  const arm = React.useCallback(() => {
    armedRef.current = true;
    setState({ requests: 0, armed: true, hosts: [] });
  }, []);
  return [state, arm];
}
