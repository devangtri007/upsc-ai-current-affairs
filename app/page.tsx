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

const articles = [
  {
    title: "Critical Minerals and India's Strategic Supply Chains",
    description:
      "Why critical minerals matter for India's energy transition, manufacturing and strategic autonomy.",
    tags: ["#Economy", "#Environment", "#IR"],
    relevance: "HIGH",
    source: "PIB",
    gs: "GS III",
  },
  {
    title: "India's Renewable Energy Transition",
    description:
      "Recent developments in renewable energy, grid infrastructure and India's climate commitments.",
    tags: ["#Environment", "#Economy"],
    relevance: "HIGH",
    source: "The Hindu",
    gs: "GS III",
  },
  {
    title: "India and the Changing Global Order",
    description:
      "Understanding recent developments in India's foreign policy and their implications.",
    tags: ["#IR", "#Polity"],
    relevance: "MEDIUM",
    source: "Indian Express",
    gs: "GS II",
  },
  {
    title: "New Developments in India's Space Programme",
    description:
      "Important developments in India's space programme and their relevance to science and technology.",
    tags: ["#S&T", "#Economy"],
    relevance: "HIGH",
    source: "ISRO",
    gs: "GS III",
  },
  {
    title: "Constitutional Developments and Governance",
    description:
      "Recent developments relating to constitutional governance and institutional functioning.",
    tags: ["#Polity", "#Governance"],
    relevance: "HIGH",
    source: "Indian Express",
    gs: "GS II",
  },
  {
    title: "Biodiversity Conservation in India",
    description:
      "Important developments in India's biodiversity and conservation framework.",
    tags: ["#Environment", "#Geography"],
    relevance: "MEDIUM",
    source: "PIB",
    gs: "GS III",
  },
];

export default function Home() {
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
            3 October 2026
          </div>

        </div>

      </section>


      {/* TOPIC FILTERS */}
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


      {/* MAIN CONTENT */}
      <section className="mx-auto max-w-7xl px-6 pb-16">

        <div className="mb-6 flex items-center justify-between">

          <div>
            <h3 className="text-xl font-bold">
              Today's important stories
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              AI-ranked by UPSC relevance
            </p>
          </div>

          <span className="text-sm text-slate-500">
            {articles.length} stories
          </span>

        </div>


        {/* ARTICLE GRID */}
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">

          {articles.map((article) => (

            <article
              key={article.title}
              className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >

              {/* TOP ROW */}
              <div className="mb-4 flex items-center justify-between">

                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold ${
                    article.relevance === "HIGH"
                      ? "bg-red-50 text-red-600"
                      : "bg-amber-50 text-amber-600"
                  }`}
                >
                  {article.relevance}
                </span>

                <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">
                  {article.gs}
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

                {article.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700"
                  >
                    {tag}
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
                    {article.source}
                  </p>
                </div>

                <button className="text-sm font-semibold text-blue-600 hover:text-blue-700">
                  Explore →
                </button>

              </div>

            </article>

          ))}

        </div>

      </section>


      {/* FOOTER */}
      <footer className="border-t bg-white">

        <div className="mx-auto max-w-7xl px-6 py-8 text-center">

          <p className="text-sm text-slate-500">
            UPSC Lens uses approved sources including The Hindu, Indian
            Express, PIB and official government websites.
          </p>

        </div>

      </footer>

    </main>
  );
}