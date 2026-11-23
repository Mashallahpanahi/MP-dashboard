// src/components/students/ScoreUpdateModal.tsx
import { useState, useEffect } from "react";
import {
  useUpdateStudentScore,
  type StudentScore,
  type UpdateStudentScoreData,
} from "@/api/scoreApi";
// ✅ Shamsi date picker
import ShamsiDatePicker from "@/utils/ShamsiDatePicker";

interface ScoreUpdateModalProps {
  isOpen: boolean;
  score: StudentScore | null;
  onClose: () => void;
  onUpdate?: () => void;
}

const ScoreUpdateModal = ({
  isOpen,
  score,
  onClose,
  onUpdate,
}: ScoreUpdateModalProps) => {
  // ✅ Hook replaces updateStudentScore + local saving/error state
  const {
    updateStudentScore,
    loading: saving,
    error: updateError,
  } = useUpdateStudentScore();

  // Local state (validation errors + success message)
  const [localError, setLocalError] = useState("");
  const [success, setSuccess] = useState("");

  // Combined error shown to the user
  const error = localError || updateError || "";

  const [formData, setFormData] = useState<UpdateStudentScoreData>({
    midtermScore: 0,
    finalScore: 0,
    totalScore: 0,
    date: "",
    time: "",
    notes: "",
  });

  // ✅ Reset form when score changes (date kept as MILADI ISO for backend)
  useEffect(() => {
    if (score) {
      const midterm =
        score.midtermScore !== null && score.midtermScore !== undefined
          ? parseFloat(String(score.midtermScore)) || 0
          : 0;
      const final =
        score.finalScore !== null && score.finalScore !== undefined
          ? parseFloat(String(score.finalScore)) || 0
          : 0;

      setFormData({
        midtermScore: midterm,
        finalScore: final,
        totalScore: midterm + final,
        date: score.date ? score.date.split("T")[0] : "",
        time: score.time || "",
        notes: score.notes || "",
      });
      setLocalError("");
      setSuccess("");
    }
  }, [score]);

  // ✅ Auto-calculate total score when midterm or final changes
  useEffect(() => {
    const midterm = formData.midtermScore || 0;
    const final = formData.finalScore || 0;
    setFormData((prev) => ({
      ...prev,
      totalScore: midterm + final,
    }));
  }, [formData.midtermScore, formData.finalScore]);

  if (!isOpen || !score) return null;

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type } = e.target;

    if (type === "number") {
      setFormData((prev) => ({
        ...prev,
        [name]: value === "" ? 0 : parseFloat(value),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");
    setSuccess("");

    // Validation
    if (
      formData.midtermScore !== undefined &&
      (formData.midtermScore < 0 || formData.midtermScore > 100)
    ) {
      setLocalError("Midterm score must be between 0 and 50");
      return;
    }

    if (
      formData.finalScore !== undefined &&
      (formData.finalScore < 0 || formData.finalScore > 100)
    ) {
      setLocalError("Final score must be between 0 and 50");
      return;
    }

    const submitData: UpdateStudentScoreData = {
      midtermScore: formData.midtermScore,
      finalScore: formData.finalScore,
      totalScore: formData.totalScore,
      date: formData.date,
      time: formData.time,
      notes: formData.notes,
    };

    const ok = await updateStudentScore(score.id, submitData);

    if (!ok) return; // error is surfaced via `error`

    setSuccess("Score updated successfully!");

    setTimeout(() => {
      if (onUpdate) onUpdate();
      onClose();
    }, 1500);
  };

  const handleClose = () => {
    if (!saving) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between border-b border-gray-200 pb-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              Update Score
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Edit score details for this student
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={saving}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <svg
              className="h-5 w-5"
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

        {success && (
          <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-3">
            <div className="flex items-start gap-2">
              <svg
                className="mt-0.5 h-5 w-5 text-green-600"
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
              <p className="text-sm font-medium text-green-700">{success}</p>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3">
            <div className="flex items-start gap-2">
              <svg
                className="mt-0.5 h-5 w-5 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-sm font-medium text-red-700">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Scores Grid */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Midterm Score
              </label>
              <input
                type="number"
                name="midtermScore"
                value={formData.midtermScore ?? ""}
                onChange={handleInputChange}
                min="0"
                max="100"
                step="0.01"
                placeholder="0-50"
                disabled={saving}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Final Score
              </label>
              <input
                type="number"
                name="finalScore"
                value={formData.finalScore ?? ""}
                onChange={handleInputChange}
                min="0"
                max="100"
                step="0.01"
                placeholder="0-50"
                disabled={saving}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Total Score
              </label>
              <input
                type="number"
                name="totalScore"
                value={formData.totalScore ?? 0}
                disabled
                className="w-full cursor-not-allowed rounded-lg border border-gray-200 bg-gray-100 px-3 py-2 text-sm text-gray-700"
              />
              <p className="mt-1 text-xs text-gray-400">
                Auto-calculated: Midterm + Final
              </p>
            </div>
          </div>

          {/* ✅ Date and Time — Shamsi date picker */}
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Date
              </label>
              <ShamsiDatePicker
                value={formData.date || ""}
                onChange={(miladiISO) =>
                  setFormData((prev) => ({ ...prev, date: miladiISO }))
                }
                placeholder="انتخاب تاریخ"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Time
              </label>
              <input
                type="text"
                name="time"
                value={formData.time || ""}
                onChange={handleInputChange}
                placeholder="e.g., 3-4 PM"
                disabled={saving}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="mt-4">
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes || ""}
              onChange={handleInputChange}
              rows={3}
              placeholder="Additional notes (optional)"
              disabled={saving}
              className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          {/* Buttons */}
          <div className="mt-6 flex gap-3 border-t border-gray-200 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
            <button
              type="button"
              onClick={handleClose}
              disabled={saving}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ScoreUpdateModal;
