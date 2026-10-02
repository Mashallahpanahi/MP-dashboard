// src/components/dashboard/GenerateReportModal.tsx
import { useEffect, useRef, useState } from "react";
import {
  getDashboardReportByMonth,
  type DashboardByMonthResponse,
} from "@/api/dashboardApi";
// ✅ Shamsi helpers
import ShamsiDatePicker from "@/utils/ShamsiDatePicker";
import {
  formatShamsi,
  convertToShamsi,
  convertToMillady,
  SHAMSI_MONTHS,
} from "@/utils/dateConverter";

interface GenerateReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  fromDate?: string;
  toDate?: string;
}

// ============================================
// HELPERS
// ============================================
const formatCurrency = (v: number | undefined): string => {
  if (v === undefined || v === null) return "AF 0.00";
  return `AF ${Number(v).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const formatNumber = (v: number | undefined): string =>
  Number(v || 0).toLocaleString("en-US");

// ============================================
// COMPONENT
// ============================================
const GenerateReportModal = ({
  isOpen,
  onClose,
  fromDate: initialFromDate,
  toDate: initialToDate,
}: GenerateReportModalProps) => {
  const [mode, setMode] = useState<"month" | "range">("month");

  const todayShamsi = convertToShamsi(new Date());
  const [shamsiMonth, setShamsiMonth] = useState<number>(todayShamsi.month);
  const [shamsiYear, setShamsiYear] = useState<number>(todayShamsi.year);

  const [rangeFrom, setRangeFrom] = useState<string>(initialFromDate || "");
  const [rangeTo, setRangeTo] = useState<string>(initialToDate || "");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [report, setReport] = useState<DashboardByMonthResponse | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);

  const reportRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !pdfLoading) onClose();
    };
    if (isOpen) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose, pdfLoading]);

  // Reset when opened
  useEffect(() => {
    if (isOpen) {
      setMode("month");
      setShamsiMonth(todayShamsi.month);
      setShamsiYear(todayShamsi.year);
      setRangeFrom(initialFromDate || "");
      setRangeTo(initialToDate || "");
      setLoading(false);
      setError("");
      setReport(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!isOpen) return null;

  // ============================================
  // SHAMSI → MILADI
  // ============================================
  const convertShamsiMonthYearToMiladi = (
    shYear: number,
    shMonth: number
  ): { month: number; year: number } => {
    try {
      const m = convertToMillady({
        year: shYear,
        month: shMonth,
        day: 15,
      });
      return { month: m.month, year: m.year };
    } catch (err) {
      console.warn("convertToMillady failed:", err);
      return { month: shMonth, year: shYear };
    }
  };

  // ============================================
  // GENERATE
  // ============================================
  const handleGenerate = async () => {
    try {
      setLoading(true);
      setError("");
      setReport(null);

      if (mode === "range") {
        if (!rangeFrom || !rangeTo) {
          setError("Please pick both From and To dates.");
          setLoading(false);
          return;
        }
        if (rangeFrom > rangeTo) {
          setError("From date must be before To date.");
          setLoading(false);
          return;
        }
      }

      let response: DashboardByMonthResponse;

      if (mode === "range") {
        response = await getDashboardReportByMonth({
          fromDate: rangeFrom,
          toDate: rangeTo,
        });
      } else {
        const miladi = convertShamsiMonthYearToMiladi(shamsiYear, shamsiMonth);
        response = await getDashboardReportByMonth({
          month: miladi.month,
          year: miladi.year,
        });
      }

      setReport(response);
    } catch (err) {
      console.error("Failed to generate report:", err);
      setError(
        err instanceof Error ? err.message : "Failed to generate report"
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // DOWNLOAD PDF
  // ============================================
  const handleDownloadPDF = async () => {
    if (!reportRef.current || !report) return;

    try {
      setPdfLoading(true);
      const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
        import("jspdf"),
        import("html2canvas"),
      ]);

      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.95);

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();

      const imgW = pageW;
      const imgH = (canvas.height * imgW) / canvas.width;

      let heightLeft = imgH;
      let position = 0;

      pdf.addImage(imgData, "JPEG", 0, position, imgW, imgH, undefined, "FAST");
      heightLeft -= pageH;

      while (heightLeft > 0) {
        position -= pageH;
        pdf.addPage();
        pdf.addImage(
          imgData,
          "JPEG",
          0,
          position,
          imgW,
          imgH,
          undefined,
          "FAST"
        );
        heightLeft -= pageH;
      }

      const name =
        report.filters.mode === "range"
          ? `Report-${report.filters.fromDate}-to-${report.filters.toDate}`
          : `Report-${report.filters.monthName}-${report.filters.year}`;

      pdf.save(`${name}.pdf`);
    } catch (err) {
      console.error("Failed to download PDF:", err);
      setError(err instanceof Error ? err.message : "Failed to download PDF");
    } finally {
      setPdfLoading(false);
    }
  };

  // ============================================
  // RENDER
  // ============================================
  const data = report?.data;
  const filters = report?.filters;

  const periodLabel = filters
    ? filters.mode === "range"
      ? "Custom Range Report"
      : `${filters.monthName} ${filters.year} Report`
    : "";

  const rangeLabel =
    filters?.fromDate && filters?.toDate
      ? `${formatShamsi(filters.fromDate, "YYYY/MM/DD")} → ${formatShamsi(
          filters.toDate,
          "YYYY/MM/DD"
        )}`
      : "";

  const generatedOn = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  // ✅ Benefit / loss logic
  const isBenefit = (data?.totalBenefit ?? 0) >= 0;
  const resultLabel = isBenefit ? "(Benefit)" : "(Loss)";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={pdfLoading ? undefined : onClose}
    >
      <div
        className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
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
                  d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Generate Report
              </h3>
              <p className="text-xs text-gray-500">
                Pick a month or a date range, then generate
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={pdfLoading}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
            title="Close"
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

        {/* BODY */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {/* Mode toggle */}
          <div className="mb-4">
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Report Period
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setMode("month")}
                disabled={loading}
                className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
                  mode === "month"
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-300 text-gray-700 hover:bg-gray-50"
                } disabled:cursor-not-allowed disabled:opacity-50`}
              >
                By Month
              </button>
              <button
                type="button"
                onClick={() => setMode("range")}
                disabled={loading}
                className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
                  mode === "range"
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-300 text-gray-700 hover:bg-gray-50"
                } disabled:cursor-not-allowed disabled:opacity-50`}
              >
                By Date Range
              </button>
            </div>
          </div>

          {/* Month picker */}
          {mode === "month" && (
            <div className="mb-4 grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Month (Shamsi)
                </label>
                <select
                  value={shamsiMonth}
                  onChange={(e) => setShamsiMonth(Number(e.target.value))}
                  disabled={loading}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {SHAMSI_MONTHS.map((label, i) => (
                    <option key={i + 1} value={i + 1}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Year
                </label>
                <input
                  type="number"
                  value={shamsiYear}
                  onChange={(e) => setShamsiYear(Number(e.target.value) || 0)}
                  min={1300}
                  max={1500}
                  disabled={loading}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
            </div>
          )}

          {/* Range picker */}
          {mode === "range" && (
            <div className="mb-4 grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  From
                </label>
                <ShamsiDatePicker
                  value={rangeFrom}
                  onChange={setRangeFrom}
                  placeholder="1403/07/02"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  To
                </label>
                <ShamsiDatePicker
                  value={rangeTo}
                  onChange={setRangeTo}
                  placeholder="1403/12/29"
                />
              </div>
            </div>
          )}

          {/* Format notice */}
          <div className="mb-4 rounded-lg border border-blue-100 bg-blue-50 p-3">
            <p className="text-xs text-blue-700">
              <strong>Format:</strong> PDF (report will be formatted for
              download)
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3">
              <p className="text-sm font-medium text-red-700">{error}</p>
            </div>
          )}

          {/* ============================================ */}
          {/* ✅ REPORT PREVIEW — Simple Word-style text */}
          {/* ============================================ */}
          {report && data && (
            <div
              ref={reportRef}
              className="bg-white p-8 text-black"
              style={{
                fontFamily: "Arial, Helvetica, sans-serif",
                lineHeight: 1.7,
              }}
            >
              {/* Title */}
              <h1 className="text-2xl font-bold tracking-wide">
                CEO Report
              </h1>

              {/* Period */}
              <p className="mt-1 text-lg font-semibold">{periodLabel}</p>

              {/* Range + generated date */}
              <p className="mt-1 text-xs text-gray-600">
                {rangeLabel}
                {rangeLabel && " · "}
                Generated on {generatedOn}
              </p>

              {/* Divider */}
              <hr className="my-5 border-gray-300" />

              {/* Body — plain text */}
              <div className="space-y-3 text-[15px]">
                <p>
                  <span className="font-semibold">Total Students = </span>
                  {formatNumber(data.totalStudents)}
                </p>

                <p>
                  <span className="font-semibold">Active Students = </span>
                  {formatNumber(data.totalActiveStudents)}
                </p>

                <p>
                  <span className="font-semibold">Inactive Students = </span>
                  {formatNumber(data.totalInactiveStudents)}
                </p>

                <p>
                  <span className="font-semibold">
                    All students which enrolled (Enrolled Students) ={" "}
                  </span>
                  {formatNumber(data.totalEnrolledStudents)}
                </p>

                <p>
                  <span className="font-semibold">Active Teachers = </span>
                  {formatNumber(data.totalActiveTeachers)}
                </p>

                <p>
                  <span className="font-semibold">Total Income = </span>
                  {formatCurrency(data.totalIncome)}
                </p>

                <p>
                  <span className="font-semibold">
                    The total salary we payed for our teachers (Payroll
                    Expenses) ={" "}
                  </span>
                  {formatCurrency(data.totalPayrollExpenses)}
                </p>

                <p>
                  <span className="font-semibold">
                    All other expenses in center we did (Other Expenses) ={" "}
                  </span>
                  {formatCurrency(data.totalOtherExpenses)}
                </p>

                <p>
                  <span className="font-semibold">
                    Teacher salary + other expenses (Total Expenses) ={" "}
                  </span>
                  {formatCurrency(data.totalExpenses)}
                </p>

                <p>
                  <span className="font-semibold">
                    If we subtract our expenses from our income, the result is
                    (Total Benefit) ={" "}
                  </span>
                  {formatCurrency(data.totalBenefit)}
                </p>
              </div>

              {/* Note */}
              <p className="mt-8 text-sm leading-relaxed text-gray-800">
                If anything is not completely clear for you, please feel free
                to ask — I will explain it and provide more information.
              </p>

              <p className="mt-4 text-sm font-semibold text-gray-900">
                By regard, Manager of Center.
              </p>

              {/* RESULT — with benefit / loss label */}
              <div className="mt-10 border-t border-gray-300 pt-6">
                <p className="text-sm font-bold tracking-widest text-gray-700">
                  Result
                </p>
                <p className="mt-2 text-3xl font-extrabold text-black">
                  {formatCurrency(data.totalBenefit)}
                </p>
                <p className="mt-1 text-sm font-semibold text-gray-800">
                  {resultLabel}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="flex items-center justify-end gap-2 border-t border-gray-200 bg-slate-50 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={loading || pdfLoading}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>

          {report && (
            <button
              type="button"
              onClick={handleDownloadPDF}
              disabled={pdfLoading || loading}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-800 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
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
                  Preparing PDF...
                </>
              ) : (
                <>
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                  Download PDF
                </>
              )}
            </button>
          )}

          <button
            type="button"
            onClick={handleGenerate}
            disabled={loading || pdfLoading}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
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
                Generating...
              </>
            ) : (
              <>
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                Generate Report
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GenerateReportModal;