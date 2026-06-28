import { NextResponse } from "next/server";
import { getCatalog, getCatalogListItems } from "../../../lib/get-catalog";
import type { CatalogItemType } from "../../../types/catalog";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const includeContent = searchParams.get("includeContent") === "true";
  const type = searchParams.get("type") as CatalogItemType | "all" | null;
  const id = searchParams.get("id");

  const catalog = getCatalog();

  if (id) {
    const itemType = type && type !== "all" ? type : undefined;
    const item = catalog.items.find(
      (entry) =>
        entry.id === id && (!itemType || entry.type === itemType),
    );

    if (!item) {
      return NextResponse.json({ error: "Style not found" }, { status: 404 });
    }

    return NextResponse.json(item, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  }

  const payload = includeContent
    ? catalog
    : {
        ...catalog,
        items: getCatalogListItems(
          type && type !== "all" ? { type } : undefined,
        ),
      };

  return NextResponse.json(payload, {
    headers: {
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
    },
  });
}
