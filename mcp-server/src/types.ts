export type CatalogItemType = "ui" | "motion";

export type CatalogPreview = {
  backgroundColor: string;
  textColor: string;
};

export type CatalogSource = {
  repo: "vibe-ui" | "vibe-motion";
  referencePath: string;
  skillPath: string;
};

export type CatalogItem = {
  id: string;
  type: CatalogItemType;
  name: string;
  nameZh?: string;
  description: string;
  domains: string[];
  aesthetics: string[];
  interactionTypes: string[];
  components?: string[];
  effects?: string[];
  colorScheme?: string;
  website?: string;
  preview: CatalogPreview;
  coverImage?: string;
  coverVideo?: string;
  source: CatalogSource;
  assets: string[];
  triggers: string[];
  content: string;
};

export type CatalogListItem = Omit<CatalogItem, "content">;

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

export type CatalogListResponse = Omit<Catalog, "items"> & {
  items: CatalogListItem[];
};
