// src/components/teacher-payroll/TeacherPayrollCreateModal.tsx
import { useState, useEffect, useRef } from "react";
import { createTeacherPayroll, getTeachers } from "@/api/teacherPayrollApi";
import type { CreateTeacherPayrollData, Teacher } from "@/types/teacherPayroll";

interface TeacherPayrollCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: CreateTeacherPayrollData) => Promise<void>;
  isLoading?: boolean;
  prefillData?: CreateTeacherPayrollData | null;
}

// Month options
const MONTHS = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
];

// Get default month and year (previous month)
const getDefaultMonthYear = () => {
  const now = new Date();
  let month = now.getMonth(); // 0-11
  let year = now.getFullYear();
  
  if (month === 0) {
    month = 12;
    year = year - 1;
  }
  
  return {
    month: month === 0 ? 12 : month,
    year,
  };
};

const TeacherPayrollCreateModal = ({
  isOpen,
  onClose,
  onCreate,
  isLoading = false,
  prefillData = null,
}: TeacherPayrollCreateModalProps) => {
  const defaultMonthYear = getDefaultMonthYear();
  
  const [formData, setFormData] = useState<CreateTeacherPayrollData>({
    teacherId: "",
    month: defaultMonthYear.month,
    year: defaultMonthYear.year,
    baseSalary: 0,
    paidAmount: 0,
    remainingSalary: 0,
    date: new Date().toISOString().split('T')[0],
    status: 'Not Completed',
    notes: "",
  });
  
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [loadingTeachers, setLoadingTeachers] = useState(true);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPreFilled, setIsPreFilled] = useState(false);

  // ✅ Use ref to track if we've already processed prefill for this open
  const prefillProcessedRef = useRef<string | null>(null);

  const safeNumber = (value: number | string | null | undefined): number => {
    if (value === null || value === undefined || value === '') return 0;
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return isNaN(num) ? 0 : num;
  };

  // ✅ Single useEffect that handles both teacher fetching AND prefill data
  useEffect(() => {
    if (!isOpen) {
      // Reset when modal closes
      prefillProcessedRef.current = null;
      return;
    }

    const initModal = async () => {
      setLoadingTeachers(true);
      setError("");
      
      try {
        // Fetch teachers first
        const data = await getTeachers();
        const activeTeachers = Array.isArray(data) ? data.filter(t => t.isActive) : [];
        setTeachers(activeTeachers);

        // ✅ Create a unique key for this prefill to avoid double processing
        const prefillKey = prefillData 
          ? `${prefillData.teacherId}-${prefillData.month}-${prefillData.year}`
          : 'no-prefill';

        // Skip if already processed this exact prefill
        if (prefillProcessedRef.current === prefillKey) {
          setLoadingTeachers(false);
          return;
        }
        prefillProcessedRef.current = prefillKey;

        if (prefillData) {
          // ✅ PREFILL: Use the unpaid record's data
          const baseSalary = safeNumber(prefillData.baseSalary);
          const paidAmount = prefillData.paidAmount !== undefined 
            ? safeNumber(prefillData.paidAmount) 
            : baseSalary;
          const remaining = baseSalary - paidAmount;

          console.log('✅ Applying prefill data:', {
            teacherId: prefillData.teacherId,
            month: prefillData.month,
            year: prefillData.year,
            baseSalary,
            paidAmount,
          });

          setFormData({
            teacherId: prefillData.teacherId,
            month: prefillData.month ?? defaultMonthYear.month,
            year: prefillData.year ?? defaultMonthYear.year,
            baseSalary,
            paidAmount,
            remainingSalary: remaining > 0 ? remaining : 0,
            date: prefillData.date || new Date().toISOString().split('T')[0],
            status: remaining <= 0 ? 'Completed' : 'Not Completed',
            notes: prefillData.notes || "",
          });

          // Find and set the selected teacher
          const teacher = activeTeachers.find(t => t.id === prefillData.teacherId);
          if (teacher) {
            setSelectedTeacher(teacher);
          }
          setIsPreFilled(true);
        } else {
          // ✅ FRESH: Use defaults
          const defaults = getDefaultMonthYear();
          setFormData({
            teacherId: "",
            month: defaults.month,
            year: defaults.year,
            baseSalary: 0,
            paidAmount: 0,
            remainingSalary: 0,
            date: new Date().toISOString().split('T')[0],
            status: 'Not Completed',
            notes: "",
          });
          setSelectedTeacher(null);
          setIsPreFilled(false);
        }
      } catch (error) {
        console.error("Failed to initialize modal:", error);
        setError("Failed to load teachers");
      } finally {
        setLoadingTeachers(false);
      }
    };

    initModal();
  }, [isOpen, prefillData]);

  const handleTeacherChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const teacherId = e.target.value;
    const teacher = teachers.find(t => t.id === teacherId);
    
    if (teacher) {
      const teacherSalary = safeNumber(teacher.salaryAmount);
      
      setSelectedTeacher(teacher);
      setFormData((prev) => ({
        ...prev,
        teacherId: teacherId,
        baseSalary: teacherSalary,
        paidAmount: 0,
        remainingSalary: teacherSalary,
        status: teacherSalary > 0 ? 'Not Completed' : 'Completed',
      }));
      setIsPreFilled(false);
    } else {
      setSelectedTeacher(null);
      setFormData((prev) => ({
        ...prev,
        teacherId: "",
        baseSalary: 0,
        paidAmount: 0,
        remainingSalary: 0,
      }));
    }
  };

  // Auto-calculate remaining salary when base or paid changes
  useEffect(() => {
    const remaining = safeNumber(formData.baseSalary) - safeNumber(formData.paidAmount);
    setFormData((prev) => {
      // Only update if remaining actually changed
      if (prev.remainingSalary === (remaining > 0 ? remaining : 0)) {
        return prev;
      }
      return {
        ...prev,
        remainingSalary: remaining > 0 ? remaining : 0,
        status: remaining <= 0 ? 'Completed' : 'Not Completed',
      };
    });
  }, [formData.baseSalary, formData.paidAmount]);

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "number" || name === "paidAmount" || name === "month" || name === "year"
          ? value === "" ? 0 : parseInt(value, 10)
          : value,
    }));
  };

  // Handle paidAmount separately (it's a float, not integer)
  const handlePaidAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData((prev) => ({
      ...prev,
      paidAmount: value === "" ? 0 : parseFloat(value),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.teacherId) {
      setError("Please select a teacher");
      return;
    }

    if (!formData.baseSalary || formData.baseSalary <= 0) {
      setError("Base salary is missing for this teacher. Please update the teacher's salary first.");
      return;
    }

    if (!formData.month || formData.month < 1 || formData.month > 12) {
      setError("Please select a valid month");
      return;
    }

    if (!formData.year || formData.year < 2000) {
      setError("Please enter a valid year");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");
      await onCreate(formData);
      onClose();
    } catch (error) {
      console.error("Failed to pay salary:", error);
      setError(
        error instanceof Error ? error.message : "Failed to process payment"
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

  const formatCurrency = (amount: number | string | null | undefined): string => {
    const num = safeNumber(amount);
    return `$${num.toFixed(2)}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between border-b border-gray-200 pb-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              Pay Teacher Salary
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Process a salary payment for a teacher
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

        {/* Pre-filled indicator */}
        {isPreFilled && (
          <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-3">
            <div className="flex items-start gap-2">
              <svg className="mt-0.5 h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-green-700">
                  ✓ Auto-filled from unpaid salary record
                </p>
                <p className="text-xs text-green-600 mt-0.5">
                  You can edit any field if needed, or just click "Pay Salary"
                </p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3">
            <p className="text-sm font-medium text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Teacher */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Teacher *
              </label>
              <select
                name="teacherId"
                value={formData.teacherId}
                onChange={handleTeacherChange}
                required
                disabled={loadingTeachers || isSubmitting}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Select a teacher</option>
                {teachers.map((teacher) => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.firstName} {teacher.lastName}
                  </option>
                ))}
              </select>
            </div>

            {/* Month and Year */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Month <span className="text-red-500">*</span>
                </label>
                <select
                  name="month"
                  value={formData.month || ""}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Select month</option>
                  {MONTHS.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
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
                  name="year"
                  value={formData.year || ""}
                  onChange={handleChange}
                  min="2000"
                  max="2100"
                  required
                  disabled={isSubmitting}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
            </div>

            {/* Teacher Info Box */}
            {selectedTeacher && (
              <div className="rounded-lg bg-blue-50 border border-blue-200 p-3">
                <p className="text-xs font-medium text-blue-600 mb-2">Selected Teacher</p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-gray-600">Name</p>
                    <p className="font-semibold text-gray-900">
                      {selectedTeacher.firstName} {selectedTeacher.lastName}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Monthly Salary</p>
                    <p className="font-bold text-blue-700">
                      {formatCurrency(selectedTeacher.salaryAmount)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Base Salary */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Base Salary ($)
              </label>
              <input
                type="number"
                name="baseSalary"
                value={formData.baseSalary || 0}
                disabled
                className="w-full rounded-lg border border-gray-200 bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-700 cursor-not-allowed"
              />
              <p className="mt-1 text-xs text-gray-500">
                Auto-filled from teacher's registered salary
              </p>
            </div>

            {/* Paid Amount */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Paid Amount ($)
              </label>
              <input
                type="number"
                name="paidAmount"
                value={formData.paidAmount ?? ""}
                onChange={handlePaidAmountChange}
                step="0.01"
                min="0"
                max={formData.baseSalary}
                placeholder="0.00"
                disabled={isSubmitting || !selectedTeacher}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
              />
              <p className="mt-1 text-xs text-gray-500">
                {isPreFilled ? "✓ Auto-filled with full amount. Edit if needed." : "Enter the amount being paid now"}
              </p>
            </div>

            {/* Remaining Salary */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Remaining Salary ($)
              </label>
              <input
                type="number"
                name="remainingSalary"
                value={formData.remainingSalary || 0}
                disabled
                className={`w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold cursor-not-allowed ${
                  safeNumber(formData.remainingSalary) > 0 
                    ? 'bg-orange-50 text-orange-700' 
                    : 'bg-green-50 text-green-700'
                }`}
              />
              {safeNumber(formData.remainingSalary) === 0 && (
                <p className="mt-1 text-xs text-green-600 font-medium">
                  ✓ This payment will complete the salary
                </p>
              )}
            </div>

            {/* Payment Date */}
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

            {/* Status */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                disabled={isSubmitting}
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
                value={formData.notes}
                onChange={handleChange}
                rows={2}
                placeholder="Additional notes (optional)"
                disabled={isSubmitting}
                className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </div>

          <div className="mt-6 flex gap-3 border-t border-gray-200 pt-4">
            <button
              type="submit"
              disabled={isSubmitting || loadingTeachers || !selectedTeacher}
              className="flex-1 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <svg className="mr-2 inline h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  <svg className="mr-2 inline h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Pay Salary
                </>
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

export default TeacherPayrollCreateModal;