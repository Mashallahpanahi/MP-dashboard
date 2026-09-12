// src/components/other-expenses/DeleteOtherExpenseModal.tsx
import type { OtherExpense } from "@/types/otherExpense";

interface DeleteOtherExpenseModalProps {
  isOpen: boolean;
  expense: OtherExpense | null;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isLoading?: boolean;
}

const DeleteOtherExpenseModal = ({
  isOpen,
  expense,
  onClose,
  onConfirm,
  isLoading = false,
}: DeleteOtherExpenseModalProps) => {
  if (!isOpen || !expense) return null;

  const formatCurrency = (amount: number | string | null | undefined): string => {
    if (amount === null || amount === undefined || amount === "") return "$0.00";
    const num = typeof amount === "string" ? parseFloat(amount) : amount;
    if (isNaN(num)) return "$0.00";
    return `$${num.toFixed(2)}`;
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Delete Expense
            </h3>
            <p className="text-sm text-gray-500">
              Are you sure you want to delete this expense?
            </p>
          </div>
        </div>

        <div className="mb-6 rounded-lg bg-gray-50 p-4">
          <p className="text-sm font-medium text-gray-900">
            {expense.description}
          </p>
          <p className="mt-1 text-sm text-gray-500">
            Amount: {formatCurrency(expense.amount)} | Date: {expense.date}
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
            {isLoading ? "Deleting..." : "Delete Expense"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteOtherExpenseModal;