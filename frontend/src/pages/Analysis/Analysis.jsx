import {
  ArrowLeft,
  FileText,
  Sparkles,
  Lightbulb,
  Target,
  Database,
  Cpu,
  AlertTriangle,
  Rocket,
  Tag,
  Clock,
  LoaderCircle,
  AlertCircle,
  Download,
} from "lucide-react";

import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";

import api from "../../services/api";

function Analysis() {
  const { paperId } = useParams();

  const [paper, setPaper] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ============================================================
  // Fetch Paper Analysis
  // ============================================================

  useEffect(() => {
    const fetchPaper = async () => {
      try {
        setLoading(true);
        setError("");

        if (!paperId) {
          setError("Paper ID is missing.");
          return;
        }

        const response = await api.get(`/api/papers/${paperId}`);

        /*
         * Backend may return:
         * {
         *   success: true,
         *   paper: {...}
         * }
         *
         * or directly:
         * {
         *   id: ...,
         *   title: ...
         * }
         */

        const paperData = response.data.paper || response.data;

        if (!paperData) {
          throw new Error("Paper data was not found.");
        }

        setPaper(paperData);
      } catch (err) {
        console.error("Failed to load paper analysis:", err);

        setError(
          err.response?.data?.detail ||
            err.message ||
            "Unable to load paper analysis."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPaper();
  }, [paperId]);

  // ============================================================
  // Loading
  // ============================================================

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <LoaderCircle
            size={42}
            className="animate-spin text-indigo-600"
          />

          <p className="text-sm font-medium text-slate-600">
            Loading paper analysis...
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
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
        <div className="w-full max-w-lg rounded-xl border border-red-200 bg-white p-8 text-center shadow-sm">

          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
            <AlertCircle size={24} />
          </div>

          <h1 className="mt-4 text-xl font-bold text-slate-900">
            Unable to load analysis
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            {error || "The requested paper could not be found."}
          </p>

          <Link
            to="/papers"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            <ArrowLeft size={17} />
            Back to My Papers
          </Link>

        </div>
      </div>
    );
  }

  // ============================================================
  // Safe Data Handling
  // ============================================================

  const title =
    paper.title ||
    paper.filename ||
    "Untitled Research Paper";

  const authors = Array.isArray(paper.authors)
    ? paper.authors.join(", ")
    : paper.authors || "Unknown authors";

  const pageCount = paper.page_count || 0;

  const tldr =
    paper.tldr ||
    "No quick summary was generated for this paper.";

  const summary =
    paper.summary ||
    "No research summary is available.";

  const contributions = normalizeList(
    paper.key_contributions
  );

  const methodology =
    paper.methodology ||
    "No methodology information is available.";

  const dataset =
    paper.dataset ||
    "No dataset information is available.";

  const model =
    paper.models_or_algorithms ||
    "No model or algorithm information is available.";

  const findings =
    paper.key_findings ||
    "No key findings are available.";

  const limitations = normalizeList(
    paper.limitations
  );

  const futureWork = normalizeList(
    paper.future_work
  );

  const keywords = normalizeList(
    paper.keywords
  );

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ======================================================
          Header
      ====================================================== */}

      <header className="border-b border-slate-200 bg-white">

        <div className="flex items-center justify-between px-8 py-5">

          <div className="flex items-center gap-4">

            <Link
              to="/papers"
              className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            >
              <ArrowLeft size={20} />
            </Link>

            <div>

              <div className="flex items-center gap-2">

                <FileText
                  size={18}
                  className="text-indigo-600"
                />

                <span className="text-sm font-medium text-slate-500">
                  Paper Analysis
                </span>

              </div>

              <h1 className="mt-1 max-w-3xl text-xl font-bold text-slate-900">
                {title}
              </h1>

            </div>

          </div>


        <div className="flex items-center gap-3">

         <Link
          to={`/workspace/${paperId}`}
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
         >
         <Sparkles size={17} />
          Research Workspace
         </Link>

         <button
          type="button"
          onClick={() => window.print()}
          className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
         <Download size={17} />
          Export
         </button>

        </div>

        </div>

      </header>


      {/* ======================================================
          Main Content
      ====================================================== */}

      <main className="mx-auto max-w-7xl space-y-6 px-8 py-8">

        {/* ====================================================
            Paper Metadata
        ==================================================== */}

        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">

            <div>

              <h2 className="text-lg font-bold text-slate-900">
                {title}
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                {authors}
              </p>

            </div>


            <div className="flex flex-wrap gap-3">

              <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">
                <FileText size={15} />
                {pageCount} pages
              </div>

              <div className="flex items-center gap-2 rounded-lg bg-indigo-50 px-3 py-2 text-sm font-medium text-indigo-700">
                <Sparkles size={15} />
                AI analyzed
              </div>

            </div>

          </div>

        </section>


        {/* ====================================================
            TL;DR
        ==================================================== */}

        <section className="rounded-xl border border-indigo-100 bg-indigo-50 p-6">

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600 text-white">
              <Sparkles size={20} />
            </div>

            <div>

              <h2 className="font-bold text-slate-900">
                TL;DR
              </h2>

              <p className="text-sm text-slate-500">
                Quick understanding of the research
              </p>

            </div>

          </div>

          <p className="mt-5 leading-7 text-slate-700">
            {tldr}
          </p>

        </section>


        {/* ====================================================
            Summary + Contributions
        ==================================================== */}

        <div className="grid gap-6 lg:grid-cols-2">

          <AnalysisCard
            icon={<FileText size={20} />}
            title="Research Summary"
            description={summary}
          />


          <ListCard
            icon={<Target size={20} />}
            title="Key Contributions"
            items={contributions}
          />

        </div>


        {/* ====================================================
            Methodology
        ==================================================== */}

        <AnalysisCard
          icon={<Cpu size={20} />}
          title="Methodology"
          description={methodology}
        />


        {/* ====================================================
            Dataset + Model
        ==================================================== */}

        <div className="grid gap-6 lg:grid-cols-2">

          <AnalysisCard
            icon={<Database size={20} />}
            title="Dataset"
            description={dataset}
          />

          <AnalysisCard
            icon={<Cpu size={20} />}
            title="Model / Approach"
            description={model}
          />

        </div>


        {/* ====================================================
            Key Findings
        ==================================================== */}

        <AnalysisCard
          icon={<Sparkles size={20} />}
          title="Key Findings"
          description={findings}
        />


        {/* ====================================================
            Limitations
        ==================================================== */}

        <ListCard
          icon={<AlertTriangle size={20} />}
          title="Limitations"
          items={limitations}
          variant="warning"
        />


        {/* ====================================================
            Future Work
        ==================================================== */}

        <ListCard
          icon={<Rocket size={20} />}
          title="Future Research Directions"
          items={futureWork}
          variant="success"
        />


        {/* ====================================================
            Keywords
        ==================================================== */}

        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
              <Tag size={19} />
            </div>

            <h2 className="font-bold text-slate-900">
              Keywords
            </h2>

          </div>


          <div className="mt-5 flex flex-wrap gap-2">

            {keywords.length > 0 ? (
              keywords.map((keyword, index) => (
                <span
                  key={`${keyword}-${index}`}
                  className="rounded-full bg-indigo-50 px-3 py-1.5 text-sm font-medium text-indigo-700"
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


        {/* ====================================================
            AI Insight
        ==================================================== */}

        <section className="rounded-xl border border-purple-100 bg-purple-50 p-6">

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-600 text-white">
              <Lightbulb size={20} />
            </div>

            <div>

              <h2 className="font-bold text-slate-900">
                AI Research Insight
              </h2>

              <p className="text-sm text-slate-500">
                Generated from the analyzed paper
              </p>

            </div>

          </div>

          <p className="mt-5 leading-7 text-slate-700">
            {generateInsight(paper)}
          </p>

        </section>

      </main>

    </div>
  );
}


// ============================================================
// Helper: Convert Backend Values Into Arrays
// ============================================================

function normalizeList(value) {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value === "string") {
    return value
      .split(/\n|•|;/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}


// ============================================================
// AI Insight Helper
// ============================================================

function generateInsight(paper) {
  if (paper.key_findings) {
    return typeof paper.key_findings === "string"
      ? paper.key_findings
      : "The analysis identifies important findings from the research paper.";
  }

  return (
    "The research provides useful insights based on the analyzed methodology, " +
    "findings, and experimental results. Further validation using larger and " +
    "more diverse datasets could strengthen the reliability and generalizability " +
    "of the research."
  );
}


// ============================================================
// Analysis Card
// ============================================================

function AnalysisCard({
  icon,
  title,
  description,
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

      <SectionHeader
        icon={icon}
        title={title}
      />

      <p className="mt-5 text-sm leading-7 text-slate-600">
        {description}
      </p>

    </section>
  );
}


// ============================================================
// List Card
// ============================================================

function ListCard({
  icon,
  title,
  items,
  variant = "default",
}) {

  const styles = {
    default: {
      container:
        "border-slate-200 bg-white",
      icon:
        "bg-indigo-50 text-indigo-600",
      bullet:
        "bg-indigo-600",
      text:
        "text-slate-600",
    },

    warning: {
      container:
        "border-amber-200 bg-amber-50",
      icon:
        "bg-amber-100 text-amber-700",
      bullet:
        "bg-amber-500",
      text:
        "text-slate-700",
    },

    success: {
      container:
        "border-green-100 bg-green-50",
      icon:
        "bg-green-100 text-green-700",
      bullet:
        "bg-green-600",
      text:
        "text-slate-700",
    },
  };

  const style = styles[variant];

  return (
    <section
      className={`rounded-xl border p-6 shadow-sm ${style.container}`}
    >

      <div className="flex items-center gap-3">

        <div
          className={`flex h-10 w-10 items-center justify-center rounded-lg ${style.icon}`}
        >
          {icon}
        </div>

        <h2 className="font-bold text-slate-900">
          {title}
        </h2>

      </div>


      <ul className="mt-5 space-y-3">

        {items.length > 0 ? (

          items.map((item, index) => (

            <li
              key={`${item}-${index}`}
              className={`flex gap-3 text-sm leading-6 ${style.text}`}
            >

              <span
                className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${style.bullet}`}
              />

              <span>{item}</span>

            </li>

          ))

        ) : (

          <li className="text-sm text-slate-500">
            No information available.
          </li>

        )}

      </ul>

    </section>
  );
}


// ============================================================
// Section Header
// ============================================================

function SectionHeader({
  icon,
  title,
}) {
  return (
    <div className="flex items-center gap-3">

      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
        {icon}
      </div>

      <h2 className="font-bold text-slate-900">
        {title}
      </h2>

    </div>
  );
}

export default Analysis;