// src/pages/Students/PrintResultCard.tsx
import { useEffect, useState, useMemo, useRef } from "react";
import {
  findStudentsForScoring,
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

const getInitials = (first?: string, last?: string) =>
  `${first?.charAt(0) || "?"}${last?.charAt(0) || ""}`.toUpperCase();

const formatDate = (dateStr: string | undefined): string => {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
};

// ============================================
// RESULT CARD (one per student)
// ============================================
interface ResultCardProps {
  student: StudentForScoring;
}

// ============================================
// RESULT CARD (one per student)
// ============================================
interface ResultCardProps {
  student: StudentForScoring;
}

const ResultCard = ({ student }: ResultCardProps) => {
  const midterm =
    student.midtermScore !== null && student.midtermScore !== undefined
      ? Number(student.midtermScore)
      : null;
  const final =
    student.finalScore !== null && student.finalScore !== undefined
      ? Number(student.finalScore)
      : null;
  const total =
    student.totalScore !== null && student.totalScore !== undefined
      ? Number(student.totalScore)
      : midterm !== null || final !== null
      ? (midterm || 0) + (final || 0)
      : null;
  const passed = total !== null && total >= student.passingScore;

  // Dynamic message based on result
  const message = passed
    ? `You have shown remarkable dedication and a genuine love for learning. Your hard work in "${student.bookName}" has truly paid off, and your achievement is something to be proud of. Keep shining and continue to inspire those around you with your commitment and passion for knowledge.`
    : `Every step you take is a step toward growth. Although this chapter has come to a close, your journey is far from over. Use this experience as fuel for the next challenge — with persistence and a willing heart, success will surely follow.`;

  return (
    <div
      className="result-card relative mx-auto aspect-[1.414/1] w-full max-w-[900px] overflow-hidden rounded-sm bg-white shadow-xl print:shadow-none"
      style={{
        pageBreakAfter: "always",
        breakAfter: "page",
      }}
    >
      {/* ---------- DECORATIVE BORDER ---------- */}
      {/* Outer gold border */}
      <div className="pointer-events-none absolute inset-0 z-20 border-[3px] border-amber-500" />
      {/* Inner navy border */}
      <div className="pointer-events-none absolute inset-[8px] z-20 border border-blue-900/60" />
      {/* Corner accents */}
      <div className="pointer-events-none absolute left-0 top-0 z-20 h-16 w-16 border-l-4 border-t-4 border-amber-500" />
      <div className="pointer-events-none absolute right-0 top-0 z-20 h-16 w-16 border-r-4 border-t-4 border-amber-500" />
      <div className="pointer-events-none absolute bottom-0 left-0 z-20 h-16 w-16 border-b-4 border-l-4 border-amber-500" />
      <div className="pointer-events-none absolute bottom-0 right-0 z-20 h-16 w-16 border-b-4 border-r-4 border-amber-500" />

      {/* ---------- BLUE CURVED SHAPE (bottom-right) ---------- */}
     {/* ---------- BLUE CURVED SHAPE (bottom-right, subtle) ---------- */}
<div className="pointer-events-none absolute -bottom-32 -right-32 z-0 h-[320px] w-[320px] rounded-full bg-gradient-to-br from-blue-700 to-blue-900 opacity-40" />
<div className="pointer-events-none absolute -bottom-24 -right-24 z-0 h-[260px] w-[260px] rounded-full bg-gradient-to-br from-amber-400 to-amber-600 opacity-25" />
<div className="pointer-events-none absolute -bottom-16 -right-16 z-0 h-[200px] w-[200px] rounded-full bg-gradient-to-br from-blue-800 to-blue-950 opacity-50" />
      {/* ---------- STUDENT PHOTO (top-right, replacing the seal) ---------- */}
      <div className="absolute right-10 top-16 z-30">
        {student.studentImage ? (
          <div className="relative">
            {/* Gold ring around photo */}
            <div className="absolute -inset-1 rounded-lg bg-gradient-to-br from-amber-300 via-amber-500 to-amber-700 opacity-90" />
            <div className="relative h-32 w-24 overflow-hidden rounded-md border-2 border-white shadow-md">
              <img
                src={getImageUrl(student.studentImage) || ""}
                alt={`${student.studentName} ${student.studentLastName}`}
                className="h-full w-full object-cover"
                crossOrigin="anonymous"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            </div>
          </div>
        ) : (
          <div className="flex h-28 w-24 items-center justify-center rounded-md bg-gradient-to-br from-blue-100 to-blue-200 text-2xl font-bold text-blue-700 shadow-lg ring-2 ring-amber-400">
            {getInitials(student.studentName, student.studentLastName)}
          </div>
        )}
      </div>

      {/* ---------- CONTENT ---------- */}
      <div className="relative z-10 flex h-full flex-col px-16 py-12">
        {/* Title */}
        <div className="mb-6 max-w-[540px]">
          <h1
            className="text-6xl font-bold tracking-widest text-blue-900"
            style={{ fontFamily: "Cinzel, serif" }}
          >
            CERTIFICATE
          </h1>
          <p
            className="mt-2 text-2xl font-semibold tracking-[0.35em] text-amber-600"
            style={{ fontFamily: "Cinzel, serif" }}
          >
            OF APPRECIATION
          </p>
        </div>

        {/* Presented to */}
        <p className="text-sm font-bold uppercase tracking-widest text-blue-900">
          This certificate is proudly presented to:
        </p>

        {/* Student name (cursive) */}
        <div className="mt-6">
          <h2
            className="max-w-[600px] text-6xl leading-tight text-blue-900"
            style={{ fontFamily: "'Great Vibes', cursive" }}
          >
            {student.studentName} {student.studentLastName}
          </h2>
          <div className="mt-2 h-[2px] w-[420px] bg-gradient-to-r from-amber-600 via-amber-400 to-transparent" />
        </div>

        {/* Score & result (NO passing score shown) */}
        <div className="mt-6 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-900">
              Score:
            </span>
            <span
              className={`text-3xl font-bold ${
                passed ? "text-emerald-600" : "text-red-600"
              }`}
            >
              {total !== null ? total.toFixed(1) : "—"}
            </span>
          </div>
         <div className="h-6 w-px bg-gray-300" />
<span
  className={`text-sm font-bold uppercase tracking-widest ${
    passed ? "text-emerald-600" : "text-red-600"
  }`}
>
  {passed ? "✓ Passed" : " Not Passed"}
</span>
        </div>

        {/* Book / Teacher info */}
        <div className="mt-3 text-xs text-gray-600">
          <span className="font-semibold text-blue-900">
            {student.bookName}
          </span>{" "}
          · Taught by{" "}
          <span className="font-semibold">
            {student.teacherName} {student.teacherLastName}
          </span>
        </div>

        {/* Message */}
        <p
          className="mt-6 max-w-[600px] text-[13px] leading-relaxed text-gray-700"
          style={{ fontFamily: "Inter, sans-serif" }}
        >
          {message}
        </p>

        {/* ---------- FOOTER: DATE / SIGNATURE ---------- */}
        <div className="mt-auto flex items-end justify-between pt-8">
          {/* Date */}
          {/* Date */}
<div className="text-center">
  <div className="mb-1 h-[2px] w-40 bg-amber-500" />
  <p className="text-xs font-bold uppercase tracking-widest text-blue-900">
              {new Date().toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </p>
            <p className="mt-1 text-[10px] uppercase tracking-widest text-gray-500">
              Date
            </p>
          </div>

          {/* Student number (center, small) */}
          <div className="text-center">
            <p className="text-xs font-semibold text-gray-700">
              {student.studentNumber || "—"}
            </p>
            <p className="mt-0.5 text-[10px] uppercase tracking-widest text-gray-500">
              Student No.
            </p>
          </div>

          {/* Signature */}
        {/* Signature */}
<div className="text-center">
  <div className="mb-1 mt-14 h-[1px] w-40 bg-amber-500" />
  <p
    className="text-lg text-blue-900"
    style={{ fontFamily: "'Great Vibes', cursive" }}
  >
    School Director
  </p>
            <p className="mt-0.5 text-[10px] uppercase tracking-widest text-gray-500">
              Signature
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
// ============================================
// MAIN PAGE
// ============================================
const PrintResultCard = () => {
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

  // Results
  const [students, setStudents] = useState<StudentForScoring[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  // Loading / messages
  const [loading, setLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [error, setError] = useState("");

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
      setHasSearched(true);

      const response = await findStudentsForScoring({
        teacherId,
        bookId,
        classId: classId || undefined,
        time: time || undefined,
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
      });

      if (response.success) setStudents(response.data);
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
    setHasSearched(false);
    setError("");
  };

  // ============================================
  // PRINT
  // ============================================
  const handlePrint = () => {
    window.print();
  };

  // ============================================
  // DOWNLOAD AS PDF
  // ============================================
  const handleDownloadPDF = async () => {
    if (students.length === 0) return;

    try {
      setPdfLoading(true);
      const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
        import("jspdf"),
        import("html2canvas"),
      ]);

      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      const cards = document.querySelectorAll<HTMLElement>(".result-card");
      if (cards.length === 0) return;

      for (let i = 0; i < cards.length; i++) {
        const card = cards[i];
        const canvas = await html2canvas(card, {
          scale: 2,
          useCORS: true,
          backgroundColor: "#ffffff",
          logging: false,
        });

        const imgData = canvas.toDataURL("image/jpeg", 0.95);

        const pageW = pdf.internal.pageSize.getWidth();
        const pageH = pdf.internal.pageSize.getHeight();

        if (i > 0) pdf.addPage();

        // Fit card to page with margin
        const margin = 8;
        const availW = pageW - margin * 2;
        const availH = pageH - margin * 2;
        const ratio = Math.min(availW / canvas.width, availH / canvas.height);
        const imgW = canvas.width * ratio;
        const imgH = canvas.height * ratio;
        const x = (pageW - imgW) / 2;
        const y = (pageH - imgH) / 2;

        pdf.addImage(imgData, "JPEG", x, y, imgW, imgH, undefined, "FAST");
      }

      // Save
      const fileName = `result-cards-${new Date()
        .toISOString()
        .slice(0, 10)}.pdf`;
      pdf.save(fileName);
    } catch (err) {
      console.error("Failed to generate PDF:", err);
      setError(
        err instanceof Error ? err.message : "Failed to generate PDF"
      );
    } finally {
      setPdfLoading(false);
    }
  };

  // ============================================
  // DERIVED
  // ============================================
  const hasResults = hasSearched && students.length > 0;
  const noResults = hasSearched && !loading && students.length === 0;
  const canSearch = useMemo(() => !!teacherId && !!bookId, [teacherId, bookId]);

  return (
    <div className="p-6">
      {/* ============================================ */}
      {/* HEADER (screen only) */}
      {/* ============================================ */}
      <div className="mb-6 print:hidden">
        <h1 className="text-2xl font-bold text-gray-900">Print Result Card</h1>
        <p className="mt-1 text-sm text-gray-500">
          چاپ نمودن ریزلت کارت — Print or download PDF (one page per student)
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 print:hidden">
          <p className="text-sm font-medium text-red-700">{error}</p>
        </div>
      )}

      {/* ============================================ */}
      {/* FILTERS (screen only) */}
      {/* ============================================ */}
      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm print:hidden">
        <h2 className="mb-4 text-base font-semibold text-gray-900">Filters</h2>

        {loadingDropdowns ? (
          <div className="flex justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
        <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-10 text-center print:hidden">
          <h3 className="text-base font-semibold text-gray-900">
            No students found
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            Try adjusting the filters above.
          </p>
        </div>
      )}

      {/* ============================================ */}
      {/* ACTION BUTTONS (screen only) */}
      {/* ============================================ */}
      {hasResults && (
        <div className="mb-6 flex flex-wrap items-center gap-3 print:hidden">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-800 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-900"
          >
            🖨️ Print All Cards ({students.length})
          </button>
          <button
            type="button"
            onClick={handleDownloadPDF}
            disabled={pdfLoading}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pdfLoading ? (
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
                Generating PDF...
              </>
            ) : (
              <>📄 Download PDF ({students.length})</>
            )}
          </button>
        </div>
      )}

      {/* ============================================ */}
      {/* RESULT CARDS (one per student, one per page) */}
      {/* ============================================ */}
      {hasResults && (
        <div id="print-area" className="space-y-10 print:space-y-0">
          {students.map((student) => (
            <ResultCard key={student.enrollmentId} student={student} />
          ))}
        </div>
      )}
    </div>
  );
};

export default PrintResultCard;