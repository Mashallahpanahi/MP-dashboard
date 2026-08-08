// src/components/teachers/TeacherUpdateModal.tsx
import { useState, useEffect } from "react";
import type { Teacher } from "@/types/teacher";
import type { UpdateTeacherData, ApiError } from "@/api/teacherApi";

interface TeacherUpdateModalProps {
  isOpen: boolean;
  teacher: Teacher | null;
  onClose: () => void;
  onUpdate: (id: string, data: Partial<UpdateTeacherData>) => Promise<void>;
  isLoading?: boolean;
}

const TeacherUpdateModal = ({
  isOpen,
  teacher,
  onClose,
  onUpdate,
  isLoading = false,
}: TeacherUpdateModalProps) => {
  const [formData, setFormData] = useState<Partial<UpdateTeacherData>>({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when teacher changes
  useEffect(() => {
    if (teacher) {
      setFormData({
        firstName: teacher.firstName,
        lastName: teacher.lastName,
        gender: teacher.gender,
        phone: teacher.phone,
        email: teacher.email,
        address: teacher.address,
        salaryType: teacher.salaryType,
        salaryAmount: teacher.salaryAmount,
        feePercentage: teacher.feePercentage,
        hireDate: teacher.hireDate,
        isActive: teacher.isActive,
      });
      setError("");
      setSuccess("");
    }
  }, [teacher]);

  if (!isOpen || !teacher) return null;

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;

    if (type === "number") {
      setFormData((prev) => ({
        ...prev,
        [name]: value === "" ? "" : Number(value),
      }));
    } else if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!teacher) return;

    try {
      setIsSubmitting(true);
      setError("");
      setSuccess("");

      // Prepare the data for submission
      const submitData: Partial<UpdateTeacherData> = {
        ...formData,
        salaryAmount: formData.salaryAmount !== undefined
          ? Number(formData.salaryAmount)
          : undefined,
        feePercentage: formData.feePercentage !== undefined
          ? Number(formData.feePercentage)
          : undefined,
      };

      // Remove any fields that are empty strings or undefined
      Object.keys(submitData).forEach((key) => {
        const value = submitData[key as keyof typeof submitData];
        if (value === "" || value === undefined || value === null) {
          delete submitData[key as keyof typeof submitData];
        }
      });

      await onUpdate(teacher.id, submitData);

      setSuccess("Teacher updated successfully!");

      // Close modal after 1.5 seconds
      setTimeout(() => {
        onClose();
        setFormData({});
        setSuccess("");
      }, 1500);
    } catch (error) {
      console.error("Failed to update teacher:", error);
      
      // Handle ApiError with better messages
      if (error instanceof ApiError) {
        setError(error.message);
      } else if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Failed to update teacher");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
      setFormData({});
      setError("");
      setSuccess("");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              Update Teacher
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Edit teacher information
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting || isLoading}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <svg
              className="h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
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

        {/* Success Message */}
        {success && (
          <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-4">
            <p className="text-sm font-medium text-green-700">{success}</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4">
            <div className="flex items-start gap-3">
              <svg
                className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600"
                xmlns="http://www.w3.org/2000/svg"
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
              <div>
                <p className="text-sm font-medium text-red-700">{error}</p>
                {(error.includes("phone number") || error.includes("email address")) && (
                  <p className="mt-1 text-sm text-red-600">
                    Please check the phone number and email address you entered.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Personal Information */}
          <div className="mb-6">
            <h4 className="mb-3 text-sm font-semibold text-gray-700">
              Personal Information
            </h4>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* First Name */}
              <div>
                <label
                  htmlFor="update-firstName"
                  className="mb-1.5 block text-sm font-medium text-gray-700"
                >
                  First Name *
                </label>

                <input
                  id="update-firstName"
                  name="firstName"
                  type="text"
                  value={formData.firstName || ""}
                  onChange={handleChange}
                  placeholder="Enter first name"
                  required
                  disabled={isLoading || isSubmitting}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              {/* Last Name */}
              <div>
                <label
                  htmlFor="update-lastName"
                  className="mb-1.5 block text-sm font-medium text-gray-700"
                >
                  Last Name *
                </label>

                <input
                  id="update-lastName"
                  name="lastName"
                  type="text"
                  value={formData.lastName || ""}
                  onChange={handleChange}
                  placeholder="Enter last name"
                  required
                  disabled={isLoading || isSubmitting}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              {/* Gender */}
              <div>
                <label
                  htmlFor="update-gender"
                  className="mb-1.5 block text-sm font-medium text-gray-700"
                >
                  Gender *
                </label>

                <select
                  id="update-gender"
                  name="gender"
                  value={formData.gender || ""}
                  onChange={handleChange}
                  required
                  disabled={isLoading || isSubmitting}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>

              {/* Phone */}
              <div>
                <label
                  htmlFor="update-phone"
                  className="mb-1.5 block text-sm font-medium text-gray-700"
                >
                  Phone *
                </label>

                <input
                  id="update-phone"
                  name="phone"
                  type="tel"
                  value={formData.phone || ""}
                  onChange={handleChange}
                  placeholder="+937XXXXXXXX"
                  required
                  disabled={isLoading || isSubmitting}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Phone number must be unique in the system
                </p>
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="update-email"
                  className="mb-1.5 block text-sm font-medium text-gray-700"
                >
                  Email *
                </label>

                <input
                  id="update-email"
                  name="email"
                  type="email"
                  value={formData.email || ""}
                  onChange={handleChange}
                  placeholder="teacher@example.com"
                  required
                  disabled={isLoading || isSubmitting}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Email address must be unique in the system
                </p>
              </div>

              {/* Hire Date */}
              <div>
                <label
                  htmlFor="update-hireDate"
                  className="mb-1.5 block text-sm font-medium text-gray-700"
                >
                  Hire Date *
                </label>

                <input
                  id="update-hireDate"
                  name="hireDate"
                  type="date"
                  value={formData.hireDate || ""}
                  onChange={handleChange}
                  required
                  disabled={isLoading || isSubmitting}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              {/* Address */}
              <div className="md:col-span-2">
                <label
                  htmlFor="update-address"
                  className="mb-1.5 block text-sm font-medium text-gray-700"
                >
                  Address *
                </label>

                <textarea
                  id="update-address"
                  name="address"
                  value={formData.address || ""}
                  onChange={handleChange}
                  placeholder="Enter teacher address"
                  rows={2}
                  required
                  disabled={isLoading || isSubmitting}
                  className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
            </div>
          </div>

          {/* Salary Information */}
          <div className="mb-6 border-t border-gray-200 pt-6">
            <h4 className="mb-3 text-sm font-semibold text-gray-700">
              Salary Information
            </h4>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {/* Salary Type */}
              <div>
                <label
                  htmlFor="update-salaryType"
                  className="mb-1.5 block text-sm font-medium text-gray-700"
                >
                  Salary Type *
                </label>

                <select
                  id="update-salaryType"
                  name="salaryType"
                  value={formData.salaryType || ""}
                  onChange={handleChange}
                  required
                  disabled={isLoading || isSubmitting}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Select salary type</option>
                  <option value="Fixed">Fixed</option>
                  <option value="Percentage">Percentage</option>
                </select>
              </div>

              {/* Salary Amount */}
              <div>
                <label
                  htmlFor="update-salaryAmount"
                  className="mb-1.5 block text-sm font-medium text-gray-700"
                >
                  Salary Amount *
                </label>

                <input
                  id="update-salaryAmount"
                  name="salaryAmount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.salaryAmount ?? ""}
                  onChange={handleChange}
                  placeholder="4000"
                  required
                  disabled={isLoading || isSubmitting}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              {/* Fee Percentage */}
              <div>
                <label
                  htmlFor="update-feePercentage"
                  className="mb-1.5 block text-sm font-medium text-gray-700"
                >
                  Fee Percentage (%) *
                </label>

                <input
                  id="update-feePercentage"
                  name="feePercentage"
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  value={formData.feePercentage ?? ""}
                  onChange={handleChange}
                  placeholder="40"
                  required
                  disabled={isLoading || isSubmitting}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="mb-6 border-t border-gray-200 pt-6">
            <h4 className="mb-3 text-sm font-semibold text-gray-700">
              Status
            </h4>

            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive || false}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    isActive: e.target.checked,
                  }))
                }
                disabled={isLoading || isSubmitting}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
              />

              <span className="text-sm font-medium text-gray-700">
                Teacher is active
              </span>
            </label>
          </div>

          {/* Buttons */}
          <div className="flex flex-col-reverse gap-3 border-t border-gray-200 pt-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading || isSubmitting}
              className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isLoading || isSubmitting}
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading || isSubmitting ? (
                <>
                  <svg
                    className="mr-2 inline h-4 w-4 animate-spin"
                    xmlns="http://www.w3.org/2000/svg"
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
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TeacherUpdateModal;