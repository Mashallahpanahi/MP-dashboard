// src/components/books/BookUpdateModal.tsx
import { useState, useEffect } from "react";
import type { Book, UpdateBookData } from "@/api/bookApi";

interface BookUpdateModalProps {
  isOpen: boolean;
  book: Book | null;
  onClose: () => void;
  onUpdate: (id: string, data: UpdateBookData) => Promise<void>;
  isLoading?: boolean;
}

const BookUpdateModal = ({
  isOpen,
  book,
  onClose,
  onUpdate,
  isLoading = false,
}: BookUpdateModalProps) => {
  const [formData, setFormData] = useState<UpdateBookData>({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Level options for datalist
  const levelOptions = [
    "A1 - Beginner",
    "A2 - Elementary",
    "B1 - Intermediate",
    "B2 - Upper Intermediate",
    "C1 - Advanced",
    "C2 - Proficiency",
  ];

  // Reset form when book changes
  useEffect(() => {
    if (book) {
      setFormData({
        code: book.code,
        name: book.name,
        description: book.description,
        level: book.level,
        category: book.category,
        author: book.author,
        publisher: book.publisher,
        isbn: book.isbn,
        bookPrice: book.bookPrice,
        durationWeeks: book.durationWeeks,
        totalLessons: book.totalLessons,
        totalHours: book.totalHours,
        passingScore: book.passingScore,
        levelOrder: book.levelOrder,
        isActive: book.isActive,
      });
      setError("");
      setSuccess("");
    }
  }, [book]);

  if (!isOpen || !book) return null;

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value, type } = e.target;

    if (type === "number") {
      setFormData((prev) => ({
        ...prev,
        [name]: value === "" ? undefined : parseFloat(value),
      }));
    } else if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
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

    if (!book) return;

    try {
      setIsSubmitting(true);
      setError("");
      setSuccess("");

      // Only send fields that have changed
      const changedData: UpdateBookData = {};
      const keys = Object.keys(formData) as (keyof UpdateBookData)[];

      keys.forEach((key) => {
        const currentValue = formData[key];
        const originalValue = book[key as keyof Book];

        if (currentValue !== originalValue) {
          Object.assign(changedData, {
            [key]: currentValue,
          });
        }
      });

      if (Object.keys(changedData).length === 0) {
        setSuccess("No changes made.");
        setTimeout(() => {
          onClose();
          setFormData({});
          setSuccess("");
        }, 1000);
        return;
      }

      await onUpdate(book.id, changedData);

      setSuccess("Book updated successfully!");

      setTimeout(() => {
        onClose();
        setFormData({});
        setSuccess("");
      }, 1500);
    } catch (error) {
      console.error("Failed to update book:", error);
      setError(
        error instanceof Error ? error.message : "Failed to update book",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
      setFormData({});
      setError("");
      setSuccess("");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Update Book</h3>
            <p className="mt-1 text-sm text-gray-500">Edit book information</p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting || isLoading}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
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

        {/* Success Message */}
        {success && (
          <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-4">
            <p className="text-sm font-medium text-green-700">{success}</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm font-medium text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Required Information */}
          <div className="mb-6">
            <h4 className="mb-3 text-sm font-semibold text-gray-700">
              Required Information <span className="text-red-500">*</span>
            </h4>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Book Name *
                </label>
                <input
                  name="name"
                  value={formData.name || ""}
                  onChange={handleChange}
                  required
                  disabled={isLoading || isSubmitting}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Level Order *
                </label>
                <input
                  name="levelOrder"
                  type="number"
                  min="0"
                  step="1"
                  value={formData.levelOrder || ""}
                  onChange={handleChange}
                  required
                  disabled={isLoading || isSubmitting}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Duration (Weeks) *
                </label>
                <input
                  name="durationWeeks"
                  type="number"
                  min="0"
                  step="1"
                  value={formData.durationWeeks || ""}
                  onChange={handleChange}
                  required
                  disabled={isLoading || isSubmitting}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Passing Score (%) *
                </label>
                <input
                  name="passingScore"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={formData.passingScore || ""}
                  onChange={handleChange}
                  required
                  disabled={isLoading || isSubmitting}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
            </div>
          </div>

          {/* Optional Information */}
          <div className="mb-6 border-t border-gray-200 pt-6">
            <h4 className="mb-3 text-sm font-semibold text-gray-700">
              Optional Information
            </h4>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Code
                </label>
                <input
                  name="code"
                  value={formData.code || ""}
                  onChange={handleChange}
                  disabled={isLoading || isSubmitting}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  ISBN
                </label>
                <input
                  name="isbn"
                  value={formData.isbn || ""}
                  onChange={handleChange}
                  disabled={isLoading || isSubmitting}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category || ""}
                  onChange={handleChange}
                  disabled={isLoading || isSubmitting}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Select category</option>
                  <option value="Grammar">Grammar</option>
                  <option value="Vocabulary">Vocabulary</option>
                  <option value="Reading">Reading</option>
                  <option value="Writing">Writing</option>
                  <option value="Listening">Listening</option>
                  <option value="Speaking">Speaking</option>
                  <option value="IELTS">IELTS</option>
                  <option value="TOEFL">TOEFL</option>
                  <option value="Business">Business</option>
                  <option value="Academic">Academic</option>
                  <option value="Children">Children</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              {/* Level - Optional with Datalist (Type + Select) */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Level
                </label>
                <input
                  name="level"
                  type="text"
                  value={formData.level || ""}
                  onChange={handleChange}
                  placeholder="Type or select level (optional)"
                  list="level-options-update"
                  disabled={isLoading || isSubmitting}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                />
                <datalist id="level-options-update">
                  {levelOptions.map((option) => (
                    <option key={option} value={option} />
                  ))}
                </datalist>
                <p className="mt-1 text-xs text-gray-500">
                  Type any value or select from dropdown
                </p>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Author
                </label>
                <input
                  name="author"
                  value={formData.author || ""}
                  onChange={handleChange}
                  disabled={isLoading || isSubmitting}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Publisher
                </label>
                <input
                  name="publisher"
                  value={formData.publisher || ""}
                  onChange={handleChange}
                  disabled={isLoading || isSubmitting}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Price ($)
                </label>
                <input
                  name="bookPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.bookPrice ?? ""}
                  onChange={handleChange}
                  disabled={isLoading || isSubmitting}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Total Lessons
                </label>
                <input
                  name="totalLessons"
                  type="number"
                  min="0"
                  step="1"
                  value={formData.totalLessons ?? ""}
                  onChange={handleChange}
                  disabled={isLoading || isSubmitting}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Total Hours
                </label>
                <input
                  name="totalHours"
                  type="number"
                  min="0"
                  step="0.5"
                  value={formData.totalHours ?? ""}
                  onChange={handleChange}
                  disabled={isLoading || isSubmitting}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              <div className="md:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description || ""}
                  onChange={handleChange}
                  rows={2}
                  disabled={isLoading || isSubmitting}
                  className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="mb-6 border-t border-gray-200 pt-6">
            <h4 className="mb-3 text-sm font-semibold text-gray-700">Status</h4>
            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive || false}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    isActive: e.target.checked,
                  }))
                }
                disabled={isLoading || isSubmitting}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">
                Book is active
              </span>
            </label>
          </div>

          {/* Buttons */}
          <div className="flex flex-col-reverse gap-3 border-t border-gray-200 pt-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading || isSubmitting}
              className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || isSubmitting}
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading || isSubmitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookUpdateModal;
