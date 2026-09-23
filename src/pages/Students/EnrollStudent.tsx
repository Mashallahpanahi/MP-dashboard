// src/pages/Students/EnrollStudent.tsx
import { FormEvent, useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  createEnrollmentWithPayment,
  type CreateEnrollmentWithPaymentData,
} from "@/api/studentEnrollmentApi";
import { getStudentById } from "@/api/studentApi";
import { getTeachers, type Teacher } from "@/api/teacherApi";
import { getBooks, type Book } from "@/api/bookApi";
import { getClasses, type Class } from "@/api/classApi";
// ✅ Shamsi date picker
import ShamsiDatePicker from "@/utils/ShamsiDatePicker";
import { formatMiladiISO } from "@/utils/dateConverter";

const EnrollStudent = () => {
  const navigate = useNavigate();
  const { studentId } = useParams<{ studentId: string }>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [studentName, setStudentName] = useState("");

  // Data for dropdowns
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const [formData, setFormData] = useState<
    Partial<CreateEnrollmentWithPaymentData>
  >({
    studentId: studentId || "",
    bookId: "",
    classId: "",
    teacherId: "",
    startDate: "",
    endDate: "",
    status: "Studying",
    result: "In Progress",
    fee: 0,
    discount: 0,
    finalFee: 0,
    date: "",
    paymentStatus: "Pending",
    score: undefined,
    scoreDate: "",
    scoreTime: "",
    scoreNotes: "",
  });

  // Fetch data for dropdowns
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingData(true);
        const [teachersData, booksData, classesData] = await Promise.all([
          getTeachers(),
          getBooks(),
          getClasses(),
        ]);
        setTeachers(teachersData.filter((t) => t.isActive));
        setBooks(booksData.filter((b) => b.isActive));
        setClasses(classesData);

        // Fetch student name
        if (studentId) {
          const student = await getStudentById(studentId);
          setStudentName(`${student.firstName} ${student.lastName || ""}`);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
        setError("Failed to load required data");
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, [studentId]);

  const handleChange = (
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
        name === "finalFee" ||
        name === "score"
          ? value === ""
            ? 0
            : parseFloat(value)
          : value,
    }));
  };

  // Auto-calculate final fee when fee or discount changes
  useEffect(() => {
    const fee = formData.fee || 0;
    const discount = formData.discount || 0;
    const finalFee = fee - discount;
    setFormData((prev) => ({
      ...prev,
      finalFee: finalFee > 0 ? finalFee : 0,
    }));
  }, [formData.fee, formData.discount]);

  // Set payment date to today when not set (Miladi ISO for the backend)
  useEffect(() => {
    if (!formData.date) {
      setFormData((prev) => ({
        ...prev,
        date: formatMiladiISO(new Date()),
      }));
    }
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Validate required fields
      if (!formData.bookId) {
        setError("Please select a book");
        setLoading(false);
        return;
      }
      if (!formData.classId) {
        setError("Please select a class");
        setLoading(false);
        return;
      }
      if (!formData.teacherId) {
        setError("Please select a teacher");
        setLoading(false);
        return;
      }
      if (!formData.startDate) {
        setError("Please select start date");
        setLoading(false);
        return;
      }
      if (!formData.endDate) {
        setError("Please select end date");
        setLoading(false);
        return;
      }
      if (!formData.fee || formData.fee <= 0) {
        setError("Please enter a valid fee amount");
        setLoading(false);
        return;
      }
      if (!formData.date) {
        setError("Please select payment date");
        setLoading(false);
        return;
      }

      // Prepare data for submission
      const submitData: CreateEnrollmentWithPaymentData = {
        studentId: formData.studentId!,
        bookId: formData.bookId,
        classId: formData.classId,
        teacherId: formData.teacherId,
        startDate: formData.startDate,
        endDate: formData.endDate,
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
        score: formData.score || undefined,
        scoreDate: formData.scoreDate || undefined,
        scoreTime: formData.scoreTime || undefined,
        scoreNotes: formData.scoreNotes || undefined,
      };

      await createEnrollmentWithPayment(submitData);
      setSuccess("Student enrolled successfully!");
      setTimeout(() => {
        navigate("/students/all");
      }, 1500);
    } catch (error) {
      console.error("Failed to enroll student:", error);
      setError(
        error instanceof Error ? error.message : "Failed to enroll student"
      );
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
          <p className="mt-4 text-sm text-gray-500">Loading data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Enroll Student</h1>
          <p className="mt-1 text-sm text-gray-500">
            Enroll {studentName || "Student"} in a new course with payment
          </p>
        </div>

        {/* Success */}
        {success && (
          <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4">
            <p className="text-sm font-medium text-green-700">{success}</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm font-medium text-red-700">{error}</p>
          </div>
        )}

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
        >
          {/* Course Selection */}
          <div className="mb-8">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Course Selection
            </h2>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {/* Book */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Book *
                </label>
                <select
                  name="bookId"
                  value={formData.bookId || ""}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">Select book</option>
                  {books.map((book) => (
                    <option key={book.id} value={book.id}>
                      {book.name} ({book.code}) - Level {book.level}
                    </option>
                  ))}
                </select>
              </div>

              {/* Class */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Class *
                </label>
                <select
                  name="classId"
                  value={formData.classId || ""}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">Select class</option>
                  {classes.map((classItem) => (
                    <option key={classItem.id} value={classItem.id}>
                      {classItem.name} - {classItem.block}
                    </option>
                  ))}
                </select>
              </div>

              {/* Teacher */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Teacher *
                </label>
                <select
                  name="teacherId"
                  value={formData.teacherId || ""}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">Select teacher</option>
                  {teachers.map((teacher) => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.firstName} {teacher.lastName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status || "Studying"}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="Studying">Studying</option>
                  <option value="Pending">Pending</option>
                  <option value="Completed">Completed</option>
                  <option value="Dropped">Dropped</option>
                </select>
              </div>

              {/* Result */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Result
                </label>
                <select
                  name="result"
                  value={formData.result || "In Progress"}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="In Progress">In Progress</option>
                  <option value="Passed">Passed</option>
                  <option value="Failed">Failed</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>
            </div>
          </div>

          {/* ✅ Course Dates — Shamsi pickers */}
          <div className="mb-8 border-t border-gray-200 pt-8">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Course Dates
            </h2>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {/* Start Date */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Start Date *
                </label>
                <ShamsiDatePicker
                  value={formData.startDate || ""}
                  onChange={(miladiISO) =>
                    setFormData((prev) => ({
                      ...prev,
                      startDate: miladiISO,
                    }))
                  }
                  placeholder="انتخاب تاریخ شروع"
                />
              </div>

              {/* End Date */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  End Date *
                </label>
                <ShamsiDatePicker
                  value={formData.endDate || ""}
                  onChange={(miladiISO) =>
                    setFormData((prev) => ({
                      ...prev,
                      endDate: miladiISO,
                    }))
                  }
                  placeholder="انتخاب تاریخ ختم"
                />
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div className="mb-8 border-t border-gray-200 pt-8">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Payment Information
            </h2>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Fee ($) *
                </label>
                <input
                  name="fee"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.fee || ""}
                  onChange={handleChange}
                  placeholder="1000"
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Discount ($)
                </label>
                <input
                  name="discount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.discount || ""}
                  onChange={handleChange}
                  placeholder="100"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Final Fee ($)
                </label>
                <input
                  type="number"
                  value={formData.finalFee || 0}
                  disabled
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-700"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Auto-calculated: Fee - Discount
                </p>
              </div>

              {/* ✅ Payment Date — Shamsi picker */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Payment Date *
                </label>
                <ShamsiDatePicker
                  value={formData.date || ""}
                  onChange={(miladiISO) =>
                    setFormData((prev) => ({ ...prev, date: miladiISO }))
                  }
                  placeholder="انتخاب تاریخ پرداخت"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Payment Status
                </label>
                <select
                  name="paymentStatus"
                  value={formData.paymentStatus || "Pending"}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="Paid">Paid</option>
                  <option value="Pending">Pending</option>
                  <option value="Partially Paid">Partially Paid</option>
                  <option value="Overdue">Overdue</option>
                </select>
              </div>
            </div>
          </div>

          {/* Score Information (Optional) */}
          <div className="mb-8 border-t border-gray-200 pt-8">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Score Information{" "}
              <span className="text-sm font-normal text-gray-500">
                (Optional)
              </span>
            </h2>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Score
                </label>
                <input
                  name="score"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={formData.score || ""}
                  onChange={handleChange}
                  placeholder="85.5"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* ✅ Score Date — Shamsi picker */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Score Date
                </label>
                <ShamsiDatePicker
                  value={formData.scoreDate || ""}
                  onChange={(miladiISO) =>
                    setFormData((prev) => ({ ...prev, scoreDate: miladiISO }))
                  }
                  placeholder="انتخاب تاریخ نمبر"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Score Time
                </label>
                <input
                  name="scoreTime"
                  type="time"
                  value={formData.scoreTime || ""}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Score Notes
                </label>
                <textarea
                  name="scoreNotes"
                  value={formData.scoreNotes || ""}
                  onChange={handleChange}
                  rows={2}
                  placeholder="Additional notes about the score (optional)"
                  className="w-full resize-none rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col-reverse gap-3 border-t border-gray-200 pt-6 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => navigate("/students/all")}
              disabled={loading}
              className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Enrolling..." : "Enroll Student"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EnrollStudent;