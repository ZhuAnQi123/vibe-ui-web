export type Dictionary = {
  meta: {
    title: string;
    description: string;
  };
  hero: {
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
    more: string;
    aesthetics: string;
    interactions: string;
    interactionTypes: string;
    interactionEffects: string;
    interactionComponents: string;
    clearAll: string;
  };
  grid: {
    viewPrompt: string;
    viewDemo: string;
    typeUi: string;
    typeMotion: string;
    empty: string;
    tabs: {
      all: string;
      ui: string;
      motion: string;
    };
  };
  modal: {
    copy: string;
    copied: string;
  };
  tags: Record<string, string>;
};
