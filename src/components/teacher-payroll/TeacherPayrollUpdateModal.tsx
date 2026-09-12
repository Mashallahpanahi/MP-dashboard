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

  // ✅ Safe number conversion
  const safeNumber = (value: number | string | null | undefined): number => {
    if (value === null || value === undefined || value === '') return 0;
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return isNaN(num) ? 0 : num;
  };

  useEffect(() => {
    if (payroll) {
      setFormData({
        teacherId: payroll.teacherId,
        baseSalary: safeNumber(payroll.baseSalary),
        paidAmount: safeNumber(payroll.paidAmount),
        remainingSalary: safeNumber(payroll.remainingSalary),
        date: payroll.date ? payroll.date.split('T')[0] : "",
        status: payroll.status,
        notes: payroll.notes || "",
      });
      setError("");
      setSuccess("");
    }
  }, [payroll]);

  // Auto-calculate remaining salary
  useEffect(() => {
    if (formData.baseSalary !== undefined && formData.paidAmount !== undefined) {
      const remaining = safeNumber(formData.baseSalary) - safeNumber(formData.paidAmount);
      setFormData((prev) => ({
        ...prev,
        remainingSalary: remaining > 0 ? remaining : 0,
        status: remaining <= 0 ? 'Completed' : 'Not Completed',
      }));
    }
  }, [formData.baseSalary, formData.paidAmount]);

  if (!isOpen || !payroll) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "number" || name === "baseSalary" || name === "paidAmount"
          ? value === "" ? 0 : parseFloat(value)
          : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsSubmitting(true);
      setError("");
      setSuccess("");

      // Only send changed fields
      const changedData: UpdateTeacherPayrollData = {};
      
      if (formData.baseSalary !== safeNumber(payroll.baseSalary)) {
        changedData.baseSalary = formData.baseSalary;
      }
      if (formData.paidAmount !== safeNumber(payroll.paidAmount)) {
        changedData.paidAmount = formData.paidAmount;
      }
      if (formData.date !== payroll.date?.split('T')[0]) {
        changedData.date = formData.date;
      }
      if (formData.status !== payroll.status) {
        changedData.status = formData.status;
      }
      if (formData.notes !== payroll.notes) {
        changedData.notes = formData.notes;
      }

      if (Object.keys(changedData).length === 0) {
        setSuccess("No changes made.");
        setTimeout(() => {
          onClose();
          setSuccess("");
        }, 1000);
        return;
      }

      await onUpdate(payroll.id, changedData);
      setSuccess("Payroll updated successfully!");
      setTimeout(() => {
        onClose();
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
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between border-b border-gray-200 pb-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              Update Payroll
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

        {success && (
          <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-3">
            <p className="text-sm font-medium text-green-700">{success}</p>
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3">
            <p className="text-sm font-medium text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Base Salary */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Base Salary ($) *
              </label>
              <input
                type="number"
                name="baseSalary"
                value={formData.baseSalary || ""}
                onChange={handleChange}
                step="0.01"
                min="0"
                required
                disabled={isSubmitting || isLoading}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            {/* Paid Amount */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Paid Amount ($)
              </label>
              <input
                type="number"
                name="paidAmount"
                value={formData.paidAmount || ""}
                onChange={handleChange}
                step="0.01"
                min="0"
                disabled={isSubmitting || isLoading}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            {/* Remaining Salary - Read only */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Remaining Salary ($)
              </label>
              <input
                type="number"
                value={safeNumber(formData.remainingSalary)}
                disabled
                className="w-full rounded-lg border border-gray-200 bg-gray-100 px-3 py-2 text-sm text-gray-700 cursor-not-allowed"
              />
              <p className="mt-1 text-xs text-gray-500">
                Auto-calculated: Base Salary - Paid Amount
              </p>
            </div>

            {/* Date */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Date
              </label>
              <input
                type="date"
                name="date"
                value={formData.date || ""}
                onChange={handleChange}
                disabled={isSubmitting || isLoading}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            {/* Status */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Status
              </label>
              <select
                name="status"
                value={formData.status || "Not Completed"}
                onChange={handleChange}
                disabled={isSubmitting || isLoading}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="Completed">Completed</option>
                <option value="Not Completed">Not Completed</option>
              </select>
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
                rows={3}
                placeholder="Additional notes (optional)"
                disabled={isSubmitting || isLoading}
                className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </div>

          <div className="mt-6 flex gap-3 border-t border-gray-200 pt-4">
            <button
              type="submit"
              disabled={isSubmitting || isLoading}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting || isLoading}
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

export default TeacherPayrollUpdateModal;