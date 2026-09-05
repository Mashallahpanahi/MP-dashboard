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

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

  // ✅ Helper function to get full image URL
  const getImageUrl = (imagePath: string | null | undefined) => {
    if (!imagePath) return null;
    // If the image path already starts with http, return as is
    if (imagePath.startsWith('http')) return imagePath;
    // Otherwise, prepend the API URL
    return `${API_URL}${imagePath}`;
  };

  const imageUrl = getImageUrl(student.image);

  const InfoRow = ({ label, value }: { label: string; value: any }) => (
    <div className="flex items-start py-3 border-b border-gray-100 last:border-0">
      <span className="w-1/3 text-sm font-medium text-gray-600">{label}</span>
      <span className="w-2/3 text-sm text-gray-900 break-all">
        {value !== null && value !== undefined && value !== '' ? String(value) : '—'}
      </span>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl bg-white shadow-xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                Student Details
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Complete information for this student
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          {/* Student Header with Image */}
          <div className="flex items-center gap-4 mb-6 bg-blue-50 rounded-lg p-4">
            {/* ✅ Student Image */}
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={`${student.firstName} ${student.lastName}`}
                className="h-20 w-20 rounded-full object-cover border-2 border-blue-300"
                onError={(e) => {
                  // If image fails to load, show initials
                  e.currentTarget.style.display = 'none';
                  const parent = e.currentTarget.parentElement;
                  if (parent) {
                    const fallback = document.createElement('div');
                    fallback.className = 'flex h-20 w-20 items-center justify-center rounded-full bg-blue-200 text-2xl font-bold text-blue-700';
                    fallback.textContent = `${student.firstName.charAt(0)}${student.lastName?.charAt(0) || ''}`;
                    parent.appendChild(fallback);
                  }
                }}
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-200 text-2xl font-bold text-blue-700">
                {student.firstName.charAt(0)}{student.lastName?.charAt(0) || ''}
              </div>
            )}
            <div>
              <h2 className="text-2xl font-bold text-blue-900">
                {student.firstName} {student.lastName || ''}
              </h2>
              <p className="text-sm text-blue-700">
                Student #{student.studentNumber || 'N/A'}
              </p>
              <p className="text-xs text-blue-600">
                Registered: {new Date(student.registrationDate).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Main Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
                Personal Information
              </h4>
              <InfoRow label="First Name" value={student.firstName} />
              <InfoRow label="Last Name" value={student.lastName} />
              <InfoRow label="Gender" value={student.gender} />
              <InfoRow label="Phone" value={student.phone} />
              <InfoRow label="Birth Date" value={student.birthDate} />
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
                Family & Status
              </h4>
              <InfoRow label="Father's Name" value={student.fatherName} />
              <InfoRow label="Father's Phone" value={student.fatherPhone} />
              <InfoRow label="Status" value={student.status} />
              <InfoRow label="Address" value={student.address} />
              <InfoRow label="Notes" value={student.notes} />
            </div>
          </div>

          {/* Timestamps */}
          <div className="mt-4 bg-gray-50 rounded-lg p-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
              System Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <InfoRow label="Created At" value={new Date(student.createdAt).toLocaleString()} />
              <InfoRow label="Updated At" value={new Date(student.updatedAt).toLocaleString()} />
              <InfoRow label="ID" value={student.id} />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 rounded-b-xl">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDetailModal;