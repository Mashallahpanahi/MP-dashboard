// src/pages/Books/AllBooks.tsx
import { useEffect, useState } from "react";
import { getBooks, deleteBook, getBookById, updateBook } from "@/api/bookApi";
import type { Book, UpdateBookData } from "@/types/book";
import { BookUpdateModal, BookDeleteModal } from "@/components/books";

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

  // Helper function to safely format price
  const formatPrice = (price: number | string): string => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return isNaN(numPrice) ? '0.00' : numPrice.toFixed(2);
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
                    Category
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Level
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
                        {book.code}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {book.name}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          {book.author}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                        {book.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-700">
                        {book.level}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-gray-900">
                        ${formatPrice(book.bookPrice)}
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
                        <button
                          onClick={() => handleUpdateClick(book)}
                          className="inline-flex items-center rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-blue-600 transition hover:bg-blue-100"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteClick(book)}
                          disabled={deleteLoading === book.id}
                          className="inline-flex items-center rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {deleteLoading === book.id ? "Deleting..." : "Delete"}
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
    </div>
  );
};

export default AllBooks;