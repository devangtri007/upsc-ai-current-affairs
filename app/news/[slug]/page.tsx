import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;

  const { data: article, error } = await supabase
    .from("articles")
    .select(`
      id,
      title,
      slug,
      description,
      content,
      source_name,
      source_url,
      published_at,
      relevance,
      relevance_score,
      gs_paper,
      why_in_news,
      article_topics (
        topics (
          name,
          hashtag,
          gs_paper
        )
      )
    `)
    .eq("slug", slug)
    .single();

  if (error || !article) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">

      {/* HEADER */}

      <header className="border-b bg-white">

        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">

          <Link
            href="/"
            className="text-2xl font-bold tracking-tight"
          >
            UPSC<span className="text-blue-600">Lens</span>
          </Link>

          <Link
            href="/"
            className="text-sm font-medium text-slate-500 hover:text-slate-900"
          >
            ← Today's Current Affairs
          </Link>

        </div>

      </header>


      {/* ARTICLE */}

      <article className="mx-auto max-w-5xl px-6 py-12">

        {/* TAGS */}

        <div className="flex flex-wrap gap-2">

          {article.article_topics?.map((relation: any) => (

            <span
              key={relation.topics.hashtag}
              className="rounded-md bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700"
            >
              {relation.topics.hashtag}
            </span>

          ))}

        </div>


        {/* TITLE */}

        <h1 className="mt-6 max-w-4xl text-4xl font-bold leading-tight tracking-tight md:text-5xl">
          {article.title}
        </h1>


        {/* META */}

        <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-slate-500">

          <span>
            Source:
            <strong className="ml-1 text-slate-700">
              {article.source_name}
            </strong>
          </span>

          <span>•</span>

          <span>
            {article.gs_paper}
          </span>

          <span>•</span>

          <span>
            UPSC relevance:
            <strong
              className={`ml-1 ${
                article.relevance === "high"
                  ? "text-red-600"
                  : "text-amber-600"
              }`}
            >
              {article.relevance?.toUpperCase()}
            </strong>
          </span>

        </div>


        {/* DIVIDER */}

        <div className="my-10 border-t" />


        {/* WHY IN NEWS */}

        <section>

          <div className="mb-4 flex items-center gap-3">

            <div className="h-7 w-1 rounded-full bg-blue-600" />

            <h2 className="text-2xl font-bold">
              Why is this in the news?
            </h2>

          </div>

          <p className="max-w-4xl text-lg leading-8 text-slate-700">
            {article.why_in_news}
          </p>

        </section>


        {/* WHAT HAPPENED */}

        <section className="mt-12">

          <h2 className="text-2xl font-bold">
            What happened?
          </h2>

          <p className="mt-4 max-w-4xl text-lg leading-8 text-slate-700">
            {article.content}
          </p>

        </section>


        {/* UPSC CONNECTION */}

        <section className="mt-12 rounded-2xl border bg-white p-7 shadow-sm">

          <h2 className="text-2xl font-bold">
            UPSC Connection
          </h2>

          <p className="mt-2 text-slate-500">
            This topic can be approached through multiple UPSC dimensions.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-2">

            <div className="rounded-xl bg-slate-50 p-5">

              <p className="text-sm font-semibold text-blue-600">
                PRIMARY GS PAPER
              </p>

              <p className="mt-2 text-2xl font-bold">
                {article.gs_paper}
              </p>

            </div>


            <div className="rounded-xl bg-slate-50 p-5">

              <p className="text-sm font-semibold text-blue-600">
                UPSC RELEVANCE SCORE
              </p>

              <p className="mt-2 text-2xl font-bold">
                {article.relevance_score}/10
              </p>

            </div>

          </div>

        </section>


        {/* TOPICS */}

        <section className="mt-12">

          <h2 className="text-2xl font-bold">
            Related UPSC Topics
          </h2>

          <div className="mt-5 grid gap-4 md:grid-cols-2">

            {article.article_topics?.map((relation: any) => (

              <div
                key={relation.topics.hashtag}
                className="rounded-xl border bg-white p-5"
              >

                <p className="font-semibold">
                  {relation.topics.name}
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  {relation.topics.gs_paper}
                </p>

              </div>

            ))}

          </div>

        </section>


        {/* SOURCE */}

        <section className="mt-12 rounded-2xl border bg-white p-7">

          <h2 className="text-2xl font-bold">
            Source
          </h2>

          <p className="mt-2 text-slate-500">
            UPSC Lens uses approved sources and preserves source
            traceability.
          </p>

          <a
            href={article.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Read original source →
          </a>

        </section>


        {/* FUTURE AI SECTION */}

        <section className="mt-12 rounded-2xl border border-blue-100 bg-blue-50 p-7">

          <p className="text-sm font-bold uppercase tracking-wider text-blue-600">
            Coming next
          </p>

          <h2 className="mt-2 text-2xl font-bold">
            AI-powered UPSC analysis
          </h2>

          <p className="mt-3 max-w-3xl leading-7 text-slate-600">
            This section will connect the article to the UPSC syllabus,
            previous year questions, important concepts and possible
            examination questions.
          </p>

          <div className="mt-6 grid gap-3 md:grid-cols-3">

            <div className="rounded-xl bg-white p-4">
              <p className="font-semibold">
                AI Curator
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Analyse relevance
              </p>
            </div>

            <div className="rounded-xl bg-white p-4">
              <p className="font-semibold">
                UPSC Mapper
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Connect syllabus & PYQs
              </p>
            </div>

            <div className="rounded-xl bg-white p-4">
              <p className="font-semibold">
                AI Examiner
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Generate practice
              </p>
            </div>

          </div>

        </section>

      </article>

    </main>
  );
}