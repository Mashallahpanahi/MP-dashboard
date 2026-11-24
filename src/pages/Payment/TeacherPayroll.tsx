// src/pages/Payment/TeacherPayroll.tsx
import { useEffect, useState } from "react";
import {
  useTeacherPayrolls,
  useUnpaidSalaries,
  useTeacherPayrollById,
  useCreateTeacherPayroll,
  useUpdateTeacherPayroll,
  useDeleteTeacherPayroll,
  useAddPaymentToPayroll,
} from "@/api/teacherPayrollApi";
import type {
  TeacherPayroll,
  UpdateTeacherPayrollData,
  CreateTeacherPayrollData,
  AddPaymentData,
  UnpaidSalaryRecord,
} from "@/api/teacherPayrollApi";
import {
  TeacherPayrollCreateModal,
  TeacherPayrollHistoryModal,
} from "@/components/teacher-payroll";
// ✅ Shamsi helpers
import {
  formatShamsi,
  formatMiladiISO,
  convertToShamsi,
  SHAMSI_MONTHS,
} from "@/utils/dateConverter";

const TeacherPayrollPage = () => {
  // ✅ List hooks
  const {
    data: payrollsData,
    loading,
    error: payrollsError,
    refetch: refetchPayrolls,
  } = useTeacherPayrolls();
  const payrolls: TeacherPayroll[] = Array.isArray(payrollsData)
    ? payrollsData
    : [];

  const {
    data: unpaidData,
    loading: loadingUnpaid,
    refetch: refetchUnpaid,
  } = useUnpaidSalaries();
  const unpaidRecords: UnpaidSalaryRecord[] = Array.isArray(unpaidData)
    ? unpaidData
    : [];

  // ✅ Mutation hooks — destructure using the actual keys the hooks export
  const { createTeacherPayroll, loading: createLoading } =
    useCreateTeacherPayroll();
  const { updateTeacherPayroll } = useUpdateTeacherPayroll();
  const { remove: deleteTeacherPayroll, loading: deleteLoading } =
    useDeleteTeacherPayroll();
  const { addPaymentToPayroll, loading: addPaymentLoading } =
    useAddPaymentToPayroll();

  const [localError, setLocalError] = useState("");
  const error = localError || payrollsError || "";

  // Delete state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [payrollToDelete, setPayrollToDelete] = useState<TeacherPayroll | null>(
    null,
  );

  // Update state — track ID, let the hook fetch fresh copy
  const [updatePayrollId, setUpdatePayrollId] = useState<string | null>(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  const { data: fetchedPayrollToUpdate, loading: updateLoading } =
    useTeacherPayrollById(updatePayrollId ?? "", !!updatePayrollId);

  const payrollToUpdate: TeacherPayroll | null = updatePayrollId
    ? fetchedPayrollToUpdate?.id === updatePayrollId
      ? fetchedPayrollToUpdate
      : (payrolls.find((p) => p.id === updatePayrollId) ?? null)
    : null;

  // Create state
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Add Payment state
  const [showAddPaymentModal, setShowAddPaymentModal] = useState(false);
  const [payrollToAddPayment, setPayrollToAddPayment] =
    useState<TeacherPayroll | null>(null);

  // History state
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  // Search state
  const [searchTerm, setSearchTerm] = useState("");

  // Prefill data for create modal
  const [prefillData, setPrefillData] =
    useState<CreateTeacherPayrollData | null>(null);

  // Reset local errors on mount
  useEffect(() => {
    setLocalError("");
  }, []);

  // ============================================
  // DELETE
  // ============================================
  const handleDeleteClick = (payroll: TeacherPayroll) => {
    setPayrollToDelete(payroll);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!payrollToDelete) return;

    setLocalError("");
    const ok = await deleteTeacherPayroll(payrollToDelete.id);

    if (ok) {
      setShowDeleteModal(false);
      setPayrollToDelete(null);
      refetchPayrolls();
      refetchUnpaid();
    } else {
      setLocalError("Failed to delete payroll");
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setPayrollToDelete(null);
  };

  // ============================================
  // UPDATE
  // ============================================
  const handleUpdateClick = async (payroll: TeacherPayroll) => {
    // Open the modal instantly with list data; hook fetches fresh copy in background
    setUpdatePayrollId(payroll.id);
    setShowUpdateModal(true);
  };

  const handleUpdatePayroll = async (
    id: string,
    data: UpdateTeacherPayrollData,
  ) => {
    const ok = await updateTeacherPayroll(id, data);
    if (!ok) {
      throw new Error("Failed to update payroll");
    }
    setShowUpdateModal(false);
    setUpdatePayrollId(null);
    refetchPayrolls();
    refetchUnpaid();
  };

  const handleCloseUpdate = () => {
    setShowUpdateModal(false);
    setUpdatePayrollId(null);
  };

  // ============================================
  // CREATE
  // ============================================
  const handleCreateClick = () => {
    setPrefillData(null);
    setShowCreateModal(true);
  };

  // ============================================
  // ✅ Pay salary for an unpaid record
  //   - Fixed: use salaryAmount as before
  //   - PerStudent: use calculatedSalary (from enrolled students)
  // ============================================
  const handlePayForMonth = (record: UnpaidSalaryRecord) => {
    const isPerStudent = record.salaryType === "PerStudent";

    const calculated = safeNumber(record.calculatedSalary as any);
    const fixedAmount = safeNumber(record.salaryAmount);

    let baseSalary: number;
    let paidAmount: number;

    if (isPerStudent) {
      baseSalary = calculated;
      paidAmount = calculated;
    } else {
      baseSalary = fixedAmount;
      paidAmount = fixedAmount;
    }

    const noteText = isPerStudent
      ? `Salary for ${record.month} ${record.year} — ${calculated} from ${
          record.enrolledStudents ?? 0
        } students`
      : `Salary for ${record.month} ${record.year}`;

    console.log("📤 Prefilling payroll:", {
      teacher: `${record.firstName} ${record.lastName}`,
      type: record.salaryType,
      month: record.month,
      year: record.year,
      baseSalary,
      paidAmount,
      calculatedSalary: record.calculatedSalary,
      enrolledStudents: record.enrolledStudents,
    });

    setPrefillData({
      teacherId: record.teacherId,
      month: record.monthNumber ?? monthNameToNumber(record.month),
      year: record.year,
      baseSalary,
      paidAmount,
      remainingSalary: 0,
      date: formatMiladiISO(new Date()),
      status: "Completed",
      notes: noteText,
    });
    setShowCreateModal(true);
  };

  const handleCreatePayroll = async (data: CreateTeacherPayrollData) => {
    const ok = await createTeacherPayroll(data);
    if (!ok) {
      throw new Error("Failed to create payroll");
    }
    setShowCreateModal(false);
    setPrefillData(null);
    refetchPayrolls();
    refetchUnpaid();
  };

  const handleCloseCreate = () => {
    setShowCreateModal(false);
    setPrefillData(null);
  };

  // ============================================
  // ADD PAYMENT
  // ============================================
  const handleAddPaymentClick = (payroll: TeacherPayroll) => {
    setPayrollToAddPayment(payroll);
    setShowAddPaymentModal(true);
  };

  const handleAddPayment = async (id: string, data: AddPaymentData) => {
    const ok = await addPaymentToPayroll(id, data);
    if (!ok) {
      throw new Error("Failed to add payment");
    }
    setShowAddPaymentModal(false);
    setPayrollToAddPayment(null);
    refetchPayrolls();
    refetchUnpaid();
  };

  const handleCloseAddPayment = () => {
    setShowAddPaymentModal(false);
    setPayrollToAddPayment(null);
  };

  // ============================================
  // HISTORY
  // ============================================
  const handleHistoryClick = () => {
    setShowHistoryModal(true);
  };

  const handleCloseHistory = () => {
    setShowHistoryModal(false);
  };

  // ============================================
  // HELPERS
  // ============================================
  const formatCurrency = (
    amount: number | string | null | undefined,
  ): string => {
    if (amount === null || amount === undefined || amount === "")
      return "$0.00";
    const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
    if (isNaN(numAmount)) return "$0.00";
    return `$${numAmount.toFixed(2)}`;
  };

  const safeNumber = (value: number | string | null | undefined): number => {
    if (value === null || value === undefined || value === "") return 0;
    const num = typeof value === "string" ? parseFloat(value) : value;
    return isNaN(num) ? 0 : num;
  };

  const monthNameToNumber = (monthName: string): number => {
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    return monthNames.indexOf(monthName) + 1;
  };

  const formatDate = (date: string) => {
    if (!date) return "N/A";
    try {
      return formatShamsi(date, "YYYY/MM/DD");
    } catch {
      return "Invalid date";
    }
  };

  // ✅ Convert Miladi month name + year to Shamsi label
  const formatUnpaidMonth = (monthName: string, year: number): string => {
    const monthNumber = monthNameToNumber(monthName);
    if (!monthNumber) return `${monthName} ${year}`;

    try {
      const miladiMid = `${year}-${String(monthNumber).padStart(2, "0")}-15`;
      const sh = convertToShamsi(miladiMid);
      return `${SHAMSI_MONTHS[sh.month - 1]} ${sh.year}`;
    } catch {
      return `${monthName} ${year}`;
    }
  };

  // Filter unpaid records by search
  const filteredUnpaidRecords = unpaidRecords.filter((record) => {
    if (searchTerm === "") return true;
    return (
      record.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.month.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.year.toString().includes(searchTerm)
    );
  });

  if (loadingUnpaid) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
          <p className="mt-4 text-sm text-gray-500">
            Loading unpaid salaries...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Teacher Payroll</h1>
          <p className="mt-1 text-sm text-gray-500">
            Teachers who haven't received their salary
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleHistoryClick}
            className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            <svg
              className="mr-2 h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            See History of Payment
          </button>
          <button
            onClick={() => refetchUnpaid()}
            disabled={loadingUnpaid}
            className="inline-flex items-center rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <svg
              className="mr-2 h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-medium text-red-700">{error}</p>
        </div>
      )}

      {/* Search Bar */}
      <div className="mb-4">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by name, month, or year..."
          className="w-full max-w-md rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
      </div>

      {/* Empty State */}
      {filteredUnpaidRecords.length === 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-10 text-center shadow-sm">
          <div className="mb-4 text-4xl">✅</div>
          <h3 className="text-lg font-semibold text-gray-900">
            {unpaidRecords.length === 0
              ? "All Teachers Are Paid!"
              : "No Results Match Your Search"}
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            {unpaidRecords.length === 0
              ? "All active teachers have received their salaries for all months."
              : "Try adjusting your search criteria."}
          </p>
        </div>
      )}

      {/* Unpaid Records Table */}
      {filteredUnpaidRecords.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr className="border-b border-gray-200">
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Teacher Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Type
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Month
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Amount Due
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUnpaidRecords.map((record, index) => {
                  const isPerStudent = record.salaryType === "PerStudent";
                  const calculated = safeNumber(record.calculatedSalary as any);
                  const fixed = safeNumber(record.salaryAmount);
                  const amountDue = isPerStudent ? calculated : fixed;
                  const studentsCount = record.enrolledStudents ?? 0;

                  return (
                    <tr
                      key={`${record.teacherId}-${record.monthKey}-${index}`}
                      className="transition hover:bg-gray-50"
                    >
                      {/* Teacher */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                            <span className="text-sm font-bold text-red-700">
                              {record.firstName?.charAt(0)}
                              {record.lastName?.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">
                              {record.firstName} {record.lastName}
                            </p>
                            <p className="mt-1 text-xs text-gray-500">
                              {record.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Type */}
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                            isPerStudent
                              ? "bg-purple-100 text-purple-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {record.salaryType}
                        </span>
                      </td>

                      {/* Month (Shamsi) */}
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-800">
                          {formatUnpaidMonth(record.month, record.year)}
                        </span>
                      </td>

                      {/* Amount Due — differs by type */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span className="font-bold text-gray-900">
                            {formatCurrency(amountDue)}
                          </span>
                          {isPerStudent && (
                            <span className="text-[11px] text-purple-600">
                              {studentsCount} student
                              {studentsCount !== 1 ? "s" : ""} •{" "}
                              {safeNumber(record.feePercentage)}% share
                            </span>
                          )}
                          {isPerStudent && studentsCount === 0 && (
                            <span className="text-[11px] text-gray-500">
                              No students enrolled this month
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Action */}
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handlePayForMonth(record)}
                          disabled={isPerStudent && amountDue <= 0}
                          title={
                            isPerStudent && amountDue <= 0
                              ? "Nothing to pay — no students enrolled this month"
                              : "Pay Salary"
                          }
                          className="inline-flex items-center rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <svg
                            className="mr-2 h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                            />
                          </svg>
                          Pay Salary
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create/Pay Salary Modal */}
      <TeacherPayrollCreateModal
        isOpen={showCreateModal}
        onClose={handleCloseCreate}
        onCreate={handleCreatePayroll}
        isLoading={createLoading}
        prefillData={prefillData}
      />

      {/* History Modal */}
      <TeacherPayrollHistoryModal
        isOpen={showHistoryModal}
        onClose={handleCloseHistory}
      />
    </div>
  );
};

export default TeacherPayrollPage;
