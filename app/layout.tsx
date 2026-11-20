import type { Metadata } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";

import "@/styles/globals.css";

import { ADS_ENABLED, ADSENSE_CLIENT } from "@/config/ads";
import { SITE } from "@/config/constants";
import { ANALYTICS_ENABLED, BING_VERIFICATION, GSC_VERIFICATION } from "@/config/analytics";
import { DEFAULT_SEO, TITLE_TEMPLATE } from "@/config/seo";
import { cn } from "@/lib/utils";
import { JsonLd, organizationJsonLd, websiteJsonLd } from "@/lib/schema";
import { buildNavData } from "@/lib/nav-data";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { Header } from "@/components/layout/header";
import { NavProgress } from "@/components/layout/nav-progress";
import { Footer } from "@/components/layout/footer";
import { ChromeGate } from "@/components/layout/chrome-gate";
import { Toaster } from "@/components/ui/sonner";
import { CookieConsent } from "@/components/legal/cookie-consent";
import { GigaiAssistant } from "@/components/assistant";
import { SwRegister } from "@/components/pwa/sw-register";
import { VitalsTracker } from "@/components/pwa/vitals-tracker";
import { GoogleAnalytics } from "@/components/analytics/google-analytics";

/*
 * UI-upgrade spec phase 1: "precision instruments for files". IBM Plex is the
 * deliberate pairing - a grotesque with genuine engineering heritage (and not
 * Inter, which reads as the default), plus its matching mono for every number,
 * size, dimension and result readout on the site. Self-hosted via next/font,
 * so no external font requests.
 */
const fontSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

const fontMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name}, ${SITE.tagline}`,
    template: TITLE_TEMPLATE,
  },
  description: SITE.description,
  keywords: DEFAULT_SEO.keywords,
  applicationName: SITE.name,
  authors: [{ name: SITE.brand, url: SITE.parentUrl }],
  creator: SITE.brand,
  publisher: SITE.brand,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: SITE.name,
    title: `${SITE.name}, ${SITE.tagline}`,
    description: SITE.description,
    url: SITE.url,
    locale: SITE.locale,
    images: [{ url: SITE.ogImage, width: 1200, height: 630, alt: SITE.name }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE.name}: ${SITE.tagline}`,
    description: SITE.description,
    images: [SITE.ogImage],
    site: SITE.twitterHandle,
    creator: SITE.twitterHandle,
  },
  // Search-engine site verification: Google Search Console and Bing Webmaster
  // Tools, each emitted only when its NEXT_PUBLIC_*_VERIFICATION token is set.
  verification: {
    ...(GSC_VERIFICATION ? { google: GSC_VERIFICATION } : {}),
    ...(BING_VERIFICATION ? { other: { "msvalidate.01": BING_VERIFICATION } } : {}),
  },
  // AdSense ownership/verification signal Google looks for during account review.
  ...(ADS_ENABLED ? { other: { "google-adsense-account": ADSENSE_CLIENT } } : {}),
  // Favicon/app icons are provided by the app/{favicon.ico,icon.png,apple-icon.png}
  // file convention, Next emits the correct <link> tags with hashed URLs.
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Computed on the server from the registry, then threaded as SLIM props into
  // the client Header/Footer so those never bundle the ~249 tool configs.
  const navData = buildNavData();

  return (
    <html
      lang={SITE.language}
      suppressHydrationWarning
      className={cn(fontSans.variable, fontMono.variable)}
    >
      {/* GA4 consent-default + gtag.js loader must sit as high in <head> as
          possible so Consent Mode is established before any tag, including the
          AdSense loader. Can fire. React does NOT hoist inline
          dangerouslySetInnerHTML scripts, so an explicit <head> is required;
          rendering them in <body> puts them after </head> and Google's tag
          testers report the tag as missing.
          No-op unless NEXT_PUBLIC_GA4_ID is set. */}
      <head>
        <GoogleAnalytics />
      </head>
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        {/* Density no-FOUC bootstrap (companion to lib/density) - applies the
            compact attribute before first paint, like next-themes does for
            the theme class. Keep in sync with lib/density's "gt:density". */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(localStorage.getItem("gt:density")==="compact")document.documentElement.setAttribute("data-density","compact")}catch(e){}`,
          }}
        />
        <ThemeProvider>
          {/* Global navigation loader - instant feedback on every route change. */}
          <NavProgress />
          {/* Skip link - first focusable element, so keyboard/SR users can jump
              past the header on every page (WCAG 2.4.1 Bypass Blocks). */}
          <a
            href="#main-content"
            className="sr-only rounded-md focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:bg-background focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-foreground focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
          >
            Skip to content
          </a>
          {/* `overflow-x-clip` here (not on html/body) guards against sideways
              scroll from stray wide content WITHOUT trapping fixed overlays:
              every overlay (Sheet, command dialog, Browse popper, assistant,
              toaster) portals to <body>, i.e. OUTSIDE this shell. `clip` also
              keeps the sticky header working (it creates no scroll container). */}
          <div className="flex min-h-screen flex-col overflow-x-clip">
            <Header navData={navData} />
            <main id="main-content" tabIndex={-1} className="flex-1 outline-none">
              {children}
            </main>
            <ChromeGate>
              <Footer navData={navData} />
            </ChromeGate>
          </div>
          {/* Floating product-expert assistant - button is tiny; the panel +
              intent engine (registry) lazy-load on first open (CWV rule). */}
          <ChromeGate>
            <GigaiAssistant />
          </ChromeGate>
          <Toaster />
          {/* Consent banner for analytics and ads (Consent Mode defaults to
              denied). With neither configured there is nothing to consent to. */}
          {ADS_ENABLED || ANALYTICS_ENABLED ? <CookieConsent /> : null}
          {/* Service worker: intelligent caching + offline mode (registers
              after `load`, so it never competes with hydration/LCP). */}
          <SwRegister />
          {/* Local-first real-user web-vitals (stored on-device, no beacon). */}
          <VitalsTracker />
        </ThemeProvider>
        <JsonLd data={[websiteJsonLd(), organizationJsonLd()]} />

        {/*
          THE single AdSense loader for the whole app. Ad components never
          inject this - they only render <ins> and push once. Do not duplicate.
          Rendered as a native async <script> (not next/script) so it carries no
          `data-nscript` attribute - AdSense warns about that attribute, and
          React 19 hoists/dedupes an async external script into <head> for us.
        */}
        {ADS_ENABLED ? (
           
          <script
            async
            crossOrigin="anonymous"
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
          />
        ) : null}
      </body>
    </html>
  );
}
