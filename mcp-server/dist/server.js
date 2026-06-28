import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { findItem, loadCatalog, searchItems, toListItem, } from "./catalog.js";
const SERVER_INSTRUCTIONS = [
    "Vibe MCP provides UI design styles (vibe-ui) and motion interaction specs (vibe-motion).",
    "Use list_vibe_styles to browse available styles, search_vibe_styles to filter by keyword/domain/aesthetic,",
    "and get_vibe_style to fetch the full markdown specification for implementation.",
    "For a page build, combine one UI style with one or more motion specs via get_vibe_combo.",
].join(" ");
export function createVibeMcpServer() {
    const server = new McpServer({
        name: "vibe-ui-mcp",
        version: "1.0.0",
    }, {
        instructions: SERVER_INSTRUCTIONS,
    });
    server.registerTool("list_vibe_styles", {
        title: "List Vibe Styles",
        description: "List available UI styles and motion interaction specs from the Vibe library.",
        inputSchema: {
            type: z
                .enum(["ui", "motion", "all"])
                .optional()
                .describe("Filter by content type. Defaults to all."),
            limit: z
                .number()
                .int()
                .min(1)
                .max(100)
                .optional()
                .describe("Maximum number of items to return. Defaults to 50."),
        },
    }, async ({ type = "all", limit = 50 }) => {
        const catalog = await loadCatalog();
        const items = type === "all"
            ? catalog.items
            : catalog.items.filter((item) => item.type === type);
        const payload = items.slice(0, limit).map(toListItem);
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify({
                        generatedAt: catalog.generatedAt,
                        total: items.length,
                        returned: payload.length,
                        items: payload,
                    }, null, 2),
                },
            ],
        };
    });
    server.registerTool("search_vibe_styles", {
        title: "Search Vibe Styles",
        description: "Search UI styles and motion specs by keyword, domain, aesthetic, or type.",
        inputSchema: {
            query: z
                .string()
                .optional()
                .describe("Keyword to match id, name, description, triggers, domains, or aesthetics."),
            type: z
                .enum(["ui", "motion", "all"])
                .optional()
                .describe("Filter by content type. Defaults to all."),
            domain: z
                .string()
                .optional()
                .describe("Filter by domain tag, e.g. SaaS, 金融, 个人主页."),
            aesthetic: z
                .string()
                .optional()
                .describe("Filter by aesthetic tag, e.g. Neo-Brutalism, 有机极简."),
            limit: z
                .number()
                .int()
                .min(1)
                .max(50)
                .optional()
                .describe("Maximum number of results. Defaults to 20."),
        },
    }, async ({ query, type = "all", domain, aesthetic, limit = 20 }) => {
        const catalog = await loadCatalog();
        const results = searchItems(catalog, {
            query,
            type,
            domain,
            aesthetic,
            limit,
        });
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify({
                        query: query ?? null,
                        type,
                        domain: domain ?? null,
                        aesthetic: aesthetic ?? null,
                        count: results.length,
                        results,
                    }, null, 2),
                },
            ],
        };
    });
    server.registerTool("get_vibe_style", {
        title: "Get Vibe Style",
        description: "Fetch the full markdown specification for a UI style or motion interaction by id, name, or trigger keyword.",
        inputSchema: {
            id: z
                .string()
                .describe("Style id, English name, Chinese name, or trigger keyword (e.g. stripe, fluid-elastic-button-hover)."),
            type: z
                .enum(["ui", "motion"])
                .optional()
                .describe("Optional type hint when id is ambiguous."),
        },
    }, async ({ id, type }) => {
        const catalog = await loadCatalog();
        const item = findItem(catalog, id, type);
        if (!item) {
            return {
                isError: true,
                content: [
                    {
                        type: "text",
                        text: `No style found for "${id}". Use search_vibe_styles or list_vibe_styles to browse available entries.`,
                    },
                ],
            };
        }
        return {
            content: [
                {
                    type: "text",
                    text: item.content,
                },
            ],
        };
    });
    server.registerTool("get_vibe_combo", {
        title: "Get UI + Motion Combo",
        description: "Fetch one UI style and one or more motion specs together — ideal for building a complete page vibe.",
        inputSchema: {
            ui: z
                .string()
                .describe("UI style id, name, or trigger (e.g. supabase, neo-brutalism)."),
            motions: z
                .array(z.string())
                .min(1)
                .describe("Motion spec ids, names, or triggers (e.g. fluid-elastic-button-hover)."),
        },
    }, async ({ ui, motions }) => {
        const catalog = await loadCatalog();
        const uiItem = findItem(catalog, ui, "ui");
        if (!uiItem) {
            return {
                isError: true,
                content: [
                    {
                        type: "text",
                        text: `UI style not found for "${ui}".`,
                    },
                ],
            };
        }
        const motionItems = motions.map((motionId) => findItem(catalog, motionId, "motion"));
        const missing = motions.filter((_, index) => !motionItems[index]);
        if (missing.length > 0) {
            return {
                isError: true,
                content: [
                    {
                        type: "text",
                        text: `Motion specs not found: ${missing.join(", ")}`,
                    },
                ],
            };
        }
        const sections = [
            `# UI Style: ${uiItem.name}`,
            uiItem.content,
            ...motionItems.map((motionItem, index) => [
                `# Motion: ${motionItem.name}`,
                motionItem.content,
            ].join("\n\n")),
        ];
        return {
            content: [
                {
                    type: "text",
                    text: sections.join("\n\n---\n\n"),
                },
            ],
        };
    });
    server.registerResource("catalog", "vibe://catalog", {
        title: "Vibe Catalog Index",
        description: "JSON index of all UI styles and motion specs (metadata only).",
        mimeType: "application/json",
    }, async () => {
        const catalog = await loadCatalog();
        const payload = {
            version: catalog.version,
            generatedAt: catalog.generatedAt,
            filters: catalog.filters,
            items: catalog.items.map(toListItem),
        };
        return {
            contents: [
                {
                    uri: "vibe://catalog",
                    mimeType: "application/json",
                    text: JSON.stringify(payload, null, 2),
                },
            ],
        };
    });
    server.registerResource("style", new ResourceTemplate("vibe://style/{type}/{id}", {
        list: async () => {
            const catalog = await loadCatalog();
            return {
                resources: catalog.items.map((item) => ({
                    uri: `vibe://style/${item.type}/${item.id}`,
                    name: item.name,
                    description: item.description,
                    mimeType: "text/markdown",
                })),
            };
        },
    }), {
        title: "Vibe Style Specification",
        description: "Full markdown specification for a single UI style or motion spec.",
        mimeType: "text/markdown",
    }, async (uri, variables) => {
        const typeValue = Array.isArray(variables.type)
            ? variables.type[0]
            : variables.type;
        const idValue = Array.isArray(variables.id)
            ? variables.id[0]
            : variables.id;
        const catalog = await loadCatalog();
        const item = findItem(catalog, idValue, typeValue);
        if (!item) {
            throw new Error(`Style not found: ${typeValue}/${idValue}`);
        }
        return {
            contents: [
                {
                    uri: uri.href,
                    mimeType: "text/markdown",
                    text: item.content,
                },
            ],
        };
    });
    server.registerPrompt("build-with-vibe", {
        title: "Build Page with Vibe",
        description: "Prompt template for building a page with a specific UI style and motion interactions.",
        argsSchema: {
            page: z.string().describe("Page to build, e.g. login page, dashboard."),
            ui: z.string().describe("UI style id or name."),
            motions: z
                .string()
                .describe("Comma-separated motion spec ids or names."),
        },
    }, async ({ page, ui, motions }) => {
        const motionList = motions
            .split(",")
            .map((value) => value.trim())
            .filter(Boolean)
            .join(", ");
        return {
            messages: [
                {
                    role: "user",
                    content: {
                        type: "text",
                        text: [
                            `Build a ${page}.`,
                            `First call get_vibe_combo with ui="${ui}" and motions=[${motionList.split(", ").map((m) => `"${m}"`).join(", ")}].`,
                            "Apply the returned UI tokens and motion parameters strictly.",
                            "Use Tailwind CSS and Framer Motion where applicable.",
                        ].join("\n"),
                    },
                },
            ],
        };
    });
    return server;
}
