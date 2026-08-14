// src/components/expenses/ExpenseUpdateModal.tsx
import { useState, useEffect } from "react";
import type { Expense, UpdateExpenseData, ExpenseCategory } from "@/types/expense";

interface ExpenseUpdateModalProps {
  isOpen: boolean;
  expense: Expense | null;
  categories: ExpenseCategory[];
  onClose: () => void;
  onUpdate: (id: string, data: UpdateExpenseData) => Promise<void>;
  isLoading?: boolean;
}

const ExpenseUpdateModal = ({
  isOpen,
  expense,
  categories,
  onClose,
  onUpdate,
  isLoading = false,
}: ExpenseUpdateModalProps) => {
  const [formData, setFormData] = useState<UpdateExpenseData>({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (expense) {
      setFormData({
        categoryId: expense.categoryId,
        description: expense.description,
        amount: expense.amount,
        date: expense.date.split('T')[0],
        paymentMethod: expense.paymentMethod,
        status: expense.status,
        vendor: expense.vendor,
        receiptNumber: expense.receiptNumber || "",
        notes: expense.notes || "",
      });
      setError("");
      setSuccess("");
    }
  }, [expense]);

  if (!isOpen || !expense) return null;

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;

    if (type === "number") {
      setFormData((prev) => ({
        ...prev,
        [name]: value === "" ? 0 : parseFloat(value),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!expense) return;

    try {
      setIsSubmitting(true);
      setError("");
      setSuccess("");

      // Only send fields that have changed
      const changedData: UpdateExpenseData = {};
      const keys = Object.keys(formData) as (keyof UpdateExpenseData)[];

      keys.forEach((key) => {
        const currentValue = formData[key];
        const originalValue = expense[key as keyof Expense];

        if (typeof currentValue === 'number' && typeof originalValue === 'number') {
          if (currentValue !== originalValue) {
            changedData[key] = currentValue;
          }
        } else if (currentValue !== originalValue) {
          changedData[key] = currentValue;
        }
      });

      if (Object.keys(changedData).length === 0) {
        setSuccess("No changes made.");
        setTimeout(() => {
          onClose();
          setFormData({});
          setSuccess("");
        }, 1000);
        return;
      }

      await onUpdate(expense.id, changedData);

      setSuccess("Expense updated successfully!");

      setTimeout(() => {
        onClose();
        setFormData({});
        setSuccess("");
      }, 1500);
    } catch (error) {
      console.error("Failed to update expense:", error);
      setError(
        error instanceof Error ? error.message : "Failed to update expense"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
      setFormData({});
      setError("");
      setSuccess("");
    }
  };

  const formatCurrency = (amount: number): string => {
    return `$${amount.toFixed(2)}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              Update Expense
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Edit expense details
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting || isLoading}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <svg
              className="h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {success && (
          <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-4">
            <p className="text-sm font-medium text-green-700">{success}</p>
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm font-medium text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Category */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Category *
              </label>
              <select
                name="categoryId"
                value={formData.categoryId || ""}
                onChange={handleChange}
                required
                disabled={isLoading || isSubmitting}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Description *
              </label>
              <input
                name="description"
                value={formData.description || ""}
                onChange={handleChange}
                placeholder="Enter expense description"
                required
                disabled={isLoading || isSubmitting}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            {/* Amount and Vendor */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Amount ($) *
                </label>
                <input
                  name="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.amount || ""}
                  onChange={handleChange}
                  placeholder="0.00"
                  required
                  disabled={isLoading || isSubmitting}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Vendor *
                </label>
                <input
                  name="vendor"
                  value={formData.vendor || ""}
                  onChange={handleChange}
                  placeholder="Vendor name"
                  required
                  disabled={isLoading || isSubmitting}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
            </div>

            {/* Date and Receipt */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Date *
                </label>
                <input
                  name="date"
                  type="date"
                  value={formData.date || ""}
                  onChange={handleChange}
                  required
                  disabled={isLoading || isSubmitting}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Receipt Number
                </label>
                <input
                  name="receiptNumber"
                  value={formData.receiptNumber || ""}
                  onChange={handleChange}
                  placeholder="REC-2026-001"
                  disabled={isLoading || isSubmitting}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
            </div>

            {/* Payment Method and Status */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Payment Method *
                </label>
                <select
                  name="paymentMethod"
                  value={formData.paymentMethod || "Cash"}
                  onChange={handleChange}
                  required
                  disabled={isLoading || isSubmitting}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="Cash">Cash</option>
                  <option value="Bank">Bank Transfer</option>
                  <option value="Online">Online Payment</option>
                  <option value="Cheque">Cheque</option>
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Status *
                </label>
                <select
                  name="status"
                  value={formData.status || "Pending"}
                  onChange={handleChange}
                  required
                  disabled={isLoading || isSubmitting}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Paid">Paid</option>
                </select>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes || ""}
                onChange={handleChange}
                rows={2}
                placeholder="Additional notes (optional)"
                disabled={isLoading || isSubmitting}
                className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </div>

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading || isSubmitting}
              className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || isSubmitting}
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading || isSubmitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExpenseUpdateModal;