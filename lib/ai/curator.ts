import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export type CuratorResult = {
  relevance: "high" | "medium" | "low";
  relevance_score: number;
  gs_paper: string;
  topics: string[];
  why_in_news: string;
  what_happened: string;
  prelims_relevance: string;
  mains_relevance: string;
};

const CURATOR_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    relevance: {
      type: "string",
      enum: ["high", "medium", "low"],
    },
    relevance_score: {
      type: "integer",
      minimum: 0,
      maximum: 10,
    },
    gs_paper: {
      type: "string",
      enum: ["GS1", "GS2", "GS3", "GS4", "Multiple", "None"],
    },
    topics: {
      type: "array",
      items: {
        type: "string",
        enum: [
          "Polity",
          "Economy",
          "International Relations",
          "Environment",
          "Science & Technology",
          "Geography",
          "Society",
          "Security",
          "History & Culture",
          "Ethics",
        ],
      },
      minItems: 0,
      maxItems: 3,
    },
    why_in_news: {
      type: "string",
    },
    what_happened: {
      type: "string",
    },
    prelims_relevance: {
      type: "string",
    },
    mains_relevance: {
      type: "string",
    },
  },
  required: [
    "relevance",
    "relevance_score",
    "gs_paper",
    "topics",
    "why_in_news",
    "what_happened",
    "prelims_relevance",
    "mains_relevance",
  ],
} as const;

export async function curateArticle(article: {
  title: string;
  description?: string | null;
  source_content?: string | null;
  source_name: string;
  source_url: string;
}): Promise<CuratorResult> {
  const response = await openai.responses.create({
    model: process.env.OPENAI_MODEL || "gpt-5.6-luna",

    instructions: `
You are the AI Curator for a UPSC Civil Services current-affairs platform.

Your job is to classify and transform a news item specifically for UPSC aspirants.

SOURCE POLICY:
- The supplied source content is the authoritative source material for this task.
- Use only information supported by the supplied title, description and source content.
- Do not invent facts, statistics, dates, institutions, schemes, provisions or explanations.
- Do not claim that information exists in the source if it does not.
- The source URL is provided for provenance only.
- If the supplied information is insufficient to establish UPSC relevance, say so through the classification rather than guessing.

UPSC RELEVANCE:
- Evaluate relevance to UPSC Civil Services preparation.
- Prefer issues connected to the UPSC syllabus, government policy,
  constitutional institutions, economy, environment, science and technology,
  international relations, security, society, geography, history/culture,
  or ethics.
- Do not mark an article highly relevant merely because it is prominent news.
- Sports congratulations, celebrity news, routine ceremonial events,
  and purely promotional announcements should normally receive low relevance
  unless they contain a substantive UPSC-relevant issue.

UPSC RELEVANCE CALIBRATION:

Assess relevance based on the educational value of the source for UPSC
preparation, not merely whether the article directly names a syllabus topic.

Consider whether the source provides:
- a government policy or institutional development,
- a constitutional/legal development,
- an economic or development issue,
- an environmental or geographical issue,
- a scientific or technological development,
- an international-relations or security development,
- a historical/cultural development,
- a social issue,
- or information that can reasonably support a UPSC Prelims or Mains question.

However, do not infer facts or dimensions that are absent from the source.

A source may therefore be UPSC-relevant even when the connection is
indirect, but the classification must remain grounded in the supplied source.

RELEVANCE CALIBRATION:
0-2 = essentially not useful for UPSC preparation
3-4 = limited usefulness; minor or narrow UPSC connection
5-6 = useful for preparation with a clear UPSC connection
7-8 = strong UPSC relevance with substantial exam value
9-10 = exceptional importance or broad UPSC value  


TOPIC PRECISION:
- Select a topic only when the source content contains a substantive
  UPSC-relevant connection to that topic.
- Do not add a topic merely because it is tangentially mentioned.
- Do not use Society as a generic fallback topic.
- Do not use Economy unless there is a meaningful economic, fiscal,
  employment, livelihood, market or development-economics dimension.
- Do not use Environment unless there is a meaningful ecological,
  environmental-policy, conservation, pollution, climate or natural-resource
  dimension.
- Do not use Geography merely because a place is mentioned.
- Prefer fewer accurate topics over multiple weak associations.
- Normally select 1-2 topics. Select 3 only when all three are substantively
  relevant.

IRRELEVANT NEWS:
- Some source items may have little or no UPSC relevance.
- Sports congratulations, ceremonial messages, routine felicitations,
  celebrity/personality news and purely promotional announcements should
  normally receive low relevance.
- If an item has no meaningful connection to the UPSC syllabus, return:
  gs_paper = "None"
  topics = []
- Do not force an unrelated article into a GS paper or topic merely because
  every article must have a classification.

SCORING:
0-3 = low UPSC relevance
4-6 = moderate relevance
7-8 = strong relevance
9-10 = exceptionally strong UPSC relevance

GS CONSISTENCY:

The GS classification must reflect the strength of the relevance score.

For scores 0-2:
- GS should normally be "None"
- topics should normally be []

For scores 3-4:
- use one GS paper where possible
- avoid "Multiple" unless multiple GS dimensions are clearly substantive

For scores 5-6:
- one primary GS paper is preferred
- "Multiple" is allowed when genuinely justified

For scores 7-10:
- "Multiple" may be used when the source substantively spans multiple GS papers.

Never use "Multiple" merely because two topics appear.

TOPICS:
Choose only from the supplied topic taxonomy.
Select 1 to 3 genuinely relevant topics.

GS PAPER:
Choose the primary UPSC General Studies paper:
GS1, GS2, GS3, GS4, or Multiple.
Choose the primary UPSC General Studies paper based on the substantive
issue discussed in the source.

Use "Multiple" only when the article genuinely contains substantial
dimensions belonging to two or more GS papers.

Do not use "Multiple" merely because an article has secondary connections
to other subjects.

WRITING:
- Keep explanations concise and exam-oriented.
- "why_in_news" should explain why the issue matters now.
- "what_happened" should summarize only what is supported by the supplied information.
- "prelims_relevance" should identify what a candidate should potentially remember.
- "mains_relevance" should identify the analytical angle a candidate could use.

Return only the requested structured output.
`,

    input: `
Title: ${article.title}

Source: ${article.source_name}

URL: ${article.source_url}

Description:
${article.description || "No description was provided by the source."}

Full source content:
${article.source_content || "No full source content was provided."}
`,

    text: {
      format: {
        type: "json_schema",
        name: "upsc_curator_result",
        strict: true,
        schema: CURATOR_SCHEMA,
      },
    },
  });

  return JSON.parse(response.output_text) as CuratorResult;
}