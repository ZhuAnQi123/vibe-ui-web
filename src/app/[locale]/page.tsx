import React from "react";
import { HeroSearch } from "../../components/HeroSearch";
import { ElasticFilter } from "../../components/ElasticFilter";
import { StyleGrid } from "../../components/StyleGrid";
import { LanguageToggle } from "../../components/LanguageToggle";
import { getDictionary } from "../../i18n/get-dictionary";
import { getCatalogItems } from "../../lib/get-catalog";
import { isValidLocale, type Locale } from "../../i18n/config";
import { notFound } from "next/navigation";

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  const t = await getDictionary(locale as Locale);
  const catalogItems = getCatalogItems();

  return (
    <main className="min-h-screen bg-[#FAFAFA] font-sans selection:bg-neutral-900 selection:text-white">
      <header className="w-full h-20 flex items-center justify-between px-8 max-w-7xl mx-auto gap-4">
        <div className="text-2xl font-black tracking-tighter text-neutral-900 shrink-0">
          Vibe UI<span className="text-neutral-400">.</span>
        </div>
        <div className="flex items-center gap-4 min-w-0">
          <ElasticFilter />
          <LanguageToggle />
        </div>
      </header>

      <section className="w-full pt-24 pb-12 px-4 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-100 border border-neutral-200 text-sm font-semibold text-neutral-600 mb-8">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          {t.hero.badge}
        </div>

        <h1 className="text-6xl md:text-7xl font-black tracking-tighter text-neutral-900 max-w-4xl leading-[1.1]">
          {locale === "zh" ? (
            <>
              {t.hero.titleInject}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-neutral-400 to-neutral-800">
                {t.hero.titleHighlight}
              </span>
              {t.hero.titleSuffix}
            </>
          ) : (
            <>
              {t.hero.titleInject}{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-neutral-400 to-neutral-800">
                {t.hero.titleHighlight}
              </span>{" "}
              <br />
              {t.hero.titleSuffix}
            </>
          )}
        </h1>

        <p className="mt-6 text-lg md:text-xl text-neutral-500 font-medium max-w-2xl">
          {t.hero.description}
        </p>

        <HeroSearch />
      </section>

      <StyleGrid items={catalogItems} />
    </main>
  );
}
