// src/components/teachers/TeacherViewMoreModal.tsx
import { type Teacher } from "@/api/teacherApi";
import { formatShamsi } from "@/utils/dateConverter";

interface TeacherViewMoreModalProps {
  isOpen: boolean;
  teacher: Teacher | null;
  onClose: () => void;
}

const Field = ({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) => (
  <div>
    <p className="text-xs font-medium uppercase text-gray-400">{label}</p>
    <p className="mt-1 break-all text-sm text-gray-800">{value || "N/A"}</p>
  </div>
);

const TeacherViewMoreModal = ({
  isOpen,
  teacher,
  onClose,
}: TeacherViewMoreModalProps) => {
  if (!isOpen || !teacher) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl overflow-hidden rounded-xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-gray-200 p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-lg font-bold text-blue-700">
              {teacher.firstName.charAt(0)}
              {teacher.lastName.charAt(0)}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {teacher.firstName} {teacher.lastName}
              </h2>
              <div className="mt-1">
                {teacher.isActive ? (
                  <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700">
                    <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-green-500" />
                    Active
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-700">
                    <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-red-500" />
                    Inactive
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
            aria-label="Close"
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

        {/* Body — all data received from the API */}
        <div className="max-h-[70vh] overflow-y-auto p-6">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field label="Teacher ID" value={teacher.id} />
            <Field label="Gender" value={teacher.gender} />
            <Field label="Phone" value={teacher.phone} />
            <Field label="Email" value={teacher.email} />
            <Field label="Salary Type" value={teacher.salaryType} />
            <Field
              label="Salary Amount"
              value={teacher.salaryAmount?.toLocaleString()}
            />
            <Field label="Fee Percentage" value={`${teacher.feePercentage}%`} />
            <Field
              label="Hire Date"
              value={formatShamsi(teacher.hireDate, "YYYY/MM/DD")}
            />
            <div className="sm:col-span-2">
              <Field label="Address" value={teacher.address} />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t border-gray-200 p-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeacherViewMoreModal;