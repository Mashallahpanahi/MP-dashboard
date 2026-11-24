// src/components/teacher-payroll/TeacherPayrollHistoryEditModal.tsx
import { useState, useEffect, useMemo } from "react";
import { useUpdateTeacherPayroll } from "@/api/teacherPayrollApi";
import type {
  TeacherPayroll,
  UpdateTeacherPayrollData,
} from "@/api/teacherPayrollApi";
// ✅ Shamsi date picker + helpers
import ShamsiDatePicker from "@/utils/ShamsiDatePicker";
import {
  convertToShamsi,
  convertToMillady,
  SHAMSI_MONTHS,
} from "@/utils/dateConverter";

interface TeacherPayrollHistoryEditModalProps {
  isOpen: boolean;
  payroll: TeacherPayroll | null;
  onClose: () => void;
  onSuccess: () => void;
}

const TeacherPayrollHistoryEditModal = ({
  isOpen,
  payroll,
  onClose,
  onSuccess,
}: TeacherPayrollHistoryEditModalProps) => {
  // ✅ Hook replaces updateTeacherPayroll + local loading/error state
  // Note: teacherPayrollApi's useUpdateTeacherPayroll() exposes `.updateTeacherPayroll`
  const {
    updateTeacherPayroll,
    loading: updateLoading,
    error: updateError,
  } = useUpdateTeacherPayroll();

  const [formData, setFormData] = useState<UpdateTeacherPayrollData>({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✅ Shamsi month/year picked by the user (independent from Miladi stored values)
  const [shamsiMonth, setShamsiMonth] = useState<number>(1);
  const [shamsiYear, setShamsiYear] = useState<number>(1404);

  const safeNumber = (value: number | string | null | undefined): number => {
    if (value === null || value === undefined || value === "") return 0;
    const num = typeof value === "string" ? parseFloat(value) : value;
    return isNaN(num) ? 0 : num;
  };

  const formatCurrency = (
    amount: number | string | null | undefined,
  ): string => {
    const num = safeNumber(amount);
    return `$${num.toFixed(2)}`;
  };

  // ✅ Load payroll data into form — convert Miladi month/year to Shamsi for display
  useEffect(() => {
    if (payroll) {
      setFormData({
        teacherId: payroll.teacherId,
        month: payroll.month,
        year: payroll.year,
        baseSalary: safeNumber(payroll.baseSalary),
        paidAmount: safeNumber(payroll.paidAmount),
        remainingSalary: safeNumber(payroll.remainingSalary),
        date: payroll.date ? payroll.date.split("T")[0] : "",
        status: payroll.status,
        notes: payroll.notes || "",
      });

      // ✅ Compute Shamsi equivalent from the stored Miladi month/year
      try {
        // Use 15th of the month to avoid edge-of-month rollover issues
        const miladiMid = `${payroll.year}-${String(payroll.month).padStart(
          2,
          "0",
        )}-15`;
        const sh = convertToShamsi(miladiMid);
        setShamsiMonth(sh.month);
        setShamsiYear(sh.year);
      } catch {
        setShamsiMonth(1);
        setShamsiYear(1404);
      }

      setError("");
      setSuccess("");
    }
  }, [payroll]);

  // ✅ Auto-calc remaining salary
  useEffect(() => {
    if (
      formData.baseSalary !== undefined &&
      formData.paidAmount !== undefined
    ) {
      const remaining =
        safeNumber(formData.baseSalary) - safeNumber(formData.paidAmount);
      setFormData((prev) => ({
        ...prev,
        remainingSalary: remaining > 0 ? remaining : 0,
        status: remaining <= 0 ? "Completed" : "Not Completed",
      }));
    }
  }, [formData.baseSalary, formData.paidAmount]);

  // ✅ When Shamsi month/year changes → convert to Miladi and store in formData
  useEffect(() => {
    try {
      // Use 15th of the Shamsi month to avoid edge cases
      const miladi = convertToMillady({
        year: shamsiYear,
        month: shamsiMonth,
        day: 15,
      });
      setFormData((prev) => ({
        ...prev,
        month: miladi.month,
        year: miladi.year,
      }));
    } catch {
      /* ignore invalid conversion */
    }
  }, [shamsiMonth, shamsiYear]);

  if (!isOpen || !payroll) return null;

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value, type } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "number" || name === "baseSalary" || name === "paidAmount"
          ? value === ""
            ? 0
            : parseFloat(value)
          : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsSubmitting(true);
      setError("");
      setSuccess("");

      if (!formData.baseSalary || formData.baseSalary <= 0) {
        setError("Base salary must be greater than 0");
        setIsSubmitting(false);
        return;
      }

      if (formData.paidAmount === undefined || formData.paidAmount < 0) {
        setError("Paid amount cannot be negative");
        setIsSubmitting(false);
        return;
      }

      if (!formData.month || formData.month < 1 || formData.month > 12) {
        setError("Please select a valid month");
        setIsSubmitting(false);
        return;
      }

      if (!formData.year || formData.year < 2000) {
        setError("Please enter a valid year");
        setIsSubmitting(false);
        return;
      }

      const submitData: UpdateTeacherPayrollData = {
        baseSalary: safeNumber(formData.baseSalary),
        paidAmount: safeNumber(formData.paidAmount),
        remainingSalary: safeNumber(formData.remainingSalary),
        month: formData.month,
        year: formData.year,
        date: formData.date,
        status: formData.status,
        notes: formData.notes || "",
      };

      console.log("📤 Updating payroll:", payroll.id, submitData);

      // ✅ Hook returns boolean — throw to keep the existing catch block behaviour
      const ok = await updateTeacherPayroll(payroll.id, submitData);
      if (!ok) {
        throw new Error(updateError || "Failed to update payroll");
      }

      setSuccess("Payroll updated successfully!");

      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (error) {
      console.error("Failed to update payroll:", error);
      setError(
        error instanceof Error ? error.message : "Failed to update payroll",
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

  const remainingNum = safeNumber(formData.remainingSalary);

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between border-b border-gray-200 pb-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              Edit Payment Record
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
            {/* ✅ Shamsi Month and Year */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Month <span className="text-red-500">*</span>
                </label>
                <select
                  value={shamsiMonth}
                  onChange={(e) => setShamsiMonth(parseInt(e.target.value))}
                  required
                  disabled={isSubmitting}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {SHAMSI_MONTHS.map((label, i) => (
                    <option key={i + 1} value={i + 1}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Year <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={shamsiYear}
                  onChange={(e) => setShamsiYear(parseInt(e.target.value) || 0)}
                  min="1300"
                  max="1500"
                  required
                  disabled={isSubmitting}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
            </div>

            {/* Base Salary and Paid Amount */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Base Salary ($) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="baseSalary"
                  value={formData.baseSalary ?? ""}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  required
                  disabled={isSubmitting}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Paid Amount ($) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="paidAmount"
                  value={formData.paidAmount ?? ""}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  max={formData.baseSalary}
                  required
                  disabled={isSubmitting}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
            </div>

            {/* Remaining Salary */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Remaining Salary ($)
              </label>
              <input
                type="number"
                value={remainingNum}
                disabled
                className={`w-full cursor-not-allowed rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold ${
                  remainingNum > 0
                    ? "bg-orange-50 text-orange-700"
                    : "bg-green-50 text-green-700"
                }`}
              />
              <p className="mt-1 text-xs text-gray-500">
                Auto-calculated: Base Salary - Paid Amount
              </p>
            </div>

            {/* Payment Date */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Payment Date
              </label>
              <ShamsiDatePicker
                value={formData.date || ""}
                onChange={(miladiISO) =>
                  setFormData((prev) => ({ ...prev, date: miladiISO }))
                }
                placeholder="انتخاب تاریخ"
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
                disabled={isSubmitting}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="Completed">Completed</option>
                <option value="Not Completed">Not Completed</option>
              </select>
              <p className="mt-1 text-xs text-gray-500">
                Auto-updated based on remaining salary
              </p>
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
                disabled={isSubmitting}
                className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </div>

          <div className="mt-6 flex gap-3 border-t border-gray-200 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="mr-2 inline h-4 w-4 animate-spin"
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
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
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

export default TeacherPayrollHistoryEditModal;
