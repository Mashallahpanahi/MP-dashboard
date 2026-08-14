// src/pages/Payment/OtherExpenses.tsx
import { useEffect, useState } from "react";
import { 
  getExpenses, 
  deleteExpense,
  getExpenseById,
  updateExpense,
  getExpenseCategories
} from "@/api/expenseApi";
import type { Expense, UpdateExpenseData, ExpenseCategory } from "@/types/expense";
import { ExpenseDeleteModal, ExpenseUpdateModal, ExpenseAddModal } from "@/components/expenses";

const OtherExpensesPage = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Delete state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Update state
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [expenseToUpdate, setExpenseToUpdate] = useState<Expense | null>(null);
  const [updateLoading, setUpdateLoading] = useState(false);

  // Add state
  const [showAddModal, setShowAddModal] = useState(false);
  const [addLoading, setAddLoading] = useState(false);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getExpenses();
      setExpenses(data);
    } catch (error) {
      console.error("Failed to fetch expenses:", error);
      setError(
        error instanceof Error ? error.message : "Failed to fetch expenses"
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await getExpenseCategories();
      setCategories(data);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  useEffect(() => {
    fetchExpenses();
    fetchCategories();
  }, []);

  // Delete handlers
  const handleDeleteClick = (expense: Expense) => {
    setExpenseToDelete(expense);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!expenseToDelete) return;

    try {
      setDeleteLoading(true);
      await deleteExpense(expenseToDelete.id);
      setExpenses((prev) => prev.filter((e) => e.id !== expenseToDelete.id));
      setShowDeleteModal(false);
      setExpenseToDelete(null);
    } catch (error) {
      console.error("Failed to delete expense:", error);
      setError(
        error instanceof Error ? error.message : "Failed to delete expense"
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setExpenseToDelete(null);
  };

  // Update handlers
  const handleUpdateClick = async (expense: Expense) => {
    try {
      setUpdateLoading(true);
      const expenseData = await getExpenseById(expense.id);
      setExpenseToUpdate(expenseData);
      setShowUpdateModal(true);
    } catch (error) {
      console.error("Failed to fetch expense for update:", error);
      setError(
        error instanceof Error ? error.message : "Failed to load expense data"
      );
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleUpdateExpense = async (id: string, data: UpdateExpenseData) => {
    const updatedExpense = await updateExpense(id, data);
    setExpenses((prev) =>
      prev.map((e) =>
        e.id === updatedExpense.id ? updatedExpense : e
      )
    );
  };

  const handleCloseUpdate = () => {
    setShowUpdateModal(false);
    setExpenseToUpdate(null);
  };

  // Add handlers
  const handleAddClick = () => {
    setShowAddModal(true);
  };

  const handleAddExpense = async (data: any) => {
    try {
      setAddLoading(true);
      const newExpense = await createExpense(data);
      setExpenses((prev) => [newExpense, ...prev]);
      setShowAddModal(false);
    } catch (error) {
      console.error("Failed to add expense:", error);
      throw error;
    } finally {
      setAddLoading(false);
    }
  };

  const handleCloseAdd = () => {
    setShowAddModal(false);
  };

  // Helper function to format currency
  const formatCurrency = (amount: number): string => {
    return `$${amount.toFixed(2)}`;
  };

  // Helper function to get status badge color
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      Paid: 'bg-green-100 text-green-700',
      Pending: 'bg-yellow-100 text-yellow-700',
      Approved: 'bg-blue-100 text-blue-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  // Helper function to get status dot color
  const getStatusDotColor = (status: string) => {
    const colors: Record<string, string> = {
      Paid: 'bg-green-500',
      Pending: 'bg-yellow-500',
      Approved: 'bg-blue-500'
    };
    return colors[status] || 'bg-gray-500';
  };

  // Helper function to get payment method badge
  const getPaymentMethodColor = (method: string) => {
    const colors: Record<string, string> = {
      Cash: 'bg-blue-100 text-blue-700',
      Bank: 'bg-purple-100 text-purple-700',
      Online: 'bg-indigo-100 text-indigo-700',
      Cheque: 'bg-pink-100 text-pink-700'
    };
    return colors[method] || 'bg-gray-100 text-gray-700';
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
          <p className="mt-4 text-sm text-gray-500">Loading expenses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Other Expenses</h1>
          <p className="mt-1 text-sm text-gray-500">
            View and manage all expenses in the system
          </p>
        </div>
        <button
          onClick={handleAddClick}
          className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          Add New Expense
        </button>
      </div>

      {/* Summary Cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Total Expenses</p>
          <p className="text-2xl font-bold text-gray-900">
            {expenses.length}
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Total Amount</p>
          <p className="text-2xl font-bold text-red-600">
            {formatCurrency(expenses.reduce((sum, e) => sum + e.amount, 0))}
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Paid</p>
          <p className="text-2xl font-bold text-green-600">
            {formatCurrency(expenses.filter(e => e.status === 'Paid').reduce((sum, e) => sum + e.amount, 0))}
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">
            {formatCurrency(expenses.filter(e => e.status !== 'Paid').reduce((sum, e) => sum + e.amount, 0))}
          </p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-medium text-red-700">{error}</p>
        </div>
      )}

      {/* Empty State */}
      {expenses.length === 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-10 text-center shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900">No Expenses Found</h3>
          <p className="mt-2 text-sm text-gray-500">
            There are no expenses registered yet.
          </p>
          <button
            onClick={handleAddClick}
            className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Add First Expense
          </button>
        </div>
      )}

      {/* Expenses Table */}
      {expenses.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr className="border-b border-gray-200">
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Category
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Description
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Vendor
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Method
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {expenses.map((expense) => (
                  <tr key={expense.id} className="transition hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <span className="inline-flex rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-800">
                        {expense.category.name}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">
                          {expense.description}
                        </p>
                        {expense.receiptNumber && (
                          <p className="mt-1 text-xs text-gray-500">
                            Receipt: {expense.receiptNumber}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {expense.vendor}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-red-600">
                        {formatCurrency(expense.amount)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${getPaymentMethodColor(expense.paymentMethod)}`}>
                        {expense.paymentMethod}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(expense.status)}`}>
                        <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${getStatusDotColor(expense.status)}`} />
                        {expense.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(expense.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleUpdateClick(expense)}
                          className="inline-flex items-center rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-blue-600 transition hover:bg-blue-100"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteClick(expense)}
                          disabled={deleteLoading}
                          className="inline-flex items-center rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      <ExpenseDeleteModal
        isOpen={showDeleteModal}
        expense={expenseToDelete}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        isLoading={deleteLoading}
      />

      {/* Update Modal */}
      <ExpenseUpdateModal
        isOpen={showUpdateModal}
        expense={expenseToUpdate}
        categories={categories}
        onClose={handleCloseUpdate}
        onUpdate={handleUpdateExpense}
        isLoading={updateLoading}
      />

      {/* Add Modal */}
      <ExpenseAddModal
        isOpen={showAddModal}
        categories={categories}
        onClose={handleCloseAdd}
        onAdd={handleAddExpense}
        isLoading={addLoading}
      />
    </div>
  );
};

export default OtherExpensesPage;