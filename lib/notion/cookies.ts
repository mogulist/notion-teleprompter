export const NOTION_TOKEN_COOKIE = "notion_access_token";

export function getNotionTokenFromRequest(request: Request): string | null {
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) return null;
  const match = cookieHeader.match(
    new RegExp(`${NOTION_TOKEN_COOKIE}=([^;]+)`)
  );
  return match ? decodeURIComponent(match[1]) : null;
}
