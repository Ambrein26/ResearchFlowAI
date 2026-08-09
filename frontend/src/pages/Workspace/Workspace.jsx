import {
  ArrowLeft,
  FileText,
  Sparkles,
  Search,
  BookOpen,
  Lightbulb,
  Tag,
} from "lucide-react";

import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";

import api from "../../services/api";

function Workspace() {
  const { paperId } = useParams();

  const [paper, setPaper] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  // ============================================================
  // Fetch Paper
  // ============================================================

  useEffect(() => {
    const fetchPaper = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(`/api/papers/${paperId}`);

        if (response.data.success) {
          setPaper(response.data.paper);
        } else {
          setError("Unable to load this research paper.");
        }
      } catch (err) {
        console.error("Failed to fetch paper:", err);

        setError(
          err.response?.data?.detail ||
            "Unable to load this research paper."
        );
      } finally {
        setLoading(false);
      }
    };

    if (paperId) {
      fetchPaper();
    }
  }, [paperId]);

  // ============================================================
  // Loading
  // ============================================================

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <Sparkles
            size={40}
            className="animate-pulse text-indigo-600"
          />

          <p className="text-sm font-medium text-slate-600">
            Loading research workspace...
          </p>
        </div>
      </div>
    );
  }

  // ============================================================
  // Error
  // ============================================================

  if (error || !paper) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600">
          <FileText size={26} />
        </div>

        <h1 className="mt-5 text-xl font-bold text-slate-900">
          Unable to load paper
        </h1>

        <p className="mt-2 max-w-md text-sm text-slate-500">
          {error || "The requested research paper could not be found."}
        </p>

        <Link
          to="/papers"
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
        >
          <ArrowLeft size={17} />
          Back to Papers
        </Link>
      </div>
    );
  }

  // ============================================================
  // Paper Data
  // ============================================================

  const title =
    paper.title ||
    paper.filename ||
    "Untitled Research Paper";

  const authors = Array.isArray(paper.authors)
    ? paper.authors.join(", ")
    : paper.authors || "Unknown authors";

  const keywords = Array.isArray(paper.keywords)
    ? paper.keywords
    : [];

  const extractedText =
    paper.extracted_text ||
    paper.full_text ||
    paper.text ||
    "";

  const filteredText = search
    ? extractedText
        .split("\n")
        .filter((paragraph) =>
          paragraph
            .toLowerCase()
            .includes(search.toLowerCase())
        )
        .join("\n")
    : extractedText;

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ======================================================
          Header
      ====================================================== */}

      <header className="border-b border-slate-200 bg-white">

        <div className="flex items-center justify-between px-8 py-5">

          <div className="flex items-center gap-4">

            <Link
              to={`/analysis/${paperId}`}
              className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            >
              <ArrowLeft size={20} />
            </Link>

            <div>

              <div className="flex items-center gap-2">

                <BookOpen
                  size={18}
                  className="text-indigo-600"
                />

                <span className="text-sm font-medium text-slate-500">
                  Research Workspace
                </span>

              </div>

              <h1 className="mt-1 max-w-2xl truncate text-xl font-bold text-slate-900">
                {title}
              </h1>

            </div>

          </div>

          <Link
            to={`/analysis/${paperId}`}
            className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <Sparkles size={17} />
            View Analysis
          </Link>

        </div>

      </header>


      {/* ======================================================
          Main
      ====================================================== */}

      <main className="mx-auto max-w-7xl space-y-6 px-8 py-8">

        {/* Paper Information */}

        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-start">

            <div>

              <h2 className="text-lg font-bold text-slate-900">
                {title}
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                {authors}
              </p>

              <div className="mt-4 flex flex-wrap gap-2">

                <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600">
                  {paper.page_count || 0} pages
                </span>

                <span className="rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-700">
                  AI Analyzed
                </span>

              </div>

            </div>

          </div>

        </section>


        {/* ====================================================
            Search
        ==================================================== */}

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="relative">

            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              placeholder="Search within this paper..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />

          </div>

        </section>


        {/* ====================================================
            Workspace
        ==================================================== */}

        <div className="grid gap-6 lg:grid-cols-3">

          {/* Paper Content */}

          <section className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="flex items-center gap-3 border-b border-slate-200 pb-4">

              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                <FileText size={20} />
              </div>

              <div>

                <h2 className="font-bold text-slate-900">
                  Paper Content
                </h2>

                <p className="text-sm text-slate-500">
                  Extracted research paper text
                </p>

              </div>

            </div>

            <div className="mt-6 max-h-[650px] overflow-y-auto pr-3">

              {filteredText ? (

                <div className="whitespace-pre-wrap text-sm leading-7 text-slate-700">
                  {filteredText}
                </div>

              ) : (

                <div className="py-12 text-center">

                  <FileText
                    size={36}
                    className="mx-auto text-slate-300"
                  />

                  <p className="mt-4 text-sm text-slate-500">
                    No extracted paper text is available.
                  </p>

                </div>

              )}

            </div>

          </section>


          {/* Research Information */}

          <aside className="space-y-6">

            {/* AI Summary */}

            <section className="rounded-xl border border-indigo-100 bg-indigo-50 p-6">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600 text-white">
                  <Sparkles size={19} />
                </div>

                <h2 className="font-bold text-slate-900">
                  AI Summary
                </h2>

              </div>

              <p className="mt-4 text-sm leading-7 text-slate-700">
                {paper.tldr ||
                  paper.summary ||
                  "No AI summary is available."}
              </p>

            </section>


            {/* Keywords */}

            <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                  <Tag size={18} />
                </div>

                <h2 className="font-bold text-slate-900">
                  Keywords
                </h2>

              </div>

              <div className="mt-4 flex flex-wrap gap-2">

                {keywords.length > 0 ? (

                  keywords.map((keyword) => (
                    <span
                      key={keyword}
                      className="rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-700"
                    >
                      {keyword}
                    </span>
                  ))

                ) : (

                  <p className="text-sm text-slate-500">
                    No keywords available.
                  </p>

                )}

              </div>

            </section>


            {/* Research Insight */}

            <section className="rounded-xl border border-purple-100 bg-purple-50 p-6">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-600 text-white">
                  <Lightbulb size={19} />
                </div>

                <h2 className="font-bold text-slate-900">
                  Research Insight
                </h2>

              </div>

              <p className="mt-4 text-sm leading-7 text-slate-700">
                Use this workspace to review the paper,
                search important sections, and organize your
                research findings.
              </p>

            </section>

          </aside>

        </div>

      </main>

    </div>
  );
}

export default Workspace;