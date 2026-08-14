// src/components/teacher-payroll/TeacherPayrollUpdateModal.tsx
import { useState, useEffect } from "react";
import type { TeacherPayroll, UpdateTeacherPayrollData } from "@/types/teacherPayroll";

interface TeacherPayrollUpdateModalProps {
  isOpen: boolean;
  payroll: TeacherPayroll | null;
  onClose: () => void;
  onUpdate: (id: string, data: UpdateTeacherPayrollData) => Promise<void>;
  isLoading?: boolean;
}

const TeacherPayrollUpdateModal = ({
  isOpen,
  payroll,
  onClose,
  onUpdate,
  isLoading = false,
}: TeacherPayrollUpdateModalProps) => {
  const [formData, setFormData] = useState<UpdateTeacherPayrollData>({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (payroll) {
      setFormData({
        teacherId: payroll.teacherId,
        month: payroll.month,
        year: payroll.year,
        baseSalary: payroll.baseSalary,
        bonus: payroll.bonus || 0,
        deductions: payroll.deductions || 0,
        netSalary: payroll.netSalary,
        paymentDate: payroll.paymentDate ? payroll.paymentDate.split('T')[0] : "",
        paymentMethod: payroll.paymentMethod || "Cash",
        bankAccount: payroll.bankAccount || "",
        status: payroll.status,
        notes: payroll.notes || "",
      });
      setError("");
      setSuccess("");
    }
  }, [payroll]);

  if (!isOpen || !payroll) return null;

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

    if (!payroll) return;

    try {
      setIsSubmitting(true);
      setError("");
      setSuccess("");

      // Only send fields that have changed
      const changedData: UpdateTeacherPayrollData = {};
      const keys = Object.keys(formData) as (keyof UpdateTeacherPayrollData)[];

      keys.forEach((key) => {
        const currentValue = formData[key];
        const originalValue = payroll[key as keyof TeacherPayroll];

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

      await onUpdate(payroll.id, changedData);

      setSuccess("Payroll updated successfully!");

      setTimeout(() => {
        onClose();
        setFormData({});
        setSuccess("");
      }, 1500);
    } catch (error) {
      console.error("Failed to update payroll:", error);
      setError(
        error instanceof Error ? error.message : "Failed to update payroll"
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
              Update Payroll
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {payroll.teacher.firstName} {payroll.teacher.lastName} - 
              {new Date(payroll.month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
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
          {/* Salary Details */}
          <div className="mb-6">
            <h4 className="mb-3 text-sm font-semibold text-gray-700">
              Salary Details
            </h4>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Base Salary *
                </label>
                <input
                  name="baseSalary"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.baseSalary ?? ""}
                  onChange={handleChange}
                  required
                  disabled={isLoading || isSubmitting}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Bonus
                </label>
                <input
                  name="bonus"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.bonus ?? ""}
                  onChange={handleChange}
                  disabled={isLoading || isSubmitting}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Deductions
                </label>
                <input
                  name="deductions"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.deductions ?? ""}
                  onChange={handleChange}
                  disabled={isLoading || isSubmitting}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
            </div>
            <div className="mt-3">
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Net Salary *
              </label>
              <input
                name="netSalary"
                type="number"
                step="0.01"
                min="0"
                value={formData.netSalary ?? ""}
                onChange={handleChange}
                required
                disabled={isLoading || isSubmitting}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
              />
              <p className="mt-1 text-xs text-gray-500">
                Base + Bonus - Deductions = Net Salary
              </p>
            </div>
          </div>

          {/* Payment Details */}
          <div className="mb-6 border-t border-gray-200 pt-6">
            <h4 className="mb-3 text-sm font-semibold text-gray-700">
              Payment Details
            </h4>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Payment Method
                </label>
                <select
                  name="paymentMethod"
                  value={formData.paymentMethod || "Cash"}
                  onChange={handleChange}
                  disabled={isLoading || isSubmitting}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="Cash">Cash</option>
                  <option value="Bank">Bank Transfer</option>
                  <option value="Cheque">Cheque</option>
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Payment Date
                </label>
                <input
                  name="paymentDate"
                  type="date"
                  value={formData.paymentDate || ""}
                  onChange={handleChange}
                  disabled={isLoading || isSubmitting}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Bank Account
                </label>
                <input
                  name="bankAccount"
                  value={formData.bankAccount || ""}
                  onChange={handleChange}
                  placeholder="Account number"
                  disabled={isLoading || isSubmitting}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
            </div>
          </div>

          {/* Status & Notes */}
          <div className="mb-6 border-t border-gray-200 pt-6">
            <h4 className="mb-3 text-sm font-semibold text-gray-700">
              Status & Notes
            </h4>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                  <option value="Paid">Paid</option>
                  <option value="Pending">Pending</option>
                  <option value="Overdue">Overdue</option>
                </select>
              </div>
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
          </div>

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

export default TeacherPayrollUpdateModal;