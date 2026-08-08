import {
  Upload,
  Search,
  FileText,
  Clock,
  MoreVertical,
  Eye,
} from "lucide-react";

import { useState } from "react";
import UploadPaperModal from "../../components/paper/UploadPaperModal";

function Papers() {
  const [search, setSearch] = useState("");
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Temporary data.
  // Later this will come from FastAPI + PostgreSQL.
  const papers = [];

  const filteredPapers = papers.filter((paper) =>
    paper.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen">

      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="flex flex-col gap-4 px-8 py-6 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              My Papers
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage and explore your research papers.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowUploadModal(true)}
            className="flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            <Upload size={17} />
            Upload Paper
          </button>

        </div>
      </header>


      {/* Content */}
      <div className="space-y-6 p-8">

        {/* Search and Filters */}
        <div className="flex flex-col gap-3 sm:flex-row">

          <div className="relative flex-1">

            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              placeholder="Search your papers..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />

          </div>

        </div>


        {/* Paper Count */}
        <div className="flex items-center justify-between">

          <div>
            <p className="text-sm font-medium text-slate-700">
              {filteredPapers.length} papers
            </p>
          </div>

        </div>


        {/* Papers */}
        {filteredPapers.length === 0 ? (

          <EmptyPapersState
            onUpload={() => setShowUploadModal(true)}
          />

        ) : (

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">

            {filteredPapers.map((paper) => (

              <PaperCard
                key={paper.id}
                paper={paper}
              />

            ))}

          </div>

        )}

      </div>
       {showUploadModal && (
        <UploadPaperModal
          onClose={() => setShowUploadModal(false)}
        />
     )}
    </div>
  );
}


/* Empty State */

function EmptyPapersState({ onUpload }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">

      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
        <FileText size={26} />
      </div>

      <h2 className="mt-5 text-lg font-semibold text-slate-900">
        No research papers yet
      </h2>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        Upload your first research paper to generate an AI-powered
        summary, extract key insights, and explore the paper
        inside your research workspace.
      </p>

      <button
        type="button"
        onClick={onUpload}
        className="mt-6 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
      >
        <Upload size={17} />
        Upload Research Paper
      </button>

    </div>
  );
}


/* Paper Card */

function PaperCard({ paper }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">

      <div className="flex items-start justify-between">

        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
          <FileText size={21} />
        </div>

        <button
          type="button"
          className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
        >
          <MoreVertical size={18} />
        </button>

      </div>

      <h3 className="mt-5 line-clamp-2 font-semibold text-slate-900">
        {paper.title}
      </h3>

      <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
        <Clock size={14} />
        {paper.createdAt}
      </div>

      <button
        type="button"
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
      >
        <Eye size={16} />
        View Analysis
      </button>

    </div>
  );
}

export default Papers;