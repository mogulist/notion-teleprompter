const NOTION_AUTHORIZE_URL = "https://api.notion.com/v1/oauth/authorize";

export function getNotionAuthorizationUrl(state?: string): string {
  const clientId = process.env.NOTION_CLIENT_ID;
  const redirectUri = process.env.NOTION_OAUTH_REDIRECT_URI;
  if (!clientId || !redirectUri) {
    return "/controller?error=config";
  }
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    owner: "user",
    ...(state && { state }),
  });
  return `${NOTION_AUTHORIZE_URL}?${params.toString()}`;
}
