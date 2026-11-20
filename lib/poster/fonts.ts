/**
 * Display + body faces for the poster pages, self-hosted by next/font like the
 * rest of the site (no runtime Google Fonts request). `style.fontFamily` is
 * also what the canvas renderer uses, so the exported poster and the page
 * share the exact same faces. Devanagari subset covers the reference market;
 * more scripts are a Phase 3 concern.
 */
import { Baloo_2, Mukta } from "next/font/google";

export const posterDisplay = Baloo_2({
  subsets: ["devanagari", "latin"],
  weight: ["600", "700", "800"],
  variable: "--font-poster-display",
  display: "swap",
});

export const posterBody = Mukta({
  subsets: ["devanagari", "latin"],
  weight: ["400", "500", "700"],
  variable: "--font-poster-body",
  display: "swap",
});

export const posterFontFamilies = {
  display: posterDisplay.style.fontFamily,
  body: posterBody.style.fontFamily,
};
