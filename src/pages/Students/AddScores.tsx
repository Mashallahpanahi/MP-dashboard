// src/pages/Students/AddScores.tsx
import { useEffect, useState, useMemo } from "react";
import {
  findStudentsForScoring,
  bulkUpdateStudentScores,
  type StudentForScoring,
} from "@/api/studentApi";
import { getTeachers, type Teacher } from "@/api/teacherApi";
import { getBooks, type Book } from "@/api/bookApi";
import { getClasses, type Class } from "@/api/classApi";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// ============================================
// HELPERS
// ============================================
const getImageUrl = (imagePath: string | null | undefined) => {
  if (!imagePath) return null;
  if (imagePath.startsWith("http")) return imagePath;
  return `${API_URL}${imagePath}`;
};

const getResultBadge = (result: string) => {
  switch (result) {
    case "Passed":
      return "bg-green-100 text-green-700 ring-1 ring-green-200";
    case "Failed":
      return "bg-red-100 text-red-700 ring-1 ring-red-200";
    case "In Progress":
      return "bg-blue-100 text-blue-700 ring-1 ring-blue-200";
    default:
      return "bg-gray-100 text-gray-700 ring-1 ring-gray-200";
  }
};

// ============================================
// MAIN PAGE
// ============================================
const AddScores = () => {
  // Dropdown data
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loadingDropdowns, setLoadingDropdowns] = useState(true);

  // Filters
  const [teacherId, setTeacherId] = useState("");
  const [bookId, setBookId] = useState("");
  const [classId, setClassId] = useState("");
  const [time, setTime] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // Result
  const [students, setStudents] = useState<StudentForScoring[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  // Loading / messages
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Inline edit state
  const [editedScores, setEditedScores] = useState<
    Record<string, { midterm: string; final: string }>
  >({});

  // Row-level saving state
  const [savingId, setSavingId] = useState<string | null>(null);

  // ============================================
  // FETCH DROPDOWNS
  // ============================================
  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        setLoadingDropdowns(true);
        const [teachersData, booksData, classesData] = await Promise.all([
          getTeachers(),
          getBooks(),
          getClasses(),
        ]);
        setTeachers(teachersData.filter((t) => t.isActive));
        setBooks(booksData.filter((b) => b.isActive));
        setClasses(classesData);
      } catch (err) {
        console.error("Failed to load dropdowns:", err);
      } finally {
        setLoadingDropdowns(false);
      }
    };
    fetchDropdowns();
  }, []);

  // ============================================
  // FETCH STUDENTS
  // ============================================
  const handleFindStudents = async () => {
    if (!teacherId || !bookId) {
      setError("Please select both a teacher and a book");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");
      setHasSearched(true);

      const response = await findStudentsForScoring({
        teacherId,
        bookId,
        classId: classId || undefined,
        time: time || undefined,
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
      });

      if (response.success) {
        setStudents(response.data);

        const init: Record<string, { midterm: string; final: string }> = {};
        response.data.forEach((s) => {
          init[s.enrollmentId] = {
            midterm:
              s.midtermScore !== null && s.midtermScore !== undefined
                ? String(s.midtermScore)
                : "",
            final:
              s.finalScore !== null && s.finalScore !== undefined
                ? String(s.finalScore)
                : "",
          };
        });
        setEditedScores(init);
      }
    } catch (err) {
      console.error("Failed to find students:", err);
      setError(err instanceof Error ? err.message : "Failed to find students");
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setTeacherId("");
    setBookId("");
    setClassId("");
    setTime("");
    setFromDate("");
    setToDate("");
    setStudents([]);
    setEditedScores({});
    setHasSearched(false);
    setError("");
    setSuccess("");
  };

  // ============================================
  // INLINE SCORE EDITING
  // ============================================
  const updateScoreField = (
    enrollmentId: string,
    field: "midterm" | "final",
    value: string
  ) => {
    if (value !== "" && !/^\d*\.?\d*$/.test(value)) return;

    setEditedScores((prev) => ({
      ...prev,
      [enrollmentId]: {
        ...(prev[enrollmentId] || { midterm: "", final: "" }),
        [field]: value,
      },
    }));
  };

  const computeTotal = (enrollmentId: string): number | null => {
    const edit = editedScores[enrollmentId];
    if (!edit) return null;
    const m = edit.midterm === "" ? null : parseFloat(edit.midterm);
    const f = edit.final === "" ? null : parseFloat(edit.final);
    if (m === null && f === null) return null;
    return (m || 0) + (f || 0);
  };

  // ============================================
  // SAVE ROW
  // ============================================
  const handleSaveRow = async (student: StudentForScoring) => {
    const edit = editedScores[student.enrollmentId];
    if (!edit) return;

    const midterm = edit.midterm === "" ? null : parseFloat(edit.midterm);
    const finalScore = edit.final === "" ? null : parseFloat(edit.final);

    if (midterm === null && finalScore === null) {
      setError("Please enter at least one score (midterm or final)");
      return;
    }
    if (midterm !== null && (midterm < 0 || midterm > 100)) {
      setError("Midterm score must be between 0 and 100");
      return;
    }
    if (finalScore !== null && (finalScore < 0 || finalScore > 100)) {
      setError("Final score must be between 0 and 100");
      return;
    }

    try {
      setSavingId(student.enrollmentId);
      setError("");
      setSuccess("");

      const response = await bulkUpdateStudentScores([
        {
          studentId: student.studentId,
          bookId: student.bookId,
          teacherId: student.teacherId,
          midtermScore: midterm,
          finalScore: finalScore,
          notes: "",
        },
      ]);

      setSuccess(
        response.message ||
          `Score saved for ${student.studentName} ${student.studentLastName}`
      );

      setStudents((prev) =>
        prev.map((s) =>
          s.enrollmentId === student.enrollmentId
            ? {
                ...s,
                midtermScore: midterm,
                finalScore: finalScore,
                totalScore:
                  midterm !== null || finalScore !== null
                    ? (midterm || 0) + (finalScore || 0)
                    : null,
                scoreId: s.scoreId || "temp",
                result:
                  finalScore !== null
                    ? (midterm || 0) + finalScore >= s.passingScore
                      ? "Passed"
                      : "Failed"
                    : s.result,
                enrollmentStatus:
                  finalScore !== null ? "Completed" : s.enrollmentStatus,
              }
            : s
        )
      );
    } catch (err) {
      console.error("Failed to save score:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to save score. Please try again."
      );
    } finally {
      setSavingId(null);
    }
  };

  // ============================================
  // SAVE ALL
  // ============================================
  const handleSaveAll = async () => {
    if (students.length === 0) return;

    const scores: {
      studentId: string;
      bookId: string;
      teacherId: string;
      midtermScore: number | null;
      finalScore: number | null;
      notes: string;
    }[] = [];

    const invalid: string[] = [];

    for (const s of students) {
      const edit = editedScores[s.enrollmentId];
      if (!edit) continue;

      const m = edit.midterm === "" ? null : parseFloat(edit.midterm);
      const f = edit.final === "" ? null : parseFloat(edit.final);

      if (m === null && f === null) continue;

      if (
        (m !== null && (m < 0 || m > 100)) ||
        (f !== null && (f < 0 || f > 100))
      ) {
        invalid.push(`${s.studentName} ${s.studentLastName}`);
        continue;
      }

      scores.push({
        studentId: s.studentId,
        bookId: s.bookId,
        teacherId: s.teacherId,
        midtermScore: m,
        finalScore: f,
        notes: "",
      });
    }

    if (invalid.length > 0) {
      setError(`Invalid scores for: ${invalid.join(", ")}`);
      return;
    }
    if (scores.length === 0) {
      setError("Please enter at least one score before saving");
      return;
    }

    try {
      setSavingId("__ALL__");
      setError("");
      setSuccess("");

      const response = await bulkUpdateStudentScores(scores);

      setSuccess(
        response.message ||
          `Successfully saved ${scores.length} score${
            scores.length !== 1 ? "s" : ""
          }`
      );

      await handleFindStudents();
    } catch (err) {
      console.error("Failed to save all scores:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to save scores. Please try again."
      );
    } finally {
      setSavingId(null);
    }
  };

  // ============================================
  // DERIVED
  // ============================================
  const hasResults = hasSearched && students.length > 0;
  const noResults = hasSearched && !loading && students.length === 0;
  const canSearch = useMemo(() => !!teacherId && !!bookId, [teacherId, bookId]);

  const rowsWithInput = useMemo(() => {
    return students.filter((s) => {
      const edit = editedScores[s.enrollmentId];
      if (!edit) return false;
      return edit.midterm !== "" || edit.final !== "";
    }).length;
  }, [students, editedScores]);

  return (
    <div className="p-6">
      {/* ============================================ */}
      {/* HEADER */}
      {/* ============================================ */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Add Students Scores</h1>
        <p className="mt-1 text-sm text-gray-500">
          Find students by teacher, book and class, then enter their scores
        </p>
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4">
          <div className="flex items-start gap-2">
            <svg
              className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600"
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
      {success && (
        <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-4">
          <div className="flex items-start gap-2">
            <svg
              className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <p className="text-sm font-medium text-green-700">{success}</p>
          </div>
        </div>
      )}

      {/* ============================================ */}
      {/* FILTERS */}
      {/* ============================================ */}
      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-base font-semibold text-gray-900">Filters</h2>

        {loadingDropdowns ? (
          <div className="flex justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {/* Teacher */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Teacher <span className="text-red-500">*</span>
                </label>
                <select
                  value={teacherId}
                  onChange={(e) => setTeacherId(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">Select teacher</option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.firstName} {t.lastName || ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* Book */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Book <span className="text-red-500">*</span>
                </label>
                <select
                  value={bookId}
                  onChange={(e) => setBookId(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">Select book</option>
                  {books.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                      {b.code ? ` (${b.code})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* Class */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Class{" "}
                  <span className="text-xs font-normal text-gray-400">
                    (optional)
                  </span>
                </label>
                <select
                  value={classId}
                  onChange={(e) => setClassId(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">Any class</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                      {c.block ? ` - ${c.block}` : ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* Time */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Time{" "}
                  <span className="text-xs font-normal text-gray-400">
                    (optional)
                  </span>
                </label>
                <input
                  type="text"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  placeholder='e.g., "4-6"'
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* From Date */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  From Date{" "}
                  <span className="text-xs font-normal text-gray-400">
                    (optional)
                  </span>
                </label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* To Date */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  To Date{" "}
                  <span className="text-xs font-normal text-gray-400">
                    (optional)
                  </span>
                </label>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            <div className="mt-5 flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={handleClear}
                disabled={loading}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={handleFindStudents}
                disabled={loading || !canSearch}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Searching..." : "Find Students"}
              </button>
            </div>
          </>
        )}
      </div>

      {/* ============================================ */}
      {/* NO RESULTS */}
      {/* ============================================ */}
      {noResults && (
        <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-10 text-center">
          <h3 className="text-base font-semibold text-gray-900">
            No students found
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            Try adjusting the filters above.
          </p>
        </div>
      )}

      {/* ============================================ */}
      {/* RESULTS TABLE */}
      {/* ============================================ */}
      {hasResults && (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          {/* ✅ HEADER BAR — Save All on LEFT, info on RIGHT */}
          <div className="flex flex-col items-start justify-between gap-3 border-b border-gray-200 bg-gray-50 px-5 py-3 sm:flex-row sm:items-center">
            {/* LEFT: Save All button */}
            <button
              type="button"
              onClick={handleSaveAll}
              disabled={savingId !== null || rowsWithInput === 0}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {savingId === "__ALL__" ? (
                <>
                  <svg
                    className="h-4 w-4 animate-spin"
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
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Saving All...
                </>
              ) : (
                <>💾 Save All ({rowsWithInput})</>
              )}
            </button>

            {/* RIGHT: info text */}
            <p className="text-sm text-gray-700">
              Found <strong>{students.length}</strong> student
              {students.length !== 1 ? "s" : ""}
              {rowsWithInput > 0 && (
                <span className="ml-2 text-xs text-blue-600">
                  · {rowsWithInput} edited
                </span>
              )}
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] border-collapse">
              <thead className="bg-gray-50">
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-500">
                    #
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-500">
                    Student Name
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-500">
                    Teacher Name
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-500">
                    Class / Time
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-500">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-gray-500">
                    Midterm
                  </th>
                  <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-gray-500">
                    Final
                  </th>
                  <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-gray-500">
                    Total
                  </th>
                  <th className="px-4 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-gray-500">
                    Save
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100 bg-white">
                {students.map((s, idx) => {
                  const edit = editedScores[s.enrollmentId] || {
                    midterm: "",
                    final: "",
                  };
                  const total = computeTotal(s.enrollmentId);
                  const isSaving = savingId === s.enrollmentId;
                  const anySaving = savingId !== null;
                  const isExisting = !!s.scoreId;

                  return (
                    <tr
                      key={s.enrollmentId}
                      className={`transition ${
                        idx % 2 === 0 ? "bg-white" : "bg-slate-50/40"
                      } hover:bg-blue-50/40`}
                    >
                      {/* # */}
                      <td className="px-4 py-3 text-xs text-gray-500">
                        {idx + 1}
                      </td>

                      {/* ✅ Student Full Name */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {s.studentImage ? (
                            <img
                              src={getImageUrl(s.studentImage) || ""}
                              alt={s.studentName}
                              className="h-9 w-9 rounded-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                              }}
                            />
                          ) : (
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-700">
                              {s.studentName?.charAt(0) || "?"}
                              {s.studentLastName?.charAt(0) || ""}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-gray-900">
                              {s.studentName} {s.studentLastName}
                            </p>
                            <p className="text-[11px] text-gray-500">
                              {s.studentNumber || "No ID"}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* ✅ Teacher Name */}
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-gray-900">
                          {s.teacherName} {s.teacherLastName}
                        </p>
                      </td>

                      {/* Class / Time */}
                     {/* Class / Time */}
                        <td className="px-4 py-3">
                        <p className="text-sm text-gray-900">
                            {s.classBlock || "—"}
                        </p>
                        <p className="text-[11px] text-gray-500">
                            {s.time || "—"}
                        </p>
                        </td>

                      {/* Status badge */}
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${getResultBadge(
                            s.result
                          )}`}
                        >
                          {s.result}
                        </span>
                      </td>

                      {/* Midterm */}
                      <td className="px-4 py-3 text-right">
                        <input
                          type="text"
                          inputMode="decimal"
                          value={edit.midterm}
                          onChange={(e) =>
                            updateScoreField(
                              s.enrollmentId,
                              "midterm",
                              e.target.value
                            )
                          }
                          placeholder="—"
                          disabled={anySaving}
                          className="w-20 rounded-lg border border-gray-300 px-2 py-1.5 text-right text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-50 disabled:opacity-60"
                        />
                      </td>

                      {/* Final */}
                      <td className="px-4 py-3 text-right">
                        <input
                          type="text"
                          inputMode="decimal"
                          value={edit.final}
                          onChange={(e) =>
                            updateScoreField(
                              s.enrollmentId,
                              "final",
                              e.target.value
                            )
                          }
                          placeholder="—"
                          disabled={anySaving}
                          className="w-20 rounded-lg border border-gray-300 px-2 py-1.5 text-right text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-50 disabled:opacity-60"
                        />
                      </td>

                      {/* Total */}
                      <td className="px-4 py-3 text-right">
                        {total !== null ? (
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ${
                              total >= s.passingScore
                                ? "bg-green-100 text-green-700 ring-1 ring-green-200"
                                : "bg-yellow-100 text-yellow-700 ring-1 ring-yellow-200"
                            }`}
                          >
                            {total.toFixed(1)}
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>

                      {/* Save */}
                      <td className="px-4 py-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleSaveRow(s)}
                          disabled={anySaving}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {isSaving ? (
                            <>
                              <svg
                                className="h-3.5 w-3.5 animate-spin"
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
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                                />
                              </svg>
                              Saving
                            </>
                          ) : isExisting ? (
                            "Update"
                          ) : (
                            "Save"
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddScores;