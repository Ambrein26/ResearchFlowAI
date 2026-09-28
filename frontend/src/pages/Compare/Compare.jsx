import {
  ArrowLeft,
  FileText,
  LoaderCircle,
  AlertCircle,
  Check,
  GitCompare,
  Sparkles,
  BookOpen,
  Download,
} from "lucide-react";

import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

import { Document, Packer, Paragraph, HeadingLevel } from "docx";
import jsPDF from "jspdf";

import api from "../../services/api";

// ============================================================
// Selection limits
// ============================================================

const MIN_PAPERS = 2;
const MAX_PAPERS = 6;

// ============================================================
// Shared value flattening (used by results components + export)
// ============================================================

function flattenValue(value) {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return "—";
    }

    return value
      .map((item) =>
        typeof item === "object"
          ? JSON.stringify(item)
          : `- ${item}`
      )
      .join("\n");
  }

  if (typeof value === "object") {
    return Object.keys(value).length
      ? JSON.stringify(value, null, 2)
      : "—";
  }

  return String(value);
}

// ============================================================
// Export block builders
// ============================================================
// A "block" = { heading: string|null, items: [{ label, value }] }

const COMPARISON_FIELDS = [
  { key: "publication_year", label: "Publication Year" },
  { key: "abstract", label: "Abstract" },
  { key: "research_problem", label: "Research Problem" },
  { key: "key_contributions", label: "Key Contributions" },
  { key: "methodology", label: "Methodology" },
  { key: "dataset", label: "Dataset" },
  { key: "models_or_algorithms", label: "Models / Algorithms" },
  { key: "key_findings", label: "Key Findings" },
  { key: "limitations", label: "Limitations" },
  { key: "future_work", label: "Future Work" },
  { key: "keywords", label: "Keywords" },
];

const AI_COMPARISON_SECTIONS = [
  { key: "overall_comparison", label: "Overall Comparison" },
  { key: "similarities", label: "Similarities" },
  { key: "key_differences", label: "Key Differences" },
  { key: "methodology_comparison", label: "Methodology Comparison" },
  { key: "dataset_comparison", label: "Dataset Comparison" },
  { key: "model_comparison", label: "Model / Algorithm Comparison" },
  { key: "findings_comparison", label: "Findings Comparison" },
  { key: "contributions_comparison", label: "Contribution Comparison" },
  { key: "limitations_comparison", label: "Limitations Comparison" },
  { key: "research_gaps", label: "Research Gaps" },
  { key: "strengths", label: "Strengths" },
  { key: "weaknesses", label: "Weaknesses" },
  { key: "final_insights", label: "Final Insights" },
  { key: "conclusion", label: "Conclusion" },
];

const LITERATURE_REVIEW_SECTIONS = [
  { key: "introduction", label: "Introduction" },
  { key: "existing_research", label: "Existing Research" },
  { key: "methodology_comparison", label: "Methodology Comparison" },
  { key: "key_findings", label: "Key Findings" },
  { key: "research_gaps", label: "Research Gaps" },
  { key: "conclusion", label: "Conclusion" },
];

function buildComparisonBlocks(papers) {
  if (!Array.isArray(papers)) return [];

  return papers.map((paper) => ({
    heading:
      paper.title || paper.filename || "Untitled Research Paper",
    items: COMPARISON_FIELDS.map((field) => ({
      label: field.label,
      value: flattenValue(paper[field.key]),
    })),
  }));
}

function buildSectionedBlocks(data, sectionDefs) {
  if (!data) return [];

  if (typeof data === "string") {
    const blocks = [];
    let current = { heading: null, items: [] };
    data.split(/\r?\n/).forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed) return;
      const heading = trimmed.replace(/^[#\d.)\s-]+/, "").replace(/:$/, "");
      const isHeading = /^#{1,6}\s|^[A-Z][A-Za-z /&-]{2,}:?$/.test(trimmed) && trimmed.length < 90;
      if (isHeading && !trimmed.startsWith("-")) {
        if (current.items.length) blocks.push(current);
        current = { heading, items: [] };
      } else {
        current.items.push({ label: "", value: trimmed });
      }
    });
    if (current.items.length) blocks.push(current);
    return blocks.length ? blocks : [{ heading: null, items: [{ label: "Content", value: data }] }];
  }

  const availableSections = sectionDefs.filter(
    (section) =>
      data[section.key] !== undefined &&
      data[section.key] !== null &&
      data[section.key] !== ""
  );

  if (availableSections.length === 0) {
    return [
      {
        heading: null,
        items: [{ label: "Content", value: flattenValue(data) }],
      },
    ];
  }

  return [
    {
      heading: data.title || null,
      items: availableSections.map((section) => ({
        label: section.label,
        value: flattenValue(data[section.key]),
      })),
    },
  ];
}

