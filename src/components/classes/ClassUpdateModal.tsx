// src/components/classes/ClassUpdateModal.tsx
import { useState, useEffect } from "react";
import type { Class, UpdateClassData } from "@/api/classApi";

interface ClassUpdateModalProps {
  isOpen: boolean;
  classItem: Class | null;
  onClose: () => void;
  onUpdate: (id: string, data: UpdateClassData) => Promise<void>;
  isLoading?: boolean;
}

const ClassUpdateModal = ({
  isOpen,
  classItem,
  onClose,
  onUpdate,
  isLoading = false,
}: ClassUpdateModalProps) => {
  const [formData, setFormData] = useState<UpdateClassData>({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when classItem changes
  useEffect(() => {
    if (classItem) {
      setFormData({
        className: classItem.className,
        block: classItem.block || "",
        isActive: classItem.isActive,
      });
      setError("");
      setSuccess("");
    }
  }, [classItem]);

  if (!isOpen || !classItem) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
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

    if (!classItem) return;

    try {
      setIsSubmitting(true);
      setError("");
      setSuccess("");

      // Only send fields that have changed
      const changedData: UpdateClassData = {};

      if (formData.className !== classItem.className) {
        changedData.className = formData.className;
      }

      // Handle block - send null if empty, otherwise send the value
      const blockValue =
        formData.block && formData.block.trim() !== "" ? formData.block : null;

      if (blockValue !== classItem.block) {
        changedData.block = blockValue;
      }

      if (formData.isActive !== classItem.isActive) {
        changedData.isActive = formData.isActive;
      }

      if (Object.keys(changedData).length === 0) {
        setSuccess("No changes made.");
        setTimeout(() => {
          onClose();
          setFormData({});
          setSuccess("");
        }, 1000);
        return;
      }

      await onUpdate(classItem.id, changedData);

      setSuccess("Class updated successfully!");

      setTimeout(() => {
        onClose();
        setFormData({});
        setSuccess("");
      }, 1500);
    } catch (error) {
      console.error("Failed to update class:", error);
      setError(
        error instanceof Error ? error.message : "Failed to update class",
      );
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
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              Update Class
            </h3>
            <p className="mt-1 text-sm text-gray-500">Edit class information</p>
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
            <p className="text-sm font-medium text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Class Name */}
          <div className="mb-4">
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Class Name *
            </label>
            <input
              name="className"
              type="text"
              value={formData.className || ""}
              onChange={handleChange}
              required
              disabled={isLoading || isSubmitting}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          {/* Block - Optional */}
          <div className="mb-4">
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Block
            </label>
            <input
              name="block"
              type="text"
              value={formData.block || ""}
              onChange={handleChange}
              placeholder="Enter block (optional)"
              disabled={isLoading || isSubmitting}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
            />
            <p className="mt-1 text-xs text-gray-500">
              Optional - Can be left empty
            </p>
          </div>

          {/* Status */}
          <div className="mb-6 border-t border-gray-200 pt-4">
            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive || false}
                onChange={handleChange}
                disabled={isLoading || isSubmitting}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">
                Class is active
              </span>
            </label>
          </div>

          {/* Buttons */}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
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
              {isLoading || isSubmitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClassUpdateModal;
