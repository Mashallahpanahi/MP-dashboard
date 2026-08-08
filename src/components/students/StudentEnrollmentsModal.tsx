// src/components/students/StudentEnrollmentsModal.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { StudentEnrollment } from "@/types/student";
import { getStudentEnrollments } from "@/api/studentApi";

interface StudentEnrollmentsModalProps {
  isOpen: boolean;
  studentId: string | null;
  studentName: string;
  student: any;
  onClose: () => void;
}

const StudentEnrollmentsModal = ({
  isOpen,
  studentId,
  studentName,
  student,
  onClose,
}: StudentEnrollmentsModalProps) => {
  const navigate = useNavigate();
  const [enrollments, setEnrollments] = useState<StudentEnrollment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen && studentId) {
      fetchEnrollments();
    }
  }, [isOpen, studentId]);

  const fetchEnrollments = async () => {
    if (!studentId) return;
    try {
      setLoading(true);
      setError("");
      const data = await getStudentEnrollments(studentId);
      
      // Deep transform the data to ensure all numeric fields are numbers
      const transformedData = data.map((enrollment) => {
        // Create a deep copy
        const transformed = { ...enrollment };
        
        // Convert numeric fields
        const numericFields = ['tuitionFee', 'discount', 'finalFee', 'finalScore', 'attendancePercentage'];
        numericFields.forEach(field => {
          const value = transformed[field as keyof StudentEnrollment];
          if (value !== null && value !== undefined && value !== '') {
            const num = typeof value === 'string' ? parseFloat(value) : value;
            transformed[field as keyof StudentEnrollment] = isNaN(num as number) ? 0 : num as any;
          } else {
            transformed[field as keyof StudentEnrollment] = 0 as any;
          }
        });
        
        return transformed;
      });
      
      setEnrollments(transformedData);
    } catch (error) {
      console.error("Failed to fetch enrollments:", error);
      setError(
        error instanceof Error ? error.message : "Failed to fetch enrollments"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleNewEnrollment = () => {
    if (studentId) {
      onClose();
      navigate(`/students/enroll/${studentId}`);
    }
  };

  // Helper function to safely format numbers - handles both string and number
  const safeToFixed = (value: any, decimals: number = 2): string => {
    if (value === null || value === undefined || value === '') {
      return '0.00';
    }
    // If it's already a number, use it directly
    const num = typeof value === 'number' ? value : parseFloat(value);
    if (isNaN(num)) {
      return '0.00';
    }
    return num.toFixed(decimals);
  };

  // Helper function to safely format a number with $ sign
  const formatCurrency = (value: any): string => {
    return `$${safeToFixed(value)}`;
  };

  if (!isOpen) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Studying':
        return 'bg-green-100 text-green-700';
      case 'Completed':
        return 'bg-blue-100 text-blue-700';
      case 'Dropped':
        return 'bg-red-100 text-red-700';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Studying':
        return '📖';
      case 'Completed':
        return '✅';
      case 'Dropped':
        return '❌';
      case 'Pending':
        return '⏳';
      default:
        return '📚';
    }
  };

  const formatDate = (date: string) => {
    if (!date) return 'N/A';
    try {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return 'Invalid date';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
        {/* Header */}
        <div className="mb-4 flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h3 className="text-xl font-semibold text-gray-900">
                Enrollments
              </h3>
              <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                {enrollments.length}
              </span>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              {studentName} - All course enrollments
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

        {/* Action Buttons */}
        <div className="mb-4 flex flex-wrap gap-3">
          <button
            onClick={handleNewEnrollment}
            className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            <svg
              className="mr-2 h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            New Enrollment
          </button>
          <button
            onClick={fetchEnrollments}
            disabled={loading}
            className="inline-flex items-center rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <svg
              className="mr-2 h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Refresh
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm font-medium text-red-700">{error}</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && enrollments.length === 0 && (
          <div className="rounded-lg bg-gray-50 p-8 text-center">
            <div className="mb-4 text-4xl">📚</div>
            <h4 className="text-lg font-semibold text-gray-900">
              No Enrollments Yet
            </h4>
            <p className="mt-2 text-sm text-gray-500">
              This student hasn't been enrolled in any courses yet.
            </p>
            <button
              onClick={handleNewEnrollment}
              className="mt-4 inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
            >
              <svg
                className="mr-2 h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Enroll Now
            </button>
          </div>
        )}

        {/* Enrollments List */}
        {!loading && enrollments.length > 0 && (
          <div className="space-y-4">
            {enrollments.map((enrollment) => {
              // Ensure numeric values are numbers before rendering
              const finalFee = typeof enrollment.finalFee === 'number' ? enrollment.finalFee : 0;
              const tuitionFee = typeof enrollment.tuitionFee === 'number' ? enrollment.tuitionFee : 0;
              const discount = typeof enrollment.discount === 'number' ? enrollment.discount : 0;
              const finalScore = typeof enrollment.finalScore === 'number' ? enrollment.finalScore : 0;
              const attendancePercentage = typeof enrollment.attendancePercentage === 'number' ? enrollment.attendancePercentage : 0;

              return (
                <div
                  key={enrollment.id}
                  className="rounded-lg border border-gray-200 p-4 transition hover:bg-gray-50"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">
                          {getStatusIcon(enrollment.status)}
                        </span>
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            {enrollment.book?.name || 'Unknown Book'}
                          </h4>
                          <div className="mt-1 flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-800">
                              {enrollment.book?.code || 'N/A'}
                            </span>
                            <span className="text-xs text-gray-500">
                              Level: {enrollment.book?.level || 'N/A'}
                            </span>
                            <span className="text-xs text-gray-500">
                              Category: {enrollment.book?.category || 'N/A'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-600">
                        <span>
                          <span className="font-medium">Teacher:</span>{' '}
                          {enrollment.teacher?.firstName || 'N/A'} {enrollment.teacher?.lastName || ''}
                        </span>
                        <span>
                          <span className="font-medium">Timetable:</span>{' '}
                          {enrollment.timetable || 'N/A'}
                        </span>
                      </div>
                      <div className="mt-1 flex flex-wrap gap-4 text-sm text-gray-600">
                        <span>
                          <span className="font-medium">Start:</span>{' '}
                          {formatDate(enrollment.startDate)}
                        </span>
                        <span>
                          <span className="font-medium">Expected End:</span>{' '}
                          {formatDate(enrollment.expectedEndDate)}
                        </span>
                        {enrollment.completedDate && (
                          <span>
                            <span className="font-medium">Completed:</span>{' '}
                            {formatDate(enrollment.completedDate)}
                          </span>
                        )}
                      </div>
                      {enrollment.remarks && (
                        <div className="mt-2 text-sm text-gray-500">
                          <span className="font-medium">Remarks:</span> {enrollment.remarks}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(
                          enrollment.status
                        )}`}
                      >
                        <span className="mr-2 h-2 w-2 rounded-full bg-current" />
                        {enrollment.status}
                      </span>
                      <div className="text-sm">
                        <span className="font-medium text-gray-900">
                          ${finalFee.toFixed(2)}
                        </span>
                        {discount > 0 && (
                          <span className="ml-2 text-xs text-gray-500 line-through">
                            ${tuitionFee.toFixed(2)}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        {finalScore > 0 && (
                          <span className="rounded-full bg-blue-100 px-2.5 py-1 font-medium text-blue-700">
                            Score: {finalScore}%
                          </span>
                        )}
                        {attendancePercentage > 0 && (
                          <span className="rounded-full bg-green-100 px-2.5 py-1 font-medium text-green-700">
                            Attendance: {attendancePercentage}%
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Close Button */}
        <div className="mt-6 border-t border-gray-200 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentEnrollmentsModal;