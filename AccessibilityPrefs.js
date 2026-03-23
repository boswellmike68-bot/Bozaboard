// ── Accessibility Preferences ────────────────────────────────────
// Captured before Boardroom entry so the system can accommodate
// every user's communication, cultural, and legal needs.
// Zero dependencies. Stored globally on window.__bozaPrefs.

const DEFAULTS = {
  communicationMode: "read",       // read | listen | braille
  signLanguage: "none",            // none | asl | bsl | lsf | lsq | auslan | other
  preferredLanguage: "en",         // ISO 639-1 code
  country: "",                     // free text or ISO 3166 code
  religiousBeliefs: "none",        // none | christianity | islam | judaism | hinduism | buddhism | sikhism | indigenous | other
  applicableLaw: [],               // array of legal frameworks: gdpr, ccpa, pipeda, aoda, ada, etc.
  customNotes: ""                  // anything else the user wants the system to know
};

// ── Language map (display labels) ───────────────────────────────
export const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "fr", label: "Français (French)" },
  { code: "es", label: "Español (Spanish)" },
  { code: "pt", label: "Português (Portuguese)" },
  { code: "de", label: "Deutsch (German)" },
  { code: "it", label: "Italiano (Italian)" },
  { code: "ar", label: "العربية (Arabic)" },
  { code: "zh", label: "中文 (Mandarin)" },
  { code: "hi", label: "हिन्दी (Hindi)" },
  { code: "ja", label: "日本語 (Japanese)" },
  { code: "ko", label: "한국어 (Korean)" },
  { code: "ru", label: "Русский (Russian)" },
  { code: "uk", label: "Українська (Ukrainian)" },
  { code: "pl", label: "Polski (Polish)" },
  { code: "nl", label: "Nederlands (Dutch)" },
  { code: "sv", label: "Svenska (Swedish)" },
  { code: "tl", label: "Tagalog (Filipino)" },
  { code: "vi", label: "Tiếng Việt (Vietnamese)" },
  { code: "th", label: "ไทย (Thai)" },
  { code: "tr", label: "Türkçe (Turkish)" },
  { code: "other", label: "Other" }
];

// ── Sign language options ───────────────────────────────────────
export const SIGN_LANGUAGES = [
  { code: "none", label: "Not required" },
  { code: "asl", label: "ASL (American Sign Language)" },
  { code: "bsl", label: "BSL (British Sign Language)" },
  { code: "lsf", label: "LSF (French Sign Language)" },
  { code: "lsq", label: "LSQ (Quebec Sign Language)" },
  { code: "auslan", label: "Auslan (Australian Sign Language)" },
  { code: "other", label: "Other" }
];

// ── Religious / cultural options ────────────────────────────────
export const BELIEFS = [
  { code: "none", label: "Prefer not to say" },
  { code: "christianity", label: "Christianity" },
  { code: "islam", label: "Islam" },
  { code: "judaism", label: "Judaism" },
  { code: "hinduism", label: "Hinduism" },
  { code: "buddhism", label: "Buddhism" },
  { code: "sikhism", label: "Sikhism" },
  { code: "indigenous", label: "Indigenous Spirituality" },
  { code: "other", label: "Other" }
];

// ── Legal frameworks (multi-select) ─────────────────────────────
export const LEGAL_FRAMEWORKS = [
  { code: "gdpr", label: "GDPR (EU/UK)", region: "EU/UK" },
  { code: "pipeda", label: "PIPEDA (Canada)", region: "Canada" },
  { code: "aoda", label: "AODA (Ontario, Canada)", region: "Canada" },
  { code: "ada", label: "ADA (United States)", region: "US" },
  { code: "ccpa", label: "CCPA (California, US)", region: "US" },
  { code: "lgpd", label: "LGPD (Brazil)", region: "Brazil" },
  { code: "popia", label: "POPIA (South Africa)", region: "South Africa" },
  { code: "appi", label: "APPI (Japan)", region: "Japan" },
  { code: "pdpa", label: "PDPA (Singapore/Thailand)", region: "SE Asia" },
  { code: "other", label: "Other / Unknown" }
];

// ── Store & retrieve ────────────────────────────────────────────

export function savePrefs(prefs) {
  const merged = { ...DEFAULTS, ...prefs };
  window.__bozaPrefs = merged;
  // Persist across page reloads within same session
  try {
    sessionStorage.setItem("bozaPrefs", JSON.stringify(merged));
  } catch (_) { /* storage unavailable — that's fine */ }
  return merged;
}

export function getPrefs() {
  if (window.__bozaPrefs) return { ...window.__bozaPrefs };
  try {
    const stored = sessionStorage.getItem("bozaPrefs");
    if (stored) {
      window.__bozaPrefs = JSON.parse(stored);
      return { ...window.__bozaPrefs };
    }
  } catch (_) { /* ignore */ }
  return { ...DEFAULTS };
}

export function getPref(key) {
  return getPrefs()[key];
}

// ── Convenience checks ──────────────────────────────────────────

export function isBrailleMode() {
  return getPref("communicationMode") === "braille";
}

export function isListenMode() {
  return getPref("communicationMode") === "listen";
}

export function isReadMode() {
  return getPref("communicationMode") === "read";
}

export function needsSignLanguage() {
  return getPref("signLanguage") !== "none";
}

export function getApplicableLaws() {
  return getPref("applicableLaw") || [];
}

export function getLanguageLabel() {
  const code = getPref("preferredLanguage");
  const match = LANGUAGES.find(l => l.code === code);
  return match ? match.label : code;
}
