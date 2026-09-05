// src/components/students/StudentEnrollmentModal.tsx
import { useState, useEffect } from "react";
import { createEnrollmentWithPayment, type CreateEnrollmentWithPaymentData } from "@/api/studentEnrollmentApi";
import type { Student } from "@/types/student";
import { getTeachers, type Teacher } from "@/api/teacherApi";
import { getBooks, type Book } from "@/api/bookApi";
import { getClasses, type Class } from "@/api/classApi";

interface StudentEnrollmentModalProps {
  isOpen: boolean;
  student: Student | null;
  onClose: () => void;
  onSuccess?: () => void;
}

const StudentEnrollmentModal = ({
  isOpen,
  student,
  onClose,
  onSuccess,
}: StudentEnrollmentModalProps) => {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [successData, setSuccessData] = useState<any>(null);

  // Data for dropdowns
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Helper function to get date one month later
  const getOneMonthLater = (date: Date): string => {
    const newDate = new Date(date);
    newDate.setMonth(newDate.getMonth() + 1);
    return newDate.toISOString().split('T')[0];
  };

  // Form state
  const [formData, setFormData] = useState<Partial<CreateEnrollmentWithPaymentData>>({
    studentId: student?.id || "",
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
    paymentStatus: "Paid",
  });

  // Fetch data when modal opens
  useEffect(() => {
    if (isOpen && student) {
      fetchDropdownData();
      const today = new Date().toISOString().split('T')[0];
      const oneMonthLater = getOneMonthLater(new Date());
      setFormData(prev => ({ 
        ...prev, 
        studentId: student.id,
        startDate: today,
        endDate: oneMonthLater,
        date: today,
        paymentStatus: "Paid",
      }));
      // Clear previous messages
      setSuccess("");
      setError("");
      setSuccessData(null);
    }
  }, [isOpen, student]);

  const fetchDropdownData = async () => {
    try {
      setLoadingData(true);
      const [teachersData, booksData, classesData] = await Promise.all([
        getTeachers(),
        getBooks(),
        getClasses(),
      ]);
      setTeachers(teachersData.filter(t => t.isActive));
      setBooks(booksData.filter(b => b.isActive));
      setClasses(classesData);
    } catch (error) {
      console.error("Failed to fetch dropdown data:", error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "number" || name === "fee" || name === "discount" || name === "finalFee"
          ? value === "" ? 0 : parseFloat(value)
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    setSuccessData(null);

    try {
      // Validate required fields
      if (!formData.bookId) {
        setError("Please select a book");
        setSaving(false);
        return;
      }
      if (!formData.classId) {
        setError("Please select a class");
        setSaving(false);
        return;
      }
      if (!formData.teacherId) {
        setError("Please select a teacher");
        setSaving(false);
        return;
      }
      if (!formData.startDate) {
        setError("Please select start date");
        setSaving(false);
        return;
      }
      if (!formData.endDate) {
        setError("Please select end date");
        setSaving(false);
        return;
      }
      if (!formData.fee || formData.fee <= 0) {
        setError("Please enter a valid fee amount");
        setSaving(false);
        return;
      }
      if (!formData.date) {
        setError("Please select payment date");
        setSaving(false);
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
        status: formData.status as 'Studying' | 'Completed' | 'Dropped' | 'Pending',
        result: formData.result as 'Passed' | 'Failed' | 'Pending' | 'In Progress',
        fee: formData.fee,
        discount: formData.discount || 0,
        finalFee: formData.finalFee || formData.fee,
        date: formData.date,
        paymentStatus: formData.paymentStatus as 'Paid' | 'Pending' | 'Partially Paid' | 'Overdue',
      };

      const response = await createEnrollmentWithPayment(submitData);
      
      // Extract message from backend response
      const successMessage = response?.message || "Student enrolled successfully!";
      setSuccess(successMessage);
      
      // Store response data for detailed view
      if (response?.data) {
        setSuccessData(response.data);
      }

      // Auto-close after 3 seconds with success
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
        resetForm();
      }, 3000);
    } catch (error) {
      console.error("Failed to enroll student:", error);
      let errorMsg = "Failed to enroll student";
      if (error instanceof Error) {
        errorMsg = error.message;
        try {
          const parsed = JSON.parse(error.message);
          if (parsed?.message) {
            errorMsg = parsed.message;
          }
        } catch {
          // If not JSON, use the error message as is
        }
      }
      setError(errorMsg);
      setSaving(false);
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    const today = new Date().toISOString().split('T')[0];
    const oneMonthLater = getOneMonthLater(new Date());
    setFormData({
      studentId: student?.id || "",
      bookId: "",
      classId: "",
      teacherId: "",
      startDate: today,
      endDate: oneMonthLater,
      status: "Studying",
      result: "In Progress",
      fee: 0,
      discount: 0,
      finalFee: 0,
      date: today,
      paymentStatus: "Paid",
    });
    setError("");
    setSuccess("");
    setSuccessData(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between border-b border-gray-200 pb-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              Enroll Student
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Enroll {student?.firstName || ''} {student?.lastName || ''} in a new course
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={saving}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {loadingData ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
              <p className="mt-4 text-sm text-gray-500">Loading data...</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* Course Selection */}
            <div className="mb-6">
              <h4 className="mb-3 font-semibold text-gray-900">Course Information</h4>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {/* Book */}
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

                {/* Class */}
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
                        {classItem.name} - {classItem.block || 'No block'}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Teacher */}
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

                {/* Status */}
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

                {/* Result */}
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

            {/* Dates */}
            <div className="mb-6 border-t border-gray-200 pt-6">
              <h4 className="mb-3 font-semibold text-gray-900">Course Dates</h4>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Start Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate || ""}
                    onChange={handleInputChange}
                    required
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Default: Today's date
                  </p>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    End Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate || ""}
                    onChange={handleInputChange}
                    required
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Default: One month from today
                  </p>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div className="mb-6 border-t border-gray-200 pt-6">
              <h4 className="mb-3 font-semibold text-gray-900">Payment Information</h4>
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
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Payment Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date || ""}
                    onChange={handleInputChange}
                    required
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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

            {/* ✅ MESSAGE DISPLAY AREA - Near the buttons */}
            <div className="mb-4">
              {/* Success Message */}
              {success && (
                <div className="rounded-lg border border-green-200 bg-green-50 p-3">
                  <div className="flex items-start gap-2">
                    <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-green-800">{success}</p>
                      {successData && successData.enrollment && (
                        <div className="mt-1 text-xs text-green-700">
                          <span className="font-medium">Status:</span> {successData.enrollment.status} | 
                          <span className="font-medium ml-2">Result:</span> {successData.enrollment.result}
                          {successData.payment && (
                            <span className="ml-2">
                              <span className="font-medium">Payment:</span> {successData.payment.status}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                  <div className="flex items-start gap-2">
                    <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm font-medium text-red-700">{error}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Buttons with message area above */}
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
                    <svg className="mr-2 inline h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
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
      </div>
    </div>
  );
};

export default StudentEnrollmentModal;