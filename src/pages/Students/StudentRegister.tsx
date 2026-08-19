// src/pages/Students/StudentRegister.tsx
import { FormEvent, useState, useRef } from "react";
import { createStudent, type CreateStudentData } from "@/api/studentApi";
import { useNavigate } from "react-router-dom";

const StudentRegister = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<CreateStudentData>({
    firstName: "",
    lastName: "",
    phone: "",
    image: undefined,
    fatherName: "",
    fatherPhone: "",
    gender: "Male",
    status: "Active",
    notes: "",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!validTypes.includes(file.type)) {
        setError('Please upload a valid image file (jpg, jpeg, or png)');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        return;
      }

      setFormData((prev) => ({ ...prev, image: file }));
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, image: undefined }));
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Validate required fields
      if (!formData.firstName || !formData.firstName.trim()) {
        setError("First name is required");
        setLoading(false);
        return;
      }

      if (!formData.lastName || !formData.lastName.trim()) {
        setError("Last name is required");
        setLoading(false);
        return;
      }

      if (!formData.phone || !formData.phone.trim()) {
        setError("Phone number is required");
        setLoading(false);
        return;
      }

      // Validate phone number format (starts with 07 and 10 digits)
      const phoneRegex = /^07\d{8}$/;
      if (!phoneRegex.test(formData.phone)) {
        setError("Phone number must start with 07 and be 10 digits (e.g., 0777123456)");
        setLoading(false);
        return;
      }

      // Validate father phone if provided
      if (formData.fatherPhone && formData.fatherPhone.trim()) {
        if (!phoneRegex.test(formData.fatherPhone)) {
          setError("Father's phone number must start with 07 and be 10 digits (e.g., 0777123456)");
          setLoading(false);
          return;
        }
      }

      // Validate image is required
      if (!formData.image) {
        setError("Student image is required");
        setLoading(false);
        return;
      }

      // Create FormData for file upload
      const submitData = new FormData();
      submitData.append('firstName', formData.firstName.trim());
      submitData.append('lastName', formData.lastName.trim());
      submitData.append('phone', formData.phone.trim());
      submitData.append('image', formData.image);

      if (formData.fatherName && formData.fatherName.trim()) {
        submitData.append('fatherName', formData.fatherName.trim());
      }
      if (formData.fatherPhone && formData.fatherPhone.trim()) {
        submitData.append('fatherPhone', formData.fatherPhone.trim());
      }
      if (formData.gender) {
        submitData.append('gender', formData.gender);
      }
      if (formData.status) {
        submitData.append('status', formData.status);
      }
      if (formData.notes && formData.notes.trim()) {
        submitData.append('notes', formData.notes.trim());
      }

      await createStudent(submitData);
      setSuccess("Student registered successfully!");
      setTimeout(() => {
        navigate("/students/all");
      }, 1500);
    } catch (error) {
      console.error("Failed to create student:", error);
      setError(
        error instanceof Error ? error.message : "Failed to register student"
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
          <h1 className="text-2xl font-bold text-gray-900">Register Student</h1>
          <p className="mt-1 text-sm text-gray-500">
            Add a new student to the system <span className="text-red-500">*</span> indicates required field
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
              Personal Information <span className="text-sm font-normal text-red-500">*</span>
            </h2>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {/* First Name - Required */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
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
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
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
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="0777123456"
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Must start with 07 and be 10 digits (e.g., 0777123456)
                </p>
              </div>

              {/* Image Upload - Required */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Student Image <span className="text-red-500">*</span>
                </label>
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/jpg,image/png"
                      onChange={handleFileChange}
                      required={!imagePreview}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-blue-700 hover:file:bg-blue-100"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Accepted formats: JPG, JPEG, PNG (Max 5MB)
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
                      className="h-24 w-24 rounded-lg object-cover border border-gray-200"
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
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
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
                  name="fatherName"
                  value={formData.fatherName || ""}
                  onChange={handleChange}
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
                  name="fatherPhone"
                  value={formData.fatherPhone || ""}
                  onChange={handleChange}
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
              Additional Information <span className="text-sm font-normal text-gray-500">(All optional)</span>
            </h2>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
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
                  name="notes"
                  value={formData.notes || ""}
                  onChange={handleChange}
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

export default StudentRegister;