// src/pages/Payment/OtherExpenses.tsx
import { useEffect, useState } from "react";
import {
  getExpenseHistory,
  getTotalLastMonth,
  deleteOtherExpense,
  getOtherExpenseById,
} from "@/api/otherExpenseApi";
import type {
  OtherExpense,
  LastMonthTotal,
} from "@/types/otherExpense";
import {
  AddOtherExpenseModal,
  UpdateOtherExpenseModal,
  DeleteOtherExpenseModal,
} from "@/components/other-expenses";
// ✅ Shamsi helpers
import ShamsiDatePicker from "@/utils/ShamsiDatePicker";
import {
  formatShamsi,
  formatMiladiISO,
  convertToShamsi,
  SHAMSI_MONTHS,
} from "@/utils/dateConverter";

const OtherExpensesPage = () => {
  const [expenses, setExpenses] = useState<OtherExpense[]>([]);
  const [lastMonthTotal, setLastMonthTotal] = useState<LastMonthTotal | null>(null);
  const [totalForRange, setTotalForRange] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingTotal, setLoadingTotal] = useState(true);
  const [error, setError] = useState("");

  // ✅ Default date range: last 1 month (Miladi ISO for backend)
  const getDefaultDates = () => {
    const today = new Date();
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(today.getMonth() - 1);

    return {
      fromDate: formatMiladiISO(oneMonthAgo),
      toDate: formatMiladiISO(today),
    };
  };

  const defaultDates = getDefaultDates();
  // ⚠️ fromDate / toDate kept as MILADI ISO for backend
  const [fromDate, setFromDate] = useState(defaultDates.fromDate);
  const [toDate, setToDate] = useState(defaultDates.toDate);

  // Delete state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<OtherExpense | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Update state
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [expenseToUpdate, setExpenseToUpdate] = useState<OtherExpense | null>(null);
  const [updateLoading, setUpdateLoading] = useState(false);

  // Add state
  const [showAddModal, setShowAddModal] = useState(false);

  // ✅ Safe number conversion
  const safeNumber = (value: number | string | null | undefined): number => {
    if (value === null || value === undefined || value === "") return 0;
    const num = typeof value === "string" ? parseFloat(value) : value;
    return isNaN(num) ? 0 : num;
  };

  const formatCurrency = (amount: number | string | null | undefined): string => {
    const num = safeNumber(amount);
    return `$${num.toFixed(2)}`;
  };

  // ✅ Shamsi date — replaces toLocaleDateString
  const formatDate = (date: string): string => {
    if (!date) return "N/A";
    try {
      return formatShamsi(date, "YYYY/MM/DD");
    } catch {
      return "Invalid date";
    }
  };

  // ✅ Convert "September 2026" (Miladi month name + year) to "سنبله 1405"
  const formatLastMonthLabel = (
    monthName: string | undefined,
    year: number | string | undefined
  ): string => {
    if (!monthName || !year) return "Last Month";
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December",
    ];
    const monthNumber = monthNames.indexOf(monthName) + 1;
    if (!monthNumber) return `${monthName} ${year}`;

    try {
      const miladiMid = `${year}-${String(monthNumber).padStart(2, "0")}-15`;
      const sh = convertToShamsi(miladiMid);
      return `${SHAMSI_MONTHS[sh.month - 1]} ${sh.year}`;
    } catch {
      return `${monthName} ${year}`;
    }
  };

  // ✅ Fetch expenses by date range
  const fetchExpenses = async (from: string, to: string) => {
    try {
      setLoading(true);
      setError("");

      const result = await getExpenseHistory(from, to);
      setExpenses(Array.isArray(result.expenses) ? result.expenses : []);
      setTotalForRange(safeNumber(result.totalExpenses));
    } catch (error) {
      console.error("Failed to fetch expenses:", error);
      setError(
        error instanceof Error ? error.message : "Failed to fetch expenses"
      );
      setExpenses([]);
      setTotalForRange(0);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch last month total
  const fetchLastMonthTotal = async () => {
    try {
      setLoadingTotal(true);
      const data = await getTotalLastMonth();
      setLastMonthTotal(data);
    } catch (error) {
      console.error("Failed to fetch last month total:", error);
    } finally {
      setLoadingTotal(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchExpenses(fromDate, toDate);
    fetchLastMonthTotal();
  }, []);

  // Handle date range change
  const handleDateRangeSearch = () => {
    if (fromDate > toDate) {
      setError("From date must be before To date");
      return;
    }
    fetchExpenses(fromDate, toDate);
  };

  // Delete handlers
  const handleDeleteClick = (expense: OtherExpense) => {
    setExpenseToDelete(expense);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!expenseToDelete) return;

    try {
      setDeleteLoading(true);
      await deleteOtherExpense(expenseToDelete.id);
      setExpenses((prev) => prev.filter((e) => e.id !== expenseToDelete.id));
      setShowDeleteModal(false);
      setExpenseToDelete(null);
      fetchExpenses(fromDate, toDate);
      fetchLastMonthTotal();
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
  const handleUpdateClick = async (expense: OtherExpense) => {
    try {
      setUpdateLoading(true);
      const expenseData = await getOtherExpenseById(expense.id);
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

  const handleUpdateSuccess = () => {
    fetchExpenses(fromDate, toDate);
    fetchLastMonthTotal();
  };

  const handleCloseUpdate = () => {
    setShowUpdateModal(false);
    setExpenseToUpdate(null);
  };

  // Add handlers
  const handleAddClick = () => {
    setShowAddModal(true);
  };

  const handleAddSuccess = () => {
    fetchExpenses(fromDate, toDate);
    fetchLastMonthTotal();
  };

  const handleCloseAdd = () => {
    setShowAddModal(false);
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
            Track and manage all other expenses
          </p>
        </div>
        <button
          onClick={handleAddClick}
          className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add New Expense
        </button>
      </div>

      {/* ✅ Last Month Total Card — label now Shamsi */}
      <div className="mb-6">
        <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Total Expenses for{" "}
                {formatLastMonthLabel(
                  lastMonthTotal?.month,
                  lastMonthTotal?.year
                )}{" "}
                (preview month)
              </p>
              {loadingTotal ? (
                <div className="mt-2 h-8 w-32 animate-pulse rounded bg-gray-200" />
              ) : (
                <p className="mt-2 text-3xl font-bold text-blue-700">
                  {formatCurrency(lastMonthTotal?.totalExpenses || 0)}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                {lastMonthTotal?.count || 0} expense(s) in this period
              </p>
            </div>
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
              <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ Date Range Filter — Shamsi pickers */}
      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <h3 className="mb-3 text-sm font-semibold text-gray-700">
          Filter by Date Range
        </h3>
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-600">
              From Date
            </label>
            <ShamsiDatePicker
              value={fromDate}
              onChange={setFromDate}
              placeholder="انتخاب تاریخ"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-600">
              To Date
            </label>
            <ShamsiDatePicker
              value={toDate}
              onChange={setToDate}
              placeholder="انتخاب تاریخ"
            />
          </div>
          <button
            onClick={handleDateRangeSearch}
            disabled={loading}
            className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Search
          </button>
          <div className="ml-auto rounded-lg border border-gray-200 bg-gray-50 px-4 py-2">
            <p className="text-xs text-gray-600">Total in Range</p>
            <p className="text-lg font-bold text-gray-900">
              {formatCurrency(totalForRange)}
            </p>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-medium text-red-700">{error}</p>
        </div>
      )}

      {/* Empty State */}
      {expenses.length === 0 && !loading && (
        <div className="rounded-xl border border-gray-200 bg-white p-10 text-center shadow-sm">
          <div className="mb-4 text-4xl">💸</div>
          <h3 className="text-lg font-semibold text-gray-900">
            No Expenses Found
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            No expenses between {formatDate(fromDate)} and {formatDate(toDate)}
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
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Description
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {expenses.map((expense) => (
                  <tr key={expense.id} className="transition hover:bg-gray-50">
                    {/* ✅ Date — Shamsi */}
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-gray-900">
                        {formatDate(expense.date)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900">
                        {expense.description}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-red-600">
                        {formatCurrency(expense.amount)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleUpdateClick(expense)}
                          className="inline-flex items-center rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-blue-600 transition hover:bg-blue-100"
                        >
                          <svg className="mr-1.5 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteClick(expense)}
                          disabled={deleteLoading}
                          className="inline-flex items-center rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <svg className="mr-1.5 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
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

      {/* Modals */}
      <AddOtherExpenseModal
        isOpen={showAddModal}
        onClose={handleCloseAdd}
        onSuccess={handleAddSuccess}
      />

      <UpdateOtherExpenseModal
        isOpen={showUpdateModal}
        expense={expenseToUpdate}
        onClose={handleCloseUpdate}
        onSuccess={handleUpdateSuccess}
      />

      <DeleteOtherExpenseModal
        isOpen={showDeleteModal}
        expense={expenseToDelete}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        isLoading={deleteLoading}
      />
    </div>
  );
};

export default OtherExpensesPage;