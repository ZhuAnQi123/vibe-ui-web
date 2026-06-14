export type CatalogItemType = "ui" | "motion";

export type CatalogPreview = {
  backgroundColor: string;
  textColor: string;
};

export type CatalogSource = {
  repo: "vibe-ui" | "vibe-motion-md";
  referencePath: string;
  skillPath: string;
};

export type CatalogItem = {
  id: string;
  type: CatalogItemType;
  name: string;
  description: string;
  domains: string[];
  aesthetics: string[];
  interactionTypes: string[];
  colorScheme?: string;
  website?: string;
  preview: CatalogPreview;
  source: CatalogSource;
  assets: string[];
  triggers: string[];
};

export type CatalogFilters = {
  domains: string[];
  aesthetics: string[];
  interactionTypes: string[];
  types: CatalogItemType[];
};

export type CatalogSourceMeta = {
  path: string;
  resolvedFrom: "submodule" | "sibling";
};

export type Catalog = {
  version: string;
  generatedAt: string;
  sources: {
    vibeUi: CatalogSourceMeta;
    vibeMotionMd: CatalogSourceMeta;
  };
  items: CatalogItem[];
  filters: CatalogFilters;
};
