// src/pages/Books/AddBook.tsx
import { FormEvent, useState } from "react";
import { createBook, type CreateBookData } from "@/api/bookApi";
import { useNavigate } from "react-router-dom";

const AddBook = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState<Partial<CreateBookData>>({
    name: "",
    code: "",
    description: "",
    level: "",
    category: "",
    author: "",
    publisher: "",
    isbn: "",
    bookPrice: 0,
    durationWeeks: 0,
    totalLessons: 0,
    totalHours: 0,
    passingScore: 0,
    isActive: true,
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "number" || name === "bookPrice" ||
        name === "durationWeeks" || name === "totalLessons" ||
        name === "totalHours" || name === "passingScore"
          ? value === "" ? undefined : parseFloat(value)
          : value,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Only send fields that have values
      const submitData: Partial<CreateBookData> = {};
      
      // Only include fields that have values (not undefined, null, or empty string)
      Object.keys(formData).forEach((key) => {
        const value = formData[key as keyof CreateBookData];
        if (value !== undefined && value !== null && value !== "") {
          submitData[key as keyof CreateBookData] = value;
        }
      });

      // Make sure name is always included (it's required)
      if (!submitData.name) {
        setError("Book name is required");
        setLoading(false);
        return;
      }

      await createBook(submitData as CreateBookData);
      setSuccess("Book created successfully!");
      setTimeout(() => {
        navigate("/books/all");
      }, 1500);
    } catch (error) {
      console.error("Failed to create book:", error);
      setError(
        error instanceof Error ? error.message : "Failed to create book"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Add New Book</h1>
          <p className="mt-1 text-sm text-gray-500">
            Add a new book to the system <span className="text-red-500">*</span> indicates required field
          </p>
        </div>

        {/* Success */}
        {success && (
          <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4">
            <p className="text-sm font-medium text-green-700">{success}</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm font-medium text-red-700">{error}</p>
          </div>
        )}

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
        >
          {/* Basic Information */}
          <div className="mb-8">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Basic Information
            </h2>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {/* Name - Required */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  name="name"
                  value={formData.name || ""}
                  onChange={handleChange}
                  placeholder="Enter book name"
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
                <p className="mt-1 text-xs text-gray-500">
                  This field is required
                </p>
              </div>

              {/* Code - Optional */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Code
                </label>
                <input
                  name="code"
                  value={formData.code || ""}
                  onChange={handleChange}
                  placeholder="ENG-101"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Optional - Must be unique if provided
                </p>
              </div>

              {/* Category - Optional */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category || ""}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">Select category (optional)</option>
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

              {/* Level - Optional */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Level
                </label>
                <select
                  name="level"
                  value={formData.level || ""}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">Select level (optional)</option>
                  <option value="A1">A1 - Beginner</option>
                  <option value="A2">A2 - Elementary</option>
                  <option value="B1">B1 - Intermediate</option>
                  <option value="B2">B2 - Upper Intermediate</option>
                  <option value="C1">C1 - Advanced</option>
                  <option value="C2">C2 - Proficiency</option>
                </select>
              </div>

              {/* Author - Optional */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Author
                </label>
                <input
                  name="author"
                  value={formData.author || ""}
                  onChange={handleChange}
                  placeholder="Author name (optional)"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Publisher - Optional */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Publisher
                </label>
                <input
                  name="publisher"
                  value={formData.publisher || ""}
                  onChange={handleChange}
                  placeholder="Publisher name (optional)"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* ISBN - Optional */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  ISBN
                </label>
                <input
                  name="isbn"
                  value={formData.isbn || ""}
                  onChange={handleChange}
                  placeholder="978-0-521-67580-2 (optional)"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Optional - Must be unique if provided
                </p>
              </div>

              {/* Description - Optional */}
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description || ""}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Book description (optional)"
                  className="w-full resize-none rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>
          </div>

          {/* Pricing & Duration - All Optional */}
          <div className="mb-8 border-t border-gray-200 pt-8">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Pricing & Duration <span className="text-sm font-normal text-gray-500">(All optional)</span>
            </h2>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              {/* Book Price */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Price ($)
                </label>
                <input
                  name="bookPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.bookPrice || ""}
                  onChange={handleChange}
                  placeholder="29.99"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Duration Weeks */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Duration (Weeks)
                </label>
                <input
                  name="durationWeeks"
                  type="number"
                  min="0"
                  value={formData.durationWeeks || ""}
                  onChange={handleChange}
                  placeholder="8"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Total Lessons */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Total Lessons
                </label>
                <input
                  name="totalLessons"
                  type="number"
                  min="0"
                  value={formData.totalLessons || ""}
                  onChange={handleChange}
                  placeholder="24"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Total Hours */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Total Hours
                </label>
                <input
                  name="totalHours"
                  type="number"
                  min="0"
                  value={formData.totalHours || ""}
                  onChange={handleChange}
                  placeholder="36"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Passing Score */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Passing Score (%)
                </label>
                <input
                  name="passingScore"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.passingScore || ""}
                  onChange={handleChange}
                  placeholder="60"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="mb-8 border-t border-gray-200 pt-8">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Status</h2>
            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive !== undefined ? formData.isActive : true}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    isActive: e.target.checked,
                  }))
                }
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">
                Book is active
              </span>
            </label>
          </div>

          {/* Buttons */}
          <div className="flex flex-col-reverse gap-3 border-t border-gray-200 pt-6 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => navigate("/books/all")}
              disabled={loading}
              className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Book"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddBook;