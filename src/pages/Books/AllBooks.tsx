// src/pages/Books/AllBooks.tsx
import { useEffect, useState } from "react";
import {
  getBooks,
  deleteBook,
  getBookById,
  updateBook,
  updateBookStatus,
  type UpdateBookData,
} from "@/api/bookApi";
import type { Book } from "@/types/book";
import BookUpdateModal from "@/components/books/BookUpdateModal";
import BookDeleteModal from "@/components/books/BookDeleteModal";
import BookDetailsModal from "@/components/books/BookDetailsModal";

const AllBooks = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Delete state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [bookToDelete, setBookToDelete] = useState<Book | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Update state
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [bookToUpdate, setBookToUpdate] = useState<Book | null>(null);
  const [updateLoading, setUpdateLoading] = useState(false);

  // Details state
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [bookToView, setBookToView] = useState<Book | null>(null);

  // Status update state
  const [statusLoading, setStatusLoading] = useState<string | null>(null);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getBooks();
      setBooks(data);
    } catch (error) {
      console.error("Failed to fetch books:", error);
      setError(
        error instanceof Error ? error.message : "Failed to fetch books"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  // Status toggle handler
  const handleToggleStatus = async (book: Book) => {
    const newStatus = !book.isActive;
    const action = newStatus ? "activate" : "deactivate";

    if (!confirm(`Are you sure you want to ${action} "${book.name}"?`)) {
      return;
    }

    try {
      setStatusLoading(book.id);
      
      await updateBookStatus(book.id, { isActive: newStatus });

      // Update the book in the list
      setBooks((prev) =>
        prev.map((b) =>
          b.id === book.id ? { ...b, isActive: newStatus } : b
        )
      );

      alert(`Book ${action}d successfully!`);
    } catch (error) {
      console.error("Failed to update book status:", error);
      setError(
        error instanceof Error ? error.message : "Failed to update book status"
      );
    } finally {
      setStatusLoading(null);
    }
  };

  // Delete handlers
  const handleDeleteClick = (book: Book) => {
    setBookToDelete(book);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!bookToDelete) return;

    try {
      setDeleteLoading(true);
      await deleteBook(bookToDelete.id);
      setBooks((prev) => prev.filter((book) => book.id !== bookToDelete.id));
      setShowDeleteModal(false);
      setBookToDelete(null);
    } catch (error) {
      console.error("Failed to delete book:", error);
      setError(
        error instanceof Error ? error.message : "Failed to delete book"
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setBookToDelete(null);
  };

  // Update handlers
  const handleUpdateClick = async (book: Book) => {
    try {
      setUpdateLoading(true);
      const bookData = await getBookById(book.id);
      setBookToUpdate(bookData);
      setShowUpdateModal(true);
    } catch (error) {
      console.error("Failed to fetch book for update:", error);
      setError(
        error instanceof Error ? error.message : "Failed to load book data"
      );
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleUpdateBook = async (id: string, data: UpdateBookData) => {
    const updatedBook = await updateBook(id, data);
    setBooks((prev) =>
      prev.map((book) =>
        book.id === updatedBook.id ? updatedBook : book
      )
    );
  };

  const handleCloseUpdate = () => {
    setShowUpdateModal(false);
    setBookToUpdate(null);
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

  // Helper function to format price - handles both string and number
  const formatPrice = (price: number | string): string => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    if (isNaN(numPrice)) {
      return '$0.00';
    }
    return `$${numPrice.toFixed(2)}`;
  };

  // Helper function to format date
  const formatDate = (dateString: string): string => {
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return 'N/A';
    }
  };

  if (loading) {
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
        <button
          onClick={() => window.location.href = "/books/add"}
          className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          Add New Book
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-medium text-red-700">{error}</p>
        </div>
      )}

      {/* Empty State */}
      {books.length === 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-10 text-center shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900">No Books Found</h3>
          <p className="mt-2 text-sm text-gray-500">
            There are no books registered yet.
          </p>
          <button
            onClick={() => window.location.href = "/books/add"}
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
                    Code
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Level
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Category
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Price
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
                      <span className="inline-flex rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                        {book.code || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {book.name}
                        </p>
                        {book.author && (
                          <p className="mt-1 text-xs text-gray-500">
                            By: {book.author}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-700">
                        {book.level || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                        {book.category || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-gray-900">
                        {formatPrice(book.bookPrice)}
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
                        {/* View Details Button - NEW */}
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
                          disabled={deleteLoading}
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
        isLoading={deleteLoading}
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