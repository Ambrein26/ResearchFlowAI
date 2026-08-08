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
  Download,
} from "lucide-react";

import { Link } from "react-router-dom";

function Analysis() {
  const analysis = {
    title: "AI-Based Research Paper Analysis",
    authors: "Research Authors",
    pages: 12,
    readingTime: "8 min",

    tldr:
      "This research paper presents an AI-based approach for analyzing complex research data and improving decision-making through automated machine learning techniques.",

    summary:
      "The paper proposes a systematic approach for applying artificial intelligence to a real-world problem. The authors describe the problem, review existing approaches, introduce their proposed methodology, and evaluate the approach using experimental results.",

    contributions: [
      "Introduces an AI-based methodology for solving the target problem.",
      "Provides an experimental evaluation using a representative dataset.",
      "Compares the proposed approach with existing techniques.",
      "Discusses practical applications and possible improvements.",
    ],

    methodology:
      "The proposed methodology consists of data collection, preprocessing, feature extraction, model development, training, evaluation, and result analysis.",

    dataset:
      "The research uses an experimental dataset containing structured observations relevant to the problem domain.",

    model:
      "The system uses machine learning techniques to identify patterns in the collected data and generate predictions.",

    limitations: [
      "The evaluation is performed on a limited dataset.",
      "Results may vary when applied to different real-world environments.",
      "The computational requirements may increase with larger datasets.",
      "Additional experiments are required for broader validation.",
    ],

    futureWork: [
      "Evaluate the approach using larger and more diverse datasets.",
      "Improve model performance through advanced optimization techniques.",
      "Test the system in real-world environments.",
      "Explore integration with other AI techniques.",
    ],

    keywords: [
      "Artificial Intelligence",
      "Machine Learning",
      "Data Analysis",
      "Research",
      "Prediction",
    ],
  };

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Header */}

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

              <h1 className="mt-1 text-xl font-bold text-slate-900">
                {analysis.title}
              </h1>

            </div>

          </div>


          <button
            type="button"
            className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <Download size={17} />
            Export
          </button>

        </div>

      </header>


      {/* Main Content */}

      <main className="mx-auto max-w-7xl space-y-6 px-8 py-8">

        {/* Paper Metadata */}

        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">

            <div>

              <h2 className="text-lg font-bold text-slate-900">
                {analysis.title}
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                {analysis.authors}
              </p>

            </div>


            <div className="flex flex-wrap gap-3">

              <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">
                <FileText size={15} />
                {analysis.pages} pages
              </div>

              <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">
                <Clock size={15} />
                {analysis.readingTime}
              </div>

              <div className="flex items-center gap-2 rounded-lg bg-indigo-50 px-3 py-2 text-sm font-medium text-indigo-700">
                <Sparkles size={15} />
                AI analyzed
              </div>

            </div>

          </div>

        </section>


        {/* TL;DR */}

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
            {analysis.tldr}
          </p>

        </section>


        {/* Summary + Contributions */}

        <div className="grid gap-6 lg:grid-cols-2">

          <AnalysisCard
            icon={<FileText size={20} />}
            title="Research Summary"
            description={analysis.summary}
          />


          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

            <SectionHeader
              icon={<Target size={20} />}
              title="Key Contributions"
            />

            <ul className="mt-5 space-y-3">

              {analysis.contributions.map((item, index) => (

                <li
                  key={index}
                  className="flex gap-3 text-sm leading-6 text-slate-600"
                >

                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-600" />

                  {item}

                </li>

              ))}

            </ul>

          </div>

        </div>


        {/* Methodology */}

        <AnalysisCard
          icon={<Cpu size={20} />}
          title="Methodology"
          description={analysis.methodology}
        />


        {/* Dataset + Model */}

        <div className="grid gap-6 lg:grid-cols-2">

          <AnalysisCard
            icon={<Database size={20} />}
            title="Dataset"
            description={analysis.dataset}
          />

          <AnalysisCard
            icon={<Cpu size={20} />}
            title="Model / Approach"
            description={analysis.model}
          />

        </div>


        {/* Limitations */}

        <div className="rounded-xl border border-amber-200 bg-amber-50 p-6">

          <SectionHeader
            icon={<AlertTriangle size={20} />}
            title="Limitations"
          />

          <ul className="mt-5 space-y-3">

            {analysis.limitations.map((item, index) => (

              <li
                key={index}
                className="flex gap-3 text-sm leading-6 text-slate-700"
              >

                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />

                {item}

              </li>

            ))}

          </ul>

        </div>


        {/* Future Work */}

        <div className="rounded-xl border border-green-100 bg-green-50 p-6">

          <SectionHeader
            icon={<Rocket size={20} />}
            title="Future Research Directions"
          />

          <ul className="mt-5 space-y-3">

            {analysis.futureWork.map((item, index) => (

              <li
                key={index}
                className="flex gap-3 text-sm leading-6 text-slate-700"
              >

                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-green-600" />

                {item}

              </li>

            ))}

          </ul>

        </div>


        {/* Keywords */}

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

            {analysis.keywords.map((keyword) => (

              <span
                key={keyword}
                className="rounded-full bg-indigo-50 px-3 py-1.5 text-sm font-medium text-indigo-700"
              >
                {keyword}
              </span>

            ))}

          </div>

        </section>


        {/* AI Insight */}

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
            The research presents a promising direction, but further
            validation using larger datasets and real-world experiments
            would strengthen the reliability and generalizability of
            the proposed approach.
          </p>

        </section>

      </main>

    </div>
  );
}


/* Reusable Analysis Card */

function AnalysisCard({ icon, title, description }) {
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


/* Section Header */

function SectionHeader({ icon, title }) {
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