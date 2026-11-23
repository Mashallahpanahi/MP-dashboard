// src/pages/Teachers/TeacherRegister.tsx
import { FormEvent, useState } from "react";
import { useCreateTeacher, type CreateTeacherData } from "@/api/teacherApi";
import { useNavigate } from "react-router-dom";
// ✅ Shamsi date picker
import ShamsiDatePicker from "@/utils/ShamsiDatePicker";

const TeacherRegister = () => {
  const navigate = useNavigate();

  // ✅ Hook replaces createTeacher + local loading/error state
  const { createTeacher, loading, error: apiError } = useCreateTeacher();

  // ⚠️ hireDate is stored as MILADI ISO ("YYYY-MM-DD") for the backend
  const [formData, setFormData] = useState<CreateTeacherData>({
    firstName: "",
    lastName: "",
    gender: "",
    phone: "",
    email: "",
    address: "",
    salaryType: "",
    salaryAmount: 0,
    feePercentage: 0,
    hireDate: "",
    isActive: true,
  });

  const [success, setSuccess] = useState("");

  // Hook's error is `null` when no error, otherwise the backend string.
  // Coerce to "" so `.includes(...)` below works without null checks.
  const error = apiError || "";

  // ============================================
  // CHANGE HANDLER (text/number/select)
  // ============================================
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
          ? value === ""
            ? 0
            : Number(value)
          : value,
    }));
  };

  // ============================================
  // SPECIAL HANDLER FOR HIRE DATE (Shamsi picker → Miladi ISO)
  // ============================================
  const handleHireDateChange = (miladiISO: string) => {
    setFormData((prev) => ({ ...prev, hireDate: miladiISO }));
  };

  // ============================================
  // SUBMIT
  // ============================================
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setSuccess("");

    // Prepare payload
    const submitData = { ...formData };

    if (submitData.salaryType === "Fixed") {
      submitData.feePercentage = 0;
    } else if (submitData.salaryType === "PerStudent") {
      submitData.salaryAmount = 0;
    }

    const payload: Partial<CreateTeacherData> = { ...submitData };
    if (!payload.email) delete payload.email;
    if (!payload.address) delete payload.address;

    // ✅ Single call — the hook returns true on success, false on failure.
    //    On failure, `apiError` will be populated for the error banner.
    const ok = await createTeacher(payload as CreateTeacherData);

    if (ok) {
      setSuccess("Teacher registered successfully.");

      setTimeout(() => {
        navigate("/teachers/all");
      }, 1500);
    }
  };

  const currentSalaryType = formData.salaryType;

  return (
    <div className="p-6">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Register Teacher</h1>
          <p className="mt-1 text-sm text-gray-500">
            Add a new teacher to the system
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4">
            <p className="text-sm font-medium text-green-700">{success}</p>
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
                <p className="text-sm font-medium text-red-700">{error}</p>
                {(error.includes("phone number") ||
                  error.includes("email address")) && (
                  <p className="mt-1 text-sm text-red-600">
                    Please check the phone number you entered.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Form */}
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
                  First Name <span className="text-red-500">*</span>
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
                  Last Name <span className="text-red-500">*</span>
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
                  Gender <span className="text-red-500">*</span>
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
                  Phone <span className="text-red-500">*</span>
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

              {/* Email - Optional */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Email
                </label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="teacher@example.com (optional)"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Optional - Can be left empty
                </p>
              </div>

              {/* ✅ Hire Date — Shamsi picker (Miladi sent to backend) */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Hire Date (تاریخ شمسی) <span className="text-red-500">*</span>
                </label>

                <ShamsiDatePicker
                  value={formData.hireDate}
                  onChange={handleHireDateChange}
                  placeholder="تاریخ"
                />
              </div>

              {/* Address - Optional */}
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
                  placeholder="Enter teacher address (optional)"
                  rows={3}
                  className="w-full resize-none rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Optional - Can be left empty
                </p>
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
                  Salary Type <span className="text-red-500">*</span>
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
                  <option value="PerStudent">Per Student</option>
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  Select "Fixed" for monthly salary or "Per Student" for
                  percentage-based
                </p>
              </div>

              {/* Salary Amount */}
              {currentSalaryType === "Fixed" && (
                <div>
                  <label
                    htmlFor="salaryAmount"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Salary Amount <span className="text-red-500">*</span>
                  </label>

                  <input
                    id="salaryAmount"
                    name="salaryAmount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={
                      formData.salaryAmount === 0 ? "" : formData.salaryAmount
                    }
                    onChange={handleChange}
                    placeholder="Enter fixed salary amount"
                    required={currentSalaryType === "Fixed"}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Fixed salary amount per month
                  </p>
                </div>
              )}

              {/* Fee Percentage */}
              {currentSalaryType === "PerStudent" && (
                <div>
                  <label
                    htmlFor="feePercentage"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Fee Percentage (%) <span className="text-red-500">*</span>
                  </label>

                  <input
                    id="feePercentage"
                    name="feePercentage"
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={
                      formData.feePercentage === 0 ? "" : formData.feePercentage
                    }
                    onChange={handleChange}
                    placeholder="Enter percentage"
                    required={currentSalaryType === "PerStudent"}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Percentage of student fee
                  </p>
                </div>
              )}

              {!currentSalaryType && (
                <div className="col-span-2">
                  <p className="text-sm italic text-gray-500">
                    Please select a salary type to configure salary details
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Status */}
          <div className="mb-8 border-t border-gray-200 pt-8">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Status</h2>

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
                  feePercentage: 0,
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
