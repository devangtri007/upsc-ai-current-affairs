import { supabase } from "../lib/supabase";
import { fetchPIBArticle } from "../lib/ingestion/pib";

async function enrichPIB() {
  console.log("Starting PIB enrichment...\n");

  const { data: articles, error } = await supabase
    .from("articles")
    .select(
      "id, title, source_name, source_url"
    )
    .eq("source_name", "Press Information Bureau")
    .is("source_content", null)
    .order("published_at", {
      ascending: false,
    })
    .limit(10);

  if (error) {
    console.error(
      "Failed to fetch PIB articles:",
      error.message
    );
    process.exit(1);
  }

  if (!articles || articles.length === 0) {
    console.log(
      "No PIB articles need enrichment."
    );
    return;
  }

  console.log(
    `Found ${articles.length} PIB articles.\n`
  );

  for (const article of articles) {
    console.log(`Enriching: ${article.title}`);

    try {
      const result = await fetchPIBArticle(
        article.source_url
      );

      const { error: updateError } =
        await supabase
          .from("articles")
          .update({
            source_content: result.content,
            description:
              result.description || null,
          })
          .eq("id", article.id);

      if (updateError) {
        console.error(
          "  Failed to update:",
          updateError.message
        );
        continue;
      }

      console.log(
        `  ✓ Extracted ${result.content.length} characters`
      );
    } catch (error) {
      console.error(
        "  ✗ Enrichment failed:",
        error
      );
    }
  }

  console.log("\nPIB enrichment complete.");
}

enrichPIB();