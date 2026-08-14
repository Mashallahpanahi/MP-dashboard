// src/components/teacher-payroll/TeacherPayrollGenerateModal.tsx
import { useState, useEffect } from "react";
import { getTeachers } from "@/api/teacherPayrollApi";
import type { GeneratePayrollDto, Teacher } from "@/types/teacherPayroll";

interface TeacherPayrollGenerateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (data: GeneratePayrollDto) => Promise<void>;
  isLoading?: boolean;
}

const TeacherPayrollGenerateModal = ({
  isOpen,
  onClose,
  onGenerate,
  isLoading = false,
}: TeacherPayrollGenerateModalProps) => {
  const [formData, setFormData] = useState<GeneratePayrollDto>({
    teacherId: "",
    month: new Date().toISOString().slice(0, 7),
    year: new Date().getFullYear(),
  });
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loadingTeachers, setLoadingTeachers] = useState(true);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchTeachers();
    }
  }, [isOpen]);

  const fetchTeachers = async () => {
    try {
      setLoadingTeachers(true);
      const data = await getTeachers();
      setTeachers(data.filter(t => t.isActive));
    } catch (error) {
      console.error("Failed to fetch teachers:", error);
      setError("Failed to load teachers");
    } finally {
      setLoadingTeachers(false);
    }
  };

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.teacherId) {
      setError("Please select a teacher");
      return;
    }

    if (!formData.month) {
      setError("Please select a month");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");
      await onGenerate(formData);
      onClose();
    } catch (error) {
      console.error("Failed to generate payroll:", error);
      setError(
        error instanceof Error ? error.message : "Failed to generate payroll"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              Generate Payroll
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Generate a payroll record for a teacher
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading || isSubmitting}
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

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm font-medium text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Select Teacher */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Select Teacher *
              </label>
              <select
                name="teacherId"
                value={formData.teacherId}
                onChange={handleChange}
                required
                disabled={loadingTeachers || isLoading || isSubmitting}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Select a teacher</option>
                {teachers.map((teacher) => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.firstName} {teacher.lastName} - {teacher.email}
                  </option>
                ))}
              </select>
              {loadingTeachers && (
                <p className="mt-1 text-xs text-gray-500">Loading teachers...</p>
              )}
            </div>

            {/* Month */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Month *
              </label>
              <input
                type="month"
                name="month"
                value={formData.month}
                onChange={handleChange}
                required
                disabled={isLoading || isSubmitting}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </div>

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading || isSubmitting}
              className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || isSubmitting || loadingTeachers}
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading || isSubmitting ? "Generating..." : "Generate Payroll"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TeacherPayrollGenerateModal;