"use client";

import React, { createContext, useContext, useEffect } from "react";
import type { Locale } from "./config";
import type { Dictionary } from "./types";

type I18nContextValue = {
  locale: Locale;
  t: Dictionary;
};

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({
  locale,
  dictionary,
  children,
}: {
  locale: Locale;
  dictionary: Dictionary;
  children: React.ReactNode;
}) {
  useEffect(() => {
    document.documentElement.lang = locale === "zh" ? "zh-CN" : "en";
  }, [locale]);

  return (
    <I18nContext.Provider value={{ locale, t: dictionary }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useTranslation must be used within I18nProvider");
  }
  return context;
}
