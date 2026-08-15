import {
  FileText,
  Clock,
  Sparkles,
  ArrowRight,
  Upload,
  LoaderCircle,
  AlertCircle,
} from "lucide-react";

import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";

import api from "../../services/api";

function Dashboard() {
  const { user } = useAuth();
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  // ============================================================
  // Fetch Papers
  // ============================================================

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
      console.error("Failed to fetch dashboard papers:", err);

      setError(
        err.response?.data?.detail ||
          "Unable to load dashboard data."
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // Load Data
  // ============================================================

  useEffect(() => {
    fetchPapers();
  }, []);

  // ============================================================
  // Dashboard Statistics
  // ============================================================

  const totalPapers = papers.length;

  const recentlyAnalyzed = papers.filter((paper) => {
    if (!paper.created_at) {
      return false;
    }

    const createdDate = new Date(paper.created_at);
    const now = new Date();

    const difference =
      now.getTime() - createdDate.getTime();

    const sevenDays =
      7 * 24 * 60 * 60 * 1000;

    return difference <= sevenDays;
  }).length;

  const aiInsights = papers.reduce((total, paper) => {
    let count = 0;

    if (paper.tldr) count++;
    if (paper.summary) count++;
    if (paper.research_problem) count++;
    if (paper.key_contributions) count++;
    if (paper.methodology) count++;
    if (paper.dataset) count++;
    if (paper.models_or_algorithms) count++;
    if (paper.key_findings) count++;
    if (paper.limitations) count++;
    if (paper.future_work) count++;

    return total + count;
  }, 0);

  const stats = [
    {
      title: "Total Papers",
      value: totalPapers,
      description: "Research papers analyzed",
      icon: FileText,
    },
    {
      title: "Recently Analyzed",
      value: recentlyAnalyzed,
      description: "Papers analyzed in the last 7 days",
      icon: Clock,
    },
    {
      title: "AI Insights",
      value: aiInsights,
      description: "AI-generated analysis insights",
      icon: Sparkles,
    },
  ];

  // ============================================================
  // Recent Papers
  // ============================================================

  const recentPapers = [...papers]
    .sort((a, b) => {
      return (
        new Date(b.created_at || 0) -
        new Date(a.created_at || 0)
      );
    })
    .slice(0, 3);

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
            Loading your dashboard...
          </p>

        </div>
      </div>
    );
  }

  // ============================================================
  // Dashboard
  // ============================================================

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Header */}

      <header className="border-b border-slate-200 bg-white">

        <div className="flex items-center justify-between px-8 py-5">

          <div>

            <h1 className="text-2xl font-bold text-slate-900">
              Dashboard
            </h1>

            <p className="mt-1 text-sm text-slate-500">
                    Welcome back,{" "}
              <span className="font-medium text-slate-700">
               {user?.user_metadata?.full_name ||
               user?.email?.split("@")[0] ||
                "Researcher"}
                </span>
                . Continue your research journey.
            </p>
          </div>

          <Link
            to="/papers"
            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            <Upload size={17} />
            Upload Paper
          </Link>

        </div>

      </header>


      {/* Content */}

      <div className="space-y-8 p-8">

        {/* Error */}

        {error && (
          <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">

            <AlertCircle size={18} />

            {error}

          </div>
        )}


        {/* Stats */}

        <section className="grid gap-5 md:grid-cols-3">

          {stats.map((stat) => {

            const Icon = stat.icon;

            return (
              <div
                key={stat.title}
                className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
              >

                <div className="flex items-start justify-between">

                  <div>

                    <p className="text-sm font-medium text-slate-500">
                      {stat.title}
                    </p>

                    <p className="mt-2 text-3xl font-bold text-slate-900">
                      {stat.value}
                    </p>

                  </div>

                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                    <Icon size={20} />
                  </div>

                </div>

                <p className="mt-4 text-sm text-slate-500">
                  {stat.description}
                </p>

              </div>
            );

          })}

        </section>


        {/* Getting Started */}

        <section className="rounded-2xl border border-indigo-100 bg-indigo-50 p-8">

          <div className="max-w-2xl">

            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-600 text-white">
              <Sparkles size={21} />
            </div>

            <h2 className="text-2xl font-bold text-slate-900">
              Start analyzing your research
            </h2>

            <p className="mt-3 leading-7 text-slate-600">
              Upload a research paper and let ResearchFlow AI
              extract its key contributions, methodology,
              limitations, keywords, and future research directions.
            </p>

            <Link
              to="/papers"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              Upload a paper
              <ArrowRight size={17} />
            </Link>

          </div>

        </section>


        {/* Recent Papers */}

        <section>

          <div className="mb-4 flex items-center justify-between">

            <div>

              <h2 className="text-lg font-bold text-slate-900">
                Recent Papers
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Your recently analyzed research papers.
              </p>

            </div>

            <Link
              to="/papers"
              className="text-sm font-semibold text-indigo-600 hover:text-indigo-700"
            >
              View all
            </Link>

          </div>


          {recentPapers.length === 0 ? (

            <div className="rounded-xl border border-slate-200 bg-white p-10 text-center shadow-sm">

              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                <FileText size={22} />
              </div>

              <h3 className="mt-4 font-semibold text-slate-900">
                No papers yet
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                Upload your first research paper to start building
                your personal research workspace.
              </p>

              <Link
                to="/papers"
                className="mt-5 inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <Upload size={16} />
                Upload Paper
              </Link>

            </div>

          ) : (

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">

              {recentPapers.map((paper) => (

                <RecentPaperCard
                  key={paper.id}
                  paper={paper}
                />

              ))}

            </div>

          )}

        </section>

      </div>

    </div>
  );
}


/* ============================================================
   Recent Paper Card
============================================================ */

function RecentPaperCard({ paper }) {

  const title =
    paper.title ||
    paper.filename ||
    "Untitled Research Paper";

  const authors =
    Array.isArray(paper.authors)
      ? paper.authors.join(", ")
      : paper.authors || "Unknown authors";

  const createdAt = paper.created_at
    ? new Date(
        paper.created_at
      ).toLocaleDateString()
    : "Recently added";

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">

      <div className="flex items-start gap-4">

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
          <FileText size={21} />
        </div>

        <div className="min-w-0 flex-1">

          <h3 className="line-clamp-2 font-semibold text-slate-900">
            {title}
          </h3>

          <p className="mt-1 line-clamp-1 text-xs text-slate-500">
            {authors}
          </p>

        </div>

      </div>


      <div className="mt-4 flex items-center justify-between text-xs text-slate-500">

        <div className="flex items-center gap-2">
          <Clock size={14} />
          {createdAt}
        </div>

        <span>
          {paper.page_count || 0} pages
        </span>

      </div>


      <Link
        to={`/analysis/${paper.id}`}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
      >
        View Analysis
        <ArrowRight size={16} />
      </Link>

    </div>
  );
}


export default Dashboard;