// src/components/student-payments/StudentPaymentUpdateModal.tsx
import { useState, useEffect } from "react";
import type {
  StudentPayment,
  UpdateStudentPaymentData,
} from "@/api/studentPaymentApi";

interface StudentPaymentUpdateModalProps {
  isOpen: boolean;
  payment: StudentPayment | null;
  onClose: () => void;
  onUpdate: (id: string, data: UpdateStudentPaymentData) => Promise<void>;
  isLoading?: boolean;
}

const StudentPaymentUpdateModal = ({
  isOpen,
  payment,
  onClose,
  onUpdate,
  isLoading = false,
}: StudentPaymentUpdateModalProps) => {
  const [formData, setFormData] = useState<UpdateStudentPaymentData>({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when payment changes
  useEffect(() => {
    if (payment) {
      setFormData({
        studentEnrollmentId: payment.studentEnrollment.id,
        amount: payment.amount,
        discount: payment.discount,
        paidAmount: payment.paidAmount,
        paymentDate: payment.paymentDate.split("T")[0],
        paymentMethod: payment.paymentMethod,
        receiptNumber: payment.receiptNumber || "",
        status: payment.status,
        notes: payment.notes || "",
      });
      setError("");
      setSuccess("");
    }
  }, [payment]);

  if (!isOpen || !payment) return null;

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value, type } = e.target;

    if (
      type === "number" ||
      name === "amount" ||
      name === "discount" ||
      name === "paidAmount"
    ) {
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

    if (!payment) return;

    try {
      setIsSubmitting(true);
      setError("");
      setSuccess("");

      // Validate
      if (!formData.amount || formData.amount <= 0) {
        setError("Amount must be greater than 0");
        setIsSubmitting(false);
        return;
      }

      if (!formData.paidAmount || formData.paidAmount <= 0) {
        setError("Paid amount must be greater than 0");
        setIsSubmitting(false);
        return;
      }

      if (formData.paidAmount > formData.amount) {
        setError("Paid amount cannot be greater than total amount");
        setIsSubmitting(false);
        return;
      }

      // Only send fields that have changed
      const changedData: UpdateStudentPaymentData = {};
      const keys = Object.keys(formData) as (keyof UpdateStudentPaymentData)[];

      keys.forEach((key) => {
        const currentValue = formData[key];
        const originalValue = payment[key as keyof StudentPayment];

        if (key === "studentEnrollmentId") {
          // Compare nested object IDs
          if (currentValue !== payment.studentEnrollment.id) {
            (changedData as Record<string, unknown>)[key] = currentValue;
          }
        } else if (
          typeof currentValue === "number" &&
          typeof originalValue === "number"
        ) {
          if (currentValue !== originalValue) {
            (changedData as Record<string, unknown>)[key] = currentValue;
          }
        } else if (currentValue !== originalValue) {
          (changedData as Record<string, unknown>)[key] = currentValue;
        }
      });

      // If nothing changed, show message and close
      if (Object.keys(changedData).length === 0) {
        setSuccess("No changes made.");
        setTimeout(() => {
          onClose();
          setFormData({});
          setSuccess("");
        }, 1000);
        return;
      }

      await onUpdate(payment.id, changedData);

      setSuccess("Payment updated successfully!");

      // Close modal after 1.5 seconds
      setTimeout(() => {
        onClose();
        setFormData({});
        setSuccess("");
      }, 1500);
    } catch (error) {
      console.error("Failed to update payment:", error);
      setError(
        error instanceof Error ? error.message : "Failed to update payment",
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
              Update Payment
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {payment.studentEnrollment.student.firstName}{" "}
              {payment.studentEnrollment.student.lastName} -{" "}
              {payment.studentEnrollment.book.name}
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

        {/* Success Message */}
        {success && (
          <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-4">
            <p className="text-sm font-medium text-green-700">{success}</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm font-medium text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Payment Details */}
          <div className="mb-6">
            <h4 className="mb-3 text-sm font-semibold text-gray-700">
              Payment Details
            </h4>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* Amount */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Total Amount ($) *
                </label>
                <input
                  name="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.amount ?? ""}
                  onChange={handleChange}
                  required
                  disabled={isLoading || isSubmitting}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              {/* Discount */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Discount ($)
                </label>
                <input
                  name="discount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.discount ?? ""}
                  onChange={handleChange}
                  disabled={isLoading || isSubmitting}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              {/* Paid Amount */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Paid Amount ($) *
                </label>
                <input
                  name="paidAmount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.paidAmount ?? ""}
                  onChange={handleChange}
                  required
                  disabled={isLoading || isSubmitting}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Remaining:{" "}
                  {formatCurrency(
                    (formData.amount || 0) - (formData.paidAmount || 0),
                  )}
                </p>
              </div>

              {/* Receipt Number */}
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
          </div>

          {/* Payment Method & Status */}
          <div className="mb-6 border-t border-gray-200 pt-6">
            <h4 className="mb-3 text-sm font-semibold text-gray-700">
              Payment Method & Status
            </h4>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {/* Payment Method */}
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

              {/* Payment Date */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Payment Date *
                </label>
                <input
                  name="paymentDate"
                  type="date"
                  value={formData.paymentDate || ""}
                  onChange={handleChange}
                  required
                  disabled={isLoading || isSubmitting}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              {/* Status */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Status *
                </label>
                <select
                  name="status"
                  value={formData.status || "Paid"}
                  onChange={handleChange}
                  required
                  disabled={isLoading || isSubmitting}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="Paid">Paid</option>
                  <option value="Partial">Partial</option>
                  <option value="Unpaid">Unpaid</option>
                  <option value="Overdue">Overdue</option>
                </select>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="mb-6 border-t border-gray-200 pt-6">
            <h4 className="mb-3 text-sm font-semibold text-gray-700">
              Additional Information
            </h4>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes || ""}
                onChange={handleChange}
                rows={2}
                placeholder="Additional notes..."
                disabled={isLoading || isSubmitting}
                className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col-reverse gap-3 border-t border-gray-200 pt-4 sm:flex-row sm:justify-end">
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

export default StudentPaymentUpdateModal;
