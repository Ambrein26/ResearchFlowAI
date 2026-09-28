import {
  ArrowLeft,
  FileText,
  Sparkles,
  LoaderCircle,
  AlertCircle,
  StickyNote,
  Bookmark,
  Plus,
  Trash2,
  Pencil,
  X,
} from "lucide-react";

import { Link, useParams } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";

import api from "../../services/api";

function Workspace() {
  const { paperId } = useParams();

  // ============================================================
  // Paper State
  // ============================================================

  const [paper, setPaper] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ============================================================
  // Notes State
  // ============================================================

  const [notes, setNotes] = useState([]);
  const [notesLoading, setNotesLoading] = useState(true);
  const [noteError, setNoteError] = useState("");

  const [showNoteForm, setShowNoteForm] = useState(false);
  const [noteContent, setNoteContent] = useState("");

  const [addingNote, setAddingNote] = useState(false);
  const [deletingNoteId, setDeletingNoteId] = useState(null);

  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editingNoteContent, setEditingNoteContent] = useState("");
  const [updatingNote, setUpdatingNote] = useState(false);

  // ============================================================
  // Bookmark State
  // ============================================================

  const [bookmarks, setBookmarks] = useState([]);
  const [bookmarksLoading, setBookmarksLoading] = useState(true);
  const [bookmarkError, setBookmarkError] = useState("");

  const [showBookmarkForm, setShowBookmarkForm] = useState(false);

  const [bookmarkTitle, setBookmarkTitle] = useState("");
  const [bookmarkLocation, setBookmarkLocation] = useState("");

  const [addingBookmark, setAddingBookmark] = useState(false);
  const [deletingBookmarkId, setDeletingBookmarkId] = useState(null);

  // ============================================================
  // Fetch Paper
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

        const paperData = response.data.paper || response.data;

        if (!paperData) {
          throw new Error("Paper data was not found.");
        }

        setPaper(paperData);
      } catch (err) {
        console.error("Failed to load workspace:", err);

        setError(
          err.response?.data?.detail ||
            err.message ||
            "Unable to load research workspace."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPaper();
  }, [paperId]);

  // ============================================================
  // Fetch Notes
  // ============================================================

  const fetchNotes = useCallback(async () => {
    if (!paperId) return;

    try {
      setNotesLoading(true);
      setNoteError("");

      const response = await api.get(
        `/api/papers/${paperId}/notes`
      );

      if (response.data.success) {
        setNotes(response.data.notes || []);
      } else {
        setNotes([]);
      }
    } catch (err) {
      console.error("Failed to load notes:", err);

      setNoteError(
        err.response?.data?.detail ||
          "Unable to load notes."
      );
    } finally {
      setNotesLoading(false);
    }
  }, [paperId]);

  // ============================================================
  // Fetch Bookmarks
  // ============================================================

  const fetchBookmarks = useCallback(async () => {
    if (!paperId) return;

    try {
      setBookmarksLoading(true);
      setBookmarkError("");

      const response = await api.get(
        `/api/papers/${paperId}/bookmarks`
      );

      if (response.data.success) {
        setBookmarks(response.data.bookmarks || []);
      } else {
        setBookmarks([]);
      }
    } catch (err) {
      console.error("Failed to load bookmarks:", err);

      setBookmarkError(
        err.response?.data?.detail ||
          "Unable to load bookmarks."
      );
    } finally {
      setBookmarksLoading(false);
    }
  }, [paperId]);

  // ============================================================
  // Load Notes + Bookmarks
  // ============================================================

  useEffect(() => {
    let cancelled = false;

    Promise.resolve().then(() => {
      if (!cancelled) {
        fetchNotes();
        fetchBookmarks();
      }
    });

    return () => {
      cancelled = true;
    };
  }, [fetchNotes, fetchBookmarks]);

  // ============================================================
  // Add Note
  // ============================================================

  const handleAddNote = async (event) => {
    event.preventDefault();

    if (!noteContent.trim()) {
      setNoteError("Note content cannot be empty.");
      return;
    }

    try {
      setAddingNote(true);
      setNoteError("");

      const response = await api.post(
        `/api/papers/${paperId}/notes`,
        {
          content: noteContent.trim(),
        }
      );

      if (response.data.success) {
        setNotes((previous) => [
          response.data.note,
          ...previous,
        ]);

        setNoteContent("");
        setShowNoteForm(false);
      }
    } catch (err) {
      console.error("Failed to create note:", err);

      setNoteError(
        err.response?.data?.detail ||
          "Unable to create note."
      );
    } finally {
      setAddingNote(false);
    }
  };

  // ============================================================
  // Start Editing Note
  // ============================================================

  const handleStartEditNote = (note) => {
    setEditingNoteId(note.id);
    setEditingNoteContent(note.content);
    setNoteError("");
  };

  // ============================================================
  // Cancel Editing Note
  // ============================================================

  const handleCancelEditNote = () => {
    setEditingNoteId(null);
    setEditingNoteContent("");
  };

  // ============================================================
  // Update Note
  // ============================================================

  const handleUpdateNote = async (noteId) => {
    if (!editingNoteContent.trim()) {
      setNoteError("Note content cannot be empty.");
      return;
    }

    try {
      setUpdatingNote(true);
      setNoteError("");

      const response = await api.put(
        `/api/papers/notes/${noteId}`,
        {
          content: editingNoteContent.trim(),
        }
      );

      if (response.data.success) {
        setNotes((previous) =>
          previous.map((note) =>
            note.id === noteId
              ? response.data.note
              : note
          )
        );

        handleCancelEditNote();
      }
    } catch (err) {
      console.error("Failed to update note:", err);

      setNoteError(
        err.response?.data?.detail ||
          "Unable to update note."
      );
    } finally {
      setUpdatingNote(false);
    }
  };

  // ============================================================
  // Delete Note
  // ============================================================

  const handleDeleteNote = async (noteId) => {
    try {
      setDeletingNoteId(noteId);
      setNoteError("");

      const response = await api.delete(
        `/api/papers/notes/${noteId}`
      );

      if (response.data.success) {
        setNotes((previous) =>
          previous.filter(
            (note) => note.id !== noteId
          )
        );
      }
    } catch (err) {
      console.error("Failed to delete note:", err);

      setNoteError(
        err.response?.data?.detail ||
          "Unable to delete note."
      );
    } finally {
      setDeletingNoteId(null);
    }
  };

  // ============================================================
  // Add Bookmark
  // ============================================================

  const handleAddBookmark = async (event) => {
    event.preventDefault();

    if (!bookmarkTitle.trim()) {
      setBookmarkError("Bookmark title is required.");
      return;
    }

    try {
      setAddingBookmark(true);
      setBookmarkError("");

      const response = await api.post(
        `/api/papers/${paperId}/bookmarks`,
        {
          title: bookmarkTitle.trim(),
          location: bookmarkLocation.trim() || null,
        }
      );

      if (response.data.success) {
        setBookmarks((previous) => [
          response.data.bookmark,
          ...previous,
        ]);

        setBookmarkTitle("");
        setBookmarkLocation("");
        setShowBookmarkForm(false);
      }
    } catch (err) {
      console.error("Failed to create bookmark:", err);

      setBookmarkError(
        err.response?.data?.detail ||
          "Unable to create bookmark."
      );
    } finally {
      setAddingBookmark(false);
    }
  };

  // ============================================================
  // Delete Bookmark
  // ============================================================

  const handleDeleteBookmark = async (bookmarkId) => {
    try {
      setDeletingBookmarkId(bookmarkId);
      setBookmarkError("");

      const response = await api.delete(
        `/api/papers/${paperId}/bookmarks/${bookmarkId}`
      );

      if (response.data.success) {
        setBookmarks((previous) =>
          previous.filter(
            (bookmark) => bookmark.id !== bookmarkId
          )
        );
      }
    } catch (err) {
      console.error("Failed to delete bookmark:", err);

      setBookmarkError(
        err.response?.data?.detail ||
          "Unable to delete bookmark."
      );
    } finally {
      setDeletingBookmarkId(null);
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
            Loading research workspace...
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

        <div className="max-w-md text-center">

          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
            <AlertCircle size={24} />
          </div>

          <h1 className="mt-4 text-xl font-bold text-slate-900">
            Unable to load workspace
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
  // Safe Paper Data
  // ============================================================

  const title =
    paper.title ||
    paper.filename ||
    "Untitled Research Paper";

  const authors = Array.isArray(paper.authors)
    ? paper.authors.join(", ")
    : paper.authors || "Unknown authors";

  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ======================================================
          Header
      ====================================================== */}

      <header className="border-b border-slate-200 bg-white">

        <div className="flex items-center justify-between px-8 py-5">

          <div className="flex items-center gap-4">

            <Link
              to={`/analysis/${paperId}`}
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
                  Research Workspace
                </span>

              </div>

              <h1 className="mt-1 max-w-3xl text-xl font-bold text-slate-900">
                {title}
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                {authors}
              </p>

            </div>

          </div>

        </div>

      </header>

      {/* ======================================================
          Main Workspace
      ====================================================== */}

      <main className="mx-auto max-w-7xl space-y-6 px-8 py-8">

        {/* Welcome */}

        <section className="rounded-2xl border border-indigo-100 bg-indigo-50 p-8">

          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-600 text-white">
            <Sparkles size={21} />
          </div>

          <h2 className="mt-5 text-2xl font-bold text-slate-900">
            Research Workspace
          </h2>

          <p className="mt-3 max-w-2xl leading-7 text-slate-600">
            Explore, organize, and build your research around this
            paper. Keep important notes and bookmarks while using
            the AI analysis as your research reference.
          </p>

        </section>

        {/* ====================================================
            Notes + Bookmarks
        ==================================================== */}

        <div className="grid gap-6 lg:grid-cols-2">

          {/* ==================================================
              Notes
          ================================================== */}

          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="flex items-center justify-between">

              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                <StickyNote size={20} />
              </div>

              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                {notes.length}
              </span>

            </div>

            <h2 className="mt-4 font-bold text-slate-900">
              Research Notes
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Add and organize your personal notes related to
              this paper.
            </p>

            {/* Add Note Button */}

            {!showNoteForm && (
              <button
                type="button"
                onClick={() => {
                  setNoteError("");
                  setShowNoteForm(true);
                }}
                className="mt-5 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
              >
                <Plus size={16} />
                Add Note
              </button>
            )}

            {/* Add Note Form */}

            {showNoteForm && (
              <form
                onSubmit={handleAddNote}
                className="mt-5 space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4"
              >

                <div>

                  <label className="text-xs font-semibold text-slate-600">
                    Note
                  </label>

                  <textarea
                    value={noteContent}
                    onChange={(event) =>
                      setNoteContent(event.target.value)
                    }
                    placeholder="Write your research note..."
                    rows={5}
                    className="mt-1 w-full resize-none rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />

                </div>

                <div className="flex gap-2">

                  <button
                    type="submit"
                    disabled={addingNote}
                    className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
                  >

                    {addingNote && (
                      <LoaderCircle
                        size={15}
                        className="animate-spin"
                      />
                    )}

                    {addingNote
                      ? "Saving..."
                      : "Save Note"}

                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowNoteForm(false);
                      setNoteContent("");
                      setNoteError("");
                    }}
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-white"
                  >
                    <X size={15} />
                    Cancel
                  </button>

                </div>

              </form>
            )}

            {/* Note Error */}

            {noteError && (
              <div className="mt-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                <AlertCircle size={15} />
                {noteError}
              </div>
            )}

            {/* Notes List */}

            <div className="mt-5">

              {notesLoading ? (

                <div className="flex items-center gap-2 py-4 text-sm text-slate-500">

                  <LoaderCircle
                    size={16}
                    className="animate-spin"
                  />

                  Loading notes...

                </div>

              ) : notes.length === 0 ? (

                <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-5 text-center">

                  <StickyNote
                    size={20}
                    className="mx-auto text-slate-400"
                  />

                  <p className="mt-2 text-sm font-medium text-slate-600">
                    No notes yet
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Add your first research note above.
                  </p>

                </div>

              ) : (

                <div className="space-y-3">

                  {notes.map((note) => (

                    <div
                      key={note.id}
                      className="rounded-lg border border-slate-200 bg-white p-4"
                    >

                      {editingNoteId === note.id ? (

                        <div className="space-y-3">

                          <textarea
                            value={editingNoteContent}
                            onChange={(event) =>
                              setEditingNoteContent(
                                event.target.value
                              )
                            }
                            rows={5}
                            className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                          />

                          <div className="flex gap-2">

                            <button
                              type="button"
                              onClick={() =>
                                handleUpdateNote(note.id)
                              }
                              disabled={updatingNote}
                              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
                            >

                              {updatingNote && (
                                <LoaderCircle
                                  size={14}
                                  className="animate-spin"
                                />
                              )}

                              {updatingNote
                                ? "Updating..."
                                : "Update"}

                            </button>

                            <button
                              type="button"
                              onClick={
                                handleCancelEditNote
                              }
                              className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                            >
                              Cancel
                            </button>

                          </div>

                        </div>

                      ) : (

                        <>

                          <div className="flex items-start justify-between gap-4">

                            <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">
                              {note.content}
                            </p>

                            <div className="flex shrink-0 gap-1">

                              <button
                                type="button"
                                onClick={() =>
                                  handleStartEditNote(note)
                                }
                                className="rounded-lg p-2 text-slate-400 transition hover:bg-indigo-50 hover:text-indigo-600"
                                title="Edit note"
                              >
                                <Pencil size={16} />
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  handleDeleteNote(note.id)
                                }
                                disabled={
                                  deletingNoteId === note.id
                                }
                                className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                                title="Delete note"
                              >

                                {deletingNoteId === note.id ? (
                                  <LoaderCircle
                                    size={16}
                                    className="animate-spin"
                                  />
                                ) : (
                                  <Trash2 size={16} />
                                )}

                              </button>

                            </div>

                          </div>

                          {note.created_at && (
                            <p className="mt-3 text-xs text-slate-400">
                              Created{" "}
                              {new Date(
                                note.created_at
                              ).toLocaleDateString()}
                            </p>
                          )}

                        </>

                      )}

                    </div>

                  ))}

                </div>

              )}

            </div>

          </section>

          {/* ==================================================
              Bookmarks
          ================================================== */}

          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="flex items-center justify-between">

              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                <Bookmark size={20} />
              </div>

              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                {bookmarks.length}
              </span>

            </div>

            <h2 className="mt-4 font-bold text-slate-900">
              Bookmarks
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Save important sections and insights from this
              research paper.
            </p>

            {/* Add Bookmark Button */}

            {!showBookmarkForm && (
              <button
                type="button"
                onClick={() => {
                  setBookmarkError("");
                  setShowBookmarkForm(true);
                }}
                className="mt-5 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
              >
                <Plus size={16} />
                Add Bookmark
              </button>
            )}

            {/* Add Bookmark Form */}

            {showBookmarkForm && (
              <form
                onSubmit={handleAddBookmark}
                className="mt-5 space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4"
              >

                <div>

                  <label className="text-xs font-semibold text-slate-600">
                    Bookmark Title
                  </label>

                  <input
                    type="text"
                    value={bookmarkTitle}
                    onChange={(event) =>
                      setBookmarkTitle(event.target.value)
                    }
                    placeholder="e.g. Important methodology"
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />

                </div>

                <div>

                  <label className="text-xs font-semibold text-slate-600">
                    Location
                  </label>

                  <input
                    type="text"
                    value={bookmarkLocation}
                    onChange={(event) =>
                      setBookmarkLocation(event.target.value)
                    }
                    placeholder="e.g. Page 4"
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />

                </div>

                <div className="flex gap-2">

                  <button
                    type="submit"
                    disabled={addingBookmark}
                    className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
                  >

                    {addingBookmark && (
                      <LoaderCircle
                        size={15}
                        className="animate-spin"
                      />
                    )}

                    {addingBookmark
                      ? "Saving..."
                      : "Save Bookmark"}

                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowBookmarkForm(false);
                      setBookmarkTitle("");
                      setBookmarkLocation("");
                      setBookmarkError("");
                    }}
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-white"
                  >
                    <X size={15} />
                    Cancel
                  </button>

                </div>

              </form>
            )}

            {/* Bookmark Error */}

            {bookmarkError && (
              <div className="mt-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                <AlertCircle size={15} />
                {bookmarkError}
              </div>
            )}

            {/* Bookmark List */}

            <div className="mt-5">

              {bookmarksLoading ? (

                <div className="flex items-center gap-2 py-4 text-sm text-slate-500">

                  <LoaderCircle
                    size={16}
                    className="animate-spin"
                  />

                  Loading bookmarks...

                </div>

              ) : bookmarks.length === 0 ? (

                <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-5 text-center">

                  <Bookmark
                    size={20}
                    className="mx-auto text-slate-400"
                  />

                  <p className="mt-2 text-sm font-medium text-slate-600">
                    No bookmarks yet
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Save important parts of this paper here.
                  </p>

                </div>

              ) : (

                <div className="space-y-3">

                  {bookmarks.map((bookmark) => (

                    <div
                      key={bookmark.id}
                      className="flex items-start justify-between gap-4 rounded-lg border border-slate-200 bg-white p-4"
                    >

                      <div className="min-w-0">

                        <p className="font-semibold text-slate-800">
                          {bookmark.title}
                        </p>

                        {bookmark.location && (
                          <p className="mt-1 text-xs text-slate-500">
                            {bookmark.location}
                          </p>
                        )}

                        {bookmark.created_at && (
                          <p className="mt-1 text-xs text-slate-400">
                            {new Date(
                              bookmark.created_at
                            ).toLocaleDateString()}
                          </p>
                        )}

                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          handleDeleteBookmark(bookmark.id)
                        }
                        disabled={
                          deletingBookmarkId === bookmark.id
                        }
                        className="shrink-0 rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                        title="Delete bookmark"
                      >

                        {deletingBookmarkId === bookmark.id ? (
                          <LoaderCircle
                            size={17}
                            className="animate-spin"
                          />
                        ) : (
                          <Trash2 size={17} />
                        )}

                      </button>

                    </div>

                  ))}

                </div>

              )}

            </div>

          </section>

        </div>

        {/* ====================================================
            Paper Information
        ==================================================== */}

        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
              <FileText size={19} />
            </div>

            <h2 className="font-bold text-slate-900">
              Paper Information
            </h2>

          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

            <InfoItem
              label="Title"
              value={title}
            />

            <InfoItem
              label="Authors"
              value={authors}
            />

            <InfoItem
              label="Pages"
              value={`${paper.page_count || 0} pages`}
            />

          </div>

        </section>

        {/* ====================================================
            Quick Navigation
        ==================================================== */}

        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

          <h2 className="font-bold text-slate-900">
            Continue Research
          </h2>

          <div className="mt-5 flex flex-wrap gap-3">

            <Link
              to={`/analysis/${paperId}`}
              className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              View AI Analysis
            </Link>

            <Link
              to="/compare"
              className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Compare Papers
            </Link>

          </div>

        </section>

      </main>

    </div>
  );
}

// ============================================================
// Info Item
// ============================================================

function InfoItem({ label, value }) {
  return (
    <div className="rounded-lg bg-slate-50 p-4">

      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 line-clamp-2 text-sm font-medium text-slate-700">
        {value}
      </p>

    </div>
  );
}

export default Workspace;