import { ADS_ENABLED, ADSENSE_CLIENT } from "@/config/ads";

/**
 * `/ads.txt`: the authorised-seller line for the configured AdSense publisher
 * (NEXT_PUBLIC_ADSENSE_CLIENT). Without one, the file lists no sellers. Static.
 */
export const dynamic = "force-static";

export function GET(): Response {
  const body = ADS_ENABLED
    ? `google.com, ${ADSENSE_CLIENT.replace(/^ca-/, "")}, DIRECT, f08c47fec0942fa0\n`
    : "# No ad sellers are authorised for this site.\n";
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
