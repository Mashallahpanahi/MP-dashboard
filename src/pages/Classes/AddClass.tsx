// src/pages/Classes/AddClass.tsx
import { FormEvent, useState } from "react";
import { createClass, type CreateClassData } from "@/api/classApi";
import { useNavigate } from "react-router-dom";

const AddClass = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState<Partial<CreateClassData>>({
    className: "",
    block: "",
    isActive: true,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
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

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Validate required fields
      if (!formData.className || formData.className.trim() === "") {
        setError("Class name is required");
        setLoading(false);
        return;
      }

      // Prepare submit data
      const submitData: Partial<CreateClassData> = {
        className: formData.className,
        isActive: formData.isActive !== undefined ? formData.isActive : true,
      };

      // Only include block if it has a value
      if (formData.block && formData.block.trim() !== "") {
        submitData.block = formData.block;
      }

      await createClass(submitData as CreateClassData);
      setSuccess("Class created successfully!");
      setTimeout(() => {
        navigate("/classes/all");
      }, 1500);
    } catch (error) {
      console.error("Failed to create class:", error);
      const errorMsg = error instanceof Error ? error.message : "Failed to create class";
      if (errorMsg.includes("duplicate key") || errorMsg.includes("UQ_")) {
        setError("This class name is already taken. Please use a different name.");
      } else {
        setError(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Add New Class</h1>
          <p className="mt-1 text-sm text-gray-500">
            Add a new class to the system <span className="text-red-500">*</span> indicates required field
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
          {/* Class Name - Required */}
          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Class Name <span className="text-red-500">*</span>
            </label>
            <input
              name="className"
              type="text"
              value={formData.className || ""}
              onChange={handleChange}
              placeholder="Enter class name (e.g., Mathematics 101)"
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
            <p className="mt-1 text-xs text-gray-500">
              This field is required
            </p>
          </div>

          {/* Block - Optional (can be empty) */}
          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Block
            </label>
            <input
              name="block"
              type="text"
              value={formData.block || ""}
              onChange={handleChange}
              placeholder="Enter block (optional, e.g., Block A)"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
            <p className="mt-1 text-xs text-gray-500">
              Optional - Can be left empty
            </p>
          </div>

          {/* Status */}
          <div className="mb-8 border-t border-gray-200 pt-8">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Status</h2>
            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive !== undefined ? formData.isActive : true}
                onChange={handleChange}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">
                Class is active
              </span>
            </label>
          </div>

          {/* Buttons */}
          <div className="flex flex-col-reverse gap-3 border-t border-gray-200 pt-6 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => navigate("/classes/all")}
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
              {loading ? "Creating..." : "Create Class"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddClass;