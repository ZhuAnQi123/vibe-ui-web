export type StyleTranslation = {
  domain: string;
  aesthetic: string;
};

export type Dictionary = {
  meta: {
    title: string;
    description: string;
  };
  hero: {
    badge: string;
    titleInject: string;
    titleHighlight: string;
    titleSuffix: string;
    description: string;
  };
  search: {
    placeholder: string;
    go: string;
    search: string;
  };
  filter: {
    all: string;
    saas: string;
    finance: string;
    healthcare: string;
    portfolio: string;
    terminal: string;
  };
  grid: {
    viewPrompt: string;
    copySkill: string;
    styles: Record<string, StyleTranslation>;
  };
};