function buildAiBlocks(aiComparison) {
  return buildSectionedBlocks(aiComparison, AI_COMPARISON_SECTIONS);
}

function buildReviewBlocks(literatureReview) {
  return buildSectionedBlocks(
    literatureReview,
    LITERATURE_REVIEW_SECTIONS
  );
}

// ============================================================
// DOCX export
// ============================================================

async function downloadAsDocx(title, blocks, filename) {
  const children = [
    new Paragraph({ text: title, heading: HeadingLevel.HEADING_1 }),
  ];

  blocks.forEach((block) => {
    if (block.heading) {
      children.push(
        new Paragraph({
          text: block.heading,
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 300, after: 100 },
        })
      );
    }

    block.items.forEach((item) => {
      children.push(
        new Paragraph({
          text: item.label,
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 200 },
        })
      );

      String(item.value)
        .split("\n")
        .forEach((line) => {
          children.push(new Paragraph({ text: line }));
        });
    });
  });

  const doc = new Document({
    sections: [{ children }],
  });

  const blob = await Packer.toBlob(doc);

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ============================================================
// PDF export
// ============================================================

function downloadAsPdf(title, blocks, filename) {
  const pdf = new jsPDF({ unit: "pt", format: "a4" });

  const marginX = 40;
  const maxWidth = 515;
  const pageBottom = 780;

  let y = 50;

  const ensureSpace = (needed) => {
    if (y + needed > pageBottom) {
      pdf.addPage();
      y = 50;
    }
  };

  pdf.setFontSize(18);
  pdf.setFont(undefined, "bold");
  const titleLines = pdf.splitTextToSize(title, maxWidth);
  titleLines.forEach((line) => {
    ensureSpace(22);
    pdf.text(line, marginX, y);
    y += 22;
  });
  y += 10;

  blocks.forEach((block) => {
    if (block.heading) {
      ensureSpace(24);
      pdf.setFontSize(14);
      pdf.setFont(undefined, "bold");
      const headingLines = pdf.splitTextToSize(block.heading, maxWidth);
      headingLines.forEach((line) => {
        ensureSpace(18);
        pdf.text(line, marginX, y);
        y += 18;
      });
      y += 6;
    }

    block.items.forEach((item) => {
      ensureSpace(16);
      pdf.setFontSize(11);
      pdf.setFont(undefined, "bold");
      pdf.text(item.label, marginX, y);
      y += 15;

      pdf.setFont(undefined, "normal");
      pdf.setFontSize(10);

      const valueLines = pdf.splitTextToSize(
        String(item.value),
        maxWidth
      );

      valueLines.forEach((line) => {
        ensureSpace(13);
        pdf.text(line, marginX, y);
        y += 13;
      });

      y += 8;
    });

    y += 6;
  });

  pdf.save(filename);
}

// ============================================================
// Download buttons (reused across the three tabs)
// ============================================================

function DownloadButtons({ onDownloadDocx, onDownloadPdf, disabled }) {
  const [downloading, setDownloading] = useState("");

  const handleDocx = async () => {
    try {
      setDownloading("docx");
      await onDownloadDocx();
    } catch (err) {
      console.error("Failed to generate DOCX:", err);
    } finally {
      setDownloading("");
    }
  };

  const handlePdf = async () => {
    try {
      setDownloading("pdf");
      await onDownloadPdf();
    } catch (err) {
      console.error("Failed to generate PDF:", err);
    } finally {
      setDownloading("");
    }
  };

  return (
    <div className="flex justify-end gap-3 border-t border-slate-100 bg-slate-50 p-4">
      <button
        type="button"
        onClick={handleDocx}
        disabled={disabled || downloading !== ""}
        className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {downloading === "docx" ? (
          <LoaderCircle size={15} className="animate-spin" />
        ) : (
          <Download size={15} />
        )}
        Download DOCX
      </button>

      <button
        type="button"
        onClick={handlePdf}
        disabled={disabled || downloading !== ""}
        className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {downloading === "pdf" ? (
          <LoaderCircle size={15} className="animate-spin" />
        ) : (
          <Download size={15} />
        )}
        Download PDF
      </button>
    </div>
  );
}

