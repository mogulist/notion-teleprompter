export type NotionRichTextItem = {
  plain_text?: string;
  type?: string;
};

export type NotionBlockContent = {
  rich_text?: NotionRichTextItem[];
};

export type NotionBlock = {
  type: string;
  id: string;
  [key: string]: unknown;
};
