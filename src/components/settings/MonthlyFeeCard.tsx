// src/components/settings/MonthlyFeeCard.tsx
import { useState, useEffect } from "react";
import { 
  getMonthlyFees, 
  createMonthlyFee, 
  updateMonthlyFee, 
  deleteMonthlyFee 
} from "@/api/monthlyFeeApi";
import { getBooks } from "@/api/bookApi";
import type { MonthlyFee, CreateMonthlyFeeData } from "@/types/monthlyFee";
import type { Book } from "@/types/book";

const MonthlyFeeCard = () => {
  const [monthlyFees, setMonthlyFees] = useState<MonthlyFee[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<Partial<CreateMonthlyFeeData>>({
    bookId: "",
    month: 1,
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
        getMonthlyFees().catch(() => []),
        getBooks().catch(() => [])
      ]);
      
      setMonthlyFees(Array.isArray(feesData) ? feesData : []);
      setBooks(Array.isArray(booksData) ? booksData : []);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      setError("Failed to load data");
      setMonthlyFees([]);
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

  // Handle book selection - auto-fill month with level order
  const handleBookChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const bookId = e.target.value;
    const selectedBook = books.find(b => b.id === bookId);
    
    setFormData((prev) => ({
      ...prev,
      bookId: bookId,
      // Auto-fill month with the book's level order
      month: selectedBook?.levelOrder || 1,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.bookId) {
      setError("Please select a book");
      return;
    }
    
    // Validate month - must be a positive number
    const monthValue = Number(formData.month);
    if (!monthValue || monthValue < 1) {
      setError("Month must be a positive number (1, 2, 3, ...)");
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
      const submitData: CreateMonthlyFeeData = {
        bookId: formData.bookId,
        month: monthValue,
        fee: Number(formData.fee),
        description: formData.description || "",
        isActive: formData.isActive !== undefined ? formData.isActive : true,
      };

      console.log("Submitting data:", submitData);

      if (editingId) {
        await updateMonthlyFee(editingId, submitData);
        setSuccess("Monthly fee updated successfully!");
      } else {
        await createMonthlyFee(submitData);
        setSuccess("Monthly fee created successfully!");
      }

      setTimeout(() => {
        setShowAddForm(false);
        setEditingId(null);
        setFormData({ bookId: "", month: 1, fee: 0, description: "", isActive: true });
        fetchData();
        setSuccess("");
      }, 1500);
    } catch (error) {
      console.error("Failed to save monthly fee:", error);
      setError(
        error instanceof Error ? error.message : "Failed to save monthly fee"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (fee: MonthlyFee) => {
    setEditingId(fee.id);
    setFormData({
      bookId: fee.bookId,
      month: fee.month,
      fee: typeof fee.fee === 'string' ? parseFloat(fee.fee) : fee.fee,
      description: fee.description || "",
      isActive: fee.isActive,
    });
    setShowAddForm(true);
    setError("");
    setSuccess("");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this monthly fee?")) return;

    try {
      await deleteMonthlyFee(id);
      setSuccess("Monthly fee deleted successfully!");
      fetchData();
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error("Failed to delete monthly fee:", error);
      setError(
        error instanceof Error ? error.message : "Failed to delete monthly fee"
      );
    }
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditingId(null);
    setFormData({ bookId: "", month: 1, fee: 0, description: "", isActive: true });
    setError("");
    setSuccess("");
  };

  // Get book level order for display
  const getBookLevelOrder = (bookId: string) => {
    const book = books.find(b => b.id === bookId);
    return book?.levelOrder || '—';
  };

  // Get selected book's level order for display
  const selectedBook = books.find(b => b.id === formData.bookId);
  const autoMonth = selectedBook?.levelOrder || '—';

  if (loading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
            <p className="mt-4 text-sm text-gray-500">Loading monthly fees...</p>
          </div>
        </div>
      </div>
    );
  }

  const feesList = Array.isArray(monthlyFees) ? monthlyFees : [];

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Monthly Fees</h3>
          <p className="mt-1 text-sm text-gray-500">
            Configure monthly fees for each book
          </p>
        </div>
        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Add Monthly Fee
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
                onChange={handleBookChange}
                required
                disabled={saving}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Select a book</option>
                {Array.isArray(books) && books.map((book) => (
                  <option key={book.id} value={book.id}>
                    {book.name} (Level Order: {book.levelOrder}) {book.code ? `[${book.code}]` : ''}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">
                Selecting a book will auto-fill the month with its Level Order
              </p>
            </div>

            {/* Month - Number Input with auto-fill from level order */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Month Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  name="month"
                  value={formData.month || ""}
                  onChange={handleInputChange}
                  placeholder="1, 2, 3..."
                  min="1"
                  step="1"
                  required
                  disabled={saving}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                />
                {formData.bookId && (
                  <div className="mt-1 text-xs text-blue-600">
                    <span className="font-medium">Auto-filled from Level Order:</span> {autoMonth}
                  </div>
                )}
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Enter month number (auto-filled from book's Level Order)
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
                Enter the fee amount for this month
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

      {/* Monthly Fees Table */}
      {feesList.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
          <p className="text-sm text-gray-500">No monthly fees configured yet.</p>
          <p className="mt-1 text-xs text-gray-400">Click "Add Monthly Fee" to get started.</p>
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
                    Month
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
                      <span className="font-bold text-blue-600 text-lg">
                        {fee.month}
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

export default MonthlyFeeCard;