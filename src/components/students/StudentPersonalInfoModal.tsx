// src/components/students/StudentPersonalInfoModal.tsx
import { useState, useEffect, useRef } from "react";
import {
  useStudentById,
  useUpdateStudent,
} from "@/api/studentApi";

interface StudentPersonalInfoModalProps {
  isOpen: boolean;
  studentId: string | null;
  studentName: string;
  onClose: () => void;
  onUpdate?: () => void;
}

const StudentPersonalInfoModal = ({
  isOpen,
  studentId,
  studentName,
  onClose,
  onUpdate,
}: StudentPersonalInfoModalProps) => {
  // ✅ Hook: fetch student (auto-fetches when modal opens)
  const {
    data: studentData,
    loading,
    error: fetchError,
    refetch,
  } = useStudentById(studentId ?? "", isOpen && !!studentId);

  // ✅ Hook: update student (FormData OR JSON — handled inside the hook)
  const {
    updateStudent,
    loading: saving,
    error: updateError,
  } = useUpdateStudent();

  // Local state (validation + UI)
  const [localError, setLocalError] = useState("");
  const [success, setSuccess] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    fatherName: "",
    fatherPhone: "",
    gender: "Male" as "Male" | "Female",
    status: "Active" as "Active" | "Inactive" | "Graduated",
    notes: "",
  });

  const [imageFile, setImageFile] = useState<File | null>(null);

  // Combined error
  const error = localError || fetchError || updateError || "";

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

  const getImageUrl = (imagePath: string | null | undefined) => {
    if (!imagePath) return null;
    if (imagePath.startsWith("http") || imagePath.startsWith("data:")) {
      return imagePath;
    }
    return `${API_URL}${imagePath}`;
  };

  // Reset messages when modal opens
  useEffect(() => {
    if (isOpen) {
      setLocalError("");
      setSuccess("");
    }
  }, [isOpen, studentId]);

  // ✅ Sync fetched data → form state (runs whenever the hook delivers data)
  useEffect(() => {
    if (!studentData) return;
    const anyData = studentData as any;

    setFormData({
      firstName: studentData.firstName || "",
      lastName: studentData.lastName || "",
      phone: studentData.phone || "",
      fatherName: anyData.fatherName || "",
      fatherPhone: anyData.fatherPhone || "",
      gender: (studentData.gender as "Male" | "Female") || "Male",
      status:
        (studentData.status as "Active" | "Inactive" | "Graduated") ||
        "Active",
      notes: studentData.notes || "",
    });

    if (anyData.image) {
      setImagePreview(anyData.image);
    } else {
      setImagePreview(null);
    }

    setImageFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [studentData]);

  const handleInputChange = (
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
      const validTypes = ["image/jpeg", "image/jpg", "image/png"];
      if (!validTypes.includes(file.type)) {
        setLocalError("Please upload a valid image file (jpg, jpeg, or png)");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setLocalError("Image size must be less than 5MB");
        return;
      }

      setImageFile(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");
    setSuccess("");

    if (!studentId) {
      setLocalError("Student ID is missing");
      return;
    }

    // Validate required fields
    if (!formData.firstName || !formData.firstName.trim()) {
      setLocalError("First name is required");
      return;
    }

    if (!formData.lastName || !formData.lastName.trim()) {
      setLocalError("Last name is required");
      return;
    }

    if (!formData.phone || !formData.phone.trim()) {
      setLocalError("Phone number is required");
      return;
    }

    const phoneRegex = /^07\d{8}$/;
    if (!phoneRegex.test(formData.phone)) {
      setLocalError(
        "Phone number must start with 07 and be 10 digits (e.g., 0777123456)"
      );
      return;
    }

    if (formData.fatherPhone && formData.fatherPhone.trim()) {
      if (!phoneRegex.test(formData.fatherPhone)) {
        setLocalError(
          "Father's phone number must start with 07 and be 10 digits (e.g., 0777123456)"
        );
        return;
      }
    }

    // Prepare payload — FormData if image, otherwise JSON
    let ok: boolean;

    if (imageFile) {
      const submitData = new FormData();
      submitData.append("firstName", formData.firstName.trim());
      submitData.append("lastName", formData.lastName.trim());
      submitData.append("phone", formData.phone.trim());
      submitData.append("image", imageFile);

      if (formData.fatherName && formData.fatherName.trim()) {
        submitData.append("fatherName", formData.fatherName.trim());
      }
      if (formData.fatherPhone && formData.fatherPhone.trim()) {
        submitData.append("fatherPhone", formData.fatherPhone.trim());
      }
      submitData.append("gender", formData.gender);
      submitData.append("status", formData.status);
      if (formData.notes && formData.notes.trim()) {
        submitData.append("notes", formData.notes.trim());
      }

      ok = await updateStudent(studentId, submitData);
    } else {
      const submitData: any = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phone: formData.phone.trim(),
        gender: formData.gender,
        status: formData.status,
      };

      if (formData.fatherName && formData.fatherName.trim()) {
        submitData.fatherName = formData.fatherName.trim();
      }
      if (formData.fatherPhone && formData.fatherPhone.trim()) {
        submitData.fatherPhone = formData.fatherPhone.trim();
      }
      if (formData.notes && formData.notes.trim()) {
        submitData.notes = formData.notes.trim();
      }

      ok = await updateStudent(studentId, submitData);
    }

    if (!ok) return; // error is surfaced via `error`

    setSuccess("Student information updated successfully!");

    // Refresh data
    await refetch();

    // Clear the pending image file (form already shows fresh preview)
    setImageFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    setTimeout(() => {
      if (onUpdate) onUpdate();
      onClose();
    }, 1500);
  };

  const handleClose = () => {
    if (!saving) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between border-b border-gray-200 pb-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              Edit Personal Info
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {studentName} - Update personal information
            </p>
            {studentId && (
              <p className="mt-1 text-xs text-gray-400">ID: {studentId}</p>
            )}
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-3">
            <div className="flex items-start gap-2">
              <svg className="mt-0.5 h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm font-medium text-green-700">{success}</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3">
            <div className="flex items-start gap-2">
              <svg className="mt-0.5 h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm font-medium text-red-700">{error}</p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* First Name */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  First Name *
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                  disabled={saving}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              {/* Last Name */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Last Name *
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                  disabled={saving}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Phone *
                </label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="0777123456"
                  required
                  disabled={saving}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                />
                <p className="mt-1 text-xs text-gray-500">Must start with 07 and be 10 digits</p>
              </div>

              {/* Image Upload */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Student Image
                </label>
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/jpg,image/png"
                      onChange={handleFileChange}
                      disabled={saving}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-blue-700 hover:file:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>
                  {imagePreview && (
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      disabled={saving}
                      className="mt-1 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-100"
                    >
                      Remove
                    </button>
                  )}
                </div>
                {imagePreview && (
                  <div className="mt-3">
                    <img
                      src={getImageUrl(imagePreview) || imagePreview}
                      alt="Student preview"
                      className="h-20 w-20 rounded-lg object-cover border border-gray-200"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  </div>
                )}
                <p className="mt-1 text-xs text-gray-500">Upload new image to replace current one</p>
              </div>

              {/* Father Name */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Father's Name
                </label>
                <input
                  type="text"
                  name="fatherName"
                  value={formData.fatherName || ""}
                  onChange={handleInputChange}
                  disabled={saving}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              {/* Father Phone */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Father's Phone
                </label>
                <input
                  type="text"
                  name="fatherPhone"
                  value={formData.fatherPhone || ""}
                  onChange={handleInputChange}
                  placeholder="0777123456"
                  disabled={saving}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                />
                <p className="mt-1 text-xs text-gray-500">Must start with 07 and be 10 digits if provided</p>
              </div>

              {/* Gender */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Gender
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  disabled={saving}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  disabled={saving}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Graduated">Graduated</option>
                </select>
              </div>

              {/* Notes */}
              <div className="md:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Notes
                </label>
                <textarea
                  name="notes"
                  value={formData.notes || ""}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Additional notes (optional)"
                  disabled={saving}
                  className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="mt-6 flex gap-3 border-t border-gray-200 pt-4">
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
              <button
                type="button"
                onClick={handleClose}
                disabled={saving}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default StudentPersonalInfoModal;