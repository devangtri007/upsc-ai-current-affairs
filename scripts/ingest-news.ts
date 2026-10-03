import { fetchRSSFeed } from "../lib/ingestion/rss";
import { NEWS_SOURCES } from "../lib/ingestion/sources";
import { supabase } from "../lib/supabase";

async function ingestNews() {
  console.log("Starting news ingestion...\n");

  for (const source of NEWS_SOURCES) {
    if (!source.active) {
      continue;
    }

    console.log(`Fetching: ${source.name}`);

    try {
      const articles = await fetchRSSFeed(source.feedUrl);

      console.log(
        `Found ${articles.length} articles`
      );

      for (const article of articles) {
        if (!article.url) {
          continue;
        }

        /*
         * Check whether this article already exists.
         */

        const { data: existing } = await supabase
          .from("articles")
          .select("id")
          .eq("source_url", article.url)
          .maybeSingle();

        if (existing) {
          console.log(`Skipping duplicate: ${article.title}`);
          continue;
        }

        /*
         * Insert basic metadata.
         *
         * AI analysis will happen later.
         */

        const { error } = await supabase
          .from("articles")
          .insert({
            title: article.title,
            slug: createSlug(article.title),
            description: article.description || null,
            content: null,

            source_name: source.name,
            source_url: article.url,

            published_at:
              article.publishedAt || null,

            relevance: null,
            relevance_score: null,
            gs_paper: null,
            why_in_news: null,
          });

        if (error) {
          console.error(
            `Failed to insert: ${article.title}`,
            error.message
          );

          continue;
        }

        console.log(`✓ Added: ${article.title}`);
      }

      console.log("");
    } catch (error) {
      console.error(
        `Failed to fetch ${source.name}`,
        error
      );
    }
  }

  console.log("News ingestion complete.");
}


function createSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 120);
}


ingestNews();