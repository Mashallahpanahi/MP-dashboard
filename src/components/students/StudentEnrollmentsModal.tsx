// src/components/students/StudentEnrollmentModal.tsx
import { useState, useEffect } from "react";
import {
  useCreateEnrollmentWithPayment,
  useEnrollmentHistory,
  type CreateEnrollmentWithPaymentData,
} from "@/api/studentEnrollmentApi";
import type { Student } from "@/api/studentApi";
import { useActiveTeachers } from "@/api/teacherApi";
import { useActiveBooks } from "@/api/bookApi";
import { useClasses } from "@/api/classApi";
// ✅ Shamsi date picker + formatter
import ShamsiDatePicker from "@/utils/ShamsiDatePicker";
import { formatShamsi, formatMiladiISO } from "@/utils/dateConverter";

interface StudentEnrollmentModalProps {
  isOpen: boolean;
  student: Student | null;
  onClose: () => void;
  onSuccess?: () => void;
}

// ============================================
// HISTORY HELPERS
// ============================================

const getPaymentStatusColor = (status: string) => {
  switch (status) {
    case "Paid":
      return "bg-green-100 text-green-700";
    case "Pending":
      return "bg-yellow-100 text-yellow-700";
    case "Partially Paid":
    case "Partial":
      return "bg-orange-100 text-orange-700";
    case "Unpaid":
    case "Overdue":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

const getEnrollmentStatusColor = (status: string) => {
  switch (status) {
    case "Studying":
      return "bg-blue-100 text-blue-700";
    case "Completed":
      return "bg-green-100 text-green-700";
    case "Pending":
      return "bg-yellow-100 text-yellow-700";
    case "Dropped":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

const getResultColor = (result: string) => {
  switch (result) {
    case "Passed":
      return "bg-green-100 text-green-700";
    case "Failed":
      return "bg-red-100 text-red-700";
    case "In Progress":
      return "bg-blue-100 text-blue-700";
    case "Pending":
      return "bg-yellow-100 text-yellow-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

const formatCurrency = (value: string | number | undefined): string => {
  if (value === undefined || value === null) return "$0.00";
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "$0.00";
  return `$${num.toFixed(2)}`;
};

// ✅ Shamsi date — replaces toLocaleDateString
const formatDate = (dateStr: string | undefined): string => {
  if (!dateStr) return "N/A";
  try {
    return formatShamsi(dateStr, "YYYY/MM/DD");
  } catch {
    return dateStr;
  }
};

// ✅ Date one month later, as MILADI ISO for the backend
const getOneMonthLater = (date: Date): string => {
  const newDate = new Date(date);
  newDate.setMonth(newDate.getMonth() + 1);
  return formatMiladiISO(newDate);
};

// ============================================
// MAIN COMPONENT
// ============================================

const StudentEnrollmentModal = ({
  isOpen,
  student,
  onClose,
  onSuccess,
}: StudentEnrollmentModalProps) => {
  const [viewMode, setViewMode] = useState<"form" | "history">("form");

  // ✅ Dropdown data hooks (auto-fetch on mount)
  const { data: teachersData, loading: teachersLoading } = useActiveTeachers();
  const { data: booksData, loading: booksLoading } = useActiveBooks();
  const { data: classesData, loading: classesLoading } = useClasses();

  const teachers = teachersData || [];
  const books = booksData || [];
  const classes = classesData || [];
  const loadingData = teachersLoading || booksLoading || classesLoading;

  // ✅ History hook — fires only when viewMode === "history"
  const {
    data: historyData,
    loading: historyLoading,
    error: historyError,
  } = useEnrollmentHistory(
    student?.id ?? "",
    viewMode === "history" && !!student?.id
  );

  // ✅ Create hook
  const {
    createEnrollmentWithPayment,
    loading: saving,
    error: createError,
  } = useCreateEnrollmentWithPayment();

  // ✅ Local error + success (form validation, PDF-style state)
  const [localError, setLocalError] = useState("");
  const [success, setSuccess] = useState("");

  // Combined error shown to the user
  const error = localError || createError || "";

  // Form state
  const [formData, setFormData] = useState<
    Partial<CreateEnrollmentWithPaymentData>
  >({
    studentId: student?.id || "",
    bookId: "",
    classId: "",
    teacherId: "",
    startDate: "",
    endDate: "",
    time: "",
    status: "Studying",
    result: "In Progress",
    fee: 0,
    discount: 0,
    finalFee: 0,
    date: "",
    paymentStatus: "Paid",
  });

  // Reset when modal opens
  useEffect(() => {
    if (isOpen && student) {
      const today = formatMiladiISO(new Date());
      const oneMonthLater = getOneMonthLater(new Date());
      setFormData({
        studentId: student.id,
        bookId: "",
        classId: "",
        teacherId: "",
        startDate: today,
        endDate: oneMonthLater,
        time: "",
        status: "Studying",
        result: "In Progress",
        fee: 0,
        discount: 0,
        finalFee: 0,
        date: today,
        paymentStatus: "Paid",
      });
      setSuccess("");
      setLocalError("");
      setViewMode("form");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, student]);

  // Auto-calculate final fee
  useEffect(() => {
    const fee = formData.fee || 0;
    const discount = formData.discount || 0;
    const finalFee = fee - discount;
    setFormData((prev) => ({
      ...prev,
      finalFee: finalFee > 0 ? finalFee : 0,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.fee, formData.discount]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "number" ||
        name === "fee" ||
        name === "discount" ||
        name === "finalFee"
          ? value === ""
            ? 0
            : parseFloat(value)
          : value,
    }));
  };

  const resetForm = () => {
    const today = formatMiladiISO(new Date());
    const oneMonthLater = getOneMonthLater(new Date());
    setFormData({
      studentId: student?.id || "",
      bookId: "",
      classId: "",
      teacherId: "",
      startDate: today,
      endDate: oneMonthLater,
      time: "",
      status: "Studying",
      result: "In Progress",
      fee: 0,
      discount: 0,
      finalFee: 0,
      date: today,
      paymentStatus: "Paid",
    });
    setLocalError("");
    setSuccess("");
    setViewMode("form");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");
    setSuccess("");

    // Validation
    if (!formData.bookId) {
      setLocalError("Please select a book");
      return;
    }
    if (!formData.classId) {
      setLocalError("Please select a class");
      return;
    }
    if (!formData.teacherId) {
      setLocalError("Please select a teacher");
      return;
    }
    if (!formData.startDate) {
      setLocalError("Please select start date");
      return;
    }
    if (!formData.endDate) {
      setLocalError("Please select end date");
      return;
    }
    if (!formData.fee || formData.fee <= 0) {
      setLocalError("Please enter a valid fee amount");
      return;
    }
    if (!formData.date) {
      setLocalError("Please select payment date");
      return;
    }

    const submitData: CreateEnrollmentWithPaymentData = {
      studentId: formData.studentId!,
      bookId: formData.bookId,
      classId: formData.classId,
      teacherId: formData.teacherId,
      startDate: formData.startDate,
      endDate: formData.endDate,
      time: formData.time || "",
      status: formData.status as
        | "Studying"
        | "Completed"
        | "Dropped"
        | "Pending",
      result: formData.result as
        | "Passed"
        | "Failed"
        | "Pending"
        | "In Progress",
      fee: formData.fee,
      discount: formData.discount || 0,
      finalFee: formData.finalFee || formData.fee,
      date: formData.date,
      paymentStatus: formData.paymentStatus as
        | "Paid"
        | "Pending"
        | "Partially Paid"
        | "Overdue",
    };

    const ok = await createEnrollmentWithPayment(submitData);
    if (!ok) return; // error surfaces via `error`

    setSuccess("Student enrolled successfully!");

    setTimeout(() => {
      if (onSuccess) onSuccess();
      onClose();
      resetForm();
    }, 3000);
  };

  const handleOpenHistory = () => {
    setViewMode("history");
    // useEnrollmentHistory fires automatically when viewMode flips
  };

  const handleBackToForm = () => {
    setViewMode("form");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // History display derivation
  const isInHistory = viewMode === "history";
  const isHistoryInitialLoading =
    isInHistory && !historyData && !historyError;
  const isHistoryLoadingForDisplay =
    isInHistory && (historyLoading || isHistoryInitialLoading);
  const displayHistory = isHistoryLoadingForDisplay
    ? []
    : historyData?.data?.history || [];
  const summary = historyData?.data?.summary;
  const studentInfo = historyData?.data?.student;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl bg-white shadow-xl">
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              {viewMode === "form" ? "Enroll Student" : "Enrollment History"}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {viewMode === "form"
                ? `Enroll ${student?.firstName || ""} ${
                    student?.lastName || ""
                  } in a new course`
                : `Complete enrollment & payment history for ${
                    studentInfo?.firstName || student?.firstName || ""
                  } ${studentInfo?.lastName || student?.lastName || ""}`}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {viewMode === "form" ? (
              <button
                type="button"
                onClick={handleOpenHistory}
                disabled={saving}
                className="inline-flex items-center gap-1.5 rounded-lg bg-amber-50 px-3 py-2 text-sm font-medium text-amber-700 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-50"
                title="View enrollment & payment history"
              >
                📋 History
              </button>
            ) : (
              <button
                type="button"
                onClick={handleBackToForm}
                className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700 transition hover:bg-blue-100"
                title="Back to enrollment form"
              >
                ← Back to Enrollment
              </button>
            )}

            <button
              type="button"
              onClick={handleClose}
              disabled={saving}
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
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {/* HISTORY VIEW */}
          {viewMode === "history" && (
            <>
              {isHistoryLoadingForDisplay && (
                <div className="flex items-center justify-center py-16">
                  <div className="text-center">
                    <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
                    <p className="mt-4 text-sm text-gray-500">
                      Loading enrollment history...
                    </p>
                  </div>
                </div>
              )}

              {!isHistoryLoadingForDisplay && historyError && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                  <p className="text-sm font-medium text-red-700">
                    {historyError}
                  </p>
                </div>
              )}

              {!isHistoryLoadingForDisplay &&
                !historyError &&
                displayHistory.length === 0 && (
                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-10 text-center">
                    <h3 className="text-base font-semibold text-gray-900">
                      No Enrollment History
                    </h3>
                    <p className="mt-2 text-sm text-gray-500">
                      This student has no enrollment records yet.
                    </p>
                  </div>
                )}

              {!isHistoryLoadingForDisplay &&
                !historyError &&
                displayHistory.length > 0 && (
                  <>
                    {summary && (
                      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                        <div className="rounded-lg border border-gray-200 bg-white p-3">
                          <p className="text-[10px] font-semibold uppercase text-gray-500">
                            Total Enrollments
                          </p>
                          <p className="mt-1 text-xl font-bold text-gray-900">
                            {summary.totalEnrollments}
                          </p>
                        </div>
                        <div className="rounded-lg border border-gray-200 bg-white p-3">
                          <p className="text-[10px] font-semibold uppercase text-gray-500">
                            Total Amount
                          </p>
                          <p className="mt-1 text-xl font-bold text-blue-600">
                            ${Number(summary.totalAmount).toFixed(2)}
                          </p>
                        </div>
                        <div className="rounded-lg border border-gray-200 bg-white p-3">
                          <p className="text-[10px] font-semibold uppercase text-gray-500">
                            Paid
                          </p>
                          <p className="mt-1 text-xl font-bold text-green-600">
                            {summary.paidCount}
                          </p>
                        </div>
                        <div className="rounded-lg border border-gray-200 bg-white p-3">
                          <p className="text-[10px] font-semibold uppercase text-gray-500">
                            Pending
                          </p>
                          <p className="mt-1 text-xl font-bold text-yellow-600">
                            {summary.pendingCount}
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="overflow-hidden rounded-xl border border-gray-200">
                      <div className="overflow-x-auto">
                        <table className="w-full min-w-[1100px]">
                          <thead className="bg-gray-50">
                            <tr className="border-b border-gray-200">
                              <th className="px-3 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                                #
                              </th>
                              <th className="px-3 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                                Book
                              </th>
                              <th className="px-3 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                                Teacher
                              </th>
                              <th className="px-3 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                                Class
                              </th>
                              <th className="px-3 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                                Time
                              </th>
                              <th className="px-3 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                                Duration
                              </th>
                              <th className="px-3 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                                Status
                              </th>
                              <th className="px-3 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                                Result
                              </th>
                              <th className="px-3 py-3 text-right text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                                Fee
                              </th>
                              <th className="px-3 py-3 text-right text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                                Discount
                              </th>
                              <th className="px-3 py-3 text-right text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                                Final
                              </th>
                              <th className="px-3 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                                Payment
                              </th>
                              <th className="px-3 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                                Pay Date
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100 bg-white">
                            {displayHistory.map((record, idx) => (
                              <tr
                                key={record.enrollmentId}
                                className="transition hover:bg-gray-50"
                              >
                                <td className="px-3 py-3 text-xs text-gray-500">
                                  {idx + 1}
                                </td>
                                <td className="px-3 py-3">
                                  <p className="text-xs font-medium text-gray-900">
                                    {record.bookName || "N/A"}
                                  </p>
                                  {record.bookLevelOrder !== undefined && (
                                    <p className="text-[10px] text-gray-500">
                                      Level {record.bookLevelOrder}
                                    </p>
                                  )}
                                </td>
                                <td className="px-3 py-3 text-xs text-gray-700">
                                  {record.teacherName}{" "}
                                  {record.teacherLastName}
                                </td>
                                <td className="px-3 py-3">
                                  <p className="text-xs text-gray-900">
                                    {record.className || "N/A"}
                                  </p>
                                  {record.classBlock && (
                                    <p className="text-[10px] text-gray-500">
                                      {record.classBlock}
                                    </p>
                                  )}
                                </td>
                                <td className="px-3 py-3 text-xs text-gray-700">
                                  {record.time || "—"}
                                </td>
                                {/* ✅ Duration — Shamsi dates */}
                                <td className="px-3 py-3 text-[10px] text-gray-600">
                                  <div>{formatDate(record.startDate)}</div>
                                  <div className="text-gray-400">
                                    to {formatDate(record.endDate)}
                                  </div>
                                </td>
                                <td className="px-3 py-3">
                                  <span
                                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${getEnrollmentStatusColor(
                                      record.enrollmentStatus
                                    )}`}
                                  >
                                    {record.enrollmentStatus}
                                  </span>
                                </td>
                                <td className="px-3 py-3">
                                  <span
                                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${getResultColor(
                                      record.result
                                    )}`}
                                  >
                                    {record.result}
                                  </span>
                                </td>
                                <td className="px-3 py-3 text-right text-xs text-gray-700">
                                  {formatCurrency(record.fee)}
                                </td>
                                <td className="px-3 py-3 text-right text-xs text-orange-600">
                                  -{formatCurrency(record.discount)}
                                </td>
                                <td className="px-3 py-3 text-right text-xs font-semibold text-gray-900">
                                  {formatCurrency(record.finalFee)}
                                </td>
                                <td className="px-3 py-3">
                                  <span
                                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${getPaymentStatusColor(
                                      record.paymentStatus
                                    )}`}
                                  >
                                    {record.paymentStatus}
                                  </span>
                                </td>
                                {/* ✅ Pay Date — Shamsi */}
                                <td className="px-3 py-3 text-xs text-gray-700">
                                  {formatDate(record.paymentDate)}
                                </td>
                              </tr>
                            ))}
                          </tbody>

                          <tfoot className="bg-gray-50">
                            <tr className="border-t-2 border-gray-200">
                              <td
                                colSpan={8}
                                className="px-3 py-3 text-right text-xs font-semibold text-gray-700"
                              >
                                Total:
                              </td>
                              <td className="px-3 py-3 text-right text-xs font-semibold text-gray-900">
                                {formatCurrency(
                                  displayHistory.reduce(
                                    (sum, r) =>
                                      sum + (parseFloat(String(r.fee)) || 0),
                                    0
                                  )
                                )}
                              </td>
                              <td className="px-3 py-3 text-right text-xs font-semibold text-orange-600">
                                -
                                {formatCurrency(
                                  displayHistory.reduce(
                                    (sum, r) =>
                                      sum +
                                      (parseFloat(String(r.discount)) || 0),
                                    0
                                  )
                                )}
                              </td>
                              <td className="px-3 py-3 text-right text-xs font-bold text-blue-700">
                                {formatCurrency(
                                  displayHistory.reduce(
                                    (sum, r) =>
                                      sum +
                                      (parseFloat(String(r.finalFee)) || 0),
                                    0
                                  )
                                )}
                              </td>
                              <td colSpan={2}></td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </div>
                  </>
                )}
            </>
          )}

          {/* FORM VIEW */}
          {viewMode === "form" && (
            <>
              {loadingData ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
                    <p className="mt-4 text-sm text-gray-500">
                      Loading data...
                    </p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  {/* Course Selection */}
                  <div className="mb-6">
                    <h4 className="mb-3 font-semibold text-gray-900">
                      Course Information
                    </h4>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700">
                          Book <span className="text-red-500">*</span>
                        </label>
                        <select
                          name="bookId"
                          value={formData.bookId || ""}
                          onChange={handleInputChange}
                          required
                          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        >
                          <option value="">Select book</option>
                          {books.map((book) => (
                            <option key={book.id} value={book.id}>
                              {book.name} ({book.code})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700">
                          Class <span className="text-red-500">*</span>
                        </label>
                        <select
                          name="classId"
                          value={formData.classId || ""}
                          onChange={handleInputChange}
                          required
                          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        >
                          <option value="">Select class</option>
                          {classes.map((classItem) => (
                            <option key={classItem.id} value={classItem.id}>
                              {classItem.className} -{" "}
                              {classItem.block || "No block"}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700">
                          Teacher <span className="text-red-500">*</span>
                        </label>
                        <select
                          name="teacherId"
                          value={formData.teacherId || ""}
                          onChange={handleInputChange}
                          required
                          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        >
                          <option value="">Select teacher</option>
                          {teachers.map((teacher) => (
                            <option key={teacher.id} value={teacher.id}>
                              {teacher.firstName} {teacher.lastName}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700">
                          Status
                        </label>
                        <select
                          name="status"
                          value={formData.status || "Studying"}
                          onChange={handleInputChange}
                          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        >
                          <option value="Studying">Studying</option>
                          <option value="Pending">Pending</option>
                          <option value="Completed">Completed</option>
                          <option value="Dropped">Dropped</option>
                        </select>
                      </div>

                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700">
                          Result
                        </label>
                        <select
                          name="result"
                          value={formData.result || "In Progress"}
                          onChange={handleInputChange}
                          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        >
                          <option value="In Progress">In Progress</option>
                          <option value="Passed">Passed</option>
                          <option value="Failed">Failed</option>
                          <option value="Pending">Pending</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Course Schedule — Shamsi pickers */}
                  <div className="mb-6 border-t border-gray-200 pt-6">
                    <h4 className="mb-3 font-semibold text-gray-900">
                      Course Schedule
                    </h4>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700">
                          Start Date <span className="text-red-500">*</span>
                        </label>
                        <ShamsiDatePicker
                          value={formData.startDate || ""}
                          onChange={(miladiISO) =>
                            setFormData((prev) => ({
                              ...prev,
                              startDate: miladiISO,
                            }))
                          }
                          placeholder="انتخاب تاریخ"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                          Default: Today's date
                        </p>
                      </div>
                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700">
                          End Date <span className="text-red-500">*</span>
                        </label>
                        <ShamsiDatePicker
                          value={formData.endDate || ""}
                          onChange={(miladiISO) =>
                            setFormData((prev) => ({
                              ...prev,
                              endDate: miladiISO,
                            }))
                          }
                          placeholder="انتخاب تاریخ"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                          Default: One month from today
                        </p>
                      </div>
                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700">
                          Time
                        </label>
                        <input
                          type="text"
                          name="time"
                          value={formData.time || ""}
                          onChange={handleInputChange}
                          placeholder="e.g., 4-6 PM"
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                          e.g., 4-6 PM, 10-12 AM
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Payment Information */}
                  <div className="mb-6 border-t border-gray-200 pt-6">
                    <h4 className="mb-3 font-semibold text-gray-900">
                      Payment Information
                    </h4>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700">
                          Fee ($) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          name="fee"
                          value={formData.fee || ""}
                          onChange={handleInputChange}
                          placeholder="1000"
                          required
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700">
                          Discount ($)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          name="discount"
                          value={formData.discount || ""}
                          onChange={handleInputChange}
                          placeholder="0"
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700">
                          Final Fee
                        </label>
                        <input
                          type="number"
                          value={formData.finalFee || 0}
                          disabled
                          className="w-full rounded-lg border border-gray-200 bg-gray-100 px-3 py-2 text-sm text-gray-700"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                          Auto-calculated: Fee - Discount
                        </p>
                      </div>

                      {/* Payment Date — Shamsi picker */}
                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700">
                          Payment Date{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <ShamsiDatePicker
                          value={formData.date || ""}
                          onChange={(miladiISO) =>
                            setFormData((prev) => ({
                              ...prev,
                              date: miladiISO,
                            }))
                          }
                          placeholder="انتخاب تاریخ"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                          Default: Today's date
                        </p>
                      </div>

                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700">
                          Payment Status
                        </label>
                        <select
                          name="paymentStatus"
                          value={formData.paymentStatus || "Paid"}
                          onChange={handleInputChange}
                          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        >
                          <option value="Paid">Paid</option>
                          <option value="Pending">Pending</option>
                          <option value="Partial">Partial</option>
                          <option value="Unpaid">Unpaid</option>
                          <option value="Overdue">Overdue</option>
                        </select>
                        <p className="mt-1 text-xs text-blue-600">
                          ✅ Default: Paid
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="mb-4">
                    {success && (
                      <div className="rounded-lg border border-green-200 bg-green-50 p-3">
                        <div className="flex items-start gap-2">
                          <svg
                            className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          <p className="text-sm font-medium text-green-800">
                            {success}
                          </p>
                        </div>
                      </div>
                    )}

                    {error && (
                      <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                        <div className="flex items-start gap-2">
                          <svg
                            className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600"
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
                          <p className="text-sm font-medium text-red-700">
                            {error}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Footer Buttons */}
                  <div className="flex flex-col-reverse gap-3 border-t border-gray-200 pt-4 sm:flex-row sm:justify-end">
                    <button
                      type="button"
                      onClick={handleClose}
                      disabled={saving}
                      className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {saving ? (
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
                          Enrolling...
                        </>
                      ) : (
                        "Enroll Student"
                      )}
                    </button>
                  </div>
                </form>
              )}
            </>
          )}
        </div>

        {/* FOOTER (history view) */}
        {viewMode === "history" && (
          <div className="flex items-center justify-end gap-2 border-t border-gray-200 px-6 py-4">
            <button
              onClick={handleBackToForm}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              ← Back to Enrollment
            </button>
            <button
              onClick={handleClose}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentEnrollmentModal;