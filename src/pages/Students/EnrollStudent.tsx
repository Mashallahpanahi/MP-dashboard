// src/pages/Students/EnrollStudent.tsx
import { FormEvent, useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { enrollStudent, getStudentById, type CreateEnrollmentData } from "@/api/studentApi";
import { getTeachers, type Teacher } from "@/api/teacherApi";
import { getBooks, type Book } from "@/api/bookApi";

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
  const [loadingData, setLoadingData] = useState(true);

  const [formData, setFormData] = useState<CreateEnrollmentData>({
    studentId: studentId || "",
    teacherId: "",
    bookId: "",
    timetable: "",
    tuitionFee: 0,
    discount: 0,
    finalFee: 0,
    startDate: "",
    expectedEndDate: "",
    remarks: "",
  });

  // Fetch teachers and books for dropdowns
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingData(true);
        const [teachersData, booksData] = await Promise.all([
          getTeachers(),
          getBooks(),
        ]);
        setTeachers(teachersData);
        setBooks(booksData);

        // Fetch student name
        if (studentId) {
          const student = await getStudentById(studentId);
          setStudentName(`${student.firstName} ${student.lastName || ''}`);
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
        type === "number" || name === "tuitionFee" || 
        name === "discount" || name === "finalFee"
          ? parseFloat(value) || 0
          : value,
    }));
  };

  // Auto-calculate final fee when tuition fee or discount changes
  useEffect(() => {
    const tuition = formData.tuitionFee || 0;
    const discount = formData.discount || 0;
    const finalFee = tuition - discount;
    setFormData((prev) => ({
      ...prev,
      finalFee: finalFee > 0 ? finalFee : 0,
    }));
  }, [formData.tuitionFee, formData.discount]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Validate required fields
      if (!formData.teacherId) {
        setError("Please select a teacher");
        setLoading(false);
        return;
      }
      if (!formData.bookId) {
        setError("Please select a book");
        setLoading(false);
        return;
      }
      if (!formData.timetable) {
        setError("Please enter timetable");
        setLoading(false);
        return;
      }
      if (!formData.startDate) {
        setError("Please select start date");
        setLoading(false);
        return;
      }
      if (!formData.expectedEndDate) {
        setError("Please select expected end date");
        setLoading(false);
        return;
      }

      await enrollStudent(formData);
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
            Enroll {studentName || 'Student'} in a new course
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
              {/* Teacher */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Teacher *
                </label>
                <select
                  name="teacherId"
                  value={formData.teacherId}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">Select teacher</option>
                  {teachers
                    .filter((teacher) => teacher.isActive)
                    .map((teacher) => (
                      <option key={teacher.id} value={teacher.id}>
                        {teacher.firstName} {teacher.lastName}
                      </option>
                    ))}
                </select>
              </div>

              {/* Book */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Book *
                </label>
                <select
                  name="bookId"
                  value={formData.bookId}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">Select book</option>
                  {books
                    .filter((book) => book.isActive)
                    .map((book) => (
                      <option key={book.id} value={book.id}>
                        {book.name} ({book.code}) - Level {book.level}
                      </option>
                    ))}
                </select>
              </div>

              {/* Timetable */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Timetable *
                </label>
                <input
                  name="timetable"
                  value={formData.timetable}
                  onChange={handleChange}
                  placeholder="Mon 10:00-12:00"
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Remarks */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Remarks
                </label>
                <input
                  name="remarks"
                  value={formData.remarks || ""}
                  onChange={handleChange}
                  placeholder="Additional remarks (optional)"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>
          </div>

          {/* Dates */}
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
                <input
                  name="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Expected End Date */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Expected End Date *
                </label>
                <input
                  name="expectedEndDate"
                  type="date"
                  value={formData.expectedEndDate}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>
          </div>

          {/* Fee Information */}
          <div className="mb-8 border-t border-gray-200 pt-8">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Fee Information
            </h2>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              {/* Tuition Fee */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Tuition Fee ($) *
                </label>
                <input
                  name="tuitionFee"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.tuitionFee || ""}
                  onChange={handleChange}
                  placeholder="100"
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Discount */}
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
                  placeholder="10"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Final Fee - Auto Calculated */}
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
                  Auto-calculated: Tuition - Discount
                </p>
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