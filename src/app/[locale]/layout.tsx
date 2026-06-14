import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isValidLocale, locales, type Locale } from "../../i18n/config";
import { getDictionary } from "../../i18n/get-dictionary";
import { I18nProvider } from "../../i18n/provider";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    return {};
  }

  const dictionary = await getDictionary(locale as Locale);

  return {
    title: dictionary.meta.title,
    description: dictionary.meta.description,
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  const dictionary = await getDictionary(locale as Locale);

  return (
    <I18nProvider locale={locale as Locale} dictionary={dictionary}>
      {children}
    </I18nProvider>
  );
}
