// src/components/students/MoreFilterModal.tsx
import { useEffect, useState } from "react";
import { useTeachers, type Teacher } from "@/api/teacherApi";
import { useBooks, type Book } from "@/api/bookApi";
// ✅ Shamsi date picker
import ShamsiDatePicker from "@/utils/ShamsiDatePicker";

export interface MoreFilterValues {
  teacherId?: string;
  bookId?: string;
  time?: string;
  fromDate?: string;
  toDate?: string;
}

interface MoreFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: MoreFilterValues) => void;
  initialValues?: MoreFilterValues;
  loading?: boolean;
}

// Common time slots
const TIME_OPTIONS = [
  "7-9 am",
  "9-11 am",
  "11-1 pm",
  "1-3 pm",
  "3-5 pm",
  "5-7 pm",
  "7-9 pm",
];

const MoreFilterModal = ({
  isOpen,
  onClose,
  onApply,
  initialValues = {},
  loading = false,
}: MoreFilterModalProps) => {
  // ✅ Hooks replace getTeachers() / getBooks() + local state
  const { data: rawTeachers, loading: teachersLoading } = useTeachers();
  const { data: rawBooks, loading: booksLoading } = useBooks();

  const teachers: Teacher[] = rawTeachers || [];
  const books: Book[] = rawBooks || [];

  // Form values — fromDate / toDate kept as MILADI ISO for the backend
  const [teacherId, setTeacherId] = useState(initialValues.teacherId || "");
  const [bookId, setBookId] = useState(initialValues.bookId || "");
  const [time, setTime] = useState(initialValues.time || "");
  const [fromDate, setFromDate] = useState(initialValues.fromDate || "");
  const [toDate, setToDate] = useState(initialValues.toDate || "");

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setTeacherId(initialValues.teacherId || "");
      setBookId(initialValues.bookId || "");
      setTime(initialValues.time || "");
      setFromDate(initialValues.fromDate || "");
      setToDate(initialValues.toDate || "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleApply = () => {
    const filters: MoreFilterValues = {};
    if (teacherId) filters.teacherId = teacherId;
    if (bookId) filters.bookId = bookId;
    if (time) filters.time = time;
    if (fromDate) filters.fromDate = fromDate;
    if (toDate) filters.toDate = toDate;
    onApply(filters);
  };

  const handleClear = () => {
    setTeacherId("");
    setBookId("");
    setTime("");
    setFromDate("");
    setToDate("");
  };

  const handleClose = () => {
    handleClear();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-lg rounded-xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              More Filters
            </h2>
            <p className="mt-0.5 text-xs text-gray-500">
              Filter students by enrollment details (all optional)
            </p>
          </div>
          <button
            onClick={handleClose}
            className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
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

        {/* Body */}
        <div className="max-h-[70vh] overflow-y-auto px-6 py-5">
          <div className="space-y-4">
            {/* Teacher */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Teacher
              </label>
              <select
                value={teacherId}
                onChange={(e) => setTeacherId(e.target.value)}
                disabled={teachersLoading}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-50"
              >
                <option value="">
                  {teachersLoading
                    ? "Loading teachers..."
                    : `All teachers${
                        teachers.length ? ` (${teachers.length})` : ""
                      }`}
                </option>
                {teachers.map((teacher) => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.firstName} {teacher.lastName || ""}
                    {teacher.salaryType ? ` (${teacher.salaryType})` : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* Book */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Book
              </label>
              <select
                value={bookId}
                onChange={(e) => setBookId(e.target.value)}
                disabled={booksLoading}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-50"
              >
                <option value="">
                  {booksLoading
                    ? "Loading books..."
                    : `All books${books.length ? ` (${books.length})` : ""}`}
                </option>
                {books.map((book) => (
                  <option key={book.id} value={book.id}>
                    {book.name}
                    {book.level ? ` - ${book.level}` : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* Time */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Time
              </label>
              <select
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="">Any time (no filter)</option>
                {TIME_OPTIONS.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">
                Or type a custom time below
              </p>
              <input
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="e.g., 4-6 PM"
                className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* ✅ Date Range — Shamsi pickers */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  From Date
                </label>
                <ShamsiDatePicker
                  value={fromDate}
                  onChange={setFromDate}
                  placeholder="1403/07/02"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  To Date
                </label>
                <ShamsiDatePicker
                  value={toDate}
                  onChange={setToDate}
                  placeholder="1403/12/29"
                />
              </div>
            </div>

            {/* Info Note */}
            <div className="rounded-lg bg-blue-50 p-3">
              <p className="text-xs text-blue-700">
                <strong>Note:</strong> Only students with at least one
                enrollment will appear. New students without enrollments are
                excluded.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-gray-200 px-6 py-4">
          <button
            onClick={handleClear}
            disabled={loading}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Clear All
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={handleClose}
              disabled={loading}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              disabled={loading}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Applying..." : "Apply Filters"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MoreFilterModal;
