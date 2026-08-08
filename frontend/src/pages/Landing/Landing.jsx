import {
  ArrowRight,
  FileText,
  Sparkles,
  GitCompare,
} from "lucide-react";

import { Link } from "react-router-dom";

function Landing() {
  return (
    <div>

      {/* Hero Section */}
      <section className="mx-auto max-w-7xl px-6 py-20 lg:py-28">

        <div className="mx-auto max-w-4xl text-center">

          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700">
            <Sparkles size={16} />
            AI-powered research workspace
          </div>

          <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
            Understand research papers
            <span className="block text-indigo-600">
              faster with AI
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            Upload research papers, extract meaningful insights,
            explore limitations, understand complex concepts,
            and compare multiple papers in one workspace.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">

            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 font-semibold text-white transition hover:bg-indigo-700"
            >
              Start Researching
              <ArrowRight size={18} />
            </Link>

            <Link
              to="/login"
              className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Sign In
            </Link>

          </div>

        </div>
      </section>


      {/* Workflow */}
      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-16">

          <div className="mx-auto mb-12 max-w-2xl text-center">

            <h2 className="text-3xl font-bold text-slate-900">
              From paper to insight
            </h2>

            <p className="mt-3 text-slate-600">
              A focused workspace for understanding and synthesizing
              academic research.
            </p>

          </div>


          <div className="grid gap-6 md:grid-cols-3">

            {/* Feature 1 */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                <FileText size={22} />
              </div>

              <h3 className="text-lg font-semibold text-slate-900">
                Analyze Papers
              </h3>

              <p className="mt-2 leading-6 text-slate-600">
                Upload a research paper and extract its key
                contributions, methodology, limitations, and
                important findings.
              </p>

            </div>


            {/* Feature 2 */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                <Sparkles size={22} />
              </div>

              <h3 className="text-lg font-semibold text-slate-900">
                Understand with AI
              </h3>

              <p className="mt-2 leading-6 text-slate-600">
                Ask contextual questions and get explanations
                based on the research paper you're studying.
              </p>

            </div>


            {/* Feature 3 */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                <GitCompare size={22} />
              </div>

              <h3 className="text-lg font-semibold text-slate-900">
                Compare Research
              </h3>

              <p className="mt-2 leading-6 text-slate-600">
                Compare multiple papers to identify common
                approaches, differences, limitations, and
                potential research gaps.
              </p>

            </div>

          </div>
        </div>
      </section>


      {/* CTA */}
      <section className="mx-auto max-w-7xl px-6 py-20">

        <div className="rounded-2xl bg-indigo-600 px-6 py-12 text-center text-white sm:px-12">

          <h2 className="text-3xl font-bold">
            Build a better understanding of research.
          </h2>

          <p className="mx-auto mt-3 max-w-xl text-indigo-100">
            Bring your research papers into one intelligent
            workspace and turn lengthy papers into actionable insights.
          </p>

          <Link
            to="/register"
            className="mt-7 inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 font-semibold text-indigo-700 transition hover:bg-indigo-50"
          >
            Create your workspace
            <ArrowRight size={18} />
          </Link>

        </div>

      </section>

    </div>
  );
}

export default Landing;