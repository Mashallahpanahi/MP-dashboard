// src/components/students/EnrollmentHistoryModal.tsx
import { useMemo } from "react";
import {
  useEnrollmentHistory,
  type EnrollmentHistoryResponse,
  type EnrollmentHistoryRecord,
  type EnrollmentScore,
} from "@/api/studentEnrollmentApi";
import type { Student } from "@/api/studentApi";
// ✅ Shamsi date formatter
import { formatShamsi } from "@/utils/dateConverter";

interface EnrollmentHistoryModalProps {
  isOpen: boolean;
  student: Student | null;
  onClose: () => void;
}

// ============================================
// COLOR HELPERS
// ============================================

const getStatusColor = (status: string) => {
  switch (status) {
    case "Paid":
      return "bg-green-100 text-green-700 ring-1 ring-green-200";
    case "Pending":
      return "bg-yellow-100 text-yellow-700 ring-1 ring-yellow-200";
    case "Partially Paid":
    case "Partial":
      return "bg-orange-100 text-orange-700 ring-1 ring-orange-200";
    case "Unpaid":
    case "Overdue":
      return "bg-red-100 text-red-700 ring-1 ring-red-200";
    default:
      return "bg-gray-100 text-gray-700 ring-1 ring-gray-200";
  }
};

const getEnrollmentStatusColor = (status: string) => {
  switch (status) {
    case "Studying":
      return "bg-blue-100 text-blue-700 ring-1 ring-blue-200";
    case "Completed":
      return "bg-green-100 text-green-700 ring-1 ring-green-200";
    case "Pending":
      return "bg-yellow-100 text-yellow-700 ring-1 ring-yellow-200";
    case "Dropped":
      return "bg-red-100 text-red-700 ring-1 ring-red-200";
    default:
      return "bg-gray-100 text-gray-700 ring-1 ring-gray-200";
  }
};

const getResultColor = (result: string) => {
  switch (result) {
    case "Passed":
      return "bg-green-100 text-green-700 ring-1 ring-green-200";
    case "Failed":
      return "bg-red-100 text-red-700 ring-1 ring-red-200";
    case "In Progress":
      return "bg-blue-100 text-blue-700 ring-1 ring-blue-200";
    case "Pending":
      return "bg-yellow-100 text-yellow-700 ring-1 ring-yellow-200";
    default:
      return "bg-gray-100 text-gray-700 ring-1 ring-gray-200";
  }
};

const getScoreTextColor = (score: number | null | undefined): string => {
  if (score === null || score === undefined || isNaN(Number(score)))
    return "text-gray-400";
  const n = Number(score);
  if (n >= 75) return "text-green-600";
  if (n >= 50) return "text-yellow-600";
  return "text-red-600";
};

const getScoreBadgeColor = (score: number | null): string => {
  if (score === null || isNaN(score)) {
    return "bg-gray-100 text-gray-500 ring-1 ring-gray-200";
  }
  if (score >= 75) return "bg-green-100 text-green-700 ring-1 ring-green-200";
  if (score >= 50)
    return "bg-yellow-100 text-yellow-700 ring-1 ring-yellow-200";
  return "bg-red-100 text-red-700 ring-1 ring-red-200";
};

// ============================================
// FORMAT HELPERS
// ============================================

const formatCurrency = (value: string | number | undefined): string => {
  if (value === undefined || value === null) return "$0.00";
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "$0.00";
  return `$${num.toFixed(2)}`;
};

// ✅ Shamsi date — replaces the old toLocaleDateString version
const formatDate = (dateStr: string | undefined): string => {
  if (!dateStr) return "N/A";
  try {
    return formatShamsi(dateStr, "YYYY/MM/DD");
  } catch {
    return dateStr;
  }
};

const parseScore = (
  value: string | number | null | undefined,
): number | null => {
  if (value === null || value === undefined) return null;
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return null;
  return num;
};

const formatScore = (value: string | number | null | undefined): string => {
  const num = parseScore(value);
  if (num === null) return "—";
  return num.toFixed(1);
};

const getRecordTimestamp = (record: EnrollmentHistoryRecord): number => {
  if (record.createdAt) {
    const t = new Date(record.createdAt).getTime();
    if (!isNaN(t)) return t;
  }
  if (record.startDate) {
    const t = new Date(record.startDate).getTime();
    if (!isNaN(t)) return t;
  }
  return 0;
};

// ============================================
// COMPONENT
// ============================================

