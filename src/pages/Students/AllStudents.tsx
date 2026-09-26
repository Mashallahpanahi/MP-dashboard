// src/pages/Students/AllStudents.tsx

import { useEffect, useState, useCallback } from "react";
import {
  getStudents,
  deleteStudent,
  getStudentById,
  getPaginatedStudents,
  getUnenrolledStudents,
  searchStudentsByName,
  searchStudentByNumber,
  getFilteredStudents,
  type FilteredStudent,
} from "@/api/studentApi";
import type { Student } from "@/types/student";
import {
  StudentDetailModal,
  StudentDeleteModal,
  StudentEnrollmentsModal,
  StudentScoresModal,
} from "@/components/students";
import StudentEditModal from "@/components/students/StudentEditModal";
import MoreFilterModal, {
  type MoreFilterValues,
} from "@/components/students/MoreFilterModal";
import EnrollmentHistoryModal from "@/components/students/EnrollmentHistoryModal";
import ShamsiDatePicker from "@/utils/ShamsiDatePicker";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const getImageUrl = (imagePath: string | null | undefined) => {
  if (!imagePath) return null;
  if (imagePath.startsWith("http")) return imagePath;
  return `${API_URL}${imagePath}`;
};

type ViewMode =
  | "paginated"
  | "unenrolled"
  | "search-name"
  | "search-number"
  | "filtered";

type SearchType = "name" | "studentNumber";

const AllStudents = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<FilteredStudent[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ============================================
  // FILTER & SEARCH STATE
  // ============================================
  const [viewMode, setViewMode] = useState<ViewMode>("paginated");
  const [searchType, setSearchType] = useState<SearchType>("name");
  const [searchName, setSearchName] = useState("");
  const [searchNumber, setSearchNumber] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [useDateFilter, setUseDateFilter] = useState(false);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [showMoreFilter, setShowMoreFilter] = useState(false);
  const [moreFilters, setMoreFilters] = useState<MoreFilterValues>({});

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [showDetailModal, setShowDetailModal] = useState(false);
  const [studentToView, setStudentToView] = useState<Student | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [showEditModal, setShowEditModal] = useState(false);
  const [studentForEdit, setStudentForEdit] = useState<Student | null>(null);

  const [showEnrollmentsModal, setShowEnrollmentsModal] = useState(false);
  const [studentForEnrollments, setStudentForEnrollments] =
    useState<Student | null>(null);

  const [showScoresModal, setShowScoresModal] = useState(false);
  const [studentForScores, setStudentForScores] = useState<Student | null>(
    null
  );

  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [studentForHistory, setStudentForHistory] = useState<Student | null>(
    null
  );

  // ============================================
  // DATA FETCHING
  // ============================================
  const fetchPaginatedStudents = useCallback(
    async (page: number = 1, limit: number = pageSize) => {
      try {
        setLoading(true);
        setError("");
        setFilteredStudents([]);

        const response = await getPaginatedStudents(
          page,
          limit,
          useDateFilter ? fromDate : undefined,
          useDateFilter ? toDate : undefined
        );

        if (response.success) {
          setStudents(response.data);
          setCurrentPage(response.pagination.page);
          setTotalPages(response.pagination.totalPages);
          setTotalCount(response.pagination.total);
          setViewMode("paginated");
        }
      } catch (error) {
        console.error("Failed to fetch paginated students:", error);
        setError(
          error instanceof Error ? error.message : "Failed to fetch students"
        );
      } finally {
        setLoading(false);
      }
    },
    [pageSize, useDateFilter, fromDate, toDate]
  );

  const fetchUnenrolledStudents = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      setFilteredStudents([]);

      const response = await getUnenrolledStudents(
        useDateFilter ? fromDate : undefined,
        useDateFilter ? toDate : undefined
      );

      if (response.success) {
        setStudents(response.data);
        setTotalCount(response.count);
        setTotalPages(1);
        setCurrentPage(1);
        setViewMode("unenrolled");
      }
    } catch (error) {
      console.error("Failed to fetch unenrolled students:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to fetch unenrolled students"
      );
    } finally {
      setLoading(false);
    }
  }, [useDateFilter, fromDate, toDate]);

  const handleSearchByName = useCallback(async (name: string) => {
    try {
      setLoading(true);
      setError("");
      setSearchName(name);
      setSearchNumber("");
      setFilteredStudents([]);

      const response = await searchStudentsByName(name);

      if (response.success) {
        const results = Array.isArray(response.data)
          ? response.data
          : [response.data].filter(Boolean);

        setStudents(results);
        setTotalCount(results.length);
        setTotalPages(1);
        setCurrentPage(1);
        setViewMode("search-name");
      }
    } catch (error) {
      console.error("Failed to search students by name:", error);
      setError(
        error instanceof Error ? error.message : "Failed to search students"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSearchByNumber = useCallback(async (studentNumber: string) => {
    try {
      setLoading(true);
      setError("");
      setSearchNumber(studentNumber);
      setSearchName("");
      setFilteredStudents([]);

      const response = await searchStudentByNumber(studentNumber);

      if (response.success) {
        const results = Array.isArray(response.data)
          ? response.data
          : [response.data].filter(Boolean);

        setStudents(results);
        setTotalCount(results.length);
        setTotalPages(1);
        setCurrentPage(1);
        setViewMode("search-number");
      }
    } catch (error) {
      console.error("Failed to search student by number:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to search student by number"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const handleApplyMoreFilters = useCallback(
    async (filters: MoreFilterValues) => {
      try {
        setLoading(true);
        setError("");
        setMoreFilters(filters);
        setShowMoreFilter(false);

        const response = await getFilteredStudents(filters);

        if (response.success) {
          setFilteredStudents(response.data);
          setStudents(response.data.map((item) => item.student));
          setTotalCount(response.count);
          setTotalPages(1);
          setCurrentPage(1);
          setViewMode("filtered");
        }
      } catch (error) {
        console.error("Failed to apply filters:", error);
        setError(
          error instanceof Error ? error.message : "Failed to apply filters"
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const handleSearch = useCallback(async () => {
    const trimmedInput = searchInput.trim();

    if (!trimmedInput) {
      fetchPaginatedStudents(1);
      return;
    }

    if (searchType === "name") {
      await handleSearchByName(trimmedInput);
    } else {
      await handleSearchByNumber(trimmedInput);
    }
  }, [
    searchInput,
    searchType,
    handleSearchByName,
    handleSearchByNumber,
    fetchPaginatedStudents,
  ]);

  useEffect(() => {
    fetchPaginatedStudents(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ============================================
  // HANDLERS
  // ============================================
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      fetchPaginatedStudents(newPage);
    }
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    fetchPaginatedStudents(1, newSize);
  };

  const handleSearchClick = () => handleSearch();

  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSearch();
  };

  const handleSearchTypeChange = (newType: SearchType) => {
    setSearchType(newType);
    setSearchInput("");
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setSearchName("");
    setSearchNumber("");
    setMoreFilters({});
    fetchPaginatedStudents(1);
  };

  const handleShowAllStudents = () => {
    setViewMode("paginated");
    setSearchInput("");
    setSearchName("");
    setSearchNumber("");
    setMoreFilters({});
    fetchPaginatedStudents(1);
  };

  const handleShowUnenrolled = () => {
    fetchUnenrolledStudents();
  };

  const handleOpenMoreFilter = () => setShowMoreFilter(true);
  const handleCloseMoreFilter = () => setShowMoreFilter(false);

  const hasActiveMoreFilters =
    moreFilters.teacherId ||
    moreFilters.bookId ||
    moreFilters.time ||
    moreFilters.fromDate ||
    moreFilters.toDate;

  const handleDateFilterToggle = (checked: boolean) => {
    setUseDateFilter(checked);
    if (!checked) {
      setFromDate("");
      setToDate("");
    }
  };

  const handleApplyDateFilter = () => {
    if (viewMode === "unenrolled") {
      fetchUnenrolledStudents();
    } else {
      fetchPaginatedStudents(1);
    }
  };

  const handleDeleteClick = (student: Student) => {
    setStudentToDelete(student);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!studentToDelete) return;

    try {
      setDeleteLoading(true);
      await deleteStudent(studentToDelete.id);
      setStudents((prev) =>
        prev.filter((student) => student.id !== studentToDelete.id)
      );
      setFilteredStudents((prev) =>
        prev.filter((item) => item.student.id !== studentToDelete.id)
      );
      setTotalCount((prev) => prev - 1);
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

  const handleViewClick = async (student: Student) => {
    try {
      setDetailLoading(true);
      const studentData = await getStudentById(student.id);
      setStudentToView(studentData);
      setShowDetailModal(true);
    } catch (error) {
      console.error("Failed to fetch student details:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to load student details"
      );
    } finally {
      setDetailLoading(false);
    }
  };

  const handleCloseDetail = () => {
    setShowDetailModal(false);
    setStudentToView(null);
  };

  const handleEditClick = (student: Student) => {
    setStudentForEdit(student);
    setShowEditModal(true);
  };

  const handleCloseEdit = () => {
    setShowEditModal(false);
    setStudentForEdit(null);
  };

  const handleStudentUpdated = () => {
    if (viewMode === "paginated") {
      fetchPaginatedStudents(currentPage);
    } else if (viewMode === "unenrolled") {
      fetchUnenrolledStudents();
    } else if (viewMode === "search-name") {
      handleSearchByName(searchName);
    } else if (viewMode === "search-number") {
      handleSearchByNumber(searchNumber);
    } else if (viewMode === "filtered") {
      handleApplyMoreFilters(moreFilters);
    }
  };

  const handleViewEnrollments = (student: Student) => {
    setStudentForEnrollments(student);
    setShowEnrollmentsModal(true);
  };

  const handleCloseEnrollments = () => {
    setShowEnrollmentsModal(false);
    setStudentForEnrollments(null);
  };

  const handleViewScores = (student: Student) => {
    setStudentForScores(student);
    setShowScoresModal(true);
  };

  const handleCloseScores = () => {
    setShowScoresModal(false);
    setStudentForScores(null);
  };

  const handleViewHistory = (student: Student) => {
    setStudentForHistory(student);
    setShowHistoryModal(true);
  };

  const handleCloseHistory = () => {
    setShowHistoryModal(false);
    setStudentForHistory(null);
  };

  const handleAddStudent = () => {
    navigate("/students/register");
  };

  // ============================================
  // PAGINATION RENDER
  // ============================================
  const renderPagination = () => {
    if (viewMode !== "paginated" || totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <div className="flex flex-col items-center justify-between gap-4 border-t border-gray-200 bg-gray-50 px-6 py-4 sm:flex-row">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>Showing</span>
          <select
            value={pageSize}
            onChange={(e) => handlePageSizeChange(Number(e.target.value))}
            className="rounded-lg border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
          <span>
            of <strong>{totalCount}</strong> students
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            First
          </button>
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            ←
          </button>

          {startPage > 1 && (
            <>
              <button
                onClick={() => handlePageChange(1)}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
              >
                1
              </button>
              {startPage > 2 && <span className="px-2 text-gray-500">...</span>}
            </>
          )}

          {pages.map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                currentPage === page
                  ? "bg-blue-600 text-white"
                  : "border border-gray-300 text-gray-700 hover:bg-gray-100"
              }`}
            >
              {page}
            </button>
          ))}

          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && (
                <span className="px-2 text-gray-500">...</span>
              )}
              <button
                onClick={() => handlePageChange(totalPages)}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
              >
                {totalPages}
              </button>
            </>
          )}

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            →
          </button>
          <button
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage === totalPages}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Last
          </button>
        </div>
      </div>
    );
  };

  if (loading && students.length === 0 && filteredStudents.length === 0) {
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
      {/* ============================================ */}
      {/* HEADER */}
      {/* ============================================ */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">All Students</h1>
          <p className="mt-1 text-sm text-gray-500">
            View and manage all students in the system
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={searchType}
            onChange={(e) =>
              handleSearchTypeChange(e.target.value as SearchType)
            }
            className="rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="name">By Name</option>
            <option value="studentNumber">By Student No.</option>
          </select>

          <div className="relative flex items-center">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyPress={handleSearchKeyPress}
              placeholder={
                searchType === "name"
                  ? "Search by name..."
                  : "Search by student no..."
              }
              className="w-48 rounded-lg border border-gray-300 py-2.5 pl-4 pr-10 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:w-56"
            />
            {searchInput && (
              <button
                onClick={handleClearSearch}
                className="absolute right-2 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                title="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          <button
            onClick={handleSearchClick}
            disabled={loading}
            className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading &&
            (viewMode === "search-name" || viewMode === "search-number")
              ? "Searching..."
              : "Search"}
          </button>

          <button
            onClick={handleAddStudent}
            className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            + Add New Student
          </button>
        </div>
      </div>

      {/* ============================================ */}
      {/* FILTER BAR */}
      {/* ============================================ */}
      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={useDateFilter}
                onChange={(e) => handleDateFilterToggle(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">
                Filter by date
              </span>
            </label>

            {useDateFilter && (
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <div className="flex items-center gap-2">
                  <label className="text-xs font-medium text-gray-500">
                    From:
                  </label>
                  <div className="w-32">
                    <ShamsiDatePicker
                      value={fromDate}
                      onChange={setFromDate}
                      placeholder="1403/07/02"
                      compact
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-xs font-medium text-gray-500">
                    To:
                  </label>
                  <div className="w-32">
                    <ShamsiDatePicker
                      value={toDate}
                      onChange={setToDate}
                      placeholder="1403/12/29"
                      compact
                    />
                  </div>
                </div>

                <button
                  onClick={handleApplyDateFilter}
                  disabled={loading}
                  className="rounded-lg bg-gray-800 px-3 py-2 text-xs font-medium text-white transition hover:bg-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Apply
                </button>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleShowAllStudents}
              disabled={loading}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${
                viewMode === "paginated"
                  ? "bg-blue-600 text-white"
                  : "border border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              Show All Students
            </button>

            <button
              onClick={handleShowUnenrolled}
              disabled={loading}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${
                viewMode === "unenrolled"
                  ? "bg-orange-600 text-white"
                  : "border border-orange-300 text-orange-600 hover:bg-orange-50"
              }`}
            >
              All Unenrolled
            </button>

            <button
              onClick={handleOpenMoreFilter}
              disabled={loading}
              className={`relative rounded-lg px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${
                hasActiveMoreFilters
                  ? "bg-purple-600 text-white"
                  : "border border-purple-300 text-purple-600 hover:bg-purple-50"
              }`}
            >
              ⚙ More Filter
              {hasActiveMoreFilters && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                  !
                </span>
              )}
            </button>

            {viewMode === "search-name" && searchName && (
              <span className="rounded-full bg-indigo-100 px-3 py-1.5 text-xs font-medium text-indigo-700">
                🔍 Name: "{searchName}"
              </span>
            )}

            {viewMode === "search-number" && searchNumber && (
              <span className="rounded-full bg-purple-100 px-3 py-1.5 text-xs font-medium text-purple-700">
                🔍 Student No: "{searchNumber}"
              </span>
            )}
          </div>
        </div>

        {hasActiveMoreFilters && (
          <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-gray-100 pt-3">
            <span className="text-xs font-medium text-gray-500">
              Active filters:
            </span>
            {moreFilters.teacherId && (
              <span className="rounded-full bg-purple-100 px-2 py-1 text-xs text-purple-700">
                Teacher filtered
              </span>
            )}
            {moreFilters.bookId && (
              <span className="rounded-full bg-purple-100 px-2 py-1 text-xs text-purple-700">
                Book filtered
              </span>
            )}
            {moreFilters.time && (
              <span className="rounded-full bg-purple-100 px-2 py-1 text-xs text-purple-700">
                Time: {moreFilters.time}
              </span>
            )}
            {moreFilters.fromDate && (
              <span className="rounded-full bg-purple-100 px-2 py-1 text-xs text-purple-700">
                From: {moreFilters.fromDate}
              </span>
            )}
            {moreFilters.toDate && (
              <span className="rounded-full bg-purple-100 px-2 py-1 text-xs text-purple-700">
                To: {moreFilters.toDate}
              </span>
            )}
            <button
              onClick={() => {
                setMoreFilters({});
                fetchPaginatedStudents(1);
              }}
              className="ml-1 text-xs font-medium text-red-600 hover:underline"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-medium text-red-700">{error}</p>
        </div>
      )}

      {/* Results Count */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-gray-600">
          {viewMode === "paginated" && (
            <>
              Showing <strong>{students.length}</strong> of{" "}
              <strong>{totalCount}</strong> students
              {totalPages > 1 && (
                <span className="ml-2 text-gray-400">
                  (Page {currentPage} of {totalPages})
                </span>
              )}
            </>
          )}
          {viewMode === "unenrolled" && (
            <>
              Found <strong>{students.length}</strong> unenrolled student
              {students.length !== 1 ? "s" : ""}
            </>
          )}
          {viewMode === "search-name" && (
            <>
              Found <strong>{students.length}</strong> result
              {students.length !== 1 ? "s" : ""} for name "{searchName}"
            </>
          )}
          {viewMode === "search-number" && (
            <>
              Found <strong>{students.length}</strong> result
              {students.length !== 1 ? "s" : ""} for student number "
              {searchNumber}"
            </>
          )}
          {viewMode === "filtered" && (
            <>
              Found <strong>{filteredStudents.length}</strong> student
              {filteredStudents.length !== 1 ? "s" : ""} matching filters
            </>
          )}
        </p>

        {loading && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-200 border-t-blue-600" />
            Loading...
          </div>
        )}
      </div>

      {/* Empty State */}
      {students.length === 0 && !loading && (
        <div className="rounded-xl border border-gray-200 bg-white p-10 text-center shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900">
            {viewMode === "unenrolled"
              ? "No Unenrolled Students"
              : viewMode === "search-name" || viewMode === "search-number"
              ? "No Results Found"
              : viewMode === "filtered"
              ? "No Students Match Filters"
              : "No Students Found"}
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            {viewMode === "unenrolled"
              ? "All students are currently enrolled in courses."
              : viewMode === "search-name"
              ? `No students found matching name "${searchName}". Try a different name.`
              : viewMode === "search-number"
              ? `No student found with number "${searchNumber}". Try a different number.`
              : viewMode === "filtered"
              ? "No students match the selected filters. Try removing some filters."
              : "There are no students registered yet."}
          </p>
          {(viewMode === "search-name" ||
            viewMode === "search-number" ||
            viewMode === "filtered") && (
            <button
              onClick={handleClearSearch}
              className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Clear Filters
            </button>
          )}
          {viewMode === "paginated" && (
            <button
              onClick={handleAddStudent}
              className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Add Your First Student
            </button>
          )}
        </div>
      )}

      {/* ============================================ */}
      {/* Students Table — Only Name + Actions */}
      {/* ============================================ */}
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
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {students.map((student) => (
                  <tr
                    key={student.id}
                    className="transition hover:bg-gray-50"
                  >
                    {/* Student name only */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {student.image ? (
                          <img
                            src={getImageUrl(student.image) || ""}
                            alt={`${student.firstName} ${student.lastName}`}
                            className="h-10 w-10 rounded-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                              const parent = e.currentTarget.parentElement;
                              if (parent) {
                                const fallback =
                                  document.createElement("div");
                                fallback.className =
                                  "flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-700 text-sm";
                                fallback.textContent = `${
                                  student.firstName.charAt(0)
                                }${student.lastName?.charAt(0) || ""}`;
                                parent.appendChild(fallback);
                              }
                            }}
                          />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-700">
                            {student.firstName.charAt(0)}
                            {student.lastName?.charAt(0) || ""}
                          </div>
                        )}
                        <p className="font-semibold text-gray-900">
                          {student.firstName} {student.lastName || ""}
                        </p>
                      </div>
                    </td>

                    {/* Actions — all buttons same width */}
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          onClick={() => handleViewClick(student)}
                          className="inline-flex w-24 items-center justify-center rounded-lg bg-purple-50 px-3 py-2 text-sm font-medium text-purple-600 transition hover:bg-purple-100"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleEditClick(student)}
                          className="inline-flex w-24 items-center justify-center rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-blue-600 transition hover:bg-blue-100"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleViewEnrollments(student)}
                          className="inline-flex w-24 items-center justify-center rounded-lg bg-indigo-50 px-3 py-2 text-sm font-medium text-indigo-600 transition hover:bg-indigo-100"
                        >
                          Enrollments
                        </button>
                        <button
                          onClick={() => handleViewScores(student)}
                          className="inline-flex w-24 items-center justify-center rounded-lg bg-green-50 px-3 py-2 text-sm font-medium text-green-600 transition hover:bg-green-100"
                        >
                          Scores
                        </button>
                        <button
                          onClick={() => handleViewHistory(student)}
                          className="inline-flex w-24 items-center justify-center rounded-lg bg-amber-50 px-3 py-2 text-sm font-medium text-amber-700 transition hover:bg-amber-100"
                          title="View enrollment & payment history"
                        >
                          📋 History
                        </button>
                        <button
                          onClick={() => handleDeleteClick(student)}
                          disabled={deleteLoading}
                          className="inline-flex w-24 items-center justify-center rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {deleteLoading ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {renderPagination()}
        </div>
      )}

      {/* ============================================ */}
      {/* MODALS */}
      {/* ============================================ */}

      <StudentDetailModal
        isOpen={showDetailModal}
        student={studentToView}
        onClose={handleCloseDetail}
      />

      <StudentEditModal
        isOpen={showEditModal}
        student={studentForEdit}
        onClose={handleCloseEdit}
        onUpdate={handleStudentUpdated}
        isLoading={false}
      />

      <StudentDeleteModal
        isOpen={showDeleteModal}
        student={studentToDelete}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        isLoading={deleteLoading}
      />

      <StudentEnrollmentsModal
        isOpen={showEnrollmentsModal}
        studentId={studentForEnrollments?.id || null}
        studentName={`${studentForEnrollments?.firstName || ""} ${
          studentForEnrollments?.lastName || ""
        }`}
        student={studentForEnrollments}
        onClose={handleCloseEnrollments}
      />

      <StudentScoresModal
        isOpen={showScoresModal}
        studentId={studentForScores?.id || null}
        studentName={`${studentForScores?.firstName || ""} ${
          studentForScores?.lastName || ""
        }`}
        onClose={handleCloseScores}
      />

      <EnrollmentHistoryModal
        isOpen={showHistoryModal}
        student={studentForHistory}
        onClose={handleCloseHistory}
      />

      <MoreFilterModal
        isOpen={showMoreFilter}
        onClose={handleCloseMoreFilter}
        onApply={handleApplyMoreFilters}
        initialValues={moreFilters}
        loading={loading}
      />
    </div>
  );
};

export default AllStudents;