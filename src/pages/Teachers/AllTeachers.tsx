// src/pages/Teachers/AllTeachers.tsx
import { useEffect, useState } from "react";
import {
  useActiveTeachers,
  useTeacherById,
  useDeleteTeacher,
  useUpdateTeacher,
  useUpdateTeacherStatus,
  type Teacher,
  type UpdateTeacherData,
} from "@/api/teacherApi";
import TeacherUpdateModal from "@/components/teachers/TeacherUpdateModal";
import TeacherDeleteModal from "@/components/teachers/TeacherDeleteModal";
// ✅ Shamsi formatter
import { formatShamsi } from "@/utils/dateConverter";

const AllTeachers = () => {
  // ✅ Hook for the list (replaces getActiveTeachers + local loading/error)
  const {
    data: fetchedTeachers,
    loading,
    error: fetchError,
    refetch,
  } = useActiveTeachers();

  // ✅ Mutation hooks
  const { remove, loading: deleting } = useDeleteTeacher();
  const { updateTeacher, loading: updatingTeacher } = useUpdateTeacher();
  const { updateStatus } = useUpdateTeacherStatus();

  // Local mirror so we can optimistically patch the list on mutations
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [localError, setLocalError] = useState("");

  // Sync hook data → local mirror
  useEffect(() => {
    if (fetchedTeachers) setTeachers(fetchedTeachers);
  }, [fetchedTeachers]);

  // Combined error (local mutations + hook fetch)
  const error = localError || fetchError || "";

  // Delete state — kept for backward compatibility
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [teacherToDelete, setTeacherToDelete] = useState<Teacher | null>(null);

  // Update state
  // We keep the *ID* of the teacher being edited — the hook fetches fresh
  // details, but we fall back to the list copy while the request is in flight.
  const [teacherToUpdateId, setTeacherToUpdateId] = useState<string | null>(
    null,
  );

  const {
    data: fetchedTeacherToUpdate,
    // loading is intentionally ignored — we have list data to fall back on
  } = useTeacherById(teacherToUpdateId ?? "", !!teacherToUpdateId);

  // Prefer the freshly-fetched teacher; fall back to the list copy
  const teacherToUpdate: Teacher | null = teacherToUpdateId
    ? fetchedTeacherToUpdate && fetchedTeacherToUpdate.id === teacherToUpdateId
      ? fetchedTeacherToUpdate
      : (teachers.find((t) => t.id === teacherToUpdateId) ?? null)
    : null;

  // Show the modal whenever a teacher is selected
  const showUpdateModal = !!teacherToUpdate;

  // Track which teacher is mid status-toggle (per-row spinner)
  const [statusLoading, setStatusLoading] = useState<string | null>(null);

  // Refresh (same effect as the old fetchTeachers button)
  const handleRefresh = () => {
    setLocalError("");
    refetch();
  };

  // Status toggle handler
  const handleToggleStatus = async (teacher: Teacher) => {
    const newStatus = !teacher.isActive;
    const action = newStatus ? "activate" : "deactivate";

    if (
      !confirm(
        `Are you sure you want to ${action} ${teacher.firstName} ${teacher.lastName}?`,
      )
    ) {
      return;
    }

    try {
      setStatusLoading(teacher.id);
      const ok = await updateStatus(teacher.id, newStatus);

      if (!ok) {
        setLocalError(`Failed to ${action} teacher`);
        return;
      }

      // Optimistic local update (same as before)
      if (!newStatus) {
        setTeachers((prev) => prev.filter((t) => t.id !== teacher.id));
      } else {
        setTeachers((prev) =>
          prev.map((t) =>
            t.id === teacher.id ? { ...t, isActive: newStatus } : t,
          ),
        );
      }

      const statusText = newStatus ? "activated" : "deactivated";
      alert(`Teacher ${statusText} successfully!`);
    } finally {
      setStatusLoading(null);
    }
  };

  // Delete handlers — kept for backward compatibility
  const handleDeleteClick = (teacher: Teacher) => {
    setTeacherToDelete(teacher);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!teacherToDelete) return;

    const ok = await remove(teacherToDelete.id);
    if (ok) {
      setTeachers((prev) =>
        prev.filter((teacher) => teacher.id !== teacherToDelete.id),
      );
      setShowDeleteModal(false);
      setTeacherToDelete(null);
    } else {
      setLocalError("Failed to delete teacher");
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setTeacherToDelete(null);
  };

  // Update handlers
  const handleUpdateClick = (teacher: Teacher) => {
    // Modal opens immediately using list data; the hook fetches fresh
    // data in the background and the modal updates when it arrives.
    setTeacherToUpdateId(teacher.id);
  };

  const handleUpdateTeacher = async (
    id: string,
    data: Partial<UpdateTeacherData>,
  ) => {
    const ok = await updateTeacher(id, data);
    if (!ok) {
      // Throwing preserves the modal's "stay open on failure" behaviour
      throw new Error("Failed to update teacher. Please try again.");
    }
    // Close the modal + refresh the list
    setTeacherToUpdateId(null);
    await refetch();
  };

  const handleCloseUpdate = () => {
    setTeacherToUpdateId(null);
  };

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">All Teachers</h1>

          <p className="mt-1 text-sm text-gray-500">
            View and manage all active teachers
          </p>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
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

              <p className="mt-1 text-sm text-red-600">{error}</p>
            </div>

            <button
              type="button"
              onClick={handleRefresh}
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

          <p className="mt-4 text-sm text-gray-500">Loading teachers...</p>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && teachers.length === 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-10 text-center shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900">
            No Active Teachers Found
          </h3>

          <p className="mt-2 text-sm text-gray-500">
            There are no active teachers currently. Register a new teacher or
            activate an existing one.
          </p>
        </div>
      )}

      {/* Teachers */}
      {!loading && !error && teachers.length > 0 && (
        <>
          {/* Desktop Table */}
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
                        <p className="text-sm text-gray-900">{teacher.phone}</p>

                        <p className="mt-1 text-xs text-gray-500">
                          {teacher.email || "No email"}
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
                          {teacher.salaryType === "Fixed"
                            ? teacher.salaryAmount.toLocaleString()
                            : teacher.feePercentage + "%"}
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

                      {/* ✅ Hire Date — Shamsi */}
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                        {formatShamsi(teacher.hireDate, "YYYY/MM/DD")}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                          <span className="mr-2 h-2 w-2 rounded-full bg-green-500" />
                          Active
                        </span>
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

                          {/* Deactivate Button */}
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(teacher)}
                            disabled={statusLoading === teacher.id}
                            className="inline-flex items-center rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-100 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {statusLoading === teacher.id ? (
                              <>
                                <svg
                                  className="mr-2 h-4 w-4 animate-spin"
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                >
                                  <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                  />
                                  <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                  />
                                </svg>
                                Updating...
                              </>
                            ) : (
                              <>
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
                                    d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                                  />
                                </svg>
                                Deactivate
                              </>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile / Tablet Cards */}
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

                  <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700">
                    Active
                  </span>
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
                      {teacher.email || "No email"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase text-gray-400">
                      Salary
                    </p>

                    <p className="mt-1 text-sm font-semibold text-gray-800">
                      {teacher.salaryType === "Fixed"
                        ? teacher.salaryAmount.toLocaleString()
                        : teacher.feePercentage + "%"}
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

                  {/* ✅ Hire Date — Shamsi */}
                  <div>
                    <p className="text-xs font-medium uppercase text-gray-400">
                      Hire Date
                    </p>

                    <p className="mt-1 text-sm text-gray-800">
                      {formatShamsi(teacher.hireDate, "YYYY/MM/DD")}
                    </p>
                  </div>
                </div>

                {/* Address & Actions */}
                <div className="mt-5 border-t border-gray-100 pt-4">
                  <p className="text-xs font-medium uppercase text-gray-400">
                    Address
                  </p>

                  <p className="mt-1 text-sm text-gray-700">
                    {teacher.address || "No address provided"}
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
                      onClick={() => handleToggleStatus(teacher)}
                      disabled={statusLoading === teacher.id}
                      className="flex-1 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-100 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {statusLoading === teacher.id ? (
                        <>
                          <svg
                            className="mr-2 inline h-4 w-4 animate-spin"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                          </svg>
                          Updating...
                        </>
                      ) : (
                        <>
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
                              d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                            />
                          </svg>
                          Deactivate
                        </>
                      )}
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
        isLoading={deleting}
      />

      <TeacherUpdateModal
        isOpen={showUpdateModal}
        teacher={teacherToUpdate}
        onClose={handleCloseUpdate}
        onUpdate={handleUpdateTeacher}
        isLoading={updatingTeacher}
      />
    </div>
  );
};

export default AllTeachers;
