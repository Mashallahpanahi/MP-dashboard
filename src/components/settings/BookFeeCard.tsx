// src/components/settings/BookFeeCard.tsx
import { useState, useEffect } from "react";
import { 
  getBookFees, 
  createBookFee, 
  updateBookFee, 
  deleteBookFee,
  updateBookFeeStatus
} from "@/api/bookFeeApi";
import { getBooks } from "@/api/bookApi";
import type { BookFee, CreateBookFeeData } from "@/types/bookFee";
import type { Book } from "@/types/book";

const BookFeeCard = () => {
  const [bookFees, setBookFees] = useState<BookFee[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<Partial<CreateBookFeeData>>({
    bookId: "",
    fee: 0,
    description: "",
    isActive: true,
  });

  // Helper function to safely format fee
  const formatFee = (fee: any): string => {
    if (fee === undefined || fee === null || fee === '') {
      return '0.00';
    }
    const numFee = typeof fee === 'string' ? parseFloat(fee) : fee;
    if (isNaN(numFee)) {
      return '0.00';
    }
    return numFee.toFixed(2);
  };

  // Fetch data
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");
      
      const [feesData, booksData] = await Promise.all([
        getBookFees().catch(() => []),
        getBooks().catch(() => [])
      ]);
      
      setBookFees(Array.isArray(feesData) ? feesData : []);
      setBooks(Array.isArray(booksData) ? booksData : []);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      setError("Failed to load data");
      setBookFees([]);
      setBooks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (type === "number") {
      setFormData((prev) => ({ ...prev, [name]: value === "" ? 0 : Number(value) }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Get books that don't have a fee yet
  const getAvailableBooks = () => {
    const existingBookIds = bookFees.map(fee => fee.bookId);
    return books.filter(book => !existingBookIds.includes(book.id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.bookId) {
      setError("Please select a book");
      return;
    }
    
    if (!formData.fee || formData.fee <= 0) {
      setError("Fee must be greater than 0");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      // Prepare the data to send to backend
      const submitData: CreateBookFeeData = {
        bookId: formData.bookId,
        fee: Number(formData.fee),
        description: formData.description || "",
        isActive: formData.isActive !== undefined ? formData.isActive : true,
      };

      console.log("Submitting data:", submitData);

      if (editingId) {
        await updateBookFee(editingId, submitData);
        setSuccess("Book fee updated successfully!");
      } else {
        await createBookFee(submitData);
        setSuccess("Book fee created successfully!");
      }

      setTimeout(() => {
        setShowAddForm(false);
        setEditingId(null);
        setFormData({ bookId: "", fee: 0, description: "", isActive: true });
        fetchData();
        setSuccess("");
      }, 1500);
    } catch (error) {
      console.error("Failed to save book fee:", error);
      setError(
        error instanceof Error ? error.message : "Failed to save book fee"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (fee: BookFee) => {
    setEditingId(fee.id);
    setFormData({
      bookId: fee.bookId,
      fee: typeof fee.fee === 'string' ? parseFloat(fee.fee) : fee.fee,
      description: fee.description || "",
      isActive: fee.isActive,
    });
    setShowAddForm(true);
    setError("");
    setSuccess("");
  };

  const handleToggleStatus = async (fee: BookFee) => {
    const newStatus = !fee.isActive;
    const action = newStatus ? "activate" : "deactivate";

    if (!confirm(`Are you sure you want to ${action} the fee for "${fee.book?.name || 'this book'}"?`)) {
      return;
    }

    try {
      await updateBookFeeStatus(fee.id, { isActive: newStatus });
      setSuccess(`Book fee ${action}d successfully!`);
      fetchData();
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error("Failed to update book fee status:", error);
      setError(
        error instanceof Error ? error.message : "Failed to update book fee status"
      );
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this book fee?")) return;

    try {
      await deleteBookFee(id);
      setSuccess("Book fee deleted successfully!");
      fetchData();
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error("Failed to delete book fee:", error);
      setError(
        error instanceof Error ? error.message : "Failed to delete book fee"
      );
    }
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditingId(null);
    setFormData({ bookId: "", fee: 0, description: "", isActive: true });
    setError("");
    setSuccess("");
  };

  const availableBooks = getAvailableBooks();

  if (loading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
            <p className="mt-4 text-sm text-gray-500">Loading book fees...</p>
          </div>
        </div>
      </div>
    );
  }

  const feesList = Array.isArray(bookFees) ? bookFees : [];

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Book Fees</h3>
          <p className="mt-1 text-sm text-gray-500">
            Configure base fees for each book (one fee per book)
          </p>
        </div>
        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            disabled={availableBooks.length === 0}
            className={`rounded-lg px-4 py-2 text-sm font-medium text-white transition ${
              availableBooks.length === 0
                ? "cursor-not-allowed bg-gray-400"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
            title={availableBooks.length === 0 ? "All books already have fees" : "Add a new book fee"}
          >
            Add Book Fee
            {availableBooks.length === 0 && " (All books have fees)"}
          </button>
        )}
      </div>

      {/* Success Message */}
      {success && (
        <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-3">
          <p className="text-sm font-medium text-green-700">{success}</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3">
          <p className="text-sm font-medium text-red-700">{error}</p>
        </div>
      )}

      {/* Add/Edit Form */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Book Selection */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Book <span className="text-red-500">*</span>
              </label>
              <select
                name="bookId"
                value={formData.bookId || ""}
                onChange={handleInputChange}
                required
                disabled={saving}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Select a book</option>
                {(editingId ? books : availableBooks).map((book) => (
                  <option key={book.id} value={book.id}>
                    {book.name} (Level: {book.level}) {book.code ? `[${book.code}]` : ''}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">
                {editingId ? 'Current book for this fee' : 'Select the book for this fee'}
              </p>
            </div>

            {/* Fee */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Fee ($) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="fee"
                value={formData.fee || ""}
                onChange={handleInputChange}
                placeholder="Enter fee amount"
                min="0"
                step="0.01"
                required
                disabled={saving}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
              />
              <p className="mt-1 text-xs text-gray-500">
                Enter the base fee for this book
              </p>
            </div>

            {/* Description */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Description
              </label>
              <input
                type="text"
                name="description"
                value={formData.description || ""}
                onChange={handleInputChange}
                placeholder="Optional description"
                disabled={saving}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
              />
              <p className="mt-1 text-xs text-gray-500">
                Optional description for this fee
              </p>
            </div>

            {/* Active Status */}
            <div className="md:col-span-2">
              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive !== undefined ? formData.isActive : true}
                  onChange={handleInputChange}
                  disabled={saving}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Active</span>
              </label>
            </div>
          </div>

          {/* Form Actions */}
          <div className="mt-4 flex gap-3 border-t border-gray-200 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Saving..." : editingId ? "Update" : "Create"}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={saving}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Book Fees Table */}
      {feesList.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
          <p className="text-sm text-gray-500">No book fees configured yet.</p>
          <p className="mt-1 text-xs text-gray-400">
            {availableBooks.length > 0 
              ? `Click "Add Book Fee" to configure fees for ${availableBooks.length} book(s).`
              : "All books already have fees configured."}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Book
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Level
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Level Order
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Fee
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Description
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {feesList.map((fee) => (
                  <tr key={fee.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-900">{fee.book?.name || 'Unknown Book'}</p>
                        <p className="text-xs text-gray-500">{fee.book?.code || 'No code'}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-700">
                        {fee.book?.level || 'N/A'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-medium text-gray-900">
                        {fee.book?.levelOrder ?? 'N/A'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-semibold text-gray-900">
                        ${formatFee(fee.fee)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {fee.description || '—'}
                    </td>
                    <td className="px-4 py-3">
                      {fee.isActive ? (
                        <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
                          <span className="mr-1 h-1.5 w-1.5 rounded-full bg-green-500" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700">
                          <span className="mr-1 h-1.5 w-1.5 rounded-full bg-red-500" />
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(fee)}
                          className="rounded-lg bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-100"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleToggleStatus(fee)}
                          className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                            fee.isActive
                              ? "bg-yellow-50 text-yellow-600 hover:bg-yellow-100"
                              : "bg-green-50 text-green-600 hover:bg-green-100"
                          }`}
                        >
                          {fee.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() => handleDelete(fee.id)}
                          className="rounded-lg bg-red-50 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-100"
                        >
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
    </div>
  );
};

export default BookFeeCard;