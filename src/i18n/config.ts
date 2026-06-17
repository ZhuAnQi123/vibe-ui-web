export const locales = ["en", "zh"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "zh";

export const localeLabels: Record<Locale, string> = {
  en: "EN",
  zh: "中文",
};

export function isValidLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}
