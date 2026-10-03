import Parser from "rss-parser";

const parser = new Parser();

export type ParsedArticle = {
  title: string;
  url: string;
  description?: string;
  publishedAt?: string;
};

export async function fetchRSSFeed(
  feedUrl: string
): Promise<ParsedArticle[]> {
  const feed = await parser.parseURL(feedUrl);

  return feed.items.map((item) => ({
    title: item.title?.trim() || "Untitled",
    url: item.link || "",
    description: item.contentSnippet || item.content || "",
    publishedAt: item.isoDate || item.pubDate,
  }));
}