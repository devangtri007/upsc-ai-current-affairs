import { supabase } from "@/lib/supabase";

const topics = [
  "All",
  "#Polity",
  "#Economy",
  "#IR",
  "#Environment",
  "#S&T",
  "#Geography",
  "#Society",
  "#Security",
];

export default async function Home() {
  const { data: articles, error } = await supabase
    .from("articles")
    .select(`
      id,
      title,
      slug,
      description,
      source_name,
      relevance,
      relevance_score,
      gs_paper,
      article_topics (
        topics (
          name,
          hashtag
        )
      )
    `)
    .order("relevance_score", { ascending: false });

  if (error) {
    return (
      <main className="min-h-screen bg-slate-50 p-10">
        <h1 className="text-2xl font-bold">
          UPSC Lens
        </h1>

        <pre className="mt-6 rounded-xl bg-red-50 p-5 text-red-700">
          {JSON.stringify(error, null, 2)}
        </pre>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">

      {/* HEADER */}

      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">

          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              UPSC<span className="text-blue-600">Lens</span>
            </h1>

            <p className="text-sm text-slate-500">
              Current affairs, connected to the UPSC syllabus.
            </p>
          </div>

          <button className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800">
            Ask UPSC Lens
          </button>

        </div>
      </header>


      {/* HERO */}

      <section className="mx-auto max-w-7xl px-6 pb-8 pt-12">

        <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-blue-600">
          Today's Current Affairs
        </p>

        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">

          <div>

            <h2 className="text-4xl font-bold tracking-tight">
              What matters for UPSC today?
            </h2>

            <p className="mt-3 max-w-2xl text-slate-600">
              Curated from The Hindu, Indian Express, PIB and official
              government sources — then connected to the UPSC syllabus.
            </p>

          </div>

          <div className="text-sm text-slate-500">
            {new Date().toLocaleDateString("en-IN", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </div>

        </div>

      </section>


      {/* TOPICS */}

      <section className="mx-auto max-w-7xl px-6">

        <div className="flex gap-2 overflow-x-auto pb-6">

          {topics.map((topic, index) => (

            <button
              key={topic}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition ${
                index === 0
                  ? "bg-slate-900 text-white"
                  : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-100"
              }`}
            >
              {topic}
            </button>

          ))}

        </div>

      </section>


      {/* ARTICLES */}

      <section className="mx-auto max-w-7xl px-6 pb-16">

        <div className="mb-6 flex items-center justify-between">

          <div>

            <h3 className="text-xl font-bold">
              Today's important stories
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Ranked by UPSC relevance
            </p>

          </div>

          <span className="text-sm text-slate-500">
            {articles?.length ?? 0} stories
          </span>

        </div>


        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">

          {articles?.map((article) => (

            <article
              key={article.id}
              className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >

              {/* TOP */}

              <div className="mb-4 flex items-center justify-between">

                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold ${
                    article.relevance === "high"
                      ? "bg-red-50 text-red-600"
                      : "bg-amber-50 text-amber-600"
                  }`}
                >
                  {article.relevance?.toUpperCase()}
                </span>

                <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">
                  {article.gs_paper}
                </span>

              </div>


              {/* TITLE */}

              <h4 className="text-xl font-bold leading-snug group-hover:text-blue-600">
                {article.title}
              </h4>


              {/* DESCRIPTION */}

              <p className="mt-3 text-sm leading-6 text-slate-600">
                {article.description}
              </p>


              {/* TAGS */}

              <div className="mt-5 flex flex-wrap gap-2">

                {article.article_topics?.map((relation: any) => (

                  <span
                    key={relation.topics.hashtag}
                    className="rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700"
                  >
                    {relation.topics.hashtag}
                  </span>

                ))}

              </div>


              {/* SOURCE */}

              <div className="mt-6 flex items-center justify-between border-t pt-4">

                <div>

                  <p className="text-xs text-slate-400">
                    Source
                  </p>

                  <p className="text-sm font-semibold text-slate-700">
                    {article.source_name}
                  </p>

                </div>

                <a
                  href={`/news/${article.slug}`}
                  className="text-sm font-semibold text-blue-600 hover:text-blue-700"
                >
                  Explore →
                </a>

              </div>

            </article>

          ))}

        </div>

      </section>


      {/* FOOTER */}

      <footer className="border-t bg-white">

        <div className="mx-auto max-w-7xl px-6 py-8 text-center">

          <p className="text-sm text-slate-500">
            UPSC Lens uses The Hindu, Indian Express, PIB and
            official government sources.
          </p>

        </div>

      </footer>

    </main>
  );
}