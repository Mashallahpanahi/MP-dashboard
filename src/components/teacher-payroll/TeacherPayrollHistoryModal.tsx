// src/components/teacher-payroll/TeacherPayrollHistoryModal.tsx
import { useEffect, useState } from "react";
import { useTeachers, usePayrollsByTeacher } from "@/api/teacherPayrollApi";
import type { TeacherPayroll, Teacher } from "@/types/teacherPayroll";
import TeacherPayrollHistoryEditModal from "./TeacherPayrollHistoryEditModal";
// ✅ Shamsi helpers
import {
  formatShamsi,
  convertToShamsi,
  SHAMSI_MONTHS,
} from "@/utils/dateConverter";

interface TeacherPayrollHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TeacherPayrollHistoryModal = ({
  isOpen,
  onClose,
}: TeacherPayrollHistoryModalProps) => {
  // ✅ Teachers come from the hook (replaces getTeachers())
  const { data: teachersData, loading: loadingTeachers } = useTeachers();
  const teachers: Teacher[] = Array.isArray(teachersData)
    ? teachersData.filter((t) => t.isActive)
    : [];

  const [selectedTeacherId, setSelectedTeacherId] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [error, setError] = useState("");

  // ✅ Payrolls come from the hook (replaces getPayrollsByTeacher)
  const {
    data: payrollsData,
    loading: loadingPayrolls,
    refetch: refetchPayrolls,
  } = usePayrollsByTeacher(selectedTeacherId, !!selectedTeacherId);

  const payrolls: TeacherPayroll[] = (
    Array.isArray(payrollsData) ? payrollsData : []
  )
    .slice()
    .sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return b.month - a.month;
    });

  // ✅ Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [payrollToEdit, setPayrollToEdit] = useState<TeacherPayroll | null>(
    null,
  );

  // ✅ Safe number conversion
  const safeNumber = (value: number | string | null | undefined): number => {
    if (value === null || value === undefined || value === "") return 0;
    const num = typeof value === "string" ? parseFloat(value) : value;
    return isNaN(num) ? 0 : num;
  };

  // ✅ Safe currency formatter
  const formatCurrency = (
    amount: number | string | null | undefined,
  ): string => {
    const num = safeNumber(amount);
    return `$${num.toFixed(2)}`;
  };

  // ✅ Format Month — now Shamsi
  //    Converts the stored Miladi month/year to Shamsi, then shows the Shamsi month name.
  const formatMonth = (month: number, year: number): string => {
    try {
      // Use the 15th of the month to avoid edge-of-month rollover
      const miladiMid = `${year}-${String(month).padStart(2, "0")}-15`;
      const sh = convertToShamsi(miladiMid);
      return `${SHAMSI_MONTHS[sh.month - 1]} ${sh.year}`;
    } catch {
      return `${month}/${year}`;
    }
  };

  // ✅ Format Date — now Shamsi
  const formatDate = (date: string): string => {
    if (!date) return "N/A";
    try {
      return formatShamsi(date, "YYYY/MM/DD");
    } catch {
      return "Invalid date";
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      Completed: "bg-green-100 text-green-700",
      "Not Completed": "bg-yellow-100 text-yellow-700",
    };
    return colors[status] || "bg-gray-100 text-gray-700";
  };

  const getStatusDotColor = (status: string) => {
    const colors: Record<string, string> = {
      Completed: "bg-green-500",
      "Not Completed": "bg-yellow-500",
    };
    return colors[status] || "bg-gray-500";
  };

  // ✅ Reset local selection when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedTeacherId("");
      setSelectedTeacher(null);
      setError("");
    }
  }, [isOpen]);

  const handleTeacherChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const teacherId = e.target.value;
    setSelectedTeacherId(teacherId);

    if (teacherId) {
      const teacher = teachers.find((t) => t.id === teacherId);
      setSelectedTeacher(teacher || null);
    } else {
      setSelectedTeacher(null);
    }
  };

  // ✅ Handle edit click
  const handleEditClick = (payroll: TeacherPayroll) => {
    setPayrollToEdit(payroll);
    setShowEditModal(true);
  };

  const handleCloseEdit = () => {
    setShowEditModal(false);
    setPayrollToEdit(null);
  };

  // ✅ Handle edit success - refresh list
  const handleEditSuccess = () => {
    if (selectedTeacherId) {
      refetchPayrolls();
    }
  };

  // Calculate totals
  const totalBaseSalary = payrolls.reduce(
    (sum, p) => sum + safeNumber(p.baseSalary),
    0,
  );
  const totalPaid = payrolls.reduce(
    (sum, p) => sum + safeNumber(p.paidAmount),
    0,
  );
  const totalRemaining = payrolls.reduce(
    (sum, p) => sum + safeNumber(p.remainingSalary),
    0,
  );

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="max-h-[90vh] w-full max-w-6xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
          {/* Header */}
          <div className="mb-4 flex items-start justify-between border-b border-gray-200 pb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h3 className="text-xl font-semibold text-gray-900">
                  See History of Payment
                </h3>
                {selectedTeacher && payrolls.length > 0 && (
                  <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                    {payrolls.length} record(s)
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Select a teacher to view their complete payment history
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
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

          {/* Teacher Selection */}
          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Select Teacher <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedTeacherId}
              onChange={handleTeacherChange}
              disabled={loadingTeachers}
              className="w-full max-w-md rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">-- Select a teacher --</option>
              {teachers.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.firstName} {teacher.lastName} - {teacher.email}
                </option>
              ))}
            </select>
            {loadingTeachers && (
              <p className="mt-1 text-xs text-gray-500">Loading teachers...</p>
            )}
          </div>

          {/* Selected Teacher Info */}
          {selectedTeacher && (
            <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 font-bold text-white">
                    {selectedTeacher.firstName?.charAt(0)}
                    {selectedTeacher.lastName?.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {selectedTeacher.firstName} {selectedTeacher.lastName}
                    </p>
                    <p className="text-xs text-gray-600">
                      {selectedTeacher.email} • {selectedTeacher.phone}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-6 text-sm">
                  <div>
                    <p className="text-xs text-gray-600">Salary Type</p>
                    <p className="font-semibold text-gray-900">
                      {selectedTeacher.salaryType === "Fixed"
                        ? "Fixed"
                        : "Per Student"}
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
            </div>
          )}

          {/* Summary Cards */}
          {selectedTeacher && payrolls.length > 0 && (
            <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                <p className="text-xs text-gray-600">Total Base Salary</p>
                <p className="text-lg font-bold text-gray-900">
                  {formatCurrency(totalBaseSalary)}
                </p>
              </div>
              <div className="rounded-lg border border-green-200 bg-green-50 p-3">
                <p className="text-xs text-green-600">Total Paid</p>
                <p className="text-lg font-bold text-green-700">
                  {formatCurrency(totalPaid)}
                </p>
              </div>
              <div className="rounded-lg border border-orange-200 bg-orange-50 p-3">
                <p className="text-xs text-orange-600">Total Remaining</p>
                <p className="text-lg font-bold text-orange-700">
                  {formatCurrency(totalRemaining)}
                </p>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3">
              <p className="text-sm font-medium text-red-700">{error}</p>
            </div>
          )}

          {/* Loading */}
          {loadingPayrolls && (
            <div className="flex justify-center py-12">
              <div className="text-center">
                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
                <p className="mt-2 text-sm text-gray-500">
                  Loading payment history...
                </p>
              </div>
            </div>
          )}

          {/* No teacher selected */}
          {!selectedTeacherId && !loadingPayrolls && (
            <div className="rounded-lg bg-gray-50 p-8 text-center">
              <div className="mb-4 text-4xl">👤</div>
              <h4 className="text-lg font-semibold text-gray-900">
                Select a Teacher
              </h4>
              <p className="mt-2 text-sm text-gray-500">
                Choose a teacher from the dropdown above to view their payment
                history
              </p>
            </div>
          )}

          {/* No payrolls */}
          {selectedTeacherId &&
            !loadingPayrolls &&
            payrolls.length === 0 &&
            !error && (
              <div className="rounded-lg bg-gray-50 p-8 text-center">
                <div className="mb-4 text-4xl">📋</div>
                <h4 className="text-lg font-semibold text-gray-900">
                  No Payment Records
                </h4>
                <p className="mt-2 text-sm text-gray-500">
                  This teacher has no payment records yet.
                </p>
              </div>
            )}

          {/* Payroll Table */}
          {selectedTeacherId && !loadingPayrolls && payrolls.length > 0 && (
            <div className="overflow-hidden rounded-lg border border-gray-200">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr className="border-b border-gray-200">
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Month
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Base Salary
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Paid Amount
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Remaining
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Payment Date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Notes
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {payrolls.map((payroll) => {
                      const remainingNum = safeNumber(payroll.remainingSalary);

                      return (
                        <tr key={payroll.id} className="hover:bg-gray-50">
                          {/* ✅ Month — Shamsi */}
                          <td className="px-4 py-3">
                            <span className="font-medium text-gray-900">
                              {formatMonth(payroll.month, payroll.year)}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-semibold text-gray-900">
                              {formatCurrency(payroll.baseSalary)}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-semibold text-green-600">
                              {formatCurrency(payroll.paidAmount)}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`font-semibold ${
                                remainingNum > 0
                                  ? "text-red-600"
                                  : "text-gray-500"
                              }`}
                            >
                              {formatCurrency(payroll.remainingSalary)}
                            </span>
                          </td>
                          {/* ✅ Payment Date — Shamsi */}
                          <td className="px-4 py-3">
                            <span className="text-sm text-gray-600">
                              {formatDate(payroll.date)}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusColor(
                                payroll.status,
                              )}`}
                            >
                              <span
                                className={`mr-1.5 h-1.5 w-1.5 rounded-full ${getStatusDotColor(
                                  payroll.status,
                                )}`}
                              />
                              {payroll.status}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-xs text-gray-600">
                              {payroll.notes || "—"}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => handleEditClick(payroll)}
                              className="inline-flex items-center rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-600 transition hover:bg-blue-100"
                            >
                              <svg
                                className="mr-1 h-3 w-3"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                />
                              </svg>
                              Edit
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

          {/* Close Button */}
          <div className="mt-6 border-t border-gray-200 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <TeacherPayrollHistoryEditModal
        isOpen={showEditModal}
        payroll={payrollToEdit}
        onClose={handleCloseEdit}
        onSuccess={handleEditSuccess}
      />
    </>
  );
};

export default TeacherPayrollHistoryModal;
