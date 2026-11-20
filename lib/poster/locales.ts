/**
 * Visitor-facing strings for the public poster page. Phase 1 ships Hindi
 * (bilingual "हिन्दी (English)" labels, exactly as the reference page) and
 * English. Phase 3 adds the other Indian languages + location detection;
 * the shape below is what those files will fill.
 */
import type { PageLang } from "./types";

export interface PosterStrings {
  share: string;
  verified: string;
  stepTemplate: string;
  designsAvailable: (n: number) => string;
  stepPhoto: string;
  upload: string;
  uploadSub: string;
  camera: string;
  cameraSub: string;
  stepDetails: string;
  yourName: string;
  namePlaceholder: string;
  areaLabel: string;
  areaPlaceholder: string;
  stepAdjust: string;
  zoom: string;
  rotation: string;
  tools: string;
  zoomOut: string;
  zoomIn: string;
  rotateLeft: string;
  rotateRight: string;
  reset: string;
  stepShare: string;
  download: string;
  whatsapp: string;
  shareOther: string;
  copyLink: string;
  supporter: string;
  rights: string;
  createOwn: string;
  stripDefault: string;
  scanToMake: string;
  notFound: string;
  notFoundBody: string;
  loading: string;
  preview: string;
  whatsappText: (name: string, url: string) => string;
  toast: {
    photoSet: string;
    reset: string;
    preparing: string;
    downloaded: (w: number, h: number) => string;
    copied: string;
    onlyImages: string;
    shareFailed: string;
    noBanners: string;
  };
}

const hi: PosterStrings = {
  share: "शेयर करें",
  verified: "सत्यापित (Verified)",
  stepTemplate: "पोस्टर डिज़ाइन चुनें (Select Template)",
  designsAvailable: (n) => `${n} आधिकारिक डिज़ाइन उपलब्ध`,
  stepPhoto: "अपनी फोटो जोड़ें (Add Photo)",
  upload: "फोटो अपलोड करें",
  uploadSub: "गैलरी / फाइल से",
  camera: "फोटो खींचें (Camera)",
  cameraSub: "तुरंत सेल्फी लें",
  stepDetails: "समर्थक जानकारी (Optional Details)",
  yourName: "आपका नाम (Your Name)",
  namePlaceholder: "उदा. रमेश शर्मा / Ramesh Sharma",
  areaLabel: "इलाका / पद (Area or Title)",
  areaPlaceholder: "उदा. वार्ड नं. 76, जयपुर / कार्यकर्ता",
  stepAdjust: "फोटो आकार व रोटेशन (Adjust Photo)",
  zoom: "फोटो आकार (Zoom)",
  rotation: "फोटो घुमाएं (Rotation)",
  tools: "फोटो एडजस्टमेंट टूल्स",
  zoomOut: "छोटा करें (Zoom out)",
  zoomIn: "बड़ा करें (Zoom in)",
  rotateLeft: "बाएं घुमाएं (Rotate left)",
  rotateRight: "दाएं घुमाएं (Rotate right)",
  reset: "रीसेट (Reset)",
  stepShare: "डाउनलोड व शेयर करें (Download & Share)",
  download: "पोस्टर डाउनलोड करें (HD Download)",
  whatsapp: "व्हाट्सएप पर शेयर करें (WhatsApp)",
  shareOther: "अन्य ऐप्स पर शेयर",
  copyLink: "लिंक कॉपी करें",
  supporter: "समर्थक",
  rights: "सर्वाधिकार सुरक्षित।",
  createOwn: "अपना पेज बनाएं (Create your own page)",
  stripDefault: "अपना समर्थन पोस्टर बनाएं",
  scanToMake: "QR स्कैन करें और अपना पोस्टर बनाएं (Scan to make yours)",
  notFound: "यह पेज उपलब्ध नहीं है (Page not found)",
  notFoundBody: "लिंक दोबारा जांचें या पेज के मालिक से नया लिंक मांगें।",
  loading: "लोड हो रहा है…",
  preview: "पूर्वावलोकन (Preview) - यह पेज अभी सार्वजनिक नहीं है",
  whatsappText: (name, url) => `मैं ${name} के साथ हूँ! आप भी अपना समर्थन पोस्टर बनाएं: ${url}`,
  toast: {
    photoSet: "फोटो सफलतापूर्वक सेट हो गई!",
    reset: "फोटो की स्थिति रीसेट हो गई",
    preparing: "पोस्टर तैयार हो रहा है…",
    downloaded: (w, h) => `${w}×${h} पोस्टर डाउनलोड हो गया! 🎉`,
    copied: "लिंक कॉपी हो गया",
    onlyImages: "कृपया केवल फोटो (JPG/PNG) चुनें",
    shareFailed: "शेयर नहीं हो सका - पोस्टर डाउनलोड करके भेजें",
    noBanners: "इस पेज पर अभी कोई डिज़ाइन नहीं है",
  },
};

const en: PosterStrings = {
  share: "Share",
  verified: "Verified",
  stepTemplate: "Select a template",
  designsAvailable: (n) => `${n} official design${n === 1 ? "" : "s"} available`,
  stepPhoto: "Add your photo",
  upload: "Upload photo",
  uploadSub: "From gallery / files",
  camera: "Take a photo",
  cameraSub: "Quick selfie",
  stepDetails: "Your details (optional)",
  yourName: "Your name",
  namePlaceholder: "e.g. Ramesh Sharma",
  areaLabel: "Area or title",
  areaPlaceholder: "e.g. Ward 76, Jaipur / Volunteer",
  stepAdjust: "Adjust photo",
  zoom: "Zoom",
  rotation: "Rotation",
  tools: "Photo tools",
  zoomOut: "Zoom out",
  zoomIn: "Zoom in",
  rotateLeft: "Rotate left",
  rotateRight: "Rotate right",
  reset: "Reset",
  stepShare: "Download & share",
  download: "Download poster (HD)",
  whatsapp: "Share on WhatsApp",
  shareOther: "Share to other apps",
  copyLink: "Copy link",
  supporter: "Supporter",
  rights: "All rights reserved.",
  createOwn: "Create your own page",
  stripDefault: "Make your supporter poster",
  scanToMake: "Scan the QR code to make yours",
  notFound: "Page not found",
  notFoundBody: "Check the link, or ask the page owner for a new one.",
  loading: "Loading…",
  preview: "Preview - this page is not public yet",
  whatsappText: (name, url) => `I stand with ${name}! Make your supporter poster too: ${url}`,
  toast: {
    photoSet: "Photo set!",
    reset: "Photo position reset",
    preparing: "Preparing your poster…",
    downloaded: (w, h) => `${w}×${h} poster downloaded! 🎉`,
    copied: "Link copied",
    onlyImages: "Please choose an image (JPG/PNG)",
    shareFailed: "Could not share - download the poster and send it",
    noBanners: "This page has no designs yet",
  },
};

export const POSTER_LOCALES: Record<PageLang, PosterStrings> = { hi, en };

export function stringsFor(lang: string | undefined): PosterStrings {
  return POSTER_LOCALES[(lang as PageLang) in POSTER_LOCALES ? (lang as PageLang) : "hi"];
}