const EnrollmentHistoryModal = ({
  isOpen,
  student,
  onClose,
}: EnrollmentHistoryModalProps) => {
  const studentId = student?.id ?? "";

  // ✅ Hook replaces getStudentEnrollmentHistory + local loading/error state
  const {
    data: rawHistoryData,
    loading: hookLoading,
    error: hookError,
  } = useEnrollmentHistory(studentId, isOpen && !!studentId);

  // ✅ Only trust data that belongs to the CURRENT student.
  // Prevents stale data flicker when switching between students.
  const historyData: EnrollmentHistoryResponse | null =
    rawHistoryData?.data?.student?.id === studentId ? rawHistoryData : null;

  const loading = hookLoading || (!!rawHistoryData && !historyData);
  const error = hookError || "";

  const sortedHistory = useMemo(() => {
    const list = historyData?.data?.history || [];
    return [...list].sort(
      (a, b) => getRecordTimestamp(b) - getRecordTimestamp(a),
    );
  }, [historyData]);

  if (!isOpen) return null;

  const summary = historyData?.data?.summary;
  const studentInfo = historyData?.data?.student;
  const history = sortedHistory;

  const scoredRecords = history.filter((r) => r.score !== null).length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="flex max-h-[92vh] w-full max-w-[1500px] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-gray-200 bg-gradient-to-r from-slate-50 to-white px-6 py-4">
          <div className="flex items-center gap-3">
            {studentInfo?.image ? (
              <img
                src={`${
                  import.meta.env.VITE_API_URL || "http://localhost:3000"
                }${studentInfo.image}`}
                alt={`${studentInfo.firstName} ${studentInfo.lastName}`}
                className="h-12 w-12 rounded-full object-cover ring-2 ring-blue-100"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 font-semibold text-white shadow-sm">
                {student?.firstName?.charAt(0) || "?"}
                {student?.lastName?.charAt(0) || ""}
              </div>
            )}
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Enrollment & Payment History
              </h2>
              <p className="text-xs text-gray-500">
                {studentInfo
                  ? `${studentInfo.firstName} ${studentInfo.lastName} · ${
                      studentInfo.studentNumber || "No ID"
                    }`
                  : `${student?.firstName || ""} ${
                      student?.lastName || ""
                    }`.trim()}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
            title="Close"
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

        {/* BODY */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {loading && (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
                <p className="mt-4 text-sm text-gray-500">
                  Loading enrollment history...
                </p>
              </div>
            </div>
          )}

          {error && !loading && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <p className="text-sm font-medium text-red-700">{error}</p>
            </div>
          )}

          {!loading && !error && history.length === 0 && (
            <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-10 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                <svg
                  className="h-6 w-6 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-gray-900">
                No Enrollment History
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                This student has no enrollment records yet.
              </p>
            </div>
          )}

          {!loading && !error && history.length > 0 && (
            <>
              {/* SUMMARY CARDS */}
              {summary && (
                <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                  <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-3 shadow-sm">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                      Enrollments
                    </p>
                    <p className="mt-1 text-xl font-bold text-gray-900">
                      {summary.totalEnrollments}
                    </p>
                  </div>
                  <div className="rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-white p-3 shadow-sm">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-blue-600">
                      Total Amount
                    </p>
                    <p className="mt-1 text-xl font-bold text-blue-700">
                      ${Number(summary.totalAmount).toFixed(2)}
                    </p>
                  </div>
                  <div className="rounded-xl border border-green-200 bg-gradient-to-br from-green-50 to-white p-3 shadow-sm">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-green-600">
                      Paid
                    </p>
                    <p className="mt-1 text-xl font-bold text-green-700">
                      {summary.paidCount}
                    </p>
                  </div>
                  <div className="rounded-xl border border-yellow-200 bg-gradient-to-br from-yellow-50 to-white p-3 shadow-sm">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-yellow-600">
                      Pending
                    </p>
                    <p className="mt-1 text-xl font-bold text-yellow-700">
                      {summary.pendingCount}
                    </p>
                  </div>
                  <div className="rounded-xl border border-purple-200 bg-gradient-to-br from-purple-50 to-white p-3 shadow-sm">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-purple-600">
                      Scored
                    </p>
                    <p className="mt-1 text-xl font-bold text-purple-700">
                      {summary.scoredCount ?? scoredRecords}
                    </p>
                  </div>
                  <div className="rounded-xl border border-indigo-200 bg-gradient-to-br from-indigo-50 to-white p-3 shadow-sm">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-indigo-600">
                      Avg. Score
                    </p>
                    <p
                      className={`mt-1 text-xl font-bold ${getScoreTextColor(
                        summary.averageTotalScore,
                      )}`}
                    >
                      {summary.averageTotalScore !== undefined &&
                      summary.averageTotalScore !== null
                        ? `${Number(summary.averageTotalScore).toFixed(1)}%`
                        : "—"}
                    </p>
                  </div>
                </div>
              )}

              {/* HISTORY TABLE */}
              <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
                <div className="max-h-[58vh] overflow-auto">
                  <table className="w-full min-w-[1600px] border-collapse">
                    <thead className="sticky top-0 z-20">
                      <tr className="bg-gradient-to-r from-slate-800 to-slate-700 text-white">
                        <th
                          colSpan={7}
                          className="border-r border-slate-600 px-4 py-2 text-left text-[10px] font-bold uppercase tracking-widest"
                        >
                          📚 Course Details
                        </th>
                        <th
                          colSpan={3}
                          className="border-r border-slate-600 px-4 py-2 text-left text-[10px] font-bold uppercase tracking-widest"
                        >
                          💰 Financial
                        </th>
                        <th
                          colSpan={2}
                          className="border-r border-slate-600 px-4 py-2 text-left text-[10px] font-bold uppercase tracking-widest"
                        >
                          💳 Payment
                        </th>
                        <th
                          colSpan={4}
                          className="px-4 py-2 text-left text-[10px] font-bold uppercase tracking-widest"
                        >
                          📊 Score & Result
                        </th>
                      </tr>

                      <tr className="bg-slate-100 shadow-sm">
                        <th className="border-b border-r border-slate-200 px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-600">
                          #
                        </th>
                        <th className="border-b border-r border-slate-200 px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-600">
                          Book
                        </th>
                        <th className="border-b border-r border-slate-200 px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-600">
                          Teacher
                        </th>
                        <th className="border-b border-r border-slate-200 px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-600">
                          Class
                        </th>
                        <th className="border-b border-r border-slate-200 px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-600">
                          Time
                        </th>
                        <th className="border-b border-r border-slate-200 px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-600">
                          Duration
                        </th>
                        <th className="border-b border-r border-slate-200 px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-600">
                          Status
                        </th>
                        <th className="border-b border-r border-slate-200 px-4 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-slate-600">
                          Fee
                        </th>
                        <th className="border-b border-r border-slate-200 px-4 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-slate-600">
                          Discount
                        </th>
                        <th className="border-b border-r border-slate-200 px-4 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-slate-600">
                          Final Fee
                        </th>
                        <th className="border-b border-r border-slate-200 px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-600">
                          Payment
                        </th>
                        <th className="border-b border-r border-slate-200 px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-600">
                          Pay Date
                        </th>
                        <th className="border-b border-r border-slate-200 bg-indigo-50/60 px-4 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-indigo-700">
                          Midterm
                        </th>
                        <th className="border-b border-r border-slate-200 bg-indigo-50/60 px-4 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-indigo-700">
                          Final
                        </th>
                        <th className="border-b border-r border-slate-200 bg-indigo-50/60 px-4 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-indigo-700">
                          Total
                        </th>
                        <th className="border-b border-slate-200 bg-indigo-50/60 px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-indigo-700">
                          Result
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-100 bg-white">
                      {history.map((record, idx) => {
                        const midterm = parseScore(record.score?.midtermScore);
                        const finalScore = parseScore(record.score?.finalScore);
                        const totalScore = parseScore(record.score?.totalScore);
                        const hasScore = record.score !== null;

                        return (
                          <tr
                            key={record.enrollmentId}
                            className={`transition ${
                              idx % 2 === 0 ? "bg-white" : "bg-slate-50/50"
                            } hover:bg-blue-50/60`}
                          >
                            <td className="border-r border-gray-100 px-4 py-3 text-xs font-medium text-gray-500">
                              {idx + 1}
                              {idx === 0 && (
                                <span className="ml-1.5 inline-flex items-center rounded-full bg-emerald-100 px-1.5 py-0.5 text-[9px] font-bold uppercase text-emerald-700">
                                  Latest
                                </span>
                              )}
                            </td>
                            <td className="border-r border-gray-100 px-4 py-3">
                              <p className="text-sm font-semibold text-gray-900">
                                {record.bookName || "N/A"}
                              </p>
                              {record.bookLevelOrder !== undefined && (
                                <p className="text-[10px] font-medium text-gray-500">
                                  Level {record.bookLevelOrder}
                                </p>
                              )}
                            </td>
                            <td className="border-r border-gray-100 px-4 py-3 text-sm text-gray-700">
                              {record.teacherName} {record.teacherLastName}
                            </td>
                            <td className="border-r border-gray-100 px-4 py-3">
                              <p className="text-sm text-gray-900">
                                {record.className || "N/A"}
                              </p>
                              {record.classBlock && (
                                <p className="text-[10px] text-gray-500">
                                  {record.classBlock}
                                </p>
                              )}
                            </td>
                            <td className="border-r border-gray-100 px-4 py-3 text-xs font-medium text-gray-700">
                              {record.time || "—"}
                            </td>
                            <td className="border-r border-gray-100 px-4 py-3 text-[11px] leading-tight text-gray-600">
                              <div className="font-medium">
                                {formatDate(record.startDate)}
                              </div>
                              <div className="text-gray-400">
                                → {formatDate(record.endDate)}
                              </div>
                            </td>
                            <td className="border-r border-gray-100 px-4 py-3">
                              <span
                                className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${getEnrollmentStatusColor(
                                  record.enrollmentStatus,
                                )}`}
                              >
                                {record.enrollmentStatus}
                              </span>
                            </td>
                            <td className="border-r border-gray-100 px-4 py-3 text-right text-sm tabular-nums text-gray-700">
                              {formatCurrency(record.fee)}
                            </td>
                            <td className="border-r border-gray-100 px-4 py-3 text-right text-sm tabular-nums text-orange-600">
                              -{formatCurrency(record.discount)}
                            </td>
                            <td className="border-r border-gray-100 px-4 py-3 text-right text-sm font-bold tabular-nums text-blue-700">
                              {formatCurrency(record.finalFee)}
                            </td>
                            <td className="border-r border-gray-100 px-4 py-3">
                              <span
                                className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${getStatusColor(
                                  record.paymentStatus,
                                )}`}
                              >
                                {record.paymentStatus}
                              </span>
                            </td>
                            <td className="border-r border-gray-100 px-4 py-3 text-xs text-gray-700">
                              {formatDate(record.paymentDate)}
                            </td>

                            <td className="border-r border-gray-100 bg-indigo-50/20 px-4 py-3 text-right text-xs tabular-nums">
                              {hasScore ? (
                                <span className="font-medium text-gray-800">
                                  {formatScore(midterm)}
                                </span>
                              ) : (
                                <span className="text-gray-400">—</span>
                              )}
                            </td>
                            <td className="border-r border-gray-100 bg-indigo-50/20 px-4 py-3 text-right text-xs tabular-nums">
                              {hasScore && finalScore !== null ? (
                                <span className="font-medium text-gray-800">
                                  {formatScore(finalScore)}
                                </span>
                              ) : (
                                <span className="text-gray-400">—</span>
                              )}
                            </td>
                            <td className="border-r border-gray-100 bg-indigo-50/20 px-4 py-3 text-right">
                              {totalScore !== null ? (
                                <span
                                  className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold tabular-nums ${getScoreBadgeColor(
                                    totalScore,
                                  )}`}
                                >
                                  {totalScore.toFixed(1)}
                                </span>
                              ) : (
                                <span className="text-xs text-gray-400">—</span>
                              )}
                            </td>
                            <td className="bg-indigo-50/20 px-4 py-3">
                              <span
                                className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${getResultColor(
                                  record.result,
                                )}`}
                              >
                                {record.result}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>

                    <tfoot className="sticky bottom-0 z-10">
                      <tr className="border-t-2 border-slate-300 bg-gradient-to-r from-slate-100 to-slate-50">
                        <td
                          colSpan={7}
                          className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider text-slate-600"
                        >
                          Grand Total
                        </td>
                        <td className="px-4 py-3 text-right text-sm font-bold tabular-nums text-slate-800">
                          {formatCurrency(
                            history.reduce(
                              (sum, r) =>
                                sum + (parseFloat(String(r.fee)) || 0),
                              0,
                            ),
                          )}
                        </td>
                        <td className="px-4 py-3 text-right text-sm font-bold tabular-nums text-orange-600">
                          -
                          {formatCurrency(
                            history.reduce(
                              (sum, r) =>
                                sum + (parseFloat(String(r.discount)) || 0),
                              0,
                            ),
                          )}
                        </td>
                        <td className="px-4 py-3 text-right text-sm font-extrabold tabular-nums text-blue-700">
                          {formatCurrency(
                            history.reduce(
                              (sum, r) =>
                                sum + (parseFloat(String(r.finalFee)) || 0),
                              0,
                            ),
                          )}
                        </td>
                        <td colSpan={5} className="text-center">
                          {summary?.averageTotalScore !== undefined &&
                            summary?.averageTotalScore !== null && (
                              <span className="text-xs font-bold uppercase tracking-wider text-indigo-700">
                                Avg Score:{" "}
                                {Number(summary.averageTotalScore).toFixed(1)}
                              </span>
                            )}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>

        {/* FOOTER */}
        <div className="flex items-center justify-between border-t border-gray-200 bg-slate-50 px-6 py-4">
          <p className="text-xs text-gray-500">
            {history.length > 0 && (
              <>
                Showing <strong>{history.length}</strong> record
                {history.length !== 1 ? "s" : ""} ·{" "}
                <span className="font-medium text-emerald-600">
                  Newest first
                </span>{" "}
                ·{" "}
                <span className="font-medium text-indigo-600">
                  {scoredRecords} scored
                </span>
              </>
            )}
          </p>
          <button
            onClick={onClose}
            className="rounded-lg bg-slate-800 px-5 py-2 text-sm font-medium text-white transition hover:bg-slate-900"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default EnrollmentHistoryModal;
