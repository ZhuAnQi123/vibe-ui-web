import { getDictionary } from "../../i18n/get-dictionary";
import { getCatalogListItems } from "../../lib/get-catalog";
import { isValidLocale, type Locale } from "../../i18n/config";
import { notFound } from "next/navigation";
import { ClientHome } from "./ClientHome";

export default async function Home({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { locale } = await params;
  const resolvedSearchParams = await searchParams;

  if (!isValidLocale(locale)) {
    notFound();
  }

  const t = await getDictionary(locale as Locale);
  const catalogItems = getCatalogListItems();

  return (
    <ClientHome
      initialItems={catalogItems}
      locale={locale}
      t={t}
      searchParams={resolvedSearchParams}
    />
  );
}
