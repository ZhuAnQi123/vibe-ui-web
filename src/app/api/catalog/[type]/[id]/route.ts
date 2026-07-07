import { NextResponse } from "next/server";
import { getCatalogItemContent } from "../../../../../lib/get-catalog";
import { CatalogItemType } from "../../../../../types/catalog";

export const dynamic = "force-dynamic";

type RouteParams = {
  params: Promise<{
    type: string;
    id: string;
  }>;
};

export async function GET(_request: Request, { params }: RouteParams) {
  const { type, id } = await params;

  if (type !== "ui" && type !== "motion") {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }

  const content = getCatalogItemContent(id, type as CatalogItemType);
  if (!content) {
    return NextResponse.json({ error: "Style not found" }, { status: 404 });
  }

  return new NextResponse(content, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
    },
  });
}
