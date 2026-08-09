import {
  Upload,
  Search,
  FileText,
  Clock,
  MoreVertical,
  Eye,
  LoaderCircle,
  AlertCircle,
  Trash2,
  X,
} from "lucide-react";

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import UploadPaperModal from "../../components/paper/UploadPaperModal";
import api from "../../services/api";

function Papers() {
  const [search, setSearch] = useState("");
  const [showUploadModal, setShowUploadModal] = useState(false);

  const [papers, setPapers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [openMenuId, setOpenMenuId] = useState(null);
  const [deletePaper, setDeletePaper] = useState(null);
  const [deleting, setDeleting] = useState(false);

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
      console.error("Failed to fetch papers:", err);

      setError(
        err.response?.data?.detail ||
          "Unable to load your research papers."
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // Load Papers When Page Opens
  // ============================================================

  useEffect(() => {
    fetchPapers();
  }, []);

  // ============================================================
  // Search
  // ============================================================

  const filteredPapers = papers.filter((paper) => {
    const title = paper.title || paper.filename || "";

    return title
      .toLowerCase()
      .includes(search.toLowerCase());
  });

  // ============================================================
  // Delete Paper
  // ============================================================

  const handleDeletePaper = async () => {
    if (!deletePaper) {
      return;
    }

    try {
      setDeleting(true);
      setError("");

      await api.delete(`/api/papers/${deletePaper.id}`);

      setPapers((currentPapers) =>
        currentPapers.filter(
          (paper) => paper.id !== deletePaper.id
        )
      );

      setDeletePaper(null);
    } catch (err) {
      console.error("Failed to delete paper:", err);

      setError(
        err.response?.data?.detail ||
          "Failed to delete the paper."
      );
    } finally {
      setDeleting(false);
    }
  };

  // ============================================================
  // Loading State
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
            Loading your papers...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ======================================================
          Header
      ====================================================== */}

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


      {/* ======================================================
          Content
      ====================================================== */}

      <div className="space-y-6 p-8">

        {/* Error */}

        {error && (
          <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle size={18} />
            {error}
          </div>
        )}


        {/* Search */}

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
              onChange={(event) =>
                setSearch(event.target.value)
              }
              className="w-full rounded-lg border border-slate-300 bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />

          </div>

        </div>


        {/* Paper Count */}

        <div className="flex items-center justify-between">

          <p className="text-sm font-medium text-slate-700">
            {filteredPapers.length}
            {filteredPapers.length === 1
              ? " paper"
              : " papers"}
          </p>

        </div>


        {/* ====================================================
            Papers
        ==================================================== */}

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
                openMenuId={openMenuId}
                setOpenMenuId={setOpenMenuId}
                onDelete={() => {
                  setOpenMenuId(null);
                  setDeletePaper(paper);
                }}
              />
            ))}

          </div>

        )}

      </div>


      {/* ======================================================
          Upload Modal
      ====================================================== */}

      {showUploadModal && (
        <UploadPaperModal
          onClose={() => {
            setShowUploadModal(false);
            fetchPapers();
          }}
        />
      )}


      {/* ======================================================
          Delete Confirmation Modal
      ====================================================== */}

      {deletePaper && (
        <DeleteConfirmationModal
          paper={deletePaper}
          deleting={deleting}
          onCancel={() => {
            if (!deleting) {
              setDeletePaper(null);
            }
          }}
          onConfirm={handleDeletePaper}
        />
      )}

    </div>
  );
}


/* ============================================================
   Empty State
============================================================ */

function EmptyPapersState({ onUpload }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">

      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
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


/* ============================================================
   Paper Card
============================================================ */

function PaperCard({
  paper,
  openMenuId,
  setOpenMenuId,
  onDelete,
}) {
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

  const isMenuOpen = openMenuId === paper.id;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">

      {/* Top */}

      <div className="flex items-start justify-between">

        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
          <FileText size={21} />
        </div>


        {/* Action Menu */}

        <div className="relative">

          <button
            type="button"
            onClick={() =>
              setOpenMenuId(
                isMenuOpen ? null : paper.id
              )
            }
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            title="Paper actions"
          >
            <MoreVertical size={18} />
          </button>


          {isMenuOpen && (
            <div className="absolute right-0 top-11 z-30 w-44 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">

              {/* View Analysis */}

              <Link
                to={`/analysis/${paper.id}`}
                onClick={() => setOpenMenuId(null)}
                className="flex items-center gap-3 px-4 py-3 text-sm text-slate-700 transition hover:bg-slate-50"
              >
                <Eye size={16} />
                View Analysis
              </Link>


              {/* Delete */}

              <button
                type="button"
                onClick={onDelete}
                className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-red-600 transition hover:bg-red-50"
              >
                <Trash2 size={16} />
                Delete Paper
              </button>

            </div>
          )}

        </div>

      </div>


      {/* Title */}

      <h3 className="mt-5 line-clamp-2 font-semibold text-slate-900">
        {title}
      </h3>


      {/* Authors */}

      <p className="mt-2 line-clamp-1 text-xs text-slate-500">
        {authors}
      </p>


      {/* Metadata */}

      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500">

        <div className="flex items-center gap-2">
          <Clock size={14} />
          {createdAt}
        </div>

        <div className="flex items-center gap-2">
          <FileText size={14} />
          {paper.page_count || 0} pages
        </div>

      </div>


      {/* View Analysis */}

      <Link
        to={`/analysis/${paper.id}`}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
      >
        <Eye size={16} />
        View Analysis
      </Link>

    </div>
  );
}


/* ============================================================
   Delete Confirmation Modal
============================================================ */

function DeleteConfirmationModal({
  paper,
  deleting,
  onCancel,
  onConfirm,
}) {
  const title =
    paper.title ||
    paper.filename ||
    "this research paper";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">

        {/* Header */}

        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50 text-red-600">
              <Trash2 size={19} />
            </div>

            <h2 className="font-bold text-slate-900">
              Delete Paper
            </h2>

          </div>

          <button
            type="button"
            onClick={onCancel}
            disabled={deleting}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
          >
            <X size={20} />
          </button>

        </div>


        {/* Content */}

        <div className="px-6 py-6">

          <p className="text-sm leading-6 text-slate-600">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-slate-900">
              {title}
            </span>
            ?
          </p>

          <p className="mt-3 text-sm text-red-600">
            This action cannot be undone.
          </p>

        </div>


        {/* Footer */}

        <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-5">

          <button
            type="button"
            onClick={onCancel}
            disabled={deleting}
            className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>


          <button
            type="button"
            onClick={onConfirm}
            disabled={deleting}
            className="flex items-center gap-2 rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >

            {deleting ? (
              <>
                <LoaderCircle
                  size={17}
                  className="animate-spin"
                />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 size={17} />
                Delete Paper
              </>
            )}

          </button>

        </div>

      </div>

    </div>
  );
}


export default Papers;