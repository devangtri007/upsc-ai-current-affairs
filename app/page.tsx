import { supabase } from "@/lib/supabase";

export default async function Home() {
  const { data: topics, error } = await supabase
    .from("topics")
    .select("*")
    .order("id");

  return (
    <main className="min-h-screen p-10">
      <h1 className="text-3xl font-bold">
        UPSC Lens Database Test
      </h1>

      {error && (
        <pre className="mt-6 rounded-lg bg-red-50 p-4 text-red-700">
          {JSON.stringify(error, null, 2)}
        </pre>
      )}

      <div className="mt-8 space-y-3">
        {topics?.map((topic) => (
          <div
            key={topic.id}
            className="rounded-lg border bg-white p-4"
          >
            <strong>{topic.name}</strong>

            <span className="ml-3 text-sm text-slate-500">
              {topic.hashtag}
            </span>

            <span className="ml-3 text-sm text-blue-600">
              {topic.gs_paper}
            </span>
          </div>
        ))}
      </div>
    </main>
  );
}