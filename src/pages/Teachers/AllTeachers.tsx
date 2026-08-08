// src/pages/Teachers/AllTeachers.tsx
import { useEffect, useState } from "react";
import {
  getTeachers,
  deleteTeacher,
  getTeacherById,
  updateTeacher,
  type UpdateTeacherData,
} from "@/api/teacherApi";
import type { Teacher } from "@/types/teacher";
import TeacherUpdateModal from "@/components/teachers/TeacherUpdateModal";
import TeacherDeleteModal from "@/components/teachers/TeacherDeleteModal";

const AllTeachers = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Delete state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [teacherToDelete, setTeacherToDelete] = useState<Teacher | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Update state
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [teacherToUpdate, setTeacherToUpdate] = useState<Teacher | null>(null);
  const [updateLoading, setUpdateLoading] = useState(false);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getTeachers();

      setTeachers(data);
    } catch (error) {
      console.error("Failed to fetch teachers:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to fetch teachers"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  // Delete handlers
  const handleDeleteClick = (teacher: Teacher) => {
    setTeacherToDelete(teacher);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!teacherToDelete) return;

    try {
      setDeleteLoading(true);

      await deleteTeacher(teacherToDelete.id);

      setTeachers((prev) =>
        prev.filter((teacher) => teacher.id !== teacherToDelete.id)
      );

      setShowDeleteModal(false);
      setTeacherToDelete(null);
    } catch (error) {
      console.error("Failed to delete teacher:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to delete teacher"
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setTeacherToDelete(null);
  };

  // Update handlers
  const handleUpdateClick = async (teacher: Teacher) => {
    try {
      setUpdateLoading(true);

      // Fetch the latest teacher data
      const teacherData = await getTeacherById(teacher.id);

      setTeacherToUpdate(teacherData);
      setShowUpdateModal(true);
    } catch (error) {
      console.error("Failed to fetch teacher for update:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to load teacher data"
      );
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleUpdateTeacher = async (
    id: string,
    data: Partial<UpdateTeacherData>
  ) => {
    const updatedTeacher = await updateTeacher(id, data);

    // Update the teacher in the list
    setTeachers((prev) =>
      prev.map((teacher) =>
        teacher.id === updatedTeacher.id ? updatedTeacher : teacher
      )
    );
  };

  const handleCloseUpdate = () => {
    setShowUpdateModal(false);
    setTeacherToUpdate(null);
  };

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            All Teachers
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            View and manage all registered teachers
          </p>
        </div>

        <button
          type="button"
          onClick={fetchTeachers}
          disabled={loading}
          className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold text-red-800">
                Failed to load teachers
              </h3>

              <p className="mt-1 text-sm text-red-600">
                {error}
              </p>
            </div>

            <button
              type="button"
              onClick={fetchTeachers}
              className="rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="rounded-xl border border-gray-200 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />

          <p className="mt-4 text-sm text-gray-500">
            Loading teachers...
          </p>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && teachers.length === 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-10 text-center shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900">
            No Teachers Found
          </h3>

          <p className="mt-2 text-sm text-gray-500">
            There are no registered teachers yet.
          </p>
        </div>
      )}

      {/* Teachers */}
      {!loading && !error && teachers.length > 0 && (
        <>
          {/* Desktop Table - Same as before */}
          <div className="hidden overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm lg:block">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr className="border-b border-gray-200">
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Teacher
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Contact
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Gender
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Salary
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Fee
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Hire Date
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
                  {teachers.map((teacher) => (
                    <tr
                      key={teacher.id}
                      className="transition hover:bg-gray-50"
                    >
                      {/* Teacher */}
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-700">
                            {teacher.firstName.charAt(0)}
                            {teacher.lastName.charAt(0)}
                          </div>

                          <div>
                            <p className="font-semibold text-gray-900">
                              {teacher.firstName} {teacher.lastName}
                            </p>

                            <p className="mt-1 text-xs text-gray-500">
                              ID: {teacher.id.slice(0, 8)}...
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-900">
                          {teacher.phone}
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                          {teacher.email}
                        </p>
                      </td>

                      {/* Gender */}
                      <td className="px-6 py-4">
                        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                          {teacher.gender}
                        </span>
                      </td>

                      {/* Salary */}
                      <td className="px-6 py-4">
                        <p className="font-semibold text-gray-900">
                          {teacher.salaryAmount.toLocaleString()}
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                          {teacher.salaryType}
                        </p>
                      </td>

                      {/* Fee */}
                      <td className="px-6 py-4">
                        <span className="font-semibold text-blue-600">
                          {teacher.feePercentage}%
                        </span>
                      </td>

                      {/* Hire Date */}
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                        {new Date(teacher.hireDate).toLocaleDateString()}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        {teacher.isActive ? (
                          <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                            <span className="mr-2 h-2 w-2 rounded-full bg-green-500" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                            <span className="mr-2 h-2 w-2 rounded-full bg-red-500" />
                            Inactive
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleUpdateClick(teacher)}
                            className="inline-flex items-center rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-blue-600 transition hover:bg-blue-100 hover:text-blue-700"
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
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteClick(teacher)}
                            className="inline-flex items-center rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-100 hover:text-red-700"
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
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile / Tablet - Same as before but with updated handlers */}
          <div className="grid grid-cols-1 gap-4 lg:hidden">
            {teachers.map((teacher) => (
              <div
                key={teacher.id}
                className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
              >
                {/* Card Header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700">
                      {teacher.firstName.charAt(0)}
                      {teacher.lastName.charAt(0)}
                    </div>

                    <div>
                      <h2 className="font-semibold text-gray-900">
                        {teacher.firstName} {teacher.lastName}
                      </h2>

                      <p className="mt-1 text-sm text-gray-500">
                        {teacher.gender}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    {teacher.isActive ? (
                      <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700">
                        Active
                      </span>
                    ) : (
                      <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700">
                        Inactive
                      </span>
                    )}
                  </div>
                </div>

                {/* Details */}
                <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-medium uppercase text-gray-400">
                      Phone
                    </p>

                    <p className="mt-1 text-sm text-gray-800">
                      {teacher.phone}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase text-gray-400">
                      Email
                    </p>

                    <p className="mt-1 break-all text-sm text-gray-800">
                      {teacher.email}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase text-gray-400">
                      Salary
                    </p>

                    <p className="mt-1 text-sm font-semibold text-gray-800">
                      {teacher.salaryAmount.toLocaleString()}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase text-gray-400">
                      Salary Type
                    </p>

                    <p className="mt-1 text-sm text-gray-800">
                      {teacher.salaryType}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase text-gray-400">
                      Fee Percentage
                    </p>

                    <p className="mt-1 text-sm font-semibold text-blue-600">
                      {teacher.feePercentage}%
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase text-gray-400">
                      Hire Date
                    </p>

                    <p className="mt-1 text-sm text-gray-800">
                      {new Date(teacher.hireDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Address & Actions */}
                <div className="mt-5 border-t border-gray-100 pt-4">
                  <p className="text-xs font-medium uppercase text-gray-400">
                    Address
                  </p>

                  <p className="mt-1 text-sm text-gray-700">
                    {teacher.address}
                  </p>

                  <div className="mt-4 flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleUpdateClick(teacher)}
                      className="flex-1 rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-blue-600 transition hover:bg-blue-100 hover:text-blue-700"
                    >
                      <svg
                        className="mr-2 inline h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteClick(teacher)}
                      className="flex-1 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-100 hover:text-red-700"
                    >
                      <svg
                        className="mr-2 inline h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Modals */}
      <TeacherDeleteModal
        isOpen={showDeleteModal}
        teacher={teacherToDelete}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        isLoading={deleteLoading}
      />

      <TeacherUpdateModal
        isOpen={showUpdateModal}
        teacher={teacherToUpdate}
        onClose={handleCloseUpdate}
        onUpdate={handleUpdateTeacher}
        isLoading={updateLoading}
      />
    </div>
  );
};

export default AllTeachers;