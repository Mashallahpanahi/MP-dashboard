// src/pages/Classes/AllClasses.tsx
import { useEffect, useState } from "react";
import {
  useClasses,
  useClassById,
  useDeleteClass,
  useUpdateClass,
  useUpdateClassStatus,
  type Class,
  type UpdateClassData,
} from "@/api/classApi";
import ClassUpdateModal from "@/components/classes/ClassUpdateModal";
import ClassDeleteModal from "@/components/classes/ClassDeleteModal";

const AllClasses = () => {
  // ✅ List hook
  const {
    data: fetchedClasses,
    loading,
    error: fetchError,
    refetch,
  } = useClasses();

  // ✅ Mutation hooks
  const { remove, loading: deleting } = useDeleteClass();
  const { update } = useUpdateClass();
  const { updateStatus } = useUpdateClassStatus();

  // Local mirror (for optimistic status toggle)
  const [classes, setClasses] = useState<Class[]>([]);
  const [localError, setLocalError] = useState("");

  // Sync hook data → local mirror
  useEffect(() => {
    if (fetchedClasses) setClasses(fetchedClasses);
  }, [fetchedClasses]);

  // Combined error
  const error = localError || fetchError || "";

  // Delete state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [classToDelete, setClassToDelete] = useState<Class | null>(null);

  // Update state — track ID, let the hook fetch fresh details
  const [classToUpdateId, setClassToUpdateId] = useState<string | null>(null);

  const { data: fetchedClassToUpdate, loading: updateLoading } = useClassById(
    classToUpdateId ?? "",
    !!classToUpdateId,
  );

  const classToUpdate: Class | null = classToUpdateId
    ? fetchedClassToUpdate?.id === classToUpdateId
      ? fetchedClassToUpdate
      : (classes.find((c) => c.id === classToUpdateId) ?? null)
    : null;

  const showUpdateModal = !!classToUpdateId && !!classToUpdate;

  // Status toggle per-row spinner
  const [statusLoading, setStatusLoading] = useState<string | null>(null);

  // Refresh
  const handleRefresh = () => {
    setLocalError("");
    refetch();
  };

  // Status toggle handler
  const handleToggleStatus = async (classItem: Class) => {
    const newStatus = !classItem.isActive;
    const action = newStatus ? "activate" : "deactivate";

    if (
      !confirm(`Are you sure you want to ${action} "${classItem.className}"?`)
    ) {
      return;
    }

    setStatusLoading(classItem.id);
    const ok = await updateStatus(classItem.id, newStatus);
    setStatusLoading(null);

    if (!ok) {
      setLocalError(`Failed to ${action} class`);
      return;
    }

    // Optimistic local update
    setClasses((prev) =>
      prev.map((c) =>
        c.id === classItem.id ? { ...c, isActive: newStatus } : c,
      ),
    );

    alert(`Class ${action}d successfully!`);
  };

  // Delete handlers
  const handleDeleteClick = (classItem: Class) => {
    setClassToDelete(classItem);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!classToDelete) return;
    setLocalError("");
    const ok = await remove(classToDelete.id);

    if (ok) {
      setClasses((prev) => prev.filter((c) => c.id !== classToDelete.id));
      setShowDeleteModal(false);
      setClassToDelete(null);
    } else {
      setLocalError("Failed to delete class");
      setShowDeleteModal(false);
      setClassToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setClassToDelete(null);
  };

  // Update handlers
  const handleUpdateClick = (classItem: Class) => {
    setClassToUpdateId(classItem.id);
  };

  const handleUpdateClass = async (id: string, data: UpdateClassData) => {
    const ok = await update(id, data);
    if (!ok) {
      throw new Error("Failed to update class. Please try again.");
    }
    setClassToUpdateId(null);
    await refetch();
  };

  const handleCloseUpdate = () => {
    setClassToUpdateId(null);
  };

  if (loading && classes.length === 0) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
          <p className="mt-4 text-sm text-gray-500">Loading classes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">All Classes</h1>
          <p className="mt-1 text-sm text-gray-500">
            View and manage all classes in the system
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Loading..." : "Refresh"}
          </button>
          <button
            onClick={() => (window.location.href = "/classes/add")}
            className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            Add New Class
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm font-medium text-red-700">{error}</p>
            <button
              onClick={handleRefresh}
              className="rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {classes.length === 0 && !loading && (
        <div className="rounded-xl border border-gray-200 bg-white p-10 text-center shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900">
            No Classes Found
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            There are no classes registered yet.
          </p>
          <button
            onClick={() => (window.location.href = "/classes/add")}
            className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Add Your First Class
          </button>
        </div>
      )}

      {/* Classes Table */}
      {classes.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr className="border-b border-gray-200">
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Class Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Block
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
                {classes.map((classItem) => (
                  <tr
                    key={classItem.id}
                    className="transition hover:bg-gray-50"
                  >
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-900">
                        {classItem.className}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      {classItem.block ? (
                        <span className="inline-flex rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                          {classItem.block}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {classItem.isActive ? (
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
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleUpdateClick(classItem)}
                          className="inline-flex items-center rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-blue-600 transition hover:bg-blue-100"
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
                          onClick={() => handleToggleStatus(classItem)}
                          disabled={statusLoading === classItem.id}
                          className={`inline-flex items-center rounded-lg px-3 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${
                            classItem.isActive
                              ? "bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700"
                              : "bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700"
                          }`}
                        >
                          {statusLoading === classItem.id ? (
                            <svg
                              className="h-4 w-4 animate-spin"
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
                          ) : classItem.isActive ? (
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
                        <button
                          onClick={() => handleDeleteClick(classItem)}
                          disabled={deleting}
                          className="inline-flex items-center rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
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
      )}

      {/* Modals */}
      <ClassDeleteModal
        isOpen={showDeleteModal}
        classItem={classToDelete}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        isLoading={deleting}
      />

      <ClassUpdateModal
        isOpen={showUpdateModal}
        classItem={classToUpdate}
        onClose={handleCloseUpdate}
        onUpdate={handleUpdateClass}
        isLoading={updateLoading}
      />
    </div>
  );
};

export default AllClasses;
