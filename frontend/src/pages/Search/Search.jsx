import {
  ArrowLeft,
  Search as SearchIcon,
  FileText,
  LoaderCircle,
  AlertCircle,
  X,
  ExternalLink,
} from "lucide-react";

import { Link } from "react-router-dom";
import { useState } from "react";

import api from "../../services/api";

function Search() {
  // ============================================================
  // State
  // ============================================================

  const [query, setQuery] = useState("");

  const [results, setResults] = useState([]);

  const [searched, setSearched] = useState(false);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  // ============================================================
  // Search Papers
  // ============================================================

  const handleSearch = async () => {
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      setError("Please enter something to search.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSearched(true);

      const response = await api.get("/api/papers/search", {
        params: {
          q: trimmedQuery,
        },
      });

      if (response.data.success) {
        setResults(
          response.data.results ||
            response.data.papers ||
            response.data.matches ||
            []
        );
      } else {
        setResults([]);
        setError("Unable to complete the search.");
      }
    } catch (err) {
      console.error("Search failed:", err);

      setResults([]);

      setError(
        err.response?.data?.detail ||
          "Unable to search your research papers."
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // Enter Key Search
  // ============================================================

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  // ============================================================
  // Clear Search
  // ============================================================

  const handleClear = () => {
    setQuery("");
    setResults([]);
    setSearched(false);
    setError("");
  };

  // ============================================================
  // Format Value
  // ============================================================

  const formatValue = (value) => {
    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {
      return null;
    }

    if (Array.isArray(value)) {
      if (value.length === 0) {
        return null;
      }

      return value.join(", ");
    }

    if (typeof value === "object") {
      return JSON.stringify(value);
    }

    return String(value);
  };

  // ============================================================
  // Get Result ID
  // ============================================================

  const getPaperId = (paper) => {
    return paper.id || paper.paper_id;
  };

  // ============================================================
  // Get Result Title
  // ============================================================

  const getPaperTitle = (paper) => {
    return (
      paper.title ||
      paper.filename ||
      "Untitled Research Paper"
    );
  };

  // ============================================================
  // Get Search Preview
  // ============================================================

  const getPreview = (paper) => {
    return (
      paper.match ||
      paper.matched_text ||
      paper.snippet ||
      paper.content ||
      paper.summary ||
      paper.tldr ||
      paper.research_problem ||
      "No matching content preview available."
    );
  };

  // ============================================================
  // Loading
  // ============================================================

  if (loading && !searched) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <LoaderCircle
            size={40}
            className="animate-spin text-indigo-600"
          />

          <p className="text-sm font-medium text-slate-600">
            Searching research papers...
          </p>
        </div>
      </div>
    );
  }

  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ======================================================
          Header
      ====================================================== */}

      <header className="border-b border-slate-200 bg-white">

        <div className="flex items-center gap-4 px-8 py-5">

          <Link
            to="/papers"
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
          >
            <ArrowLeft size={20} />
          </Link>

          <div>

            <div className="flex items-center gap-2">

              <SearchIcon
                size={18}
                className="text-indigo-600"
              />

              <span className="text-sm font-medium text-slate-500">
                Research Search
              </span>

            </div>

            <h1 className="mt-1 text-xl font-bold text-slate-900">
              Search Research Papers
            </h1>

          </div>

        </div>

      </header>


      {/* ======================================================
          Main
      ====================================================== */}

      <main className="mx-auto max-w-7xl space-y-6 px-8 py-8">

        {/* ====================================================
            Introduction
        ==================================================== */}

        <section className="rounded-2xl border border-indigo-100 bg-indigo-50 p-8">

          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-600 text-white">
            <SearchIcon size={21} />
          </div>

          <h2 className="mt-5 text-2xl font-bold text-slate-900">
            Search Your Research
          </h2>

          <p className="mt-3 max-w-2xl leading-7 text-slate-600">
            Search across your uploaded research papers using
            titles, summaries, keywords, methodologies,
            findings, research problems, and other analyzed
            content.
          </p>

        </section>


        {/* ====================================================
            Search Box
        ==================================================== */}

        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="flex flex-col gap-3 sm:flex-row">

            {/* Search Input */}

            <div className="relative flex-1">

              <SearchIcon
                size={19}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={query}
                onChange={(event) =>
                  setQuery(event.target.value)
                }
                onKeyDown={handleKeyDown}
                placeholder="Search papers, topics, methods, datasets..."
                className="w-full rounded-lg border border-slate-300 bg-white py-3 pl-11 pr-11 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />

              {query && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                  title="Clear search"
                >
                  <X size={17} />
                </button>
              )}

            </div>


            {/* Search Button */}

            <button
              type="button"
              onClick={handleSearch}
              disabled={loading || !query.trim()}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >

              {loading ? (
                <>
                  <LoaderCircle
                    size={17}
                    className="animate-spin"
                  />

                  Searching...
                </>
              ) : (
                <>
                  <SearchIcon size={17} />

                  Search
                </>
              )}

            </button>

          </div>


          <p className="mt-3 text-xs text-slate-400">
            Press Enter to search.
          </p>

        </section>


        {/* ====================================================
            Error
        ==================================================== */}

        {error && (
          <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">

            <AlertCircle
              size={18}
              className="mt-0.5 shrink-0"
            />

            <p>{error}</p>

          </div>
        )}


        {/* ====================================================
            Search Results
        ==================================================== */}

        {searched && !loading && !error && (
          <section className="space-y-4">

            {/* Results Header */}

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

              <div>

                <h2 className="text-lg font-bold text-slate-900">
                  Search Results
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {results.length === 0
                    ? "No papers matched your search."
                    : `${results.length} paper${
                        results.length === 1 ? "" : "s"
                      } found`}
                </p>

              </div>


              {results.length > 0 && (
                <div className="rounded-full bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700">
                  {results.length} result
                  {results.length === 1 ? "" : "s"}
                </div>
              )}

            </div>


            {/* ==================================================
                No Results
            ================================================== */}

            {results.length === 0 ? (

              <section className="rounded-xl border border-slate-200 bg-white p-10 text-center shadow-sm">

                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                  <SearchIcon size={25} />
                </div>

                <h3 className="mt-4 text-lg font-bold text-slate-900">
                  No matching papers
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                  We couldn't find any research papers matching
                  "{query}". Try a different keyword, topic,
                  method, or research term.
                </p>

              </section>

            ) : (

              /* ==================================================
                  Result Cards
              ================================================== */

              <div className="space-y-4">

                {results.map((paper, index) => {

                  const paperId = getPaperId(paper);

                  const title = getPaperTitle(paper);

                  const preview = getPreview(paper);

                  const authors = formatValue(
                    paper.authors
                  );

                  const keywords = formatValue(
                    paper.keywords
                  );

                  const methodology = formatValue(
                    paper.methodology
                  );

                  return (
                    <article
                      key={
                        paperId ||
                        `${title}-${index}`
                      }
                      className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-indigo-200 hover:shadow-md"
                    >

                      {/* ==================================================
                          Result Header
                      ================================================== */}

                      <div className="flex items-start gap-4">

                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                          <FileText size={21} />
                        </div>

                        <div className="min-w-0 flex-1">

                          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">

                            <div className="min-w-0">

                              <h3 className="text-base font-bold text-slate-900">
                                {title}
                              </h3>

                              {authors && (
                                <p className="mt-1 text-xs text-slate-500">
                                  {authors}
                                </p>
                              )}

                              {paper.filename &&
                                paper.title && (
                                  <p className="mt-1 text-xs text-slate-400">
                                    {paper.filename}
                                  </p>
                                )}

                            </div>


                            {/* Open Paper */}

                            {paperId && (
                              <Link
                                to={`/papers/${paperId}`}
                                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
                              >
                                Open Paper

                                <ExternalLink
                                  size={14}
                                />
                              </Link>
                            )}

                          </div>

                        </div>

                      </div>


                      {/* ==================================================
                          Matching Content
                      ================================================== */}

                      <div className="mt-5 rounded-lg bg-slate-50 p-4">

                        <div className="flex items-center gap-2">

                          <SearchIcon
                            size={15}
                            className="text-indigo-500"
                          />

                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Matching Content
                          </p>

                        </div>

                        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                          {preview}
                        </p>

                      </div>


                      {/* ==================================================
                          Metadata
                      ================================================== */}

                      <div className="mt-5 grid gap-4 md:grid-cols-3">

                        {/* Keywords */}

                        {keywords && (
                          <div>

                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                              Keywords
                            </p>

                            <p className="mt-1 text-sm leading-6 text-slate-600">
                              {keywords}
                            </p>

                          </div>
                        )}


                        {/* Methodology */}

                        {methodology && (
                          <div>

                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                              Methodology
                            </p>

                            <p className="mt-1 line-clamp-3 text-sm leading-6 text-slate-600">
                              {methodology}
                            </p>

                          </div>
                        )}


                        {/* Page Count */}

                        {paper.page_count !==
                          undefined &&
                          paper.page_count !== null && (
                            <div>

                              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                Pages
                              </p>

                              <p className="mt-1 text-sm font-medium text-slate-600">
                                {paper.page_count}
                              </p>

                            </div>
                          )}

                      </div>

                    </article>
                  );
                })}

              </div>

            )}

          </section>
        )}


        {/* ====================================================
            Initial State
        ==================================================== */}

        {!searched && !loading && (
          <section className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
              <SearchIcon size={28} />
            </div>

            <h2 className="mt-5 text-lg font-bold text-slate-900">
              Search your research library
            </h2>

            <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">
              Enter a keyword, research topic, methodology,
              dataset, algorithm, or finding to discover
              relevant papers from your uploaded collection.
            </p>

          </section>
        )}

      </main>

    </div>
  );
}

export default Search;