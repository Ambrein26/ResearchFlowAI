import {
  AlertCircle,
  ArrowLeft,
  Check,
  FileText,
  Lightbulb,
  LoaderCircle,
  Sparkles,
  Trash2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";

import api from "../../services/api";

const MIN_PAPERS = 2;
const MAX_PAPERS = 6;

function getErrorMessage(error, fallback) {
  const status = error.response?.status;
  const detail = error.response?.data?.detail;

  if (status === 401) return "Your session has expired. Please sign in again.";
  if (status === 404) return "One or more selected papers or saved results could not be found.";
  if (status === 400) return typeof detail === "string" ? detail : "Please check your paper selection.";
  if (status === 429) return "The AI service is rate-limited. Please try again shortly.";
  if (status === 502) return "The AI service is temporarily unavailable. Please try again.";
  if (status >= 500) return "The research-gap service is temporarily unavailable.";
  if (!error.response) return "Network error. Check your connection and try again.";
  return typeof detail === "string" ? detail : fallback;
}

function ResearchGapFinder() {
  const [papers, setPapers] = useState([]);
  const [savedResults, setSavedResults] = useState([]);
  const [selectedPaperIds, setSelectedPaperIds] = useState([]);
  const [selectedResultId, setSelectedResultId] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingSaved, setLoadingSaved] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const restoreResult = useCallback((savedResult, availablePapers) => {
    if (!savedResult) {
      setSelectedResultId("");
      setResult(null);
      return;
    }

    const availableIds = new Set(availablePapers.map((paper) => String(paper.id)));
    const restoredIds = (savedResult.paper_ids || [])
      .map(String)
      .filter((paperId) => availableIds.has(paperId));

    setSelectedResultId(String(savedResult.id));
    setSelectedPaperIds(restoredIds);
    setResult(savedResult.result || null);
  }, []);

  const loadPageData = useCallback(async () => {
    setError("");
    setLoading(true);
    setLoadingSaved(true);

    try {
      const [papersResponse, resultsResponse] = await Promise.all([
        api.get("/api/papers"),
        api.get("/api/research-gaps"),
      ]);

      const availablePapers = papersResponse.data.papers || [];
      const saved = resultsResponse.data.results || [];
      setPapers(availablePapers);
      setSavedResults(saved);

      const latest = saved[0];
      if (latest && latest.paper_ids?.length >= MIN_PAPERS) {
        restoreResult(latest, availablePapers);
      }
    } catch (loadError) {
      setError(getErrorMessage(loadError, "Unable to load research-gap data."));
    } finally {
      setLoading(false);
      setLoadingSaved(false);
    }
  }, [restoreResult]);

  useEffect(() => {
    let cancelled = false;

    Promise.resolve().then(() => {
      if (!cancelled) {
        loadPageData();
      }
    });

    return () => {
      cancelled = true;
    };
  }, [loadPageData]);

  const togglePaper = (paperId) => {
    setError("");
    setSelectedResultId("");
    setResult(null);

    setSelectedPaperIds((current) => {
      if (current.includes(paperId)) {
        return current.filter((id) => id !== paperId);
      }

      if (current.length >= MAX_PAPERS) {
        setError("You can select a maximum of 6 papers.");
        return current;
      }

      return [...current, paperId];
    });
  };

  const handleSelectSavedResult = (savedResult) => {
    setError("");
    restoreResult(savedResult, papers);
  };

  const handleGenerate = async () => {
    if (generating) return;

    if (selectedPaperIds.length < MIN_PAPERS) {
      setError("Select 2 to 6 papers to identify research gaps.");
      return;
    }

    try {
      setGenerating(true);
      setError("");

      const response = await api.post("/api/research-gaps", {
        paper_ids: selectedPaperIds,
      });
      const savedResult = response.data.result;

      if (!savedResult?.result) {
        throw new Error("The research-gap response was empty.");
      }

      setResult(savedResult.result);
      setSelectedResultId(String(savedResult.id));
      setSavedResults((current) => [
        savedResult,
        ...current.filter((item) => String(item.id) !== String(savedResult.id)),
      ]);
    } catch (generationError) {
      setError(getErrorMessage(generationError, "Unable to identify research gaps."));
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedResultId || deleting) return;
    if (!window.confirm("Delete this saved research-gap result? Your papers will not be deleted.")) return;

    try {
      setDeleting(true);
      setError("");
      await api.delete(`/api/research-gaps/${selectedResultId}`);

      const remaining = savedResults.filter(
        (item) => String(item.id) !== String(selectedResultId)
      );
      setSavedResults(remaining);
      setSelectedResultId("");
      setResult(null);
    } catch (deleteError) {
      setError(getErrorMessage(deleteError, "Unable to delete the saved result."));
    } finally {
      setDeleting(false);
    }
  };

  const selectedSet = new Set(selectedPaperIds.map(String));
  const hasEnoughPapers = selectedPaperIds.length >= MIN_PAPERS;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-4 text-slate-600 dark:text-slate-300">
          <LoaderCircle size={38} className="animate-spin text-indigo-600" />
          <p className="text-sm font-medium">Loading research-gap workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-4 px-6 py-5 lg:px-8">
          <Link
            to="/dashboard"
            aria-label="Back to dashboard"
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-100"
          >
            <ArrowLeft size={20} />
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600 text-white">
              <Lightbulb size={21} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-indigo-600">Research synthesis</p>
              <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">AI Research Gap Finder</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-5 py-6 lg:px-8 lg:py-8">
        {error && (
          <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-500/10 dark:text-red-300">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <section className="rounded-2xl border border-indigo-100 bg-indigo-50 p-6 dark:border-indigo-900 dark:bg-indigo-500/10 lg:p-8">
          <div className="flex items-start gap-4">
            <Sparkles className="mt-1 shrink-0 text-indigo-600 dark:text-indigo-300" size={22} />
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Find supported research gaps</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-300">
                Select papers from your workspace and identify evidence-backed gaps, why they matter, and realistic directions for future research.
              </p>
            </div>
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="font-bold text-slate-900 dark:text-slate-100">Select papers</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Select 2 to 6 papers to identify research gaps.</p>
              </div>
              <span className="rounded-full bg-indigo-50 px-3 py-1.5 text-sm font-semibold text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300">
                {selectedPaperIds.length} / {MAX_PAPERS} selected
              </span>
            </div>

            {papers.length === 0 ? (
              <div className="mt-6 rounded-xl border border-dashed border-slate-300 p-8 text-center dark:border-slate-700">
                <FileText size={34} className="mx-auto text-slate-400" />
                <h3 className="mt-3 font-semibold text-slate-900 dark:text-slate-100">No papers available</h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Analyze a paper before looking for research gaps.</p>
                <Link to="/papers" className="mt-4 inline-flex rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700">Go to My Papers</Link>
              </div>
            ) : (
              <div className="mt-6 grid gap-3 md:grid-cols-2">
                {papers.map((paper) => {
                  const paperId = String(paper.id);
                  const selected = selectedSet.has(paperId);
                  const disabled = !selected && selectedPaperIds.length >= MAX_PAPERS;
                  return (
                    <button
                      key={paper.id}
                      type="button"
                      disabled={disabled}
                      onClick={() => togglePaper(paperId)}
                      aria-pressed={selected}
                      className={`relative rounded-xl border p-4 text-left transition ${selected ? "border-indigo-500 bg-indigo-50 ring-2 ring-indigo-100 dark:border-indigo-400 dark:bg-indigo-500/10 dark:ring-indigo-900" : "border-slate-200 hover:border-indigo-300 hover:bg-slate-50 dark:border-slate-700 dark:hover:border-indigo-700 dark:hover:bg-slate-800"} ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
                    >
                      <span className={`absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full border ${selected ? "border-indigo-600 bg-indigo-600 text-white" : "border-slate-300 text-transparent dark:border-slate-600"}`}>
                        <Check size={14} />
                      </span>
                      <div className="pr-8">
                        <h3 className="line-clamp-2 font-semibold text-slate-900 dark:text-slate-100">{paper.title || paper.filename || "Untitled paper"}</h3>
                        <p className="mt-2 line-clamp-3 text-sm leading-5 text-slate-600 dark:text-slate-300">{paper.summary || paper.tldr || "No summary available."}</p>
                        <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">{paper.page_count || 0} pages</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            <div className="mt-6 flex flex-col gap-3 border-t border-slate-200 pt-5 dark:border-slate-700 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-500 dark:text-slate-400">{hasEnoughPapers ? "Your selection is ready." : "Select 2 to 6 papers to continue."}</p>
              <button type="button" onClick={handleGenerate} disabled={!hasEnoughPapers || generating} className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50">
                {generating ? <LoaderCircle size={17} className="animate-spin" /> : <Lightbulb size={17} />}
                {generating ? "Finding research gaps..." : "Find Research Gaps"}
              </button>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="font-bold text-slate-900 dark:text-slate-100">Saved results</h2>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Your research-gap history</p>
              </div>
              {selectedResultId && <button type="button" onClick={handleDelete} disabled={deleting} aria-label="Delete selected research-gap result" title="Delete selected result" className="rounded-lg p-2 text-red-600 hover:bg-red-50 disabled:opacity-50 dark:text-red-300 dark:hover:bg-red-500/10"><Trash2 size={17} /></button>}
            </div>

            {loadingSaved ? (
              <div className="mt-5 flex items-center gap-2 text-sm text-slate-500"><LoaderCircle size={16} className="animate-spin" />Loading saved results...</div>
            ) : savedResults.length === 0 ? (
              <p className="mt-5 text-sm leading-6 text-slate-500 dark:text-slate-400">No saved research-gap results yet.</p>
            ) : (
              <div className="mt-5 space-y-2">
                {savedResults.map((savedResult) => (
                  <button key={savedResult.id} type="button" onClick={() => handleSelectSavedResult(savedResult)} className={`w-full rounded-lg border p-3 text-left transition ${String(savedResult.id) === selectedResultId ? "border-indigo-400 bg-indigo-50 dark:border-indigo-700 dark:bg-indigo-500/10" : "border-slate-200 hover:border-indigo-300 dark:border-slate-700 dark:hover:border-indigo-700"}`}>
                    <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">{savedResult.result?.research_gaps?.[0]?.title || "Research-gap analysis"}</p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{savedResult.paper_ids?.length || 0} papers · {savedResult.updated_at ? new Date(savedResult.updated_at).toLocaleDateString() : "Saved result"}</p>
                  </button>
                ))}
              </div>
            )}
          </section>
        </div>

        {result && (
          <ResearchGapResultView result={result} />
        )}
      </main>
    </div>
  );
}

function ResearchGapResultView({ result }) {
  const gaps = Array.isArray(result.research_gaps) ? result.research_gaps : [];

  return (
    <section className="space-y-6">
      <article className="rounded-2xl border border-indigo-100 bg-white p-6 shadow-sm dark:border-indigo-900 dark:bg-slate-900 lg:p-8">
        <div className="flex items-center gap-3"><Sparkles className="text-indigo-600 dark:text-indigo-300" size={20} /><h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Overall Summary</h2></div>
        <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-600 dark:text-slate-300">{result.overall_summary || "No overall summary is available."}</p>
      </article>

      <div>
        <div className="mb-4 flex items-center gap-3"><Lightbulb className="text-indigo-600 dark:text-indigo-300" size={20} /><h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Research Gaps</h2></div>
        {gaps.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 p-6 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">No specific research gaps were returned for this result.</div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-2">
            {gaps.map((gap, index) => (
              <article key={`${gap.title || "gap"}-${index}`} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-start gap-3"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-sm font-bold text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300">{index + 1}</span><h3 className="text-base font-bold text-slate-900 dark:text-slate-100">{gap.title || "Untitled research gap"}</h3></div>
                <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-300">{gap.description || "No description available."}</p>
                <div className="mt-5 rounded-xl bg-slate-50 p-4 dark:bg-slate-800"><h4 className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Evidence</h4><div className="mt-3 space-y-3">{Array.isArray(gap.evidence) && gap.evidence.length > 0 ? gap.evidence.map((item, evidenceIndex) => <div key={evidenceIndex}><p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{item.paper_title || "Selected paper"}</p><p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">{item.evidence || "No evidence text available."}</p></div>) : <p className="text-sm text-slate-500 dark:text-slate-400">No evidence was returned.</p>}</div></div>
                <div className="mt-5 grid gap-4 sm:grid-cols-2"><div><h4 className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Why it matters</h4><p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{gap.importance || "No importance statement available."}</p></div><div><h4 className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Suggested direction</h4><p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{gap.suggested_direction || "No suggested direction available."}</p></div></div>
              </article>
            ))}
          </div>
        )}
      </div>

      <article className="rounded-2xl border border-emerald-100 bg-emerald-50 p-6 dark:border-emerald-900 dark:bg-emerald-500/10 lg:p-8"><h2 className="font-bold text-slate-900 dark:text-slate-100">Future Research Summary</h2><p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-600 dark:text-slate-300">{result.future_research_summary || "No future research summary is available."}</p></article>
    </section>
  );
}

export default ResearchGapFinder;
