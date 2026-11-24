// src/components/students/StudentEditModal.tsx
import { useState, useMemo } from "react";
import type { Student } from "@/api/studentApi";
import {
  useEnrollmentsByStudent,
  useUpdateBoth,
  useDeleteEnrollment,
} from "@/api/studentEnrollmentApi";
import { useTeachers, type Teacher } from "@/api/teacherApi";
import { useBooks, type Book } from "@/api/bookApi";
import { useClasses, type Class } from "@/api/classApi";
import StudentPersonalInfoModal from "./StudentPersonalInfoModal";
// ✅ Shamsi date picker + formatter
import ShamsiDatePicker from "@/utils/ShamsiDatePicker";
import { formatShamsi } from "@/utils/dateConverter";

interface StudentEditModalProps {
  isOpen: boolean;
  student: Student | null;
  onClose: () => void;
  onUpdate?: () => void;
  isLoading?: boolean;
}

const StudentEditModal = ({
  isOpen,
  student,
  onClose,
  onUpdate,
  isLoading = false,
}: StudentEditModalProps) => {
  const [showEnrollments, setShowEnrollments] = useState(false);
  const [showPersonalInfo, setShowPersonalInfo] = useState(false);

  // ✅ Data hooks (replace getTeachers / getBooks / getClasses)
  const { data: allTeachersData, error: teachersError } = useTeachers();
  const { data: allBooksData, error: booksError } = useBooks();
  const { data: allClassesData, error: classesError } = useClasses();

  // Filter to active — matches original
  const teachers = useMemo(
    () => (allTeachersData || []).filter((t) => t.isActive),
    [allTeachersData],
  );
  const books = useMemo(
    () => (allBooksData || []).filter((b) => b.isActive),
    [allBooksData],
  );
  const classes = allClassesData || [];

  // Lookup maps for enriching enrollments
  const teacherMap = useMemo(() => {
    const m: Record<string, Teacher> = {};
    teachers.forEach((t) => {
      m[t.id] = t;
    });
    return m;
  }, [teachers]);

  const bookMap = useMemo(() => {
    const m: Record<string, Book> = {};
    books.forEach((b) => {
      m[b.id] = b;
    });
    return m;
  }, [books]);

  const classMap = useMemo(() => {
    const m: Record<string, Class> = {};
    classes.forEach((c) => {
      m[c.id] = c;
    });
    return m;
  }, [classes]);

  // ✅ Enrollments hook — fetches only when All Enrollments view is open
  const {
    data: rawEnrollments,
    loading: loadingEnrollments,
    error: enrollmentsError,
    refetch: refetchEnrollments,
  } = useEnrollmentsByStudent(
    student?.id ?? "",
    isOpen && showEnrollments && !!student?.id,
  );

  // ✅ Mutation hooks
  const { updateBoth, error: updateBothError } = useUpdateBoth();
  const { remove: removeEnrollment } = useDeleteEnrollment();

  // Local UI state
  const [editingEnrollmentId, setEditingEnrollmentId] = useState<string | null>(
    null,
  );
  const [editEnrollmentData, setEditEnrollmentData] = useState<any>({});
  const [savingEnrollment, setSavingEnrollment] = useState(false);
  const [editEnrollmentSuccess, setEditEnrollmentSuccess] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // ✅ Derived enrollments (replaces old fetchAllData enrichment)
  const enrollments = useMemo(() => {
    if (!rawEnrollments) return [];
    const rawData = (rawEnrollments as any)?.data ?? rawEnrollments;
    if (!Array.isArray(rawData)) return [];

    return rawData.map((item: any) => {
      const enrollment = item.enrollment || item;
      const payment = item.payment || {};
      return {
        enrollment: {
          ...enrollment,
          teacher: teacherMap[enrollment.teacherId] || null,
          book: bookMap[enrollment.bookId] || null,
          class: classMap[enrollment.classId] || null,
        },
        payment,
      };
    });
  }, [rawEnrollments, teacherMap, bookMap, classMap]);

  // Combined fetch error (matches original "Failed to fetch data" banner)
  const enrollmentFetchError =
    enrollmentsError || teachersError || booksError || classesError || "";

  // Edit error from the update hook
  const editEnrollmentError = updateBothError || "";

  const handleEnrollmentsClick = () => {
    setShowEnrollments(true);
    setShowPersonalInfo(false);
  };

  const handlePersonalInfoClick = () => {
    setShowPersonalInfo(true);
    setShowEnrollments(false);
  };

  const handleBackToMenu = () => {
    setShowEnrollments(false);
    setShowPersonalInfo(false);
    setEditingEnrollmentId(null);
    setEditEnrollmentData({});
    setEditEnrollmentSuccess("");
  };

  const handlePersonalInfoUpdate = () => {
    if (onUpdate) onUpdate();
    if (showEnrollments && student) {
      refetchEnrollments();
    }
  };

  const handleEnrollmentEditClick = (item: any) => {
    const enrollment = item.enrollment || item;
    const payment = item.payment || {};

    setEditingEnrollmentId(enrollment.id);
    setEditEnrollmentData({
      enrollment: {
        studentId: enrollment.studentId,
        bookId: enrollment.bookId,
        classId: enrollment.classId,
        teacherId: enrollment.teacherId,
        startDate:
          enrollment.startDate?.split("T")[0] || enrollment.startDate || "",
        endDate: enrollment.endDate?.split("T")[0] || enrollment.endDate || "",
        status: enrollment.status || "Studying",
        result: enrollment.result || "",
      },
      payment: {
        fee: parseFloat(payment.fee) || enrollment.fee || 0,
        discount: parseFloat(payment.discount) || enrollment.discount || 0,
        finalFee: parseFloat(payment.finalFee) || enrollment.finalFee || 0,
        date: payment.date?.split("T")[0] || payment.date || "",
        status: payment.status || enrollment.paymentStatus || "Pending",
      },
    });
    setEditEnrollmentSuccess("");
  };

  const handleEnrollmentEditChange = (
    section: "enrollment" | "payment",
    field: string,
    value: any,
  ) => {
    setEditEnrollmentData((prev: any) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleSaveEnrollmentEdit = async () => {
    if (!editingEnrollmentId) return;

    setSavingEnrollment(true);
    setEditEnrollmentSuccess("");

    const submitData: any = {};

    if (editEnrollmentData.enrollment) {
      submitData.enrollment = {};
      Object.keys(editEnrollmentData.enrollment).forEach((key) => {
        const value = editEnrollmentData.enrollment[key];
        if (value !== undefined && value !== null && value !== "") {
          submitData.enrollment[key] = value;
        }
      });
    }

    if (editEnrollmentData.payment) {
      submitData.payment = {};
      Object.keys(editEnrollmentData.payment).forEach((key) => {
        const value = editEnrollmentData.payment[key];
        if (value !== undefined && value !== null && value !== "") {
          submitData.payment[key] =
            key === "fee" || key === "discount" || key === "finalFee"
              ? parseFloat(value)
              : value;
        }
      });
    }

    const ok = await updateBoth(editingEnrollmentId, submitData);

    if (!ok) {
      setSavingEnrollment(false);
      return;
    }

    setEditEnrollmentSuccess("✅ Enrollment updated successfully!");

    setTimeout(async () => {
      await refetchEnrollments();
      setEditingEnrollmentId(null);
      setEditEnrollmentData({});
      setEditEnrollmentSuccess("");
      setSavingEnrollment(false);
    }, 1500);
  };

  const handleCancelEnrollmentEdit = () => {
    setEditingEnrollmentId(null);
    setEditEnrollmentData({});
    setEditEnrollmentSuccess("");
  };

  const handleDeleteEnrollment = async (enrollmentId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this enrollment? This will also delete the associated payment.",
      )
    ) {
      return;
    }

    setDeletingId(enrollmentId);
    const ok = await removeEnrollment(enrollmentId);

    if (ok) {
      alert("Enrollment deleted successfully!");
      await refetchEnrollments();
    } else {
      alert("Failed to delete enrollment");
    }

    setDeletingId(null);
  };

  // ✅ Shamsi date display
  const formatDate = (date: string) => {
    if (!date) return "N/A";
    try {
      return formatShamsi(date, "YYYY/MM/DD");
    } catch {
      return "Invalid date";
    }
  };

  const formatCurrency = (value: any): string => {
    if (value === null || value === undefined || value === "") return "$0.00";
    const num = typeof value === "number" ? value : parseFloat(value);
    if (isNaN(num)) return "$0.00";
    return `$${num.toFixed(2)}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Studying":
        return "bg-green-100 text-green-700";
      case "Completed":
        return "bg-blue-100 text-blue-700";
      case "Passed":
        return "bg-blue-100 text-blue-700";
      case "Dropped":
        return "bg-red-100 text-red-700";
      case "Pending":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "Paid":
        return "bg-green-100 text-green-700";
      case "Pending":
        return "bg-yellow-100 text-yellow-700";
      case "Partial":
        return "bg-orange-100 text-orange-700";
      case "Overdue":
        return "bg-red-100 text-red-700";
      case "Unpaid":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  if (!isOpen || !student) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
          {/* Header */}
          <div className="mb-4 flex items-center justify-between border-b border-gray-200 pb-4">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                {showEnrollments ? "All Enrollments" : "Edit Student"}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {student.firstName} {student.lastName || ""}
                {showEnrollments && ` - ${enrollments.length} enrollment(s)`}
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

          {showEnrollments && (
            <button
              onClick={handleBackToMenu}
              className="mb-4 inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
            >
              <svg
                className="mr-1 h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back to menu
            </button>
          )}

          {showPersonalInfo && (
            <button
              onClick={handleBackToMenu}
              className="mb-4 inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
            >
              <svg
                className="mr-1 h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back to menu
            </button>
          )}

          {/* Main Menu */}
          {!showEnrollments && !showPersonalInfo && (
            <div className="space-y-3">
              <button
                onClick={handleEnrollmentsClick}
                className="flex w-full items-center gap-4 rounded-lg border border-gray-200 p-4 transition hover:border-indigo-300 hover:bg-indigo-50"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100">
                  <svg
                    className="h-6 w-6 text-indigo-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                </div>
                <div className="flex-1 text-left">
                  <h4 className="font-semibold text-gray-900">
                    All Enrollments
                  </h4>
                  <p className="text-sm text-gray-500">
                    View all course enrollments and payments
                  </p>
                </div>
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>

              <button
                onClick={handlePersonalInfoClick}
                className="flex w-full items-center gap-4 rounded-lg border border-gray-200 p-4 transition hover:border-blue-300 hover:bg-blue-50"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                  <svg
                    className="h-6 w-6 text-blue-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <div className="flex-1 text-left">
                  <h4 className="font-semibold text-gray-900">
                    Edit Personal Info
                  </h4>
                  <p className="text-sm text-gray-500">
                    Update student's personal information
                  </p>
                </div>
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>

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
          )}

          {/* Enrollments View */}
          {showEnrollments && (
            <div>
              {enrollmentFetchError && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3">
                  <p className="text-sm font-medium text-red-700">
                    {enrollmentFetchError}
                  </p>
                </div>
              )}

              {loadingEnrollments && (
                <div className="flex justify-center py-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
                </div>
              )}

              {!loadingEnrollments && enrollments.length === 0 && (
                <div className="rounded-lg bg-gray-50 p-8 text-center">
                  <div className="mb-4 text-4xl">📚</div>
                  <h4 className="text-lg font-semibold text-gray-900">
                    No Enrollments Yet
                  </h4>
                  <p className="mt-2 text-sm text-gray-500">
                    This student hasn't been enrolled in any courses yet.
                  </p>
                </div>
              )}

              {!loadingEnrollments && enrollments.length > 0 && (
                <div className="overflow-hidden rounded-lg border border-gray-200">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr className="border-b border-gray-200">
                          <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                            Book
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                            Teacher
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                            Dates
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                            Status
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                            Fee
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                            Payment
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {enrollments.map((item: any) => {
                          const enrollment = item.enrollment || item;
                          const payment = item.payment || {};
                          const isEditing =
                            editingEnrollmentId === enrollment.id;

                          return (
                            <tr
                              key={enrollment.id}
                              className="hover:bg-gray-50"
                            >
                              {isEditing ? (
                                <td colSpan={7} className="px-4 py-3">
                                  <div className="space-y-3">
                                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                      <div>
                                        <label className="block text-xs font-medium text-gray-500">
                                          Book *
                                        </label>
                                        <select
                                          value={
                                            editEnrollmentData.enrollment
                                              ?.bookId || ""
                                          }
                                          onChange={(e) =>
                                            handleEnrollmentEditChange(
                                              "enrollment",
                                              "bookId",
                                              e.target.value,
                                            )
                                          }
                                          className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-sm"
                                        >
                                          <option value="">Select book</option>
                                          {books.map((book) => (
                                            <option
                                              key={book.id}
                                              value={book.id}
                                            >
                                              {book.name}
                                            </option>
                                          ))}
                                        </select>
                                      </div>
                                      <div>
                                        <label className="block text-xs font-medium text-gray-500">
                                          Teacher *
                                        </label>
                                        <select
                                          value={
                                            editEnrollmentData.enrollment
                                              ?.teacherId || ""
                                          }
                                          onChange={(e) =>
                                            handleEnrollmentEditChange(
                                              "enrollment",
                                              "teacherId",
                                              e.target.value,
                                            )
                                          }
                                          className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-sm"
                                        >
                                          <option value="">
                                            Select teacher
                                          </option>
                                          {teachers.map((teacher) => (
                                            <option
                                              key={teacher.id}
                                              value={teacher.id}
                                            >
                                              {teacher.firstName}{" "}
                                              {teacher.lastName}
                                            </option>
                                          ))}
                                        </select>
                                      </div>
                                      <div>
                                        <label className="block text-xs font-medium text-gray-500">
                                          Class *
                                        </label>
                                        <select
                                          value={
                                            editEnrollmentData.enrollment
                                              ?.classId || ""
                                          }
                                          onChange={(e) =>
                                            handleEnrollmentEditChange(
                                              "enrollment",
                                              "classId",
                                              e.target.value,
                                            )
                                          }
                                          className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-sm"
                                        >
                                          <option value="">Select class</option>
                                          {classes.map((classItem) => (
                                            <option
                                              key={classItem.id}
                                              value={classItem.id}
                                            >
                                              {classItem.className} -{" "}
                                              {classItem.block || "No block"}
                                            </option>
                                          ))}
                                        </select>
                                      </div>
                                      <div>
                                        <label className="block text-xs font-medium text-gray-500">
                                          Status
                                        </label>
                                        <select
                                          value={
                                            editEnrollmentData.enrollment
                                              ?.status || ""
                                          }
                                          onChange={(e) =>
                                            handleEnrollmentEditChange(
                                              "enrollment",
                                              "status",
                                              e.target.value,
                                            )
                                          }
                                          className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-sm"
                                        >
                                          <option value="Studying">
                                            Studying
                                          </option>
                                          <option value="Completed">
                                            Completed
                                          </option>
                                          <option value="Passed">Passed</option>
                                          <option value="Dropped">
                                            Dropped
                                          </option>
                                          <option value="Pending">
                                            Pending
                                          </option>
                                        </select>
                                      </div>
                                      <div>
                                        <label className="block text-xs font-medium text-gray-500">
                                          Result
                                        </label>
                                        <input
                                          type="text"
                                          value={
                                            editEnrollmentData.enrollment
                                              ?.result || ""
                                          }
                                          onChange={(e) =>
                                            handleEnrollmentEditChange(
                                              "enrollment",
                                              "result",
                                              e.target.value,
                                            )
                                          }
                                          placeholder="e.g., 85%, Passed"
                                          className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-sm"
                                        />
                                      </div>

                                      <div>
                                        <label className="block text-xs font-medium text-gray-500">
                                          Start Date
                                        </label>
                                        <ShamsiDatePicker
                                          value={
                                            editEnrollmentData.enrollment
                                              ?.startDate || ""
                                          }
                                          onChange={(miladiISO) =>
                                            handleEnrollmentEditChange(
                                              "enrollment",
                                              "startDate",
                                              miladiISO,
                                            )
                                          }
                                          placeholder="انتخاب تاریخ"
                                        />
                                      </div>

                                      <div>
                                        <label className="block text-xs font-medium text-gray-500">
                                          End Date
                                        </label>
                                        <ShamsiDatePicker
                                          value={
                                            editEnrollmentData.enrollment
                                              ?.endDate || ""
                                          }
                                          onChange={(miladiISO) =>
                                            handleEnrollmentEditChange(
                                              "enrollment",
                                              "endDate",
                                              miladiISO,
                                            )
                                          }
                                          placeholder="انتخاب تاریخ"
                                        />
                                      </div>

                                      <div>
                                        <label className="block text-xs font-medium text-gray-500">
                                          Fee ($)
                                        </label>
                                        <input
                                          type="number"
                                          step="0.01"
                                          value={
                                            editEnrollmentData.payment?.fee ||
                                            ""
                                          }
                                          onChange={(e) => {
                                            const val =
                                              parseFloat(e.target.value) || 0;
                                            const discount =
                                              parseFloat(
                                                editEnrollmentData.payment
                                                  ?.discount,
                                              ) || 0;
                                            handleEnrollmentEditChange(
                                              "payment",
                                              "fee",
                                              val,
                                            );
                                            handleEnrollmentEditChange(
                                              "payment",
                                              "finalFee",
                                              Math.max(0, val - discount),
                                            );
                                          }}
                                          className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-sm"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-xs font-medium text-gray-500">
                                          Discount ($)
                                        </label>
                                        <input
                                          type="number"
                                          step="0.01"
                                          value={
                                            editEnrollmentData.payment
                                              ?.discount || ""
                                          }
                                          onChange={(e) => {
                                            const discount =
                                              parseFloat(e.target.value) || 0;
                                            const fee =
                                              parseFloat(
                                                editEnrollmentData.payment?.fee,
                                              ) || 0;
                                            handleEnrollmentEditChange(
                                              "payment",
                                              "discount",
                                              discount,
                                            );
                                            handleEnrollmentEditChange(
                                              "payment",
                                              "finalFee",
                                              Math.max(0, fee - discount),
                                            );
                                          }}
                                          className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-sm"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-xs font-medium text-gray-500">
                                          Final Fee
                                        </label>
                                        <input
                                          type="number"
                                          step="0.01"
                                          value={
                                            editEnrollmentData.payment
                                              ?.finalFee || 0
                                          }
                                          disabled
                                          className="mt-1 w-full cursor-not-allowed rounded border border-gray-200 bg-gray-100 px-2 py-1 text-sm text-gray-700"
                                        />
                                        <p className="text-xs text-gray-400">
                                          Auto-calculated: Fee - Discount
                                        </p>
                                      </div>
                                      <div>
                                        <label className="block text-xs font-medium text-gray-500">
                                          Payment Status
                                        </label>
                                        <select
                                          value={
                                            editEnrollmentData.payment
                                              ?.status || ""
                                          }
                                          onChange={(e) =>
                                            handleEnrollmentEditChange(
                                              "payment",
                                              "status",
                                              e.target.value,
                                            )
                                          }
                                          className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-sm"
                                        >
                                          <option value="Paid">Paid</option>
                                          <option value="Pending">
                                            Pending
                                          </option>
                                          <option value="Partial">
                                            Partial
                                          </option>
                                          <option value="Unpaid">Unpaid</option>
                                          <option value="Overdue">
                                            Overdue
                                          </option>
                                        </select>
                                      </div>

                                      <div>
                                        <label className="block text-xs font-medium text-gray-500">
                                          Payment Date
                                        </label>
                                        <ShamsiDatePicker
                                          value={
                                            editEnrollmentData.payment?.date ||
                                            ""
                                          }
                                          onChange={(miladiISO) =>
                                            handleEnrollmentEditChange(
                                              "payment",
                                              "date",
                                              miladiISO,
                                            )
                                          }
                                          placeholder="انتخاب تاریخ"
                                        />
                                      </div>
                                    </div>
                                    {editEnrollmentError && (
                                      <div className="rounded border border-red-200 bg-red-50 p-2 text-sm text-red-700">
                                        {editEnrollmentError}
                                      </div>
                                    )}
                                    {editEnrollmentSuccess && (
                                      <div className="rounded border border-green-200 bg-green-50 p-2 text-sm text-green-700">
                                        {editEnrollmentSuccess}
                                      </div>
                                    )}
                                    <div className="flex gap-2">
                                      <button
                                        onClick={handleSaveEnrollmentEdit}
                                        disabled={savingEnrollment}
                                        className="rounded bg-blue-600 px-3 py-1 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                                      >
                                        {savingEnrollment
                                          ? "Saving..."
                                          : "Save"}
                                      </button>
                                      <button
                                        onClick={handleCancelEnrollmentEdit}
                                        className="rounded border border-gray-300 px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  </div>
                                </td>
                              ) : (
                                <>
                                  <td className="px-4 py-3">
                                    <p className="font-medium text-gray-900">
                                      {enrollment.book?.name || "N/A"}
                                    </p>
                                  </td>
                                  <td className="px-4 py-3">
                                    <p className="text-sm text-gray-900">
                                      {enrollment.teacher?.firstName || "N/A"}{" "}
                                      {enrollment.teacher?.lastName || ""}
                                    </p>
                                  </td>
                                  <td className="px-4 py-3">
                                    <div className="text-sm">
                                      <p>
                                        <span className="text-xs text-gray-500">
                                          Start:
                                        </span>{" "}
                                        {formatDate(enrollment.startDate)}
                                      </p>
                                      <p>
                                        <span className="text-xs text-gray-500">
                                          End:
                                        </span>{" "}
                                        {formatDate(enrollment.endDate)}
                                      </p>
                                    </div>
                                  </td>
                                  <td className="px-4 py-3">
                                    <span
                                      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${getStatusColor(
                                        enrollment.status,
                                      )}`}
                                    >
                                      {enrollment.status}
                                    </span>
                                    {enrollment.result && (
                                      <p className="mt-1 text-xs text-gray-500">
                                        Result: {enrollment.result}
                                      </p>
                                    )}
                                  </td>
                                  <td className="px-4 py-3">
                                    <div className="text-sm">
                                      <p className="font-medium text-gray-900">
                                        {formatCurrency(
                                          payment.finalFee ||
                                            enrollment.finalFee,
                                        )}
                                      </p>
                                    </div>
                                  </td>
                                  <td className="px-4 py-3">
                                    <span
                                      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${getPaymentStatusColor(
                                        payment.status ||
                                          enrollment.paymentStatus,
                                      )}`}
                                    >
                                      {payment.status ||
                                        enrollment.paymentStatus ||
                                        "N/A"}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3">
                                    <div className="flex flex-wrap gap-2">
                                      <button
                                        onClick={() =>
                                          handleEnrollmentEditClick(item)
                                        }
                                        className="rounded bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600 hover:bg-blue-100"
                                      >
                                        Edit
                                      </button>
                                      <button
                                        onClick={() =>
                                          handleDeleteEnrollment(enrollment.id)
                                        }
                                        disabled={deletingId === enrollment.id}
                                        className="rounded bg-red-50 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                                      >
                                        {deletingId === enrollment.id
                                          ? "Deleting..."
                                          : "Delete"}
                                      </button>
                                    </div>
                                  </td>
                                </>
                              )}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <StudentPersonalInfoModal
        isOpen={showPersonalInfo}
        studentId={student.id}
        studentName={`${student.firstName} ${student.lastName || ""}`}
        onClose={handleBackToMenu}
        onUpdate={handlePersonalInfoUpdate}
      />
    </>
  );
};

export default StudentEditModal;
