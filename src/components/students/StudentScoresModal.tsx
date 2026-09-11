// src/components/students/StudentScoresModal.tsx
import { useState, useEffect } from "react";
import { getScoresByStudent, deleteStudentScore } from "@/api/scoreApi";
import type { StudentScore } from "@/api/scoreApi";
import { getBooks, type Book } from "@/api/bookApi";
import { getTeachers, type Teacher } from "@/api/teacherApi";
import ScoreUpdateModal from "./ScoreUpdateModal";
import ScoreAddModal from "./ScoreAddModal";

interface StudentScoresModalProps {
  isOpen: boolean;
  studentId: string | null;
  studentName: string;
  onClose: () => void;
}

const StudentScoresModal = ({
  isOpen,
  studentId,
  studentName,
  onClose,
}: StudentScoresModalProps) => {
  const [scores, setScores] = useState<StudentScore[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [books, setBooks] = useState<Book[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);

  // Update modal state
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [scoreToUpdate, setScoreToUpdate] = useState<StudentScore | null>(null);

  // Add modal state
  const [showAddModal, setShowAddModal] = useState(false);

  // ✅ Delete state
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [scoreToDelete, setScoreToDelete] = useState<StudentScore | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (isOpen && studentId) {
      fetchScoresAndData();
    }
  }, [isOpen, studentId]);

  const fetchScoresAndData = async () => {
    if (!studentId) return;
    
    try {
      setLoading(true);
      setError("");

      const [scoresResponse, booksData, teachersData] = await Promise.all([
        getScoresByStudent(studentId),
        getBooks().catch(() => []),
        getTeachers().catch(() => []),
      ]);

      const scoresData = Array.isArray(scoresResponse) ? scoresResponse : [];
      setScores(scoresData);
      setBooks(Array.isArray(booksData) ? booksData : []);
      setTeachers(Array.isArray(teachersData) ? teachersData : []);
    } catch (error) {
      console.error("Failed to fetch scores:", error);
      setError(
        error instanceof Error ? error.message : "Failed to fetch scores"
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle Edit Click
  const handleEditClick = (score: StudentScore) => {
    setScoreToUpdate(score);
    setShowUpdateModal(true);
  };

  const handleCloseUpdateModal = () => {
    setShowUpdateModal(false);
    setScoreToUpdate(null);
  };

  const handleUpdateSuccess = () => {
    fetchScoresAndData();
  };

  // Handle Add Click
  const handleAddClick = () => {
    setShowAddModal(true);
  };

  const handleCloseAddModal = () => {
    setShowAddModal(false);
  };

  const handleAddSuccess = () => {
    fetchScoresAndData();
  };

  // ✅ Handle Delete Click - Show Confirmation
  const handleDeleteClick = (score: StudentScore) => {
    setScoreToDelete(score);
    setShowDeleteConfirm(true);
  };

  const handleCancelDelete = () => {
    setScoreToDelete(null);
    setShowDeleteConfirm(false);
  };

  // ✅ Confirm Delete
  const handleConfirmDelete = async () => {
    if (!scoreToDelete) return;

    try {
      setDeletingId(scoreToDelete.id);
      await deleteStudentScore(scoreToDelete.id);
      
      setSuccess("Score deleted successfully!");
      setShowDeleteConfirm(false);
      setScoreToDelete(null);
      
      // Refresh scores list
      await fetchScoresAndData();
      
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error("Failed to delete score:", error);
      setError(
        error instanceof Error ? error.message : "Failed to delete score"
      );
      setShowDeleteConfirm(false);
      setScoreToDelete(null);
    } finally {
      setDeletingId(null);
    }
  };

  const getBookName = (bookId: string) => {
    const book = books.find(b => b.id === bookId);
    return book ? book.name : 'N/A';
  };

  const getTeacherName = (teacherId: string) => {
    const teacher = teachers.find(t => t.id === teacherId);
    return teacher ? `${teacher.firstName} ${teacher.lastName}` : 'N/A';
  };

  const formatNumber = (value: any): string => {
    if (value === null || value === undefined || value === '') return '0.00';
    const num = typeof value === 'number' ? value : parseFloat(value);
    if (isNaN(num)) return '0.00';
    return num.toFixed(2);
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

  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-green-600 font-bold';
    if (score >= 60) return 'text-blue-600 font-bold';
    if (score >= 40) return 'text-yellow-600 font-bold';
    return 'text-red-600 font-bold';
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
          {/* Header */}
          <div className="mb-4 flex items-start justify-between border-b border-gray-200 pb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h3 className="text-xl font-semibold text-gray-900">
                  Student Scores
                </h3>
                <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                  {scores.length}
                </span>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                {studentName} - All score records
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="mb-4 flex flex-wrap gap-3">
            <button
              onClick={handleAddClick}
              className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Score
            </button>

            <button
              onClick={fetchScoresAndData}
              disabled={loading}
              className="inline-flex items-center rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>

          {/* Success Message */}
          {success && (
            <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-3">
              <div className="flex items-start gap-2">
                <svg className="mt-0.5 h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm font-medium text-green-700">{success}</p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3">
              <p className="text-sm font-medium text-red-700">{error}</p>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="flex justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
            </div>
          )}

          {/* Empty State */}
          {!loading && scores.length === 0 && (
            <div className="rounded-lg bg-gray-50 p-8 text-center">
              <div className="mb-4 text-4xl">📊</div>
              <h4 className="text-lg font-semibold text-gray-900">No Scores Yet</h4>
              <p className="mt-2 text-sm text-gray-500">
                This student doesn't have any score records yet.
              </p>
              <button
                onClick={handleAddClick}
                className="mt-4 inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add First Score
              </button>
            </div>
          )}

          {/* Scores Table */}
          {!loading && scores.length > 0 && (
            <div className="overflow-hidden rounded-lg border border-gray-200">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr className="border-b border-gray-200">
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Book
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Teacher
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Midterm
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Final
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Total
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {scores.map((score) => (
                      <tr key={score.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-900">
                            {getBookName(score.bookId)}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm text-gray-900">
                            {getTeacherName(score.teacherId)}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm font-medium text-gray-900">
                            {formatNumber(score.midtermScore)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm font-medium text-gray-900">
                            {formatNumber(score.finalScore)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-sm ${getScoreColor(parseFloat(formatNumber(score.totalScore)))}`}>
                            {formatNumber(score.totalScore)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-gray-600">
                            {formatDate(score.date)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {/* ✅ Edit Button */}
                            <button
                              onClick={() => handleEditClick(score)}
                              className="rounded bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600 hover:bg-blue-100"
                            >
                              Edit
                            </button>
                            
                            {/* ✅ Delete Button */}
                            <button
                              onClick={() => handleDeleteClick(score)}
                              disabled={deletingId === score.id}
                              className="rounded bg-red-50 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {deletingId === score.id ? 'Deleting...' : 'Delete'}
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

      {/* Score Update Modal */}
      <ScoreUpdateModal
        isOpen={showUpdateModal}
        score={scoreToUpdate}
        onClose={handleCloseUpdateModal}
        onUpdate={handleUpdateSuccess}
      />

      {/* Score Add Modal */}
      <ScoreAddModal
        isOpen={showAddModal}
        studentId={studentId}
        studentName={studentName}
        onClose={handleCloseAddModal}
        onSuccess={handleAddSuccess}
      />

      {/* ✅ Delete Confirmation Modal */}
      {showDeleteConfirm && scoreToDelete && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            {/* Header */}
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Delete Score
                </h3>
                <p className="text-sm text-gray-500">
                  Are you sure you want to delete this score?
                </p>
              </div>
            </div>

            {/* Score Details */}
            <div className="mb-6 rounded-lg bg-gray-50 p-4">
              <p className="text-sm font-medium text-gray-900">
                {getBookName(scoreToDelete.bookId)}
              </p>
              <p className="mt-1 text-sm text-gray-500">
                Teacher: {getTeacherName(scoreToDelete.teacherId)}
              </p>
              <p className="text-sm text-gray-500">
                Score: Midterm: {formatNumber(scoreToDelete.midtermScore)} | 
                Final: {formatNumber(scoreToDelete.finalScore)} | 
                Total: {formatNumber(scoreToDelete.totalScore)}
              </p>
            </div>

            <p className="mb-6 text-sm text-red-600">
              This action cannot be undone.
            </p>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleCancelDelete}
                disabled={deletingId !== null}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deletingId !== null}
                className="flex-1 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {deletingId ? "Deleting..." : "Delete Score"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default StudentScoresModal;