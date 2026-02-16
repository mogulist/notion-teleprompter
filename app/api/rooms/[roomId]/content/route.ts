import { NextResponse } from "next/server";
import { getRoomContent, setRoomContent } from "@/lib/rooms/store";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ roomId: string }> }
) {
  const { roomId } = await params;
  if (!roomId) {
    return NextResponse.json(
      { error: "roomId is required" },
      { status: 400 }
    );
  }
  const html = getRoomContent(roomId);
  return NextResponse.json({ html: html ?? "" });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ roomId: string }> }
) {
  const { roomId } = await params;
  if (!roomId) {
    return NextResponse.json(
      { error: "roomId is required" },
      { status: 400 }
    );
  }
  let body: { html?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }
  const html = typeof body.html === "string" ? body.html : "";
  setRoomContent(roomId, html);
  return NextResponse.json({ ok: true });
}
