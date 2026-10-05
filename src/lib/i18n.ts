/**
 * i18n setup (D20). Uzbek (Latin) is the primary language, English optional.
 *
 * Every string in the interface comes from `src/locales/*.json`; nothing is
 * written inline. The two files are kept at exact key parity by a test, so a
 * missing translation is a failing test rather than a key leaking into the UI.
 *
 * The chosen language is remembered in localStorage — a preference, not data.
 */

import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "@/locales/en.json";
import uz from "@/locales/uz.json";

export const LANGUAGES = ["uz", "en"] as const;
export type Language = (typeof LANGUAGES)[number];

export const DEFAULT_LANGUAGE: Language = "uz";
const STORAGE_KEY = "neurolearn.lang";

export function storedLanguage(): Language {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return (LANGUAGES as readonly string[]).includes(saved ?? "") ? (saved as Language) : DEFAULT_LANGUAGE;
  } catch {
    return DEFAULT_LANGUAGE;
  }
}

export function rememberLanguage(language: Language): void {
  try {
    localStorage.setItem(STORAGE_KEY, language);
  } catch {
    // A private window may refuse storage; the choice then lasts for the session.
  }
}

void i18n.use(initReactI18next).init({
  resources: { uz: { translation: uz }, en: { translation: en } },
  lng: storedLanguage(),
  fallbackLng: DEFAULT_LANGUAGE,
  interpolation: { escapeValue: false },
  returnNull: false,
});

export default i18n;
