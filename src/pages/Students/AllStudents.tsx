// src/pages/Students/AllStudents.tsx
import { useEffect, useState } from "react";
import { getStudents, deleteStudent, getStudentById, updateStudent } from "@/api/studentApi";
import type { Student, UpdateStudentData } from "@/types/student";
import { StudentDetailModal, StudentUpdateModal, StudentDeleteModal } from "@/components/students";
import StudentEnrollmentsModal from "@/components/students/StudentEnrollmentsModal";
import StudentEditModal from "@/components/students/StudentEditModal";
import { useNavigate } from "react-router-dom";

const AllStudents = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Delete state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Update state
  const [updateLoading, setUpdateLoading] = useState(false);

  // Detail state
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [studentToView, setStudentToView] = useState<Student | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Enrollments state
  const [showEnrollmentsModal, setShowEnrollmentsModal] = useState(false);
  const [studentForEnrollments, setStudentForEnrollments] = useState<Student | null>(null);

  // Edit Modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [studentForEdit, setStudentForEdit] = useState<Student | null>(null);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getStudents();
      setStudents(data);
    } catch (error) {
      console.error("Failed to fetch students:", error);
      setError(
        error instanceof Error ? error.message : "Failed to fetch students"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // Delete handlers
  const handleDeleteClick = (student: Student) => {
    setStudentToDelete(student);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!studentToDelete) return;

    try {
      setDeleteLoading(true);
      await deleteStudent(studentToDelete.id);
      setStudents((prev) => prev.filter((student) => student.id !== studentToDelete.id));
      setShowDeleteModal(false);
      setStudentToDelete(null);
    } catch (error) {
      console.error("Failed to delete student:", error);
      setError(
        error instanceof Error ? error.message : "Failed to delete student"
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setStudentToDelete(null);
  };

  // Update handler - for the edit modal
  const handleUpdateStudent = async (id: string, data: UpdateStudentData) => {
    try {
      setUpdateLoading(true);
      const updatedStudent = await updateStudent(id, data);
      setStudents((prev) =>
        prev.map((student) =>
          student.id === updatedStudent.id ? updatedStudent : student
        )
      );
      setShowEditModal(false);
      setStudentForEdit(null);
    } catch (error) {
      console.error("Failed to update student:", error);
      throw error;
    } finally {
      setUpdateLoading(false);
    }
  };

  // Detail handlers
  const handleViewClick = async (student: Student) => {
    try {
      setDetailLoading(true);
      const studentData = await getStudentById(student.id);
      setStudentToView(studentData);
      setShowDetailModal(true);
    } catch (error) {
      console.error("Failed to fetch student details:", error);
      setError(
        error instanceof Error ? error.message : "Failed to load student details"
      );
    } finally {
      setDetailLoading(false);
    }
  };

  const handleCloseDetail = () => {
    setShowDetailModal(false);
    setStudentToView(null);
  };

  // Enrollments handlers
  const handleViewEnrollments = (student: Student) => {
    setStudentForEnrollments(student);
    setShowEnrollmentsModal(true);
  };

  const handleCloseEnrollments = () => {
    setShowEnrollmentsModal(false);
    setStudentForEnrollments(null);
  };

  // Edit handlers - NEW
  const handleEditClick = (student: Student) => {
    setStudentForEdit(student);
    setShowEditModal(true);
  };

  const handleCloseEdit = () => {
    setShowEditModal(false);
    setStudentForEdit(null);
  };

  const handleAddStudent = () => {
    navigate("/students/register");
  };

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

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
          <p className="mt-4 text-sm text-gray-500">Loading students...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">All Students</h1>
          <p className="mt-1 text-sm text-gray-500">
            View and manage all students in the system
          </p>
        </div>
        <button
          onClick={handleAddStudent}
          className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          Add New Student
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-medium text-red-700">{error}</p>
        </div>
      )}

      {/* Empty State */}
      {students.length === 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-10 text-center shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900">No Students Found</h3>
          <p className="mt-2 text-sm text-gray-500">
            There are no students registered yet.
          </p>
          <button
            onClick={handleAddStudent}
            className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Add Your First Student
          </button>
        </div>
      )}

      {/* Students Table */}
      {students.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr className="border-b border-gray-200">
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Student
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Student ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Contact
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Gender
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {students.map((student) => (
                  <tr key={student.id} className="transition hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-700">
                          {student.firstName.charAt(0)}
                          {student.lastName?.charAt(0) || ''}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {student.firstName} {student.lastName || ''}
                          </p>
                          <p className="mt-1 text-xs text-gray-500">
                            {student.address || 'No address'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-gray-900">
                        {student.studentNumber || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900">{student.phone || 'N/A'}</p>
                      {student.parentPhone && (
                        <p className="mt-1 text-xs text-gray-500">
                          Parent: {student.parentPhone}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                        {student.gender}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(student.status)}`}>
                        <span className="mr-2 h-2 w-2 rounded-full bg-current" />
                        {student.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          onClick={() => handleViewClick(student)}
                          className="inline-flex items-center rounded-lg bg-purple-50 px-3 py-2 text-sm font-medium text-purple-600 transition hover:bg-purple-100"
                        >
                          View
                        </button>
                        {/* ✅ Edit button - opens StudentEditModal */}
                        <button
                          onClick={() => handleEditClick(student)}
                          className="inline-flex items-center rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-blue-600 transition hover:bg-blue-100"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleViewEnrollments(student)}
                          className="inline-flex items-center rounded-lg bg-indigo-50 px-3 py-2 text-sm font-medium text-indigo-600 transition hover:bg-indigo-100"
                        >
                          Enrollments
                        </button>
                        <button
                          onClick={() => handleDeleteClick(student)}
                          disabled={deleteLoading === student.id}
                          className="inline-flex items-center rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {deleteLoading === student.id ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      <StudentDetailModal
        isOpen={showDetailModal}
        student={studentToView}
        onClose={handleCloseDetail}
      />

      {/* ✅ Edit Modal - NEW */}
      <StudentEditModal
        isOpen={showEditModal}
        student={studentForEdit}
        onClose={handleCloseEdit}
        onUpdate={handleUpdateStudent}
        isLoading={updateLoading}
      />

      {/* Delete Modal */}
      <StudentDeleteModal
        isOpen={showDeleteModal}
        student={studentToDelete}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        isLoading={deleteLoading}
      />

      {/* Enrollments Modal */}
      <StudentEnrollmentsModal
        isOpen={showEnrollmentsModal}
        studentId={studentForEnrollments?.id || null}
        studentName={`${studentForEnrollments?.firstName || ''} ${studentForEnrollments?.lastName || ''}`}
        student={studentForEnrollments}
        onClose={handleCloseEnrollments}
      />
    </div>
  );
};

export default AllStudents;