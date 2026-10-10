// src/pages/RegisterStudents/RegisterStudent.tsx
import { FormEvent, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { createStudent } from "@/api/studentApi";
import { useAuthStore } from "@store/authStore";

const RegisterStudent = () => {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const getToken = useAuthStore((s) => s.getToken);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [fatherName, setFatherName] = useState("");
  const [fatherPhone, setFatherPhone] = useState("");
  const [gender, setGender] = useState<"Male" | "Female">("Male");
  const [status, setStatus] = useState<"Active" | "Inactive" | "Graduated">(
    "Active"
  );
  const [notes, setNotes] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  // ============================================
  // IMAGE HANDLERS
  // ============================================
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    const validTypes = ["image/jpeg", "image/jpg", "image/png"];
    if (!validTypes.includes(file.type)) {
      setError("Please upload a valid image file (jpg, jpeg, or png)");
      return;
    }

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5MB");
      return;
    }

    setError("");
    setImageFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // ============================================
  // SUBMIT
  // ============================================
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // ✅ Guard: must be logged in
    if (!isAuthenticated) {
      setError("You must be logged in to register a student.");
      return;
    }

    // ✅ Guard: token must exist and not be expired
    const token = getToken();
    if (!token) {
      setError("Your session has expired. Please login again.");
      setTimeout(() => navigate("/login"), 1500);
      return;
    }

    // Validation
    if (!firstName.trim()) {
      setError("First name is required");
      return;
    }
    if (!lastName.trim()) {
      setError("Last name is required");
      return;
    }
    if (!phone.trim()) {
      setError("Phone number is required");
      return;
    }

    // Validate phone number format (starts with 07 and 10 digits)
    const phoneRegex = /^07\d{8}$/;
    if (!phoneRegex.test(phone)) {
      setError(
        "Phone number must start with 07 and be 10 digits (e.g., 0777123456)"
      );
      return;
    }

    // Validate father phone if provided
    if (fatherPhone.trim() && !phoneRegex.test(fatherPhone)) {
      setError(
        "Father's phone number must start with 07 and be 10 digits (e.g., 0777123456)"
      );
      return;
    }

    try {
      setLoading(true);

      // Build FormData (matches POST /students multipart/form-data)
      const submitData = new FormData();
      submitData.append("firstName", firstName.trim());
      submitData.append("lastName", lastName.trim());
      submitData.append("phone", phone.trim());

      // ✅ Image is OPTIONAL — only append if a file was selected
      if (imageFile instanceof File) {
        submitData.append("image", imageFile);
      }

      if (fatherName.trim()) submitData.append("fatherName", fatherName.trim());
      if (fatherPhone.trim())
        submitData.append("fatherPhone", fatherPhone.trim());
      if (gender) submitData.append("gender", gender);
      if (status) submitData.append("status", status);
      if (notes.trim()) submitData.append("notes", notes.trim());

      // createStudent now attaches the Bearer token automatically
      await createStudent(submitData);

      setSuccess("Student registered successfully!");

      // Reset form
      setFirstName("");
      setLastName("");
      setPhone("");
      setFatherName("");
      setFatherPhone("");
      setGender("Male");
      setStatus("Active");
      setNotes("");
      setImageFile(null);
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";

      // Navigate after a short delay
      setTimeout(() => navigate("/students/all"), 1500);
    } catch (err) {
      console.error("Failed to create student:", err);
      setError(
        err instanceof Error ? err.message : "Failed to register student"
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
          <h1 className="text-2xl font-bold text-gray-900">
            Register Student
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Add a new student to the system{" "}
            <span className="text-red-500">*</span> indicates required field
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

        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
        >
          {/* Personal Information */}
          <div className="mb-8">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Personal Information{" "}
              <span className="text-sm font-normal text-red-500">*</span>
            </h2>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {/* First Name - Required */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Enter first name"
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Last Name - Required */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Enter last name"
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Phone - Required */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Phone <span className="text-red-500">*</span>
                </label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0777123456"
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Must start with 07 and be 10 digits (e.g., 0777123456)
                </p>
              </div>

              {/* Image Upload - OPTIONAL ✅ */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Student Image{" "}
                  <span className="text-gray-400">(Optional)</span>
                </label>
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/jpg,image/png"
                      onChange={handleFileChange}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-blue-700 hover:file:bg-blue-100"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Optional — JPG, JPEG, PNG (Max 5MB)
                    </p>
                  </div>
                  {imagePreview && (
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="mt-1 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-100"
                    >
                      Remove
                    </button>
                  )}
                </div>
                {imagePreview && (
                  <div className="mt-3">
                    <img
                      src={imagePreview}
                      alt="Student preview"
                      className="h-24 w-24 rounded-lg border border-gray-200 object-cover"
                    />
                  </div>
                )}
              </div>

              {/* Gender - Optional */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Gender
                </label>
                <select
                  value={gender}
                  onChange={(e) =>
                    setGender(e.target.value as "Male" | "Female")
                  }
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  Optional - Defaults to Male
                </p>
              </div>

              {/* Father Name - Optional */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Father's Name
                </label>
                <input
                  value={fatherName}
                  onChange={(e) => setFatherName(e.target.value)}
                  placeholder="Enter father's name (optional)"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Optional - Can be left empty
                </p>
              </div>

              {/* Father Phone - Optional */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Father's Phone
                </label>
                <input
                  value={fatherPhone}
                  onChange={(e) => setFatherPhone(e.target.value)}
                  placeholder="0777123456 (optional)"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Optional - Must start with 07 and be 10 digits if provided
                </p>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="mb-8 border-t border-gray-200 pt-8">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Additional Information{" "}
              <span className="text-sm font-normal text-gray-500">
                (All optional)
              </span>
            </h2>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) =>
                    setStatus(
                      e.target.value as "Active" | "Inactive" | "Graduated"
                    )
                  }
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Graduated">Graduated</option>
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  Optional - Defaults to Active
                </p>
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="Additional notes about the student (optional)"
                  className="w-full resize-none rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Optional - Can be left empty
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
              {loading ? "Registering..." : "Register Student"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterStudent;