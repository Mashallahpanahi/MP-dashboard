// src/components/students/ScoreAddModal.tsx
import { useState, useEffect } from "react";
import { createStudentScore, getScoresByStudent } from "@/api/scoreApi";
import type { CreateStudentScoreData } from "@/api/scoreApi";
import { getBooks, type Book } from "@/api/bookApi";
import { getTeachers, type Teacher } from "@/api/teacherApi";
import { getEnrollmentsByStudent } from "@/api/studentEnrollmentApi";
// ✅ Shamsi date picker + miladi helper
import ShamsiDatePicker from "@/utils/ShamsiDatePicker";
import { formatMiladiISO } from "@/utils/dateConverter";

interface ScoreAddModalProps {
  isOpen: boolean;
  studentId: string | null;
  studentName: string;
  onClose: () => void;
  onSuccess?: () => void;
}

interface EnrolledBook {
  enrollmentId: string;
  bookId: string;
  bookName: string;
  teacherId: string;
  teacherName: string;
  status: string;
  startDate: string;
  time: string;
  hasScore: boolean;
}

const ScoreAddModal = ({
  isOpen,
  studentId,
  studentName,
  onClose,
  onSuccess,
}: ScoreAddModalProps) => {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loadingData, setLoadingData] = useState(true);

  const [books, setBooks] = useState<Book[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [enrolledBooks, setEnrolledBooks] = useState<EnrolledBook[]>([]);
  const [availableBooks, setAvailableBooks] = useState<EnrolledBook[]>([]);
  const [existingScores, setExistingScores] = useState<any[]>([]);

  const [formData, setFormData] = useState<{
    bookId: string;
    teacherId: string;
    midtermScore: number | undefined;
    finalScore: number | undefined;
    totalScore: number;
    date: string;
    time: string;
    notes: string;
  }>({
    bookId: "",
    teacherId: "",
    midtermScore: undefined,
    finalScore: undefined,
    totalScore: 0,
    // ✅ Miladi ISO for the backend
    date: formatMiladiISO(new Date()),
    time: "",
    notes: "",
  });

  useEffect(() => {
    if (isOpen && studentId) {
      fetchData();
    }
  }, [isOpen, studentId]);

  const fetchData = async () => {
    if (!studentId) return;

    try {
      setLoadingData(true);
      setError("");

      const [enrollmentsResponse, booksData, teachersData, scoresData] =
        await Promise.all([
          getEnrollmentsByStudent(studentId).catch(() => []),
          getBooks().catch(() => []),
          getTeachers().catch(() => []),
          getScoresByStudent(studentId).catch(() => []),
        ]);

      let enrollmentsData: any[] = [];
      if (Array.isArray(enrollmentsResponse)) {
        enrollmentsData = enrollmentsResponse;
      } else if (
        enrollmentsResponse &&
        typeof enrollmentsResponse === "object"
      ) {
        if (Array.isArray((enrollmentsResponse as any).data)) {
          enrollmentsData = (enrollmentsResponse as any).data;
        }
      }

      let scoresArray: any[] = [];
      if (Array.isArray(scoresData)) {
        scoresArray = scoresData;
      } else if (scoresData && typeof scoresData === "object") {
        if (Array.isArray((scoresData as any).data)) {
          scoresArray = (scoresData as any).data;
        }
      }

      const booksArray = Array.isArray(booksData) ? booksData : [];
      const teachersArray = Array.isArray(teachersData) ? teachersData : [];

      const bookMap: Record<string, Book> = {};
      booksArray.forEach((b: Book) => {
        bookMap[b.id] = b;
      });

      const teacherMap: Record<string, Teacher> = {};
      teachersArray.forEach((t: Teacher) => {
        teacherMap[t.id] = t;
      });

      const enrolled: EnrolledBook[] = [];

      enrollmentsData.forEach((item: any) => {
        const enrollment = item.enrollment || item;
        if (!enrollment || !enrollment.id) return;

        const book = bookMap[enrollment.bookId];
        const teacher = teacherMap[enrollment.teacherId];

        if (!book) return;

        const hasScore = scoresArray.some(
          (s: any) => s.bookId === enrollment.bookId
        );

        console.log("📋 Enrollment data:", {
          id: enrollment.id,
          bookId: enrollment.bookId,
          teacherId: enrollment.teacherId,
          timetable: enrollment.timetable,
          time: enrollment.time,
          schedule: enrollment.schedule,
          allFields: Object.keys(enrollment),
        });

        const enrollmentTime =
          enrollment.timetable ||
          enrollment.time ||
          enrollment.schedule ||
          enrollment.classTime ||
          "";

        enrolled.push({
          enrollmentId: enrollment.id,
          bookId: enrollment.bookId,
          bookName: book.name,
          teacherId: enrollment.teacherId,
          teacherName: teacher
            ? `${teacher.firstName} ${teacher.lastName}`
            : "Unknown Teacher",
          status: enrollment.status || "Studying",
          startDate: enrollment.startDate || new Date().toISOString(),
          time: enrollmentTime,
          hasScore,
        });
      });

      enrolled.sort(
        (a, b) =>
          new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
      );

      setEnrolledBooks(enrolled);
      setBooks(booksArray);
      setTeachers(teachersArray);
      setExistingScores(scoresArray);

      const available = enrolled.filter((e) => !e.hasScore);
      setAvailableBooks(available);

      if (available.length > 0) {
        const latestEnrollment = available[0];
        setFormData((prev) => ({
          ...prev,
          bookId: latestEnrollment.bookId,
          teacherId: latestEnrollment.teacherId,
          date: formatMiladiISO(new Date()),
          time: latestEnrollment.time || "",
        }));

        console.log(
          "✅ Auto-filled time from enrollment:",
          latestEnrollment.time
        );
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
      setError("Failed to load data. Please try again.");
    } finally {
      setLoadingData(false);
    }
  };

  const handleBookChange = (bookId: string) => {
    const selected = enrolledBooks.find((eb) => eb.bookId === bookId);

    if (selected) {
      setFormData((prev) => ({
        ...prev,
        bookId,
        teacherId: selected.teacherId,
        time: selected.time || "",
        midtermScore: undefined,
        finalScore: undefined,
        totalScore: 0,
      }));
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;

    if (type === "number") {
      setFormData((prev) => ({
        ...prev,
        [name]: value === "" ? undefined : parseFloat(value),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  useEffect(() => {
    const midterm = formData.midtermScore || 0;
    const final = formData.finalScore || 0;
    setFormData((prev) => ({
      ...prev,
      totalScore: midterm + final,
    }));
  }, [formData.midtermScore, formData.finalScore]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      if (!studentId) {
        setError("Student ID is missing");
        setSaving(false);
        return;
      }

      if (!formData.bookId) {
        setError("Please select a book");
        setSaving(false);
        return;
      }

      const isEnrolled = enrolledBooks.some(
        (eb) => eb.bookId === formData.bookId
      );
      if (!isEnrolled) {
        setError("Please select a book that this student is enrolled in");
        setSaving(false);
        return;
      }

      const alreadyHasScore = existingScores.some(
        (s: any) => s.bookId === formData.bookId
      );
      if (alreadyHasScore) {
        setError(
          "This book already has a score record. Please use Edit instead."
        );
        setSaving(false);
        return;
      }

      if (!formData.teacherId) {
        setError("Please select a teacher");
        setSaving(false);
        return;
      }

      const hasMidterm =
        formData.midtermScore !== undefined &&
        formData.midtermScore !== null;
      const hasFinal =
        formData.finalScore !== undefined && formData.finalScore !== null;

      if (!hasMidterm && !hasFinal) {
        setError("Please enter at least a midterm or final score");
        setSaving(false);
        return;
      }

      const submitData: CreateStudentScoreData = {
        studentId: studentId,
        bookId: formData.bookId,
        teacherId: formData.teacherId,
        totalScore: formData.totalScore,
        // ✅ formData.date is already Miladi ISO
        date: formData.date,
        time: formData.time,
        notes: formData.notes,
      };

      if (hasMidterm) {
        submitData.midtermScore = formData.midtermScore;
      }

      if (hasFinal) {
        submitData.finalScore = formData.finalScore;
      }

      console.log("📤 Creating score with data:", submitData);

      await createStudentScore(submitData);

      setSuccess("Score added successfully!");

      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 1500);
    } catch (error) {
      console.error("❌ Failed to add score:", error);
      setError(error instanceof Error ? error.message : "Failed to add score");
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    if (!saving) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between border-b border-gray-200 pb-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              Add New Score
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Add a score record for {studentName}
            </p>
          </div>
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

        {success && (
          <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-3">
            <div className="flex items-start gap-2">
              <svg
                className="mt-0.5 h-5 w-5 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-sm font-medium text-green-700">{success}</p>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3">
            <div className="flex items-start gap-2">
              <svg
                className="mt-0.5 h-5 w-5 text-red-600"
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
              <p className="text-sm font-medium text-red-700">{error}</p>
            </div>
          </div>
        )}

        {loadingData ? (
          <div className="flex justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
          </div>
        ) : enrolledBooks.length === 0 ? (
          <div className="rounded-lg bg-yellow-50 p-6 text-center">
            <div className="mb-4 text-4xl">📚</div>
            <h4 className="text-lg font-semibold text-yellow-800">
              No Enrollments Found
            </h4>
            <p className="mt-2 text-sm text-yellow-700">
              This student is not enrolled in any courses yet. Please enroll
              the student in a course first before adding scores.
            </p>
            <button
              onClick={handleClose}
              className="mt-4 rounded-lg bg-yellow-600 px-4 py-2 text-sm font-medium text-white hover:bg-yellow-700"
            >
              Close
            </button>
          </div>
        ) : availableBooks.length === 0 ? (
          <div className="rounded-lg bg-orange-50 p-6 text-center">
            <div className="mb-4 text-4xl">✅</div>
            <h4 className="text-lg font-semibold text-orange-800">
              All Books Already Have Scores
            </h4>
            <p className="mt-2 text-sm text-orange-700">
              This student already has scores for all enrolled books. Use the
              Edit button to modify existing scores.
            </p>
            <button
              onClick={handleClose}
              className="mt-4 rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* Info Banner */}
            <div className="mb-5 rounded-lg border border-blue-200 bg-blue-50 p-3">
              <p className="text-sm text-blue-800">
                <span className="font-medium">ℹ️ Note:</span> You can only add
                scores for books this student is enrolled in.
              </p>
            </div>

            {/* Book Selection */}
            <div className="mb-5">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Select Book <span className="text-red-500">*</span>
              </label>

              <div className="space-y-2">
                {availableBooks.map((eb) => (
                  <button
                    key={eb.bookId}
                    type="button"
                    onClick={() => handleBookChange(eb.bookId)}
                    disabled={saving}
                    className={`w-full rounded-lg border-2 p-4 text-left transition ${
                      formData.bookId === eb.bookId
                        ? "border-blue-500 bg-blue-50 shadow-md"
                        : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                    } disabled:cursor-not-allowed disabled:opacity-50`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1.5 rounded-lg bg-blue-100 px-3 py-1.5 text-sm font-semibold text-blue-800">
                            <svg
                              className="h-4 w-4"
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
                            Book: {eb.bookName}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1.5 rounded-lg bg-purple-100 px-3 py-1.5 text-sm font-semibold text-purple-800">
                            <svg
                              className="h-4 w-4"
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
                            Teacher: {eb.teacherName}
                          </span>
                        </div>

                        {eb.time && (
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 rounded-lg bg-green-100 px-3 py-1.5 text-sm font-medium text-green-800">
                              <svg
                                className="h-4 w-4"
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
                              Time: {eb.time}
                            </span>
                          </div>
                        )}
                      </div>

                      {formData.bookId === eb.bookId && (
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500">
                          <svg
                            className="h-4 w-4 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>

              <p className="mt-2 text-xs text-gray-500">
                {availableBooks.length} book(s) available for scoring
              </p>
            </div>

            {/* Scores Grid */}
            <div className="mb-5 grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Midterm Score
                </label>
                <input
                  type="number"
                  name="midtermScore"
                  value={formData.midtermScore ?? ""}
                  onChange={handleInputChange}
                  step="0.01"
                  placeholder="Enter midterm score"
                  disabled={saving}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                />
                <p className="mt-1 text-xs text-gray-500">Optional</p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Final Score
                </label>
                <input
                  type="number"
                  name="finalScore"
                  value={formData.finalScore ?? ""}
                  onChange={handleInputChange}
                  step="0.01"
                  placeholder="Enter final score"
                  disabled={saving}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                />
                <p className="mt-1 text-xs text-gray-500">Optional</p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Total Score
                </label>
                <input
                  type="number"
                  name="totalScore"
                  value={formData.totalScore ?? 0}
                  disabled
                  className="w-full cursor-not-allowed rounded-lg border border-gray-200 bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-700"
                />
                <p className="mt-1 text-xs text-gray-400">Auto-calculated</p>
              </div>
            </div>

            {/* ✅ Date and Time */}
            <div className="mb-5 grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* Date — Shamsi picker */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Date
                </label>
                <ShamsiDatePicker
                  value={formData.date}
                  onChange={(miladiISO) =>
                    setFormData((prev) => ({ ...prev, date: miladiISO }))
                  }
                  placeholder="انتخاب تاریخ"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Time
                  {formData.time && (
                    <span className="ml-2 text-xs font-normal text-green-600">
                      ✓ Auto-filled from enrollment
                    </span>
                  )}
                </label>
                <input
                  type="text"
                  name="time"
                  value={formData.time}
                  onChange={handleInputChange}
                  placeholder="e.g., 3-4 PM"
                  disabled={saving}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Can be edited if needed
                </p>
              </div>
            </div>

            {/* Notes */}
            <div className="mb-5">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
                placeholder="Additional notes (optional)"
                disabled={saving}
                className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            {/* Buttons */}
            <div className="mt-6 flex gap-3 border-t border-gray-200 pt-4">
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? "Saving..." : "Add Score"}
              </button>
              <button
                type="button"
                onClick={handleClose}
                disabled={saving}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ScoreAddModal;