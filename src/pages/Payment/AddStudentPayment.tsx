// src/pages/Payment/AddStudentPayment.tsx
import { FormEvent, useState, useEffect } from "react";
import { createStudentPayment, getStudentEnrollments } from "@/api/studentPaymentApi";
import type { CreateStudentPaymentData, StudentEnrollment } from "@/types/studentPayment";
import { useNavigate } from "react-router-dom";

const AddStudentPayment = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [enrollments, setEnrollments] = useState<StudentEnrollment[]>([]);
  const [loadingEnrollments, setLoadingEnrollments] = useState(true);

  const [formData, setFormData] = useState<Partial<CreateStudentPaymentData>>({
    studentEnrollmentId: "",
    amount: 0,
    discount: 0,
    paidAmount: 0,
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: "Cash",
    receiptNumber: "",
    status: "Paid",
    notes: "",
  });

  // Fetch enrollments for dropdown
  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        setLoadingEnrollments(true);
        const data = await getStudentEnrollments();
        setEnrollments(data);
      } catch (error) {
        console.error("Failed to fetch enrollments:", error);
        setError("Failed to load student enrollments");
      } finally {
        setLoadingEnrollments(false);
      }
    };

    fetchEnrollments();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "number" || name === "amount" || name === "discount" || name === "paidAmount"
          ? value === "" ? 0 : parseFloat(value)
          : value,
    }));
  };

  // Auto-calculate remaining amount when amount or paidAmount changes
  useEffect(() => {
    const amount = formData.amount || 0;
    const paidAmount = formData.paidAmount || 0;
    // Don't auto-set status, let user choose
  }, [formData.amount, formData.paidAmount]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Validate required fields
      if (!formData.studentEnrollmentId) {
        setError("Please select a student enrollment");
        setLoading(false);
        return;
      }

      if (!formData.amount || formData.amount <= 0) {
        setError("Amount must be greater than 0");
        setLoading(false);
        return;
      }

      if (!formData.paidAmount || formData.paidAmount <= 0) {
        setError("Paid amount must be greater than 0");
        setLoading(false);
        return;
      }

      if (formData.paidAmount > formData.amount) {
        setError("Paid amount cannot be greater than total amount");
        setLoading(false);
        return;
      }

      // Prepare submit data
      const submitData: CreateStudentPaymentData = {
        studentEnrollmentId: formData.studentEnrollmentId,
        amount: formData.amount,
        discount: formData.discount || 0,
        paidAmount: formData.paidAmount,
        paymentDate: formData.paymentDate || new Date().toISOString().split('T')[0],
        paymentMethod: formData.paymentMethod as 'Cash' | 'Bank' | 'Online' | 'Cheque',
        receiptNumber: formData.receiptNumber || "",
        status: formData.status as 'Paid' | 'Partial' | 'Unpaid' | 'Overdue',
        notes: formData.notes || "",
      };

      await createStudentPayment(submitData);
      setSuccess("Student payment recorded successfully!");
      setTimeout(() => {
        navigate("/payment/students");
      }, 1500);
    } catch (error) {
      console.error("Failed to create payment:", error);
      setError(
        error instanceof Error ? error.message : "Failed to record payment"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Add New Student Payment</h1>
          <p className="mt-1 text-sm text-gray-500">
            Record a new student payment <span className="text-red-500">*</span> indicates required field
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
          {/* Payment Information */}
          <div className="mb-8">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Payment Information
            </h2>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {/* Student Enrollment - Required */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Student Enrollment <span className="text-red-500">*</span>
                </label>
                <select
                  name="studentEnrollmentId"
                  value={formData.studentEnrollmentId || ""}
                  onChange={handleChange}
                  required
                  disabled={loadingEnrollments}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Select enrollment</option>
                  {enrollments.map((enrollment) => (
                    <option key={enrollment.id} value={enrollment.id}>
                      {enrollment.student.firstName} {enrollment.student.lastName} - {enrollment.book.name} ({enrollment.book.code})
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  Select the student enrollment for this payment
                </p>
              </div>

              {/* Receipt Number - Optional */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Receipt Number
                </label>
                <input
                  name="receiptNumber"
                  value={formData.receiptNumber || ""}
                  onChange={handleChange}
                  placeholder="REC-2026-001"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Optional - Auto-generated if not provided
                </p>
              </div>
            </div>
          </div>

          {/* Payment Details */}
          <div className="mb-8 border-t border-gray-200 pt-8">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Payment Details
            </h2>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              {/* Amount - Required */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Total Amount ($) <span className="text-red-500">*</span>
                </label>
                <input
                  name="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.amount || ""}
                  onChange={handleChange}
                  placeholder="500.00"
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Discount - Optional */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Discount ($)
                </label>
                <input
                  name="discount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.discount || ""}
                  onChange={handleChange}
                  placeholder="50.00"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Paid Amount - Required */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Paid Amount ($) <span className="text-red-500">*</span>
                </label>
                <input
                  name="paidAmount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.paidAmount || ""}
                  onChange={handleChange}
                  placeholder="500.00"
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Amount being paid (cannot exceed total)
                </p>
              </div>
            </div>
          </div>

          {/* Payment Method & Status */}
          <div className="mb-8 border-t border-gray-200 pt-8">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Payment Method & Status
            </h2>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              {/* Payment Method - Required */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Payment Method <span className="text-red-500">*</span>
                </label>
                <select
                  name="paymentMethod"
                  value={formData.paymentMethod || "Cash"}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="Cash">Cash</option>
                  <option value="Bank">Bank Transfer</option>
                  <option value="Online">Online Payment</option>
                  <option value="Cheque">Cheque</option>
                </select>
              </div>

              {/* Payment Date - Required */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Payment Date <span className="text-red-500">*</span>
                </label>
                <input
                  name="paymentDate"
                  type="date"
                  value={formData.paymentDate || ""}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Status - Required */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Payment Status <span className="text-red-500">*</span>
                </label>
                <select
                  name="status"
                  value={formData.status || "Paid"}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="Paid">Paid</option>
                  <option value="Partial">Partial</option>
                  <option value="Unpaid">Unpaid</option>
                  <option value="Overdue">Overdue</option>
                </select>
              </div>
            </div>
          </div>

          {/* Notes - Optional */}
          <div className="mb-8 border-t border-gray-200 pt-8">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Additional Information
            </h2>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes || ""}
                onChange={handleChange}
                rows={3}
                placeholder="Any additional notes about this payment (optional)"
                className="w-full resize-none rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col-reverse gap-3 border-t border-gray-200 pt-6 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => navigate("/payment/students")}
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
              {loading ? "Recording..." : "Record Payment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddStudentPayment;