import { NextResponse } from "next/server";
import { Client } from "@notionhq/client";
import { getNotionTokenFromRequest } from "@/lib/notion/cookies";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ blockId: string }> }
) {
  const token = getNotionTokenFromRequest(request);
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { blockId } = await params;
  if (!blockId) {
    return NextResponse.json(
      { error: "blockId is required" },
      { status: 400 }
    );
  }

  const { searchParams } = new URL(request.url);
  const recursive = searchParams.get("recursive") === "true";

  const notion = new Client({ auth: token });

  type BlockResult = Awaited<
    ReturnType<Client["blocks"]["children"]["list"]>
  >["results"][number];

  const fetchBlockChildren = async (
    id: string,
    startCursor?: string
  ): Promise<BlockResult[]> => {
    const response = await notion.blocks.children.list({
      block_id: id,
      start_cursor: startCursor ?? undefined,
      page_size: 100,
    });
    let results = [...response.results];
    if (response.has_more && response.next_cursor) {
      const more = await fetchBlockChildren(id, response.next_cursor);
      results = results.concat(more);
    }
    return results;
  };

  const flattenRecursive = async (
    id: string
  ): Promise<BlockResult[]> => {
    const children = await fetchBlockChildren(id);
    const out: BlockResult[] = [];
    for (const block of children) {
      out.push(block);
      if ("has_children" in block && block.has_children) {
        const nested = await flattenRecursive(block.id);
        out.push(...nested);
      }
    }
    return out;
  };

  try {
    const results = recursive
      ? await flattenRecursive(blockId)
      : await fetchBlockChildren(blockId);
    return NextResponse.json({ results });
  } catch (err) {
    console.error("Notion blocks.children.list error:", err);
    return NextResponse.json(
      { error: "Failed to fetch block children" },
      { status: 502 }
    );
  }
}
