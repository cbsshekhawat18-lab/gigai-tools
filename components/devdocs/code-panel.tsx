"use client";

import { useEffect, useState } from "react";

/**
 * The docs code panel: the one dark surface in the product. A language
 * switcher persisted in localStorage and synced across every panel on the
 * page (and every page) via a custom event, request + response blocks with
 * copy buttons. Samples come in pre-generated for all languages; switching
 * is instant and client-only.
 */

const STORE_KEY = "gigai-dev-lang";
const EVENT = "gigai-dev-lang-change";

export type PanelSamples = {
  langs: { id: string; label: string }[];
  request: Record<string, string>;
  response?: string;
  responseLabel?: string;
};

function useLang(fallback: string) {
  const [lang, setLang] = useState(fallback);
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORE_KEY);
      if (saved) setLang(saved);
    } catch {
      /* private mode */
    }
    const onChange = (e: Event) => setLang((e as CustomEvent<string>).detail);
    window.addEventListener(EVENT, onChange);
    return () => window.removeEventListener(EVENT, onChange);
  }, []);
  const choose = (id: string) => {
    setLang(id);
    try {
      localStorage.setItem(STORE_KEY, id);
    } catch {
      /* private mode */
    }
    window.dispatchEvent(new CustomEvent(EVENT, { detail: id }));
  };
  return [lang, choose] as const;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard.writeText(text).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        });
      }}
      className="rounded border border-zinc-700 px-2 py-0.5 text-[11px] text-zinc-400 hover:border-zinc-500 hover:text-zinc-200"
    >
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

export function CodePanel({ samples }: { samples: PanelSamples }) {
  const first = samples.langs[0]?.id ?? "curl";
  const [lang, choose] = useLang(first);
  const active = samples.request[lang] !== undefined ? lang : first;
  return (
    <div className="overflow-hidden rounded border border-zinc-800 bg-zinc-950 text-[13px]">
      <div className="flex items-center gap-1 border-b border-zinc-800 px-2 py-1.5">
        {samples.langs.map((l) => (
          <button
            key={l.id}
            type="button"
            onClick={() => choose(l.id)}
            className={
              l.id === active
                ? "rounded bg-zinc-800 px-2 py-0.5 text-[12px] font-semibold text-zinc-100"
                : "rounded px-2 py-0.5 text-[12px] text-zinc-500 hover:text-zinc-300"
            }
          >
            {l.label}
          </button>
        ))}
        <span className="ml-auto">
          <CopyButton text={samples.request[active] ?? ""} />
        </span>
      </div>
      <pre className="max-h-[420px] overflow-auto whitespace-pre-wrap break-words p-4 font-mono leading-relaxed text-zinc-200">
        <code>{samples.request[active]}</code>
      </pre>
      {samples.response ? (
        <div className="border-t border-zinc-800">
          <div className="flex items-center justify-between px-4 pt-2">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
              {samples.responseLabel ?? "Response"}
            </p>
            <CopyButton text={samples.response} />
          </div>
          <pre className="max-h-[320px] overflow-auto whitespace-pre-wrap break-words p-4 pt-2 font-mono leading-relaxed text-zinc-400">
            <code>{samples.response}</code>
          </pre>
        </div>
      ) : null}
    </div>
  );
}