function GeneratePanel({ icon: Icon, title, description, buttonLabel, loading, onGenerate }) {
  return (
    <section className="rounded-xl border border-indigo-100 bg-white p-6 shadow-sm dark:border-indigo-900 dark:bg-slate-900">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300">
            <Icon size={20} />
          </div>
          <div>
            <h2 className="font-bold text-slate-900 dark:text-slate-100">{title}</h2>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">{description}</p>
          </div>
        </div>
        <button type="button" onClick={onGenerate} disabled={loading} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50">
          {loading ? <LoaderCircle size={17} className="animate-spin" /> : <Icon size={17} />}
          {loading ? "Generating..." : buttonLabel}
        </button>
      </div>
    </section>
  );
}

function RegenerateButton({ onClick, loading, label = "Regenerate" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="inline-flex items-center gap-2 rounded-lg border border-indigo-200 px-3 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-indigo-800 dark:text-indigo-300 dark:hover:bg-indigo-500/10"
    >
      {loading && <LoaderCircle size={15} className="animate-spin" />}
      {label}
    </button>
  );
}

function SectionBlocks({ title, icon: Icon, blocks, tone }) {
  const accent = tone === "emerald"
    ? {
        border: "border-emerald-100 dark:border-emerald-900",
        background: "bg-emerald-50 dark:bg-emerald-500/10",
        icon: "bg-emerald-600",
      }
    : {
        border: "border-indigo-100 dark:border-indigo-900",
        background: "bg-indigo-50 dark:bg-indigo-500/10",
        icon: "bg-indigo-600",
      };
  return (
    <div>
      <div className={`border-b p-6 ${accent.border} ${accent.background}`}>
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-lg text-white ${accent.icon}`}><Icon size={20} /></div>
          <div><h2 className="font-bold text-slate-900 dark:text-slate-100">{title}</h2><p className="mt-1 text-sm text-slate-500">Generated from the selected research papers.</p></div>
        </div>
      </div>
      <div className="space-y-5 p-6">
        {blocks.map((block, index) => (
          <article key={`${block.heading || "section"}-${index}`} className="rounded-xl border border-slate-200 p-5 dark:border-slate-700">
            {block.heading && <h3 className="mb-3 text-base font-bold text-slate-900 dark:text-slate-100">{block.heading}</h3>}
            <div className="space-y-2">{block.items.map((item, itemIndex) => <p key={itemIndex} className="whitespace-pre-wrap text-sm leading-7 text-slate-600 dark:text-slate-300">{item.label && <strong>{item.label}: </strong>}{item.value}</p>)}</div>
          </article>
        ))}
      </div>
    </div>
  );
}

function Compare() {
  // ============================================================
  // State
  // ============================================================

  const [papers, setPapers] = useState([]);

  const [selectedPaperIds, setSelectedPaperIds] = useState([]);

  const [comparison, setComparison] = useState(null);

  const [aiComparison, setAiComparison] = useState(null);

  const [literatureReview, setLiteratureReview] = useState(null);

  const [savedComparisons, setSavedComparisons] = useState([]);

  const [savedComparisonId, setSavedComparisonId] = useState("");

  const [isLoadingSavedComparison, setIsLoadingSavedComparison] = useState(false);

  const [loading, setLoading] = useState(true);
  const [comparing, setComparing] = useState(false);
  const [aiComparing, setAiComparing] = useState(false);
  const [generatingReview, setGeneratingReview] = useState(false);

  const [error, setError] = useState("");

  // Which result tab is active: "comparison" | "ai" | "review"
  const [activeTab, setActiveTab] = useState("comparison");

  const restoreSavedComparison = (paperIds, records = savedComparisons) => {
    const selectedSet = [...paperIds].map(String).sort();
    const saved = records.find((record) =>
      [...(record.paper_ids || [])].map(String).sort().join(",") ===
      selectedSet.join(",")
    );

    if (!saved) {
      setSavedComparisonId("");
      setComparison(null);
      setAiComparison(null);
      setLiteratureReview(null);
      return;
    }

    setSavedComparisonId(String(saved.id));
    setComparison(saved.comparison_result || null);
    setAiComparison(saved.ai_analysis || null);
    setLiteratureReview(saved.literature_review || null);
  };

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

        setIsLoadingSavedComparison(true);
        const savedResponse = await api.get("/api/comparisons");
        setSavedComparisons(savedResponse.data.comparisons || []);
      } catch (err) {
        console.error("Failed to load papers:", err);

        setError(
          err.response?.data?.detail ||
            "Unable to load your research papers."
        );
      } finally {
        setIsLoadingSavedComparison(false);
        setLoading(false);
      }
    };

    fetchPapers();
  }, []);

  // ============================================================
  // Select / Unselect Paper
  // ============================================================

  const togglePaperSelection = (paperId) => {
    setActiveTab("comparison");
    setError("");

    let nextSelection;
    if (selectedPaperIds.includes(paperId)) {
      nextSelection = selectedPaperIds.filter((id) => id !== paperId);
    } else if (selectedPaperIds.length >= MAX_PAPERS) {
      return;
    } else {
      nextSelection = [...selectedPaperIds, paperId];
    }

    setSelectedPaperIds(nextSelection);
    restoreSavedComparison(nextSelection);
  };

  const saveGeneratedResult = async (payload) => {
    const response = await api.post("/api/comparisons", {
      paper_ids: selectedPaperIds,
      ...payload,
    });
    const saved = response.data.comparison;
    setSavedComparisonId(String(saved.id));
    setSavedComparisons((previous) => [
      saved,
      ...previous.filter((item) => String(item.id) !== String(saved.id)),
    ]);
    return saved;
  };

  const deleteSavedComparison = async () => {
    if (!savedComparisonId) return;

    try {
      await api.delete(`/api/comparisons/${savedComparisonId}`);
      setSavedComparisons((previous) => previous.filter(
        (item) => String(item.id) !== String(savedComparisonId)
      ));
      setSavedComparisonId("");
      setComparison(null);
      setAiComparison(null);
      setLiteratureReview(null);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Unable to delete the saved comparison."
      );
    }
  };

  // ============================================================
  // Structured Comparison
  // ============================================================

  const handleCompare = async () => {
    if (comparing) return;

    if (selectedPaperIds.length < MIN_PAPERS) {
      setError(
        `Please select at least ${MIN_PAPERS} papers to compare.`
      );
      return;
    }

    try {
      setComparing(true);
      setError("");

      const response = await api.post("/api/compare", {
        paper_ids: selectedPaperIds,
      });

      if (response.data.success) {
        setComparison(response.data.papers || []);
        await saveGeneratedResult({
          comparison_result: response.data.papers || [],
        });
        setActiveTab("comparison");
      } else {
        setComparison(null);
        setError("Unable to compare the selected papers.");
      }
    } catch (err) {
      console.error("Failed to compare papers:", err);

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
    if (aiComparing) return;

    if (selectedPaperIds.length < MIN_PAPERS) {
      setError(
        `Please select at least ${MIN_PAPERS} papers for AI comparison.`
      );
      return;
    }

    try {
      setAiComparing(true);
      setError("");
      const response = await api.post("/api/compare/ai", {
        paper_ids: selectedPaperIds,
      });

      if (response.data.success) {
        const result = response.data.comparison ||
          response.data.result ||
          response.data.analysis;
        setAiComparison(result);
        await saveGeneratedResult({ ai_analysis: result });
      } else {
        setAiComparison(null);
        setError("Unable to generate AI comparison.");
      }
    } catch (err) {
      console.error(
        "Failed to generate AI comparison:",
        err
      );

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
    if (generatingReview) return;

    if (selectedPaperIds.length < MIN_PAPERS) {
      setError(
        `Please select at least ${MIN_PAPERS} papers to generate a literature review.`
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
      const result = response.data.literature_review;
      setLiteratureReview(result);
      await saveGeneratedResult({ literature_review: result });
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

      setError(
        err.response?.data?.detail ||
          "Unable to generate the literature review."
      );
    } finally {
      setGeneratingReview(false);
    }
  };

  // ============================================================
  // Download handlers (per tab)
  // ============================================================

  const handleDownloadComparisonDocx = async () => {
    if (!comparison) return;
    await downloadAsDocx(
      "Paper Comparison",
      buildComparisonBlocks(comparison),
      "paper-comparison.docx"
    );
  };

  const handleDownloadComparisonPdf = async () => {
    if (!comparison) return;
    downloadAsPdf(
      "Paper Comparison",
      buildComparisonBlocks(comparison),
      "paper-comparison.pdf"
    );
  };

  const handleDownloadAiDocx = async () => {
    if (!aiComparison) return;
    await downloadAsDocx(
      "AI Research Comparison",
      buildAiBlocks(aiComparison),
      "ai-comparison.docx"
    );
  };

  const handleDownloadAiPdf = async () => {
    if (!aiComparison) return;
    downloadAsPdf(
      "AI Research Comparison",
      buildAiBlocks(aiComparison),
      "ai-comparison.pdf"
    );
  };

  const handleDownloadReviewDocx = async () => {
    if (!literatureReview) return;
    await downloadAsDocx(
      "Literature Review",
      buildReviewBlocks(literatureReview),
      "literature-review.docx"
    );
  };

  const handleDownloadReviewPdf = async () => {
    if (!literatureReview) return;
    downloadAsPdf(
      "Literature Review",
      buildReviewBlocks(literatureReview),
      "literature-review.pdf"
    );
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
            Select two to six research papers to compare their
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
                    Select 2 to 6 papers.
                  </p>

                </div>

                <div className="rounded-full bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700">
                  {selectedPaperIds.length} / {MAX_PAPERS} selected
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
                    selectedPaperIds.length >= MAX_PAPERS;

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
                    selectedPaperIds.length < MIN_PAPERS ||
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
                Tabbed Results
            ================================================== */}

            {selectedPaperIds.length >= MIN_PAPERS && (
              <>

                {isLoadingSavedComparison && (
                  <div className="rounded-lg border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm text-indigo-700 dark:border-indigo-900 dark:bg-indigo-500/10 dark:text-indigo-300">
                    Loading saved comparison history...
                  </div>
                )}

                {/* ==================================================
                    Tab Bar
                ================================================== */}

                <div className="flex flex-wrap gap-2 rounded-lg border border-slate-200 bg-white p-1.5 shadow-sm">

                  <button
                    type="button"
                    onClick={() => setActiveTab("comparison")}
                    className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
                      activeTab === "comparison"
                        ? "bg-indigo-600 text-white"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <GitCompare size={16} />
                    Paper Comparison
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab("ai")}
                    className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
                      activeTab === "ai"
                        ? "bg-indigo-600 text-white"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <Sparkles size={16} />
                    AI Analysis
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab("review")}
                    className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
                      activeTab === "review"
                        ? "bg-emerald-600 text-white"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <BookOpen size={16} />
                    Literature Review
                  </button>

                  {savedComparisonId && (
                    <button
                      type="button"
                      onClick={deleteSavedComparison}
                      className="ml-auto rounded-lg px-3 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-500/10"
                    >
                      Delete saved result
                    </button>
                  )}

                </div>


                {/* ==================================================
                    TAB 1: Paper Comparison
                ================================================== */}

                {activeTab === "comparison" && (
                  comparison ? (
                    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                      <div className="flex justify-end border-b border-slate-200 p-4 dark:border-slate-700 dark:bg-slate-900">
                        <RegenerateButton onClick={handleCompare} loading={comparing} />
                      </div>
                      <ComparisonResults papers={comparison} />
                      <DownloadButtons
                        onDownloadDocx={handleDownloadComparisonDocx}
                        onDownloadPdf={handleDownloadComparisonPdf}
                      />
                    </section>
                  ) : (
                    <GeneratePanel
                      icon={GitCompare}
                      title="Paper Comparison"
                      description="Compare the selected papers in a structured research matrix."
                      buttonLabel="Generate paper comparison"
                      loading={comparing}
                      onGenerate={handleCompare}
                    />
                  )
                )}


                {/* ==================================================
                    TAB 2: AI Analysis
                ================================================== */}

                {activeTab === "ai" && (
                  <>
                    {!aiComparison && (
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
                    )}

                    {aiComparison && (
                      <section className="overflow-hidden rounded-xl border border-indigo-100 bg-white shadow-sm">
                        <div className="flex justify-end border-b border-slate-200 p-4 dark:border-slate-700 dark:bg-slate-900">
                          <RegenerateButton onClick={handleAIComparison} loading={aiComparing} />
                        </div>
                        <AIComparisonResults comparison={aiComparison} />
                        <DownloadButtons
                          onDownloadDocx={handleDownloadAiDocx}
                          onDownloadPdf={handleDownloadAiPdf}
                        />
                      </section>
                    )}
                  </>
                )}


                {/* ==================================================
                    TAB 3: Literature Review
                ================================================== */}

                {activeTab === "review" && (
                  <>
                    {!literatureReview && (
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

                    {literatureReview && (
                      <section className="overflow-hidden rounded-xl border border-emerald-100 bg-white shadow-sm">
                        <div className="flex justify-end border-b border-slate-200 p-4 dark:border-slate-700 dark:bg-slate-900">
                          <RegenerateButton onClick={handleLiteratureReview} loading={generatingReview} label="Regenerate review" />
                        </div>
                        <LiteratureReviewResults
                          review={literatureReview}
                          papers={papers.filter((paper) =>
                            selectedPaperIds.includes(paper.id)
                          )}
                        />
                        <DownloadButtons
                          onDownloadDocx={handleDownloadReviewDocx}
                          onDownloadPdf={handleDownloadReviewPdf}
                        />
                      </section>
                    )}
                  </>
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

  const fields = COMPARISON_FIELDS;


  const formatValue = (value) => {

    if (value === null || value === undefined) {
      return "—";
    }

    if (Array.isArray(value)) {

      if (value.length === 0) {
        return "—";
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

    if (typeof value === "object") {
      return Object.keys(value).length
        ? JSON.stringify(value)
        : "—";
    }

    return String(value);
  };


  return (
    <div>

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

    </div>
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
    return <SectionBlocks title="AI Research Insights" icon={Sparkles} blocks={buildAiBlocks(comparison)} tone="indigo" />;
  }


  const sections = AI_COMPARISON_SECTIONS;


  const availableSections = sections.filter(
    (section) =>
      comparison?.[section.key] !== undefined &&
      comparison?.[section.key] !== null &&
      comparison?.[section.key] !== ""
  );


  return (
    <div>

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

    </div>
  );
}


// ============================================================
// Literature Review Results
// ============================================================

function LiteratureReviewResults({ review, papers = [] }) {

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
        <p className="text-sm text-slate-500 dark:text-slate-400">
          —
        </p>
      );
    }


    // Array
    if (Array.isArray(value)) {

      if (value.length === 0) {
        return (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            —
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
    return <SectionBlocks title="AI Literature Review" icon={BookOpen} blocks={buildReviewBlocks(review)} tone="emerald" />;
  }


  // ============================================================
  // Literature Review Sections
  // ============================================================

  const sections = LITERATURE_REVIEW_SECTIONS;


  // ============================================================
  // Check Available Sections
  // ============================================================

  const availableSections = sections.filter(
    (section) =>
      review[section.key] !== undefined &&
      review[section.key] !== null &&
      review[section.key] !== ""
  );

  const matrixFields = [
    ["title", "Paper"],
    ["research_problem", "Research focus"],
    ["methodology", "Methodology"],
    ["dataset", "Dataset"],
    ["key_findings", "Main findings"],
    ["limitations", "Limitations"],
  ];


  // ============================================================
  // Structured Literature Review
  // ============================================================

  return (
    <div>

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

        {papers.length > 0 && (
          <div className="mb-8 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
            <table className="min-w-[900px] w-full border-collapse text-left">
              <thead className="bg-emerald-50 dark:bg-emerald-500/10">
                <tr>
                  {matrixFields.map(([, label]) => <th key={label} className="border-b border-slate-200 p-3 text-xs font-bold uppercase tracking-wide text-slate-600 dark:border-slate-700 dark:text-slate-300">{label}</th>)}
                  <th className="border-b border-slate-200 p-3 text-xs font-bold uppercase tracking-wide text-slate-600 dark:border-slate-700 dark:text-slate-300">Research gap</th>
                </tr>
              </thead>
              <tbody>
                {papers.map((paper) => <tr key={paper.id}>
                  {matrixFields.map(([key]) => <td key={key} className="border-b border-slate-200 p-3 align-top text-sm leading-6 text-slate-600 dark:border-slate-700 dark:text-slate-300">{flattenValue(paper[key])}</td>)}
                  <td className="border-b border-slate-200 p-3 align-top text-sm leading-6 text-slate-600 dark:border-slate-700 dark:text-slate-300">{flattenValue(review.research_gaps)}</td>
                </tr>)}
              </tbody>
            </table>
          </div>
        )}

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

    </div>
  );
}


export default Compare;