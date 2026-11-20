/**
 * Routes that render WITHOUT the site header, footer and assistant: white-label
 * pages a visitor reaches from someone else's link (supporter poster pages),
 * where GigAI chrome would be noise. The static shell for /p and the live
 * /p/{slug} URL both match, so server HTML and client hydration agree.
 */
export const CHROMELESS_PREFIXES = ["/p"] as const;

export function isChromeless(pathname: string): boolean {
  return CHROMELESS_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}
