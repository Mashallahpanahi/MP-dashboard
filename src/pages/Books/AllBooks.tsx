// src/pages/Books/AllBooks.tsx
import { useEffect, useState } from "react";
import {
  useBooks,
  useBookById,
  useDeleteBook,
  useUpdateBook,
  useUpdateBookStatus,
  type Book,
  type UpdateBookData,
} from "@/api/bookApi";
import BookUpdateModal from "@/components/books/BookUpdateModal";
import BookDeleteModal from "@/components/books/BookDeleteModal";
import BookDetailsModal from "@/components/books/BookDetailsModal";

const AllBooks = () => {
  // ✅ List hook (replaces getBooks + local list/loading/error state)
  const {
    data: fetchedBooks,
    loading,
    error: fetchError,
    refetch,
  } = useBooks();

  // ✅ Mutation hooks
  const { remove, loading: deleting } = useDeleteBook();
  const { update } = useUpdateBook();
  const { updateStatus } = useUpdateBookStatus();

  // Local mirror (optimistic updates for status toggle)
  const [books, setBooks] = useState<Book[]>([]);
  const [localError, setLocalError] = useState("");

  // Sync hook data → local mirror
  useEffect(() => {
    if (fetchedBooks) setBooks(fetchedBooks);
  }, [fetchedBooks]);

  // Combined error (local + fetch)
  const error = localError || fetchError || "";

  // Delete state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [bookToDelete, setBookToDelete] = useState<Book | null>(null);

  // Update state — track ID, let the hook fetch fresh details
  const [bookToUpdateId, setBookToUpdateId] = useState<string | null>(null);

  const { data: fetchedBookToUpdate, loading: updateLoading } = useBookById(
    bookToUpdateId ?? "",
    !!bookToUpdateId,
  );

  // Prefer freshly-fetched book; fall back to the list copy while loading
  const bookToUpdate: Book | null = bookToUpdateId
    ? fetchedBookToUpdate?.id === bookToUpdateId
      ? fetchedBookToUpdate
      : (books.find((b) => b.id === bookToUpdateId) ?? null)
    : null;

  const showUpdateModal = !!bookToUpdateId && !!bookToUpdate;

  // Details state
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [bookToView, setBookToView] = useState<Book | null>(null);

  // Status toggle per-row spinner
  const [statusLoading, setStatusLoading] = useState<string | null>(null);

  // Refresh button
  const handleRefresh = () => {
    setLocalError("");
    refetch();
  };

  // Status toggle handler
  const handleToggleStatus = async (book: Book) => {
    const newStatus = !book.isActive;
    const action = newStatus ? "activate" : "deactivate";

    if (!confirm(`Are you sure you want to ${action} "${book.name}"?`)) {
      return;
    }

    setStatusLoading(book.id);
    const ok = await updateStatus(book.id, newStatus);
    setStatusLoading(null);

    if (!ok) {
      setLocalError(`Failed to ${action} book`);
      return;
    }

    // Optimistic local update
    setBooks((prev) =>
      prev.map((b) => (b.id === book.id ? { ...b, isActive: newStatus } : b)),
    );

    alert(`Book ${action}d successfully!`);
  };

  // Delete handlers
  const handleDeleteClick = (book: Book) => {
    setBookToDelete(book);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!bookToDelete) return;
    setLocalError("");
    const ok = await remove(bookToDelete.id);

    if (ok) {
      setBooks((prev) => prev.filter((b) => b.id !== bookToDelete.id));
      setShowDeleteModal(false);
      setBookToDelete(null);
    } else {
      setLocalError("Failed to delete book");
      setShowDeleteModal(false);
      setBookToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setBookToDelete(null);
  };

  // Update handlers
  const handleUpdateClick = (book: Book) => {
    // Modal opens instantly with list data; hook fetches fresh copy in background
    setBookToUpdateId(book.id);
  };

  const handleUpdateBook = async (id: string, data: UpdateBookData) => {
    const ok = await update(id, data);
    if (!ok) {
      // Throw to keep the modal open on failure
      throw new Error("Failed to update book. Please try again.");
    }
    setBookToUpdateId(null);
    await refetch();
  };

  const handleCloseUpdate = () => {
    setBookToUpdateId(null);
  };

  // Details handlers
  const handleViewDetails = (book: Book) => {
    setBookToView(book);
    setShowDetailsModal(true);
  };

  const handleCloseDetails = () => {
    setShowDetailsModal(false);
    setBookToView(null);
  };

  if (loading && books.length === 0) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
          <p className="mt-4 text-sm text-gray-500">Loading books...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">All Books</h1>
          <p className="mt-1 text-sm text-gray-500">
            View and manage all books in the system
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Loading..." : "Refresh"}
          </button>
          <button
            onClick={() => (window.location.href = "/books/add")}
            className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            Add New Book
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm font-medium text-red-700">{error}</p>
            <button
              onClick={handleRefresh}
              className="rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {books.length === 0 && !loading && (
        <div className="rounded-xl border border-gray-200 bg-white p-10 text-center shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900">
            No Books Found
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            There are no books registered yet.
          </p>
          <button
            onClick={() => (window.location.href = "/books/add")}
            className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Add Your First Book
          </button>
        </div>
      )}

      {/* Books Table */}
      {books.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr className="border-b border-gray-200">
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Level
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {books.map((book) => (
                  <tr key={book.id} className="transition hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-900">{book.name}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-700">
                        {book.level || "N/A"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {book.isActive ? (
                        <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                          <span className="mr-2 h-2 w-2 rounded-full bg-green-500" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                          <span className="mr-2 h-2 w-2 rounded-full bg-red-500" />
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {/* View */}
                        <button
                          onClick={() => handleViewDetails(book)}
                          className="inline-flex items-center rounded-lg bg-gray-50 px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-gray-700"
                          title="View full details"
                        >
                          <svg
                            className="mr-2 h-4 w-4"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                          View
                        </button>

                        <button
                          onClick={() => handleUpdateClick(book)}
                          className="inline-flex items-center rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-blue-600 transition hover:bg-blue-100"
                        >
                          <svg
                            className="mr-2 h-4 w-4"
                            xmlns="http://www.w3.org/2000/svg"
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
                          onClick={() => handleToggleStatus(book)}
                          disabled={statusLoading === book.id}
                          className={`inline-flex items-center rounded-lg px-3 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${
                            book.isActive
                              ? "bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700"
                              : "bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700"
                          }`}
                        >
                          {statusLoading === book.id ? (
                            <>
                              <svg
                                className="mr-2 h-4 w-4 animate-spin"
                                xmlns="http://www.w3.org/2000/svg"
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
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                />
                              </svg>
                              Updating...
                            </>
                          ) : book.isActive ? (
                            <>
                              <svg
                                className="mr-2 h-4 w-4"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                                />
                              </svg>
                              Deactivate
                            </>
                          ) : (
                            <>
                              <svg
                                className="mr-2 h-4 w-4"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                              Activate
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => handleDeleteClick(book)}
                          disabled={deleting}
                          className="inline-flex items-center rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <svg
                            className="mr-2 h-4 w-4"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      <BookDeleteModal
        isOpen={showDeleteModal}
        book={bookToDelete}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        isLoading={deleting}
      />

      {/* Update Modal */}
      <BookUpdateModal
        isOpen={showUpdateModal}
        book={bookToUpdate}
        onClose={handleCloseUpdate}
        onUpdate={handleUpdateBook}
        isLoading={updateLoading}
      />

      {/* Details Modal */}
      <BookDetailsModal
        isOpen={showDetailsModal}
        book={bookToView}
        onClose={handleCloseDetails}
      />
    </div>
  );
};

export default AllBooks;
