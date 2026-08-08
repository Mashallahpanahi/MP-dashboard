// src/components/students/StudentDetailModal.tsx
import type { Student } from "@/types/student";

interface StudentDetailModalProps {
  isOpen: boolean;
  student: Student | null;
  onClose: () => void;
}

const StudentDetailModal = ({
  isOpen,
  student,
  onClose,
}: StudentDetailModalProps) => {
  if (!isOpen || !student) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-700';
      case 'Inactive':
        return 'bg-gray-100 text-gray-700';
      case 'Graduated':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const formatDate = (date: string | null) => {
    if (!date) return 'Not provided';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              Student Details
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Complete information about the student
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
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

        {/* Student Info Card */}
        <div className="mb-6 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-600 text-3xl font-bold text-white">
              {student.firstName.charAt(0)}
              {student.lastName?.charAt(0) || ''}
            </div>
            <div>
              <h4 className="text-2xl font-bold text-gray-900">
                {student.firstName} {student.lastName || ''}
              </h4>
              <div className="mt-1 flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-gray-200 px-3 py-1 text-xs font-medium text-gray-700">
                  {student.studentNumber || 'No ID'}
                </span>
                <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(student.status)}`}>
                  <span className="mr-2 h-2 w-2 rounded-full bg-current" />
                  {student.status}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Personal Information */}
          <div className="col-span-2">
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">
              Personal Information
            </h4>
          </div>

          <div>
            <p className="text-xs font-medium uppercase text-gray-400">
              Gender
            </p>
            <p className="mt-1 text-sm font-medium text-gray-900">
              {student.gender}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase text-gray-400">
              Birth Date
            </p>
            <p className="mt-1 text-sm font-medium text-gray-900">
              {formatDate(student.birthDate)}
            </p>
          </div>

          {/* Contact Information */}
          <div className="col-span-2 mt-2">
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">
              Contact Information
            </h4>
          </div>

          <div>
            <p className="text-xs font-medium uppercase text-gray-400">
              Phone
            </p>
            <p className="mt-1 text-sm font-medium text-gray-900">
              {student.phone || 'Not provided'}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase text-gray-400">
              Parent Phone
            </p>
            <p className="mt-1 text-sm font-medium text-gray-900">
              {student.parentPhone || 'Not provided'}
            </p>
          </div>

          {/* Address */}
          <div className="col-span-2">
            <p className="text-xs font-medium uppercase text-gray-400">
              Address
            </p>
            <p className="mt-1 text-sm font-medium text-gray-900">
              {student.address || 'Not provided'}
            </p>
          </div>

          {/* Additional Information */}
          <div className="col-span-2 mt-2">
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">
              Additional Information
            </h4>
          </div>

          <div>
            <p className="text-xs font-medium uppercase text-gray-400">
              Registration Date
            </p>
            <p className="mt-1 text-sm font-medium text-gray-900">
              {formatDate(student.registrationDate)}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase text-gray-400">
              Student Number
            </p>
            <p className="mt-1 text-sm font-medium text-gray-900">
              {student.studentNumber || 'Not assigned'}
            </p>
          </div>

          <div className="col-span-2">
            <p className="text-xs font-medium uppercase text-gray-400">
              Notes
            </p>
            <p className="mt-1 text-sm font-medium text-gray-900">
              {student.notes || 'No notes'}
            </p>
          </div>
        </div>

        {/* Close Button */}
        <div className="mt-6 border-t border-gray-200 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentDetailModal;