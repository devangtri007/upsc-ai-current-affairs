import { supabase } from "../lib/supabase";
import { curateArticle } from "../lib/ai/curator";

async function curateNews() {
  console.log("Starting AI Curator...\n");

  const { data: articles, error } = await supabase
    .from("articles")
    .select(
      "id, title, description, source_content, source_name, source_url"
    )
    .is("relevance", null)
    .order("published_at", {
      ascending: false,
    })
    .limit(10);

  if (error) {
    console.error(
      "Failed to fetch articles:",
      error.message
    );
    process.exit(1);
  }

  if (!articles || articles.length === 0) {
    console.log("No uncurated articles found.");
    return;
  }

  console.log(
    `Found ${articles.length} articles to curate.\n`
  );

  for (const article of articles) {
    console.log(`Curating: ${article.title}`);

    try {
      const result = await curateArticle(article);

      console.log(
        `  Relevance: ${result.relevance} (${result.relevance_score}/10)`
      );
      console.log(
        `  GS: ${result.gs_paper}`
      );
      console.log(
        `  Topics: ${result.topics.join(", ")}`
      );

      const { error: updateError } = await supabase
        .from("articles")
        .update({
            relevance: result.relevance,
            relevance_score: result.relevance_score,
            gs_paper:
            result.gs_paper === "None"
            ? null
            : result.gs_paper,
            why_in_news: result.why_in_news,
            content: result.what_happened,
            prelims_relevance: result.prelims_relevance,
            mains_relevance: result.mains_relevance,
        })
        .eq("id", article.id);

      if (updateError) {
        console.error(
          "  Failed to update article:",
          updateError.message
        );
        continue;
      }
      // DELETE OLD TOPIC MAPPINGS HERE
      const { error: deleteError } = await supabase
        .from("article_topics")
        .delete()
        .eq("article_id", article.id);

      if (deleteError) {
        console.error(
            "  Failed to clear old topics:",
            deleteError.message
        );
        continue;
      }

      // THEN ADD THE NEW TOPIC MAPPINGS
      for (const topicName of result.topics) {
        const { data: topic, error: topicError } =
          await supabase
            .from("topics")
            .select("id")
            .eq("name", topicName)
            .single();

        if (topicError || !topic) {
          console.error(
            `  Topic not found: ${topicName}`
          );
          continue;
        }

        await supabase
          .from("article_topics")
          .upsert({
            article_id: article.id,
            topic_id: topic.id,
            confidence:
              result.relevance_score / 10,
          });
      }

      console.log("  ✓ Curated successfully\n");
    } catch (error) {
      console.error(
        "  ✗ Curator failed:",
        error
      );
    }
  }

  console.log("AI Curator complete.");
}

curateNews();