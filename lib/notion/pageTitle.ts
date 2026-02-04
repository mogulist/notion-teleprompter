type PageLike = { id: string; properties?: Record<string, unknown> };

function extractTitleFromProp(prop: unknown): string | null {
  if (!prop || typeof prop !== "object") return null;
  const obj = prop as Record<string, unknown>;
  if (Array.isArray(obj.title)) {
    const first = obj.title[0] as { plain_text?: string } | undefined;
    return first && typeof first.plain_text === "string"
      ? first.plain_text
      : null;
  }
  if (Array.isArray(obj.rich_text)) {
    const first = obj.rich_text[0] as { plain_text?: string } | undefined;
    return first && typeof first.plain_text === "string"
      ? first.plain_text
      : null;
  }
  return null;
}

export function getPageTitle(page: PageLike): string {
  const props = page.properties;
  if (!props || typeof props !== "object") return page.id;
  const keys = Object.keys(props);
  for (const key of ["title", "Title", "Name", "name", ...keys]) {
    const value = props[key];
    const title = extractTitleFromProp(value);
    if (title) return title;
  }
  return page.id;
}
