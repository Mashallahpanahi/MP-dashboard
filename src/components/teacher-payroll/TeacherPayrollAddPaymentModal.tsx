// src/components/teacher-payroll/TeacherPayrollAddPaymentModal.tsx
import { useState, useEffect } from "react";
import type { TeacherPayroll, AddPaymentData } from "@/types/teacherPayroll";

interface TeacherPayrollAddPaymentModalProps {
  isOpen: boolean;
  payroll: TeacherPayroll | null;
  onClose: () => void;
  onAddPayment: (id: string, data: AddPaymentData) => Promise<void>;
  isLoading?: boolean;
}

const TeacherPayrollAddPaymentModal = ({
  isOpen,
  payroll,
  onClose,
  onAddPayment,
  isLoading = false,
}: TeacherPayrollAddPaymentModalProps) => {
  const [formData, setFormData] = useState<AddPaymentData>({
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    notes: "",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✅ Safe number conversion
  const safeNumber = (value: number | string | null | undefined): number => {
    if (value === null || value === undefined || value === '') return 0;
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return isNaN(num) ? 0 : num;
  };

  // ✅ Safe currency formatter
  const formatCurrency = (amount: number | string | null | undefined): string => {
    const num = safeNumber(amount);
    return `$${num.toFixed(2)}`;
  };

  useEffect(() => {
    if (payroll) {
      const remaining = safeNumber(payroll.remainingSalary);
      setFormData({
        amount: remaining > 0 ? remaining : 0,
        date: new Date().toISOString().split('T')[0],
        notes: "",
      });
      setError("");
    }
  }, [payroll]);

  if (!isOpen || !payroll) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? (value === "" ? 0 : parseFloat(value)) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const remainingSalary = safeNumber(payroll.remainingSalary);

    if (!formData.amount || formData.amount <= 0) {
      setError("Payment amount must be greater than 0");
      return;
    }

    if (formData.amount > remainingSalary) {
      setError(`Payment amount cannot exceed remaining salary (${formatCurrency(remainingSalary)})`);
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");
      await onAddPayment(payroll.id, formData);
      onClose();
    } catch (error) {
      console.error("Failed to add payment:", error);
      setError(
        error instanceof Error ? error.message : "Failed to add payment"
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

  const newRemaining = safeNumber(payroll.remainingSalary) - safeNumber(formData.amount);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between border-b border-gray-200 pb-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              Add Payment
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {payroll.teacher?.firstName} {payroll.teacher?.lastName}
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Payment Summary */}
        <div className="mb-4 rounded-lg bg-blue-50 p-3">
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div>
              <p className="text-xs text-gray-600">Base Salary</p>
              <p className="font-semibold text-gray-900">{formatCurrency(payroll.baseSalary)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Already Paid</p>
              <p className="font-semibold text-green-600">{formatCurrency(payroll.paidAmount)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Remaining</p>
              <p className="font-semibold text-red-600">{formatCurrency(payroll.remainingSalary)}</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3">
            <p className="text-sm font-medium text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Amount */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Payment Amount ($) *
              </label>
              <input
                type="number"
                name="amount"
                value={formData.amount || ""}
                onChange={handleChange}
                step="0.01"
                min="0"
                max={safeNumber(payroll.remainingSalary)}
                placeholder="0.00"
                required
                disabled={isSubmitting}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            {/* New Remaining - Preview */}
            {formData.amount > 0 && (
              <div className="rounded-lg bg-gray-50 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">New Remaining:</span>
                  <span className={`text-lg font-bold ${newRemaining <= 0 ? 'text-green-600' : 'text-orange-600'}`}>
                    {formatCurrency(newRemaining)}
                  </span>
                </div>
                {newRemaining <= 0 && (
                  <p className="mt-1 text-xs text-green-600">
                    ✓ This payment will complete the salary
                  </p>
                )}
              </div>
            )}

            {/* Date */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Payment Date
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                disabled={isSubmitting}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                placeholder="Additional notes (optional)"
                disabled={isSubmitting}
                className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </div>

          <div className="mt-6 flex gap-3 border-t border-gray-200 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? "Adding..." : "Add Payment"}
            </button>
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TeacherPayrollAddPaymentModal;