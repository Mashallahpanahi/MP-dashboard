// src/components/teacher-payroll/TeacherPayrollDeleteModal.tsx
import type { TeacherPayroll } from "@/types/teacherPayroll";

interface TeacherPayrollDeleteModalProps {
  isOpen: boolean;
  payroll: TeacherPayroll | null;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isLoading?: boolean;
}

const TeacherPayrollDeleteModal = ({
  isOpen,
  payroll,
  onClose,
  onConfirm,
  isLoading = false,
}: TeacherPayrollDeleteModalProps) => {
  if (!isOpen || !payroll) return null;

  const formatCurrency = (amount: number): string => {
    return `$${amount.toFixed(2)}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <svg
              className="h-6 w-6 text-red-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Delete Payroll Record
            </h3>
            <p className="text-sm text-gray-500">
              Are you sure you want to delete this payroll record?
            </p>
          </div>
        </div>

        <div className="mb-6 rounded-lg bg-gray-50 p-4">
          <p className="text-sm font-medium text-gray-900">
            {payroll.teacher.firstName} {payroll.teacher.lastName}
          </p>
          <p className="mt-1 text-sm text-gray-500">
            Month: {new Date(payroll.month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </p>
          <p className="text-sm text-gray-500">
            Net Salary: {formatCurrency(payroll.netSalary)} | Status: {payroll.status}
          </p>
        </div>

        <p className="mb-6 text-sm text-red-600">
          This action cannot be undone.
        </p>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? "Deleting..." : "Delete Record"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeacherPayrollDeleteModal;