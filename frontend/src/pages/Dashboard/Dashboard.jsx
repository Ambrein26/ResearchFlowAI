import {
  FileText,
  Clock,
  Sparkles,
  ArrowRight,
  Upload,
} from "lucide-react";

import { Link } from "react-router-dom";

function Dashboard() {
  const stats = [
    {
      title: "Total Papers",
      value: "0",
      description: "Research papers analyzed",
      icon: FileText,
    },
    {
      title: "Recently Analyzed",
      value: "0",
      description: "Papers analyzed recently",
      icon: Clock,
    },
    {
      title: "AI Insights",
      value: "0",
      description: "Insights generated",
      icon: Sparkles,
    },
  ];

  return (
    <div className="min-h-screen">

      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="flex items-center justify-between px-8 py-5">

          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Dashboard
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Welcome back. Continue your research journey.
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
              Upload your first paper
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

        </section>

      </div>

    </div>
  );
}

export default Dashboard;