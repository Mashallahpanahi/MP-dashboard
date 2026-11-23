// src/pages/Notes/Notes.tsx
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  useNotes,
  useCreateNote,
  useUpdateNote,
  useDeleteNote,
  type Note,
} from "@/api/noteApi";

// ============================================
// HELPERS
// ============================================
const formatDateTime = (dateStr: string | undefined): string => {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
};

const wasEdited = (note: Note): boolean => {
  if (!note.updatedAt || !note.createdAt) return false;
  const diff =
    new Date(note.updatedAt).getTime() - new Date(note.createdAt).getTime();
  return diff > 1000;
};

// ============================================
// MAIN PAGE
// ============================================
const Notes = () => {
  const { t } = useTranslation();

  // ✅ List hook (replaces getNotes + local notes/loading/error state)
  const {
    data: notesData,
    loading,
    error: fetchError,
    refetch: refetchNotes,
  } = useNotes();

  // ✅ Mutation hooks
  const { create: createNote, loading: creating } = useCreateNote();
  const { update: updateNote } = useUpdateNote();
  const { remove: deleteNote } = useDeleteNote();

  // ✅ Sorted newest-first, derived from hook data (mirrors original sort in loadNotes)
  const notes: Note[] = useMemo(() => {
    if (!Array.isArray(notesData)) return [];
    return [...notesData].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [notesData]);

  // Local error/success (hook error surfaces via `fetchError`)
  const [localError, setLocalError] = useState("");
  const [success, setSuccess] = useState("");
  const error = localError || fetchError || "";

  // Create
  const [newContent, setNewContent] = useState("");

  // Inline edit
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);

  // Delete
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // ============================================
  // LOAD NOTES (Refresh button)
  // ============================================
  const loadNotes = () => {
    setLocalError("");
    refetchNotes();
  };

  useEffect(() => {
    setLocalError("");
  }, []);

  // ============================================
  // CREATE
  // ============================================
  const handleCreate = async () => {
    const trimmed = newContent.trim();
    if (!trimmed) {
      setLocalError("Please write something before creating a note");
      return;
    }

    setLocalError("");
    setSuccess("");

    // ✅ Payload must be an object — backend expects { content: string }
    const ok = await createNote({ content: trimmed });

    if (!ok) {
      setLocalError("Failed to create note");
      return;
    }

    setNewContent("");
    setSuccess("Note created successfully!");
    setTimeout(() => setSuccess(""), 2500);
    // Hook's data will re-fetch automatically if useCreate triggers a refresh
    // or we refetch explicitly to guarantee the list updates:
    refetchNotes();
  };

  const handleNewKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      handleCreate();
    }
  };

  // ============================================
  // EDIT
  // ============================================
  const handleStartEdit = (note: Note) => {
    setEditingId(note.id);
    setEditContent(note.content);
    setLocalError("");
    setSuccess("");
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditContent("");
  };

  const handleSaveEdit = async (id: string) => {
    const trimmed = editContent.trim();
    if (!trimmed) {
      setLocalError("Note content cannot be empty");
      return;
    }

    setSavingId(id);
    setLocalError("");
    setSuccess("");

    // ✅ Payload must be an object — backend expects { content: string }
    const ok = await updateNote(id, { content: trimmed });

    if (!ok) {
      setLocalError("Failed to update note");
      setSavingId(null);
      return;
    }

    setEditingId(null);
    setEditContent("");
    setSuccess("Note updated successfully!");
    setTimeout(() => setSuccess(""), 2500);
    setSavingId(null);
    refetchNotes();
  };

  const handleEditKeyDown = (
    e: React.KeyboardEvent<HTMLTextAreaElement>,
    id: string,
  ) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      handleSaveEdit(id);
    }
    if (e.key === "Escape") {
      e.preventDefault();
      handleCancelEdit();
    }
  };

  // ============================================
  // DELETE
  // ============================================
  const handleRequestDelete = (id: string) => {
    setConfirmDeleteId(id);
  };

  const handleCancelDelete = () => {
    setConfirmDeleteId(null);
  };

  const handleConfirmDelete = async (id: string) => {
    setDeletingId(id);
    setLocalError("");
    setSuccess("");

    const ok = await deleteNote(id);

    if (!ok) {
      setLocalError("Failed to delete note");
      setDeletingId(null);
      return;
    }

    setConfirmDeleteId(null);
    setSuccess("Note deleted successfully!");
    setTimeout(() => setSuccess(""), 2500);
    setDeletingId(null);
    refetchNotes();
  };

  // ============================================
  // RENDER
  // ============================================
  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {t("sidebar.notes") || "Notes"}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Write down important notes, meeting minutes, and reminders
        </p>
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4">
          <div className="flex items-start gap-2">
            <svg
              className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-sm font-medium text-red-700">{error}</p>
          </div>
        </div>
      )}
      {success && (
        <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-4">
          <div className="flex items-start gap-2">
            <svg
              className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <p className="text-sm font-medium text-green-700">{success}</p>
          </div>
        </div>
      )}

      {/* ============================================ */}
      {/* CREATE NOTE */}
      {/* ============================================ */}
      <div className="mb-8 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <label className="mb-2 block text-sm font-semibold text-gray-700">
          Write a new note
        </label>
        <textarea
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
          onKeyDown={handleNewKeyDown}
          rows={4}
          placeholder="Type your note here... (Ctrl/Cmd + Enter to save)"
          className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
        <div className="mt-3 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-gray-400">
            Tip: Press{" "}
            <kbd className="rounded border border-gray-300 bg-gray-50 px-1.5 py-0.5 font-mono text-[10px]">
              Ctrl
            </kbd>{" "}
            +{" "}
            <kbd className="rounded border border-gray-300 bg-gray-50 px-1.5 py-0.5 font-mono text-[10px]">
              Enter
            </kbd>{" "}
            to save
          </p>
          <button
            type="button"
            onClick={handleCreate}
            disabled={creating || !newContent.trim()}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {creating ? (
              <>
                <svg
                  className="h-4 w-4 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Creating...
              </>
            ) : (
              <>
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Create Note
              </>
            )}
          </button>
        </div>
      </div>

      {/* ============================================ */}
      {/* NOTES LIST */}
      {/* ============================================ */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500">
          All Notes ({notes.length})
        </h2>
        <button
          onClick={loadNotes}
          disabled={loading}
          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <svg
            className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Refresh
        </button>
      </div>

      {/* Loading */}
      {loading && notes.length === 0 && (
        <div className="flex min-h-[200px] items-center justify-center rounded-xl border border-gray-200 bg-white">
          <div className="text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
            <p className="mt-3 text-sm text-gray-500">Loading notes...</p>
          </div>
        </div>
      )}

      {/* Empty */}
      {!loading && notes.length === 0 && (
        <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-10 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
            <svg
              className="h-7 w-7 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </div>
          <h3 className="text-base font-semibold text-gray-900">
            No notes yet
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Write your first note above to get started.
          </p>
        </div>
      )}

      {/* Notes Grid */}
      {notes.length > 0 && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {notes.map((note) => {
            const isEditing = editingId === note.id;
            const isSaving = savingId === note.id;
            const isDeleting = deletingId === note.id;
            const isConfirming = confirmDeleteId === note.id;
            const edited = wasEdited(note);

            return (
              <div
                key={note.id}
                className="flex flex-col rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md"
              >
                {/* Header: timestamps */}
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[11px] text-gray-500">
                    <svg
                      className="h-3.5 w-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    {formatDateTime(note.createdAt)}
                  </div>
                  {edited && (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-700">
                      Edited
                    </span>
                  )}
                </div>

                {/* Content / Edit area */}
                {isEditing ? (
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    onKeyDown={(e) => handleEditKeyDown(e, note.id)}
                    rows={5}
                    autoFocus
                    className="mb-3 w-full resize-none rounded-lg border border-blue-400 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-100"
                  />
                ) : (
                  <p className="mb-4 whitespace-pre-wrap break-words text-sm text-gray-700">
                    {note.content}
                  </p>
                )}

                {/* Footer: actions */}
                <div className="mt-auto flex items-center justify-between gap-2 border-t border-gray-100 pt-3">
                  {isEditing ? (
                    <>
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        disabled={isSaving}
                        className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveEdit(note.id)}
                        disabled={isSaving || !editContent.trim()}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isSaving ? (
                          <>
                            <svg
                              className="h-3.5 w-3.5 animate-spin"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              />
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                              />
                            </svg>
                            Saving
                          </>
                        ) : (
                          <>Save</>
                        )}
                      </button>
                    </>
                  ) : isConfirming ? (
                    <>
                      <p className="text-xs font-medium text-red-600">
                        Delete this note?
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleCancelDelete}
                          disabled={isDeleting}
                          className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          No
                        </button>
                        <button
                          type="button"
                          onClick={() => handleConfirmDelete(note.id)}
                          disabled={isDeleting}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {isDeleting ? "Deleting..." : "Yes, delete"}
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => handleStartEdit(note)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 transition hover:bg-blue-100"
                      >
                        <svg
                          className="h-3.5 w-3.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRequestDelete(note.id)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-100"
                      >
                        <svg
                          className="h-3.5 w-3.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3"
                          />
                        </svg>
                        Delete
                      </button>
                    </>
                  )}
                </div>

                {/* Edited timestamp when in edit mode */}
                {isEditing && edited && (
                  <p className="mt-2 text-[10px] text-gray-400">
                    Last edited: {formatDateTime(note.updatedAt)}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Notes;
