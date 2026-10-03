import * as cheerio from "cheerio";

export type PIBArticle = {
  title: string;
  description: string;
  content: string;
  publishedAt?: string;
};

export async function fetchPIBArticle(
  url: string
): Promise<PIBArticle> {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0",
    },
  });

  if (!response.ok) {
    throw new Error(
      `PIB request failed: ${response.status} ${response.statusText}`
    );
  }

  const html = await response.text();
  const $ = cheerio.load(html);

  const title =
    $('meta[property="og:title"]').attr("content")?.trim() ||
    $("title").text().trim();

  const description =
    $('meta[property="og:description"]')
      .attr("content")
      ?.trim() || "";

  /*
   * PIB currently renders the release body as HTML paragraphs.
   * We identify the paragraph content rather than storing the
   * entire page HTML.
   */
  const paragraphs: string[] = [];

  $("p").each((_, element) => {
    const text = $(element)
      .text()
      .replace(/\s+/g, " ")
      .trim();

    if (text.length > 40) {
      paragraphs.push(text);
    }
  });

  const content = Array.from(
    new Set(paragraphs)
  ).join("\n\n");

  if (!content) {
    throw new Error(
      "Could not extract PIB article body"
    );
  }

  return {
    title,
    description,
    content,
  };
}