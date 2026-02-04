import { describe, it, expect } from "vitest";
import { blocksToHtml } from "../blockParser";
import type { NotionBlock } from "../types";

const block = (
  type: string,
  richText: { plain_text: string }[]
): NotionBlock =>
  ({
    type,
    id: `id-${type}`,
    [type]: { rich_text: richText },
  }) as NotionBlock;

describe("blocksToHtml", () => {
  it("heading_1을 h1으로 변환한다", () => {
    const blocks: NotionBlock[] = [
      block("heading_1", [{ plain_text: "Title" }]),
    ];
    expect(blocksToHtml(blocks)).toBe("<h1>Title</h1>");
  });

  it("heading_2, heading_3을 h2, h3으로 변환한다", () => {
    const blocks: NotionBlock[] = [
      block("heading_2", [{ plain_text: "Section" }]),
      block("heading_3", [{ plain_text: "Sub" }]),
    ];
    expect(blocksToHtml(blocks)).toBe(
      "<h2>Section</h2><h3>Sub</h3>"
    );
  });

  it("paragraph를 p로 변환한다", () => {
    const blocks: NotionBlock[] = [
      block("paragraph", [{ plain_text: "Hello world." }]),
    ];
    expect(blocksToHtml(blocks)).toBe("<p>Hello world.</p>");
  });

  it("bulleted_list_item들을 ul/li로 묶어 변환한다", () => {
    const blocks: NotionBlock[] = [
      block("bulleted_list_item", [{ plain_text: "Item A" }]),
      block("bulleted_list_item", [{ plain_text: "Item B" }]),
    ];
    expect(blocksToHtml(blocks)).toBe(
      "<ul><li>Item A</li><li>Item B</li></ul>"
    );
  });

  it("혼합 블록을 올바른 HTML로 변환한다", () => {
    const blocks: NotionBlock[] = [
      block("heading_1", [{ plain_text: "Intro" }]),
      block("paragraph", [{ plain_text: "First paragraph." }]),
      block("bulleted_list_item", [{ plain_text: "One" }]),
      block("bulleted_list_item", [{ plain_text: "Two" }]),
      block("paragraph", [{ plain_text: "End." }]),
    ];
    expect(blocksToHtml(blocks)).toBe(
      "<h1>Intro</h1><p>First paragraph.</p><ul><li>One</li><li>Two</li></ul><p>End.</p>"
    );
  });

  it("특수 문자를 이스케이프한다", () => {
    const blocks: NotionBlock[] = [
      block("paragraph", [{ plain_text: "<script> & \"quotes\"" }]),
    ];
    expect(blocksToHtml(blocks)).toBe(
      "<p>&lt;script&gt; &amp; &quot;quotes&quot;</p>"
    );
  });

  it("빈 블록 배열은 빈 문자열을 반환한다", () => {
    expect(blocksToHtml([])).toBe("");
  });
});
