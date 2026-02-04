import type { NotionBlock, NotionRichTextItem } from "./types";

type NotionBlockContent = { rich_text?: NotionRichTextItem[] };

function getBlockRichText(block: NotionBlock): NotionRichTextItem[] {
  const typeKey =
    block.type === "heading_1"
      ? "heading_1"
      : block.type === "heading_2"
        ? "heading_2"
        : block.type === "heading_3"
          ? "heading_3"
          : block.type === "paragraph"
            ? "paragraph"
            : block.type === "bulleted_list_item"
              ? "bulleted_list_item"
              : null;
  if (!typeKey || !(block[typeKey] && typeof block[typeKey] === "object")) {
    return [];
  }
  const content = block[typeKey] as NotionBlockContent;
  return content.rich_text ?? [];
}

function richTextToPlain(richText: NotionRichTextItem[]): string {
  return richText
    .map((item) => (typeof item.plain_text === "string" ? item.plain_text : ""))
    .join("");
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function blocksToHtml(blocks: NotionBlock[]): string {
  const parts: string[] = [];
  let ulBuffer: string[] = [];

  const flushUl = () => {
    if (ulBuffer.length > 0) {
      const items = ulBuffer
        .map((text) => `<li>${escapeHtml(text)}</li>`)
        .join("");
      parts.push(`<ul>${items}</ul>`);
      ulBuffer = [];
    }
  };

  for (const block of blocks) {
    const text = richTextToPlain(getBlockRichText(block));
    switch (block.type) {
      case "heading_1":
        flushUl();
        parts.push(`<h1>${escapeHtml(text)}</h1>`);
        break;
      case "heading_2":
        flushUl();
        parts.push(`<h2>${escapeHtml(text)}</h2>`);
        break;
      case "heading_3":
        flushUl();
        parts.push(`<h3>${escapeHtml(text)}</h3>`);
        break;
      case "paragraph":
        flushUl();
        parts.push(`<p>${escapeHtml(text)}</p>`);
        break;
      case "bulleted_list_item":
        ulBuffer.push(text);
        break;
      default:
        flushUl();
        if (text) parts.push(`<p>${escapeHtml(text)}</p>`);
    }
  }
  flushUl();
  return parts.join("");
}
