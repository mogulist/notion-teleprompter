import { NextResponse } from "next/server";
import { Client } from "@notionhq/client";
import { getNotionTokenFromRequest } from "@/lib/notion/cookies";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ databaseId: string }> }
) {
  const token = getNotionTokenFromRequest(_request);
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { databaseId } = await params;
  if (!databaseId) {
    return NextResponse.json(
      { error: "databaseId is required" },
      { status: 400 }
    );
  }

  const notion = new Client({ auth: token });
  try {
    const response = await notion.dataSources.query({
      data_source_id: databaseId,
      result_type: "page",
      page_size: 50,
    });
    return NextResponse.json(response);
  } catch (err) {
    console.error("Notion dataSources.query error:", err);
    return NextResponse.json(
      { error: "Failed to query database" },
      { status: 502 }
    );
  }
}
