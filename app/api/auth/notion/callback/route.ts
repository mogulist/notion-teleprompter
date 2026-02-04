import { NextResponse } from "next/server";
import { Client } from "@notionhq/client";
import { NOTION_TOKEN_COOKIE } from "@/lib/notion/cookies";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const redirectUri = process.env.NOTION_OAUTH_REDIRECT_URI;
  const clientId = process.env.NOTION_CLIENT_ID;
  const clientSecret = process.env.NOTION_CLIENT_SECRET;

  if (error) {
    return NextResponse.redirect(
      new URL(`/controller?error=${encodeURIComponent(error)}`, request.url)
    );
  }

  if (!code || !redirectUri || !clientId || !clientSecret) {
    return NextResponse.redirect(
      new URL("/controller?error=missing_params", request.url)
    );
  }

  const notion = new Client();
  let tokenResponse;
  try {
    tokenResponse = await notion.oauth.token({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
    });
  } catch {
    return NextResponse.redirect(
      new URL("/controller?error=token_exchange_failed", request.url)
    );
  }

  const response = NextResponse.redirect(
    new URL("/controller", request.url)
  );
  response.cookies.set(NOTION_TOKEN_COOKIE, tokenResponse.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });
  return response;
}
