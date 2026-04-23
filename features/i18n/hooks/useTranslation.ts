import { useCallback } from "react";
import { useLocale } from "../stores/useLanguageStore";
import { translations } from "../translations";
import type { Locale } from "../types";

export interface UseTranslationResult {
  t: (key: string, params?: Record<string, string | number>) => string;
  locale: Locale;
  isVi: boolean;
  isEn: boolean;
}

const interpolate = (
  template: string,
  params?: Record<string, string | number>,
): string => {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (_, k) =>
    params[k] !== undefined ? String(params[k]) : `{${k}}`,
  );
};

export const useTranslation = (): UseTranslationResult => {
  const locale = useLocale();

  const t = useCallback(
    (key: string, params?: Record<string, string | number>) => {
      const dict = translations[locale] ?? translations.vi;
      const fallback = translations.vi;
      const value = dict[key] ?? fallback[key] ?? key;
      return interpolate(value, params);
    },
    [locale],
  );

  return { t, locale, isVi: locale === "vi", isEn: locale === "en" };
};
