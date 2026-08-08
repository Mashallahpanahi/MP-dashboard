import { FormEvent, useState } from "react";
import {
  createTeacher,
  type CreateTeacherData,
  ApiError,
} from "@/api/teacherApi";
import { useNavigate } from "react-router-dom";

const TeacherRegister = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<CreateTeacherData>({
    firstName: "",
    lastName: "",
    gender: "",
    phone: "",
    email: "",
    address: "",
    salaryType: "",
    salaryAmount: 0,
    feePercentage: 40,
    hireDate: "",
    isActive: true,
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]:
        name === "salaryAmount" || name === "feePercentage"
          ? Number(value)
          : value,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setLoading(true);
    setSuccess("");
    setError("");

    try {
      await createTeacher(formData);

      setSuccess("Teacher registered successfully.");

      // Wait 1.5 seconds so the user can see the success message
      setTimeout(() => {
        navigate("/teachers/all");
      }, 1500);
    } catch (error) {
      console.error("Failed to create teacher:", error);

      // Handle ApiError with better messages
      if (error instanceof ApiError) {
        setError(error.message);
      } else if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Failed to register teacher.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Register Teacher
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Add a new teacher to the system
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4">
            <p className="text-sm font-medium text-green-700">
              {success}
            </p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
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
                <p className="text-sm font-medium text-red-700">
                  {error}
                </p>
                {(error.includes("phone number") || error.includes("email address")) && (
                  <p className="mt-1 text-sm text-red-600">
                    Please check the phone number and email address you entered.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Form - rest of the form remains the same */}
        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
        >
          {/* Personal Information */}
          <div className="mb-8">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Personal Information
            </h2>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {/* First Name */}
              <div>
                <label
                  htmlFor="firstName"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  First Name
                </label>

                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="Enter first name"
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Last Name */}
              <div>
                <label
                  htmlFor="lastName"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Last Name
                </label>

                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Enter last name"
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Gender */}
              <div>
                <label
                  htmlFor="gender"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Gender
                </label>

                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>

              {/* Phone */}
              <div>
                <label
                  htmlFor="phone"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Phone *
                </label>

                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+937XXXXXXXX"
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Phone number must be unique in the system
                </p>
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Email *
                </label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="teacher@example.com"
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Email address must be unique in the system
                </p>
              </div>

              {/* Hire Date */}
              <div>
                <label
                  htmlFor="hireDate"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Hire Date
                </label>

                <input
                  id="hireDate"
                  name="hireDate"
                  type="date"
                  value={formData.hireDate}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Address */}
              <div className="md:col-span-2">
                <label
                  htmlFor="address"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Address
                </label>

                <textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Enter teacher address"
                  rows={3}
                  required
                  className="w-full resize-none rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>
          </div>

          {/* Salary Information */}
          <div className="mb-8 border-t border-gray-200 pt-8">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Salary Information
            </h2>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              {/* Salary Type */}
              <div>
                <label
                  htmlFor="salaryType"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Salary Type
                </label>

                <select
                  id="salaryType"
                  name="salaryType"
                  value={formData.salaryType}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">Select salary type</option>
                  <option value="Fixed">Fixed</option>
                  <option value="Percentage">Percentage</option>
                </select>
              </div>

              {/* Salary Amount */}
              <div>
                <label
                  htmlFor="salaryAmount"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Salary Amount
                </label>

                <input
                  id="salaryAmount"
                  name="salaryAmount"
                  type="number"
                  min="0"
                  value={formData.salaryAmount}
                  onChange={handleChange}
                  placeholder="4000"
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Fee Percentage */}
              <div>
                <label
                  htmlFor="feePercentage"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Fee Percentage (%)
                </label>

                <input
                  id="feePercentage"
                  name="feePercentage"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.feePercentage}
                  onChange={handleChange}
                  placeholder="40"
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="mb-8 border-t border-gray-200 pt-8">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Status
            </h2>

            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={(e) =>
                  setFormData((previous) => ({
                    ...previous,
                    isActive: e.target.checked,
                  }))
                }
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />

              <span className="text-sm font-medium text-gray-700">
                Teacher is active
              </span>
            </label>
          </div>

          {/* Buttons */}
          <div className="flex flex-col-reverse gap-3 border-t border-gray-200 pt-6 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() =>
                setFormData({
                  firstName: "",
                  lastName: "",
                  gender: "",
                  phone: "",
                  email: "",
                  address: "",
                  salaryType: "",
                  salaryAmount: 0,
                  feePercentage: 40,
                  hireDate: "",
                  isActive: true,
                })
              }
              disabled={loading}
              className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Clear
            </button>

            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Registering..." : "Register Teacher"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TeacherRegister;