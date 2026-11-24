// src/pages/Teachers/AllTeachers.tsx
import { useEffect, useState } from "react";
import {
  useActiveTeachers,
  useTeachers, // ✅ Added for "All Teachers" route
  useTeacherById,
  useDeleteTeacher,
  useUpdateTeacher,
  useUpdateTeacherStatus,
  type Teacher,
  type UpdateTeacherData,
} from "@/api/teacherApi";
import TeacherUpdateModal from "@/components/teachers/TeacherUpdateModal";
import TeacherDeleteModal from "@/components/teachers/TeacherDeleteModal";
// ✅ New view modal
import TeacherViewMoreModal from "@/components/teachers/TeacherViewMoreModal";

const AllTeachers = () => {
  // ✅ Toggle state: false = active only, true = all teachers
  const [showAll, setShowAll] = useState(false);

  // ✅ Hook for the active list
  const {
    data: fetchedActiveTeachers,
    loading: loadingActive,
    error: errorActive,
    refetch: refetchActive,
  } = useActiveTeachers();

  // ✅ Hook for the all list
  const {
    data: fetchedAllTeachers,
    loading: loadingAll,
    error: errorAll,
    refetch: refetchAll,
  } = useTeachers();

  // Combine based on toggle
  const fetchedTeachers = showAll ? fetchedAllTeachers : fetchedActiveTeachers;
  const loading = showAll ? loadingAll : loadingActive;
  const fetchError = showAll ? errorAll : errorActive;
  const refetch = showAll ? refetchAll : refetchActive;

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
  //  Refetch whenever the toggle changes so the newly selected list is fresh
  useEffect(() => {
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showAll]);
  // Combined error (local mutations + hook fetch)
  const error = localError || fetchError || "";

  // Delete state — kept for backward compatibility
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [teacherToDelete, setTeacherToDelete] = useState<Teacher | null>(null);

  // View state
  const [showViewModal, setShowViewModal] = useState(false);
  const [teacherToView, setTeacherToView] = useState<Teacher | null>(null);

  // Update state
  const [teacherToUpdateId, setTeacherToUpdateId] = useState<string | null>(
    null,
  );

  const { data: fetchedTeacherToUpdate } = useTeacherById(
    teacherToUpdateId ?? "",
    !!teacherToUpdateId,
  );

  // Prefer the freshly-fetched teacher; fall back to the list copy
  const teacherToUpdate: Teacher | null = teacherToUpdateId
    ? fetchedTeacherToUpdate && fetchedTeacherToUpdate.id === teacherToUpdateId
      ? fetchedTeacherToUpdate
      : (teachers.find((t) => t.id === teacherToUpdateId) ?? null)
    : null;

  const showUpdateModal = !!teacherToUpdate;

  // Track which teacher is mid status-toggle (per-row spinner)
  const [statusLoading, setStatusLoading] = useState<string | null>(null);

  // Refresh
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

      // Optimistic local update
      // Only remove from list if we are on the "Active" tab and deactivating
      if (!newStatus && !showAll) {
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

  // View handlers
  const handleViewClick = (teacher: Teacher) => {
    setTeacherToView(teacher);
    setShowViewModal(true);
  };

  const handleCloseView = () => {
    setShowViewModal(false);
    setTeacherToView(null);
  };

  // Update handlers
  const handleUpdateClick = (teacher: Teacher) => {
    setTeacherToUpdateId(teacher.id);
  };

  const handleUpdateTeacher = async (
    id: string,
    data: Partial<UpdateTeacherData>,
  ) => {
    const ok = await updateTeacher(id, data);
    if (!ok) {
      throw new Error("Failed to update teacher. Please try again.");
    }
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
          <p className="mt-1 text-sm text-gray-500">View and manage teachers</p>
        </div>

        <div className="flex items-center gap-2">
          {/* ✅ Toggle Button Group */}
          <div className="flex overflow-hidden rounded-lg border border-gray-300 bg-white">
            <button
              type="button"
              onClick={() => setShowAll(true)}
              className={`px-4 py-2.5 text-sm font-medium transition ${
                showAll
                  ? "bg-blue-600 text-white"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              All Teachers
            </button>
            <button
              type="button"
              onClick={() => setShowAll(false)}
              className={`border-l border-gray-300 px-4 py-2.5 text-sm font-medium transition ${
                !showAll
                  ? "bg-blue-600 text-white"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              Active Teachers
            </button>
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
            {showAll ? "No Teachers Found" : "No Active Teachers Found"}
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            {showAll
              ? "There are no teachers registered yet."
              : "There are no active teachers currently. Register a new teacher or activate an existing one."}
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
                      Salary
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Fee
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
                          {/* View */}
                          <button
                            type="button"
                            onClick={() => handleViewClick(teacher)}
                            className="inline-flex items-center rounded-lg bg-gray-50 px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-gray-700"
                            title="View full details"
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
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            </svg>
                            View
                          </button>

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

                          {/* Toggle Status Button */}
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(teacher)}
                            disabled={statusLoading === teacher.id}
                            className={`inline-flex items-center rounded-lg px-3 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${
                              teacher.isActive
                                ? "bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700"
                                : "bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700"
                            }`}
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
                            ) : teacher.isActive ? (
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
                                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                  />
                                </svg>
                                Activate
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
                    </div>
                  </div>

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
                      onClick={() => handleViewClick(teacher)}
                      className="flex-1 rounded-lg bg-gray-50 px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-gray-700"
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
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                      View
                    </button>

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
                      className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${
                        teacher.isActive
                          ? "bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700"
                          : "bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700"
                      }`}
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
                      ) : teacher.isActive ? (
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
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          Activate
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

      {/* View Modal */}
      <TeacherViewMoreModal
        isOpen={showViewModal}
        teacher={teacherToView}
        onClose={handleCloseView}
      />

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
