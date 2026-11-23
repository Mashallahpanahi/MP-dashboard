// src/components/other-expenses/AddOtherExpenseModal.tsx
import { useState, useEffect } from "react";
import { useCreateOtherExpense } from "@/api/otherExpenseApi";
import type { CreateOtherExpenseData } from "@/types/otherExpense";
// ✅ Shamsi date picker + miladi helper
import ShamsiDatePicker from "@/utils/ShamsiDatePicker";
import { formatMiladiISO } from "@/utils/dateConverter";

interface AddOtherExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddOtherExpenseModal = ({
  isOpen,
  onClose,
  onSuccess,
}: AddOtherExpenseModalProps) => {
  // ✅ Hook replaces createOtherExpense + local loading/error state
  const {
    create: createOtherExpense,
    loading,
    error: hookError,
  } = useCreateOtherExpense();

  const [formData, setFormData] = useState<CreateOtherExpenseData>({
    amount: 0,
    description: "",
    // ✅ Miladi ISO for backend — shown as Shamsi in the picker
    date: formatMiladiISO(new Date()),
  });
  const [localError, setLocalError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Combined error: local first, then hook error
  const error = localError || hookError || "";

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        amount: 0,
        description: "",
        date: formatMiladiISO(new Date()),
      });
      setLocalError("");
      setSuccess("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "number" ? (value === "" ? 0 : parseFloat(value)) : value,
    }));
  };

  // ✅ Dedicated handler for the Shamsi date picker
  const handleDateChange = (miladiISO: string) => {
    setFormData((prev) => ({ ...prev, date: miladiISO }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate
    if (!formData.amount || formData.amount <= 0) {
      setLocalError("Amount must be greater than 0");
      return;
    }

    if (!formData.description || formData.description.trim() === "") {
      setLocalError("Description is required");
      return;
    }

    if (!formData.date) {
      setLocalError("Date is required");
      return;
    }

    try {
      setIsSubmitting(true);
      setLocalError("");
      setSuccess("");

      const ok = await createOtherExpense({
        amount: formData.amount,
        description: formData.description.trim(),
        // ✅ formData.date is already Miladi ISO for the backend
        date: formData.date,
      });

      // ✅ Hook returns boolean — throw so the existing catch block runs
      if (!ok) {
        throw new Error(hookError || "Failed to add expense");
      }

      setSuccess("Expense added successfully!");

      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (error) {
      console.error("Failed to add expense:", error);
      setLocalError(
        error instanceof Error ? error.message : "Failed to add expense",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between border-b border-gray-200 pb-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              Add New Expense
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Record a new other expense
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <svg
              className="h-5 w-5"
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

        {/* Success */}
        {success && (
          <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-3">
            <div className="flex items-start gap-2">
              <svg
                className="mt-0.5 h-5 w-5 text-green-600"
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
              <p className="text-sm font-medium text-green-700">{success}</p>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3">
            <div className="flex items-start gap-2">
              <svg
                className="mt-0.5 h-5 w-5 text-red-600"
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

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Amount */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Amount ($) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="amount"
                value={formData.amount || ""}
                onChange={handleChange}
                step="0.01"
                min="0"
                placeholder="500.00"
                required
                disabled={isSubmitting}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            {/* Description */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                placeholder="e.g., Office rent for September"
                required
                disabled={isSubmitting}
                className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            {/* ✅ Date — Shamsi picker */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Date <span className="text-red-500">*</span>
              </label>
              <ShamsiDatePicker
                value={formData.date}
                onChange={handleDateChange}
                placeholder="انتخاب تاریخ"
              />
            </div>
          </div>

          <div className="mt-6 flex gap-3 border-t border-gray-200 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? "Adding..." : "Add Expense"}
            </button>
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddOtherExpenseModal;
