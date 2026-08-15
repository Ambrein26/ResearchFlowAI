import {
  ArrowLeft,
  FileText,
  LoaderCircle,
  AlertCircle,
  Check,
  GitCompare,
  Sparkles,
  BookOpen,
} from "lucide-react";

import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

import api from "../../services/api";

function Compare() {
  // ============================================================
  // State
  // ============================================================

  const [papers, setPapers] = useState([]);

  const [selectedPaperIds, setSelectedPaperIds] = useState([]);

  const [comparison, setComparison] = useState(null);

  const [aiComparison, setAiComparison] = useState(null);

  const [literatureReview, setLiteratureReview] = useState(null);

  const [loading, setLoading] = useState(true);
  const [comparing, setComparing] = useState(false);
  const [aiComparing, setAiComparing] = useState(false);
  const [generatingReview, setGeneratingReview] = useState(false);

  const [error, setError] = useState("");

  // ============================================================
  // Fetch Papers
  // ============================================================

  useEffect(() => {
    const fetchPapers = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/api/papers");

        if (response.data.success) {
          setPapers(response.data.papers || []);
        } else {
          setPapers([]);
        }
      } catch (err) {
        console.error("Failed to load papers:", err);

        setError(
          err.response?.data?.detail ||
            "Unable to load your research papers."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPapers();
  }, []);

  // ============================================================
  // Select / Unselect Paper
  // ============================================================

  const togglePaperSelection = (paperId) => {
    setComparison(null);
    setAiComparison(null);
    setLiteratureReview(null);
    setError("");

    setSelectedPaperIds((previous) => {
      if (previous.includes(paperId)) {
        return previous.filter((id) => id !== paperId);
      }

      if (previous.length >= 4) {
        return previous;
      }

      return [...previous, paperId];
    });
  };

  // ============================================================
  // Structured Comparison
  // ============================================================

  const handleCompare = async () => {
    if (selectedPaperIds.length < 2) {
      setError("Please select at least 2 papers to compare.");
      return;
    }

    try {
      setComparing(true);
      setError("");

      setAiComparison(null);
      setLiteratureReview(null);

      const response = await api.post("/api/compare", {
        paper_ids: selectedPaperIds,
      });

      if (response.data.success) {
        setComparison(response.data.papers || []);
      } else {
        setComparison(null);
        setError("Unable to compare the selected papers.");
      }
    } catch (err) {
      console.error("Failed to compare papers:", err);

      setComparison(null);

      setError(
        err.response?.data?.detail ||
          "Unable to compare the selected papers."
      );
    } finally {
      setComparing(false);
    }
  };

  // ============================================================
  // AI Comparison
  // ============================================================

  const handleAIComparison = async () => {
    if (selectedPaperIds.length < 2) {
      setError(
        "Please select at least 2 papers for AI comparison."
      );
      return;
    }

    try {
      setAiComparing(true);
      setError("");
      setLiteratureReview(null);

      const response = await api.post("/api/compare/ai", {
        paper_ids: selectedPaperIds,
      });

      if (response.data.success) {
        setAiComparison(
          response.data.comparison ||
            response.data.result ||
            response.data.analysis
        );
      } else {
        setAiComparison(null);
        setError("Unable to generate AI comparison.");
      }
    } catch (err) {
      console.error(
        "Failed to generate AI comparison:",
        err
      );

      setAiComparison(null);

      setError(
        err.response?.data?.detail ||
          "Unable to generate AI comparison."
      );
    } finally {
      setAiComparing(false);
    }
  };

  // ============================================================
  // Literature Review Generator
  // ============================================================

  const handleLiteratureReview = async () => {
    if (selectedPaperIds.length < 2) {
      setError(
        "Please select at least 2 papers to generate a literature review."
      );
      return;
    }

    try {
      setGeneratingReview(true);
      setError("");

      const response = await api.post(
        "/api/literature-review",
        {
          paper_ids: selectedPaperIds,
        }
      );

      if (response.data.success) {
      setLiteratureReview(
      response.data.literature_review
      );
     } else {
        setLiteratureReview(null);
        setError(
          "Unable to generate the literature review."
        );
      }
    } catch (err) {
      console.error(
        "Failed to generate literature review:",
        err
      );

      setLiteratureReview(null);

      setError(
        err.response?.data?.detail ||
          "Unable to generate the literature review."
      );
    } finally {
      setGeneratingReview(false);
    }
  };

  // ============================================================
  // Loading
  // ============================================================

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">

          <LoaderCircle
            size={40}
            className="animate-spin text-indigo-600"
          />

          <p className="text-sm font-medium text-slate-600">
            Loading research papers...
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

              <GitCompare
                size={18}
                className="text-indigo-600"
              />

              <span className="text-sm font-medium text-slate-500">
                Research Comparison
              </span>

            </div>

            <h1 className="mt-1 text-xl font-bold text-slate-900">
              Compare Research Papers
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
            <GitCompare size={21} />
          </div>

          <h2 className="mt-5 text-2xl font-bold text-slate-900">
            Compare Your Research
          </h2>

          <p className="mt-3 max-w-2xl leading-7 text-slate-600">
            Select two to four research papers to compare their
            methodology, datasets, models, findings, limitations,
            and future work.
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
            No Papers
        ==================================================== */}

        {papers.length === 0 ? (

          <section className="rounded-xl border border-slate-200 bg-white p-10 text-center shadow-sm">

            <FileText
              size={40}
              className="mx-auto text-slate-400"
            />

            <h2 className="mt-4 text-lg font-bold text-slate-900">
              No research papers available
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Analyze and save at least two papers before
              comparing them.
            </p>

            <Link
              to="/papers"
              className="mt-5 inline-flex rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              Go to My Papers
            </Link>

          </section>

        ) : (

          <>

            {/* ==================================================
                Selection Section
            ================================================== */}

            <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                <div>

                  <h2 className="font-bold text-slate-900">
                    Select Papers
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Select 2 to 4 papers.
                  </p>

                </div>

                <div className="rounded-full bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700">
                  {selectedPaperIds.length} / 4 selected
                </div>

              </div>


              {/* ==================================================
                  Paper Cards
              ================================================== */}

              <div className="mt-6 grid gap-4 md:grid-cols-2">

                {papers.map((paper) => {

                  const selected =
                    selectedPaperIds.includes(paper.id);

                  const disabled =
                    !selected &&
                    selectedPaperIds.length >= 4;

                  return (
                    <button
                      key={paper.id}
                      type="button"
                      disabled={disabled}
                      onClick={() =>
                        togglePaperSelection(paper.id)
                      }
                      className={`relative w-full rounded-xl border p-5 text-left transition ${
                        selected
                          ? "border-indigo-500 bg-indigo-50 ring-2 ring-indigo-100"
                          : "border-slate-200 bg-white hover:border-indigo-300 hover:bg-slate-50"
                      } ${
                        disabled
                          ? "cursor-not-allowed opacity-50"
                          : "cursor-pointer"
                      }`}
                    >

                      {/* Selection Indicator */}

                      <div
                        className={`absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full border ${
                          selected
                            ? "border-indigo-600 bg-indigo-600 text-white"
                            : "border-slate-300 bg-white text-transparent"
                        }`}
                      >
                        <Check size={15} />
                      </div>


                      <div className="flex items-start gap-3 pr-8">

                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                          <FileText size={19} />
                        </div>

                        <div className="min-w-0">

                          <h3 className="line-clamp-2 font-semibold text-slate-900">
                            {paper.title ||
                              paper.filename ||
                              "Untitled Research Paper"}
                          </h3>

                          <p className="mt-1 line-clamp-2 text-xs text-slate-500">
                            {Array.isArray(paper.authors)
                              ? paper.authors.join(", ")
                              : paper.authors ||
                                "Unknown authors"}
                          </p>

                        </div>

                      </div>


                      <div className="mt-4 flex gap-4 text-xs text-slate-500">

                        <span>
                          {paper.page_count || 0} pages
                        </span>

                        {paper.methodology && (
                          <span>
                            Analysis available
                          </span>
                        )}

                      </div>

                    </button>
                  );
                })}

              </div>


              {/* ==================================================
                  Compare Button
              ================================================== */}

              <div className="mt-6 flex justify-end">

                <button
                  type="button"
                  onClick={handleCompare}
                  disabled={
                    selectedPaperIds.length < 2 ||
                    comparing
                  }
                  className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                >

                  {comparing ? (
                    <>
                      <LoaderCircle
                        size={17}
                        className="animate-spin"
                      />

                      Comparing...
                    </>
                  ) : (
                    <>
                      <GitCompare size={17} />

                      Compare Selected Papers
                    </>
                  )}

                </button>

              </div>

            </section>


            {/* ==================================================
                Structured Comparison Results
            ================================================== */}

            {comparison && comparison.length >= 2 && (
              <>

                <ComparisonResults
                  papers={comparison}
                />


                {/* ==================================================
                    AI Comparison Trigger
                ================================================== */}

                <section className="rounded-xl border border-indigo-100 bg-white p-6 shadow-sm">

                  <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

                    <div className="flex items-start gap-3">

                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                        <Sparkles size={20} />
                      </div>

                      <div>

                        <h2 className="font-bold text-slate-900">
                          AI Research Comparison
                        </h2>

                        <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
                          Get an AI-generated interpretation of
                          the similarities, differences, research
                          gaps, and overall insights across the
                          selected papers.
                        </p>

                      </div>

                    </div>


                    <button
                      type="button"
                      onClick={handleAIComparison}
                      disabled={aiComparing}
                      className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >

                      {aiComparing ? (
                        <>
                          <LoaderCircle
                            size={17}
                            className="animate-spin"
                          />

                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles size={17} />

                          Generate AI Comparison
                        </>
                      )}

                    </button>

                  </div>

                </section>


                {/* ==================================================
                    AI Comparison Results
                ================================================== */}

                {aiComparison && (
                  <AIComparisonResults
                    comparison={aiComparison}
                  />
                )}


                {/* ==================================================
                    Literature Review Generator
                ================================================== */}

                {aiComparison && (
                  <section className="rounded-xl border border-emerald-100 bg-white p-6 shadow-sm">

                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

                      <div className="flex items-start gap-3">

                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                          <BookOpen size={20} />
                        </div>

                        <div>

                          <h2 className="font-bold text-slate-900">
                            Literature Review Generator
                          </h2>

                          <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
                            Generate a structured literature review
                            from the selected research papers using
                            AI.
                          </p>

                        </div>

                      </div>


                      <button
                        type="button"
                        onClick={handleLiteratureReview}
                        disabled={generatingReview}
                        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >

                        {generatingReview ? (
                          <>
                            <LoaderCircle
                              size={17}
                              className="animate-spin"
                            />

                            Generating Review...
                          </>
                        ) : (
                          <>
                            <BookOpen size={17} />

                            Generate Literature Review
                          </>
                        )}

                      </button>

                    </div>

                  </section>
                )}


                {/* ==================================================
                    Literature Review Results
                ================================================== */}

                {literatureReview && (
                  <LiteratureReviewResults
                    review={literatureReview}
                  />
                )}

              </>
            )}

          </>
        )}

      </main>

    </div>
  );
}


// ============================================================
// Structured Comparison Results
// ============================================================

function ComparisonResults({ papers }) {

  const fields = [
    {
      key: "research_problem",
      label: "Research Problem",
    },
    {
      key: "key_contributions",
      label: "Key Contributions",
    },
    {
      key: "methodology",
      label: "Methodology",
    },
    {
      key: "dataset",
      label: "Dataset",
    },
    {
      key: "models_or_algorithms",
      label: "Models / Algorithms",
    },
    {
      key: "key_findings",
      label: "Key Findings",
    },
    {
      key: "limitations",
      label: "Limitations",
    },
    {
      key: "future_work",
      label: "Future Work",
    },
  ];


  const formatValue = (value) => {

    if (value === null || value === undefined) {
      return "Not available";
    }

    if (Array.isArray(value)) {

      if (value.length === 0) {
        return "Not available";
      }

      return (
        <ul className="space-y-2">

          {value.map((item, index) => (

            <li
              key={index}
              className="flex items-start gap-2"
            >

              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500" />

              <span>
                {typeof item === "object"
                  ? JSON.stringify(item)
                  : item}
              </span>

            </li>

          ))}

        </ul>
      );
    }

    return value;
  };


  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-sm">

      <div className="border-b border-slate-200 p-6">

        <div className="flex items-center gap-3">

          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <GitCompare size={20} />
          </div>

          <div>

            <h2 className="font-bold text-slate-900">
              Paper Comparison
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Structured comparison of the selected research
              papers.
            </p>

          </div>

        </div>

      </div>


      <div className="overflow-x-auto">

        <table className="min-w-[900px] w-full border-collapse">

          <thead>

            <tr className="bg-slate-50">

              <th className="w-52 border-b border-r border-slate-200 p-4 text-left text-sm font-semibold text-slate-700">
                Research Aspect
              </th>

              {papers.map((paper) => (

                <th
                  key={paper.id}
                  className="min-w-[280px] border-b border-slate-200 p-4 text-left align-top"
                >

                  <div className="flex items-start gap-3">

                    <FileText
                      size={18}
                      className="mt-0.5 shrink-0 text-indigo-600"
                    />

                    <div>

                      <p className="line-clamp-3 text-sm font-bold text-slate-900">
                        {paper.title ||
                          paper.filename ||
                          "Untitled Research Paper"}
                      </p>

                      <p className="mt-1 text-xs font-normal text-slate-500">
                        {Array.isArray(paper.authors)
                          ? paper.authors.join(", ")
                          : paper.authors ||
                            "Unknown authors"}
                      </p>

                    </div>

                  </div>

                </th>

              ))}

            </tr>

          </thead>


          <tbody>

            {fields.map((field) => (

              <tr key={field.key}>

                <td className="border-b border-r border-slate-200 bg-slate-50 p-4 align-top text-sm font-semibold text-slate-700">
                  {field.label}
                </td>

                {papers.map((paper) => (

                  <td
                    key={`${paper.id}-${field.key}`}
                    className="border-b border-slate-200 p-4 align-top text-sm leading-6 text-slate-600"
                  >
                    {formatValue(paper[field.key])}
                  </td>

                ))}

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </section>
  );
}


// ============================================================
// AI Comparison Results
// ============================================================

function AIComparisonResults({ comparison }) {

  const renderValue = (value) => {

    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {
      return null;
    }

    if (Array.isArray(value)) {

      return (
        <ul className="space-y-2">

          {value.map((item, index) => (

            <li
              key={index}
              className="flex items-start gap-2"
            >

              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500" />

              <span className="text-sm leading-6 text-slate-600">
                {typeof item === "object"
                  ? JSON.stringify(item)
                  : item}
              </span>

            </li>

          ))}

        </ul>
      );
    }

    if (typeof value === "object") {

      return (
        <pre className="whitespace-pre-wrap rounded-lg bg-slate-50 p-4 text-sm leading-6 text-slate-600">
          {JSON.stringify(value, null, 2)}
        </pre>
      );
    }

    return (
      <p className="whitespace-pre-wrap text-sm leading-7 text-slate-600">
        {value}
      </p>
    );
  };


  if (typeof comparison === "string") {

    return (
      <section className="rounded-xl border border-indigo-100 bg-white shadow-sm">

        <div className="border-b border-indigo-100 bg-indigo-50 p-6">

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600 text-white">
              <Sparkles size={20} />
            </div>

            <div>

              <h2 className="font-bold text-slate-900">
                AI Research Insights
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                AI-generated analysis of the selected papers.
              </p>

            </div>

          </div>

        </div>


        <div className="p-6">

          <p className="whitespace-pre-wrap text-sm leading-7 text-slate-600">
            {comparison}
          </p>

        </div>

      </section>
    );
  }


  const sections = [
    {
      key: "overall_comparison",
      label: "Overall Comparison",
    },
    {
      key: "methodology_comparison",
      label: "Methodology Comparison",
    },
    {
      key: "dataset_comparison",
      label: "Dataset Comparison",
    },
    {
      key: "model_comparison",
      label: "Model / Algorithm Comparison",
    },
    {
      key: "findings_comparison",
      label: "Findings Comparison",
    },
    {
      key: "contributions_comparison",
      label: "Contribution Comparison",
    },
    {
      key: "limitations_comparison",
      label: "Limitations Comparison",
    },
    {
      key: "research_gaps",
      label: "Research Gaps",
    },
    {
      key: "conclusion",
      label: "Conclusion",
    },
  ];


  const availableSections = sections.filter(
    (section) =>
      comparison?.[section.key] !== undefined &&
      comparison?.[section.key] !== null &&
      comparison?.[section.key] !== ""
  );


  return (
    <section className="rounded-xl border border-indigo-100 bg-white shadow-sm">

      <div className="border-b border-indigo-100 bg-indigo-50 p-6">

        <div className="flex items-center gap-3">

          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600 text-white">
            <Sparkles size={20} />
          </div>

          <div>

            <h2 className="font-bold text-slate-900">
              AI Research Insights
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              AI-generated interpretation of the selected
              research papers.
            </p>

          </div>

        </div>

      </div>


      <div className="divide-y divide-slate-200">

        {availableSections.length > 0 ? (

          availableSections.map((section) => (

            <div
              key={section.key}
              className="p-6"
            >

              <h3 className="mb-3 text-base font-bold text-slate-900">
                {section.label}
              </h3>

              {renderValue(
                comparison[section.key]
              )}

            </div>

          ))

        ) : (

          <div className="p-6">
            {renderValue(comparison)}
          </div>

        )}

      </div>

    </section>
  );
}


// ============================================================
// Literature Review Results
// ============================================================

function LiteratureReviewResults({ review }) {

  // ----------------------------------------------------------
  // Safety check
  // ----------------------------------------------------------

  if (!review) {
    return null;
  }


  // ----------------------------------------------------------
  // Render Section Content
  // ----------------------------------------------------------

  const renderValue = (value) => {

    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {
      return (
        <p className="text-sm text-slate-400">
          Not available.
        </p>
      );
    }


    // Array
    if (Array.isArray(value)) {

      if (value.length === 0) {
        return (
          <p className="text-sm text-slate-400">
            Not available.
          </p>
        );
      }

      return (
        <ul className="space-y-2">

          {value.map((item, index) => (

            <li
              key={index}
              className="flex items-start gap-2"
            >

              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />

              <span className="text-sm leading-7 text-slate-600">
                {typeof item === "object"
                  ? JSON.stringify(item)
                  : item}
              </span>

            </li>

          ))}

        </ul>
      );
    }


    // Object
    if (typeof value === "object") {

      return (
        <pre className="whitespace-pre-wrap rounded-lg bg-slate-50 p-4 text-sm leading-7 text-slate-600">
          {JSON.stringify(value, null, 2)}
        </pre>
      );
    }


    // Normal text
    return (
      <p className="whitespace-pre-wrap text-sm leading-7 text-slate-600">
        {String(value)}
      </p>
    );
  };


  // ============================================================
  // Plain Text Literature Review
  // ============================================================

  if (typeof review === "string") {

    return (
      <section className="rounded-xl border border-emerald-100 bg-white shadow-sm">

        {/* Header */}

        <div className="border-b border-emerald-100 bg-emerald-50 p-6">

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white">
              <BookOpen size={20} />
            </div>

            <div>

              <h2 className="font-bold text-slate-900">
                AI Literature Review
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Generated from the selected research papers.
              </p>

            </div>

          </div>

        </div>


        {/* Plain Text */}

        <div className="p-6">

          <p className="whitespace-pre-wrap text-sm leading-7 text-slate-600">
            {review}
          </p>

        </div>

      </section>
    );
  }


  // ============================================================
  // Literature Review Sections
  // ============================================================

  const sections = [
    {
      key: "introduction",
      label: "Introduction",
    },
    {
      key: "existing_research",
      label: "Existing Research",
    },
    {
      key: "methodology_comparison",
      label: "Methodology Comparison",
    },
    {
      key: "key_findings",
      label: "Key Findings",
    },
    {
      key: "research_gaps",
      label: "Research Gaps",
    },
    {
      key: "conclusion",
      label: "Conclusion",
    },
  ];


  // ============================================================
  // Check Available Sections
  // ============================================================

  const availableSections = sections.filter(
    (section) =>
      review[section.key] !== undefined &&
      review[section.key] !== null &&
      review[section.key] !== ""
  );


  // ============================================================
  // Structured Literature Review
  // ============================================================

  return (
    <section className="rounded-xl border border-emerald-100 bg-white shadow-sm">

      {/* ======================================================
          Header
      ====================================================== */}

      <div className="border-b border-emerald-100 bg-emerald-50 p-6">

        <div className="flex items-start gap-3">

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white">
            <BookOpen size={20} />
          </div>

          <div>

            <h2 className="font-bold text-slate-900">
              AI Literature Review
            </h2>

            <p className="mt-1 text-sm leading-6 text-slate-500">
              AI-generated literature review based on the
              selected research papers.
            </p>

          </div>

        </div>

      </div>


      {/* ======================================================
          Review Content
      ====================================================== */}

      <div className="p-6">

        {/* ====================================================
            Title
        ==================================================== */}

        {review.title && (

          <div className="mb-8 rounded-xl border border-emerald-100 bg-emerald-50/50 p-6">

            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-emerald-600">
              Literature Review
            </p>

            <h3 className="text-2xl font-bold leading-9 text-slate-900">
              {review.title}
            </h3>

          </div>

        )}


        {/* ====================================================
            Sections
        ==================================================== */}

        {availableSections.length > 0 ? (

          <div className="space-y-8">

            {availableSections.map((section) => (

              <article
                key={section.key}
                className="border-b border-slate-100 pb-8 last:border-b-0 last:pb-0"
              >

                <h3 className="mb-3 text-base font-bold text-slate-900">
                  {section.label}
                </h3>

                {renderValue(
                  review[section.key]
                )}

              </article>

            ))}

          </div>

        ) : (

          <div>

            {renderValue(review)}

          </div>

        )}

      </div>

    </section>
  );
}


export default Compare;