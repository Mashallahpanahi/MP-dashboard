// src/components/ShamsiDatePicker.tsx
import { useEffect, useRef, useState } from "react";
import {
  convertToMillady,
  convertToShamsi,
  formatShamsi,
  shamsiToBackendISO,
  todayShamsi,
  SHAMSI_MONTHS,
} from "@/utils/dateConverter";

interface ShamsiDatePickerProps {
  /** Miladi ISO string "YYYY-MM-DD" or empty */
  value: string;
  /** Called with Miladi ISO string when user picks a day, or "" when cleared */
  onChange: (miladiISO: string) => void;
  placeholder?: string;
}

// ============================================
// HELPERS
// ============================================
const pad2 = (n: number) => (n < 10 ? `0${n}` : `${n}`);

/** Days in a Shamsi month: months 1–6 = 31, 7–11 = 30, 12 = 29 or 30 */
const getDaysInShamsiMonth = (year: number, month: number): number => {
  if (month <= 6) return 31;
  if (month <= 11) return 30;
  const leapRemainders = [1, 5, 9, 13, 17, 22, 26, 30];
  return leapRemainders.includes((year + 12) % 33) ? 30 : 29;
};

/** Weekday index for the 1st of a Shamsi month (Sat=0 … Fri=6) */
const firstWeekdayOfShamsiMonth = (year: number, month: number): number => {
  const m = convertToMillady({ year, month, day: 1 });
  const jsDate = new Date(m.year, m.month - 1, m.day);
  const jsDay = jsDate.getDay(); // Sun=0..Sat=6
  // Persian week starts Saturday
  return (jsDay + 1) % 7;
};

const SHAMSI_DAY_NAMES = ["ش", "ی", "د", "س", "چ", "پ", "ج"];

// ============================================
// COMPONENT
// ============================================
const ShamsiDatePicker = ({
  value,
  onChange,
  placeholder = "انتخاب تاریخ",
}: ShamsiDatePickerProps) => {
  const [isOpen, setIsOpen] = useState(false);

  // Currently-displayed month in the popup
  const today = todayShamsi();
  const [viewYear, setViewYear] = useState(today.year);
  const [viewMonth, setViewMonth] = useState(today.month); // 1..12

  const wrapperRef = useRef<HTMLDivElement>(null);

  // ============================================
  // SYNC OPEN MONTH WITH VALUE
  // ============================================
  useEffect(() => {
    if (!value) return;
    try {
      const s = convertToShamsi(value);
      setViewYear(s.year);
      setViewMonth(s.month);
    } catch {
      /* ignore */
    }
  }, [value]);

  // ============================================
  // CLOSE ON OUTSIDE CLICK
  // ============================================
  useEffect(() => {
    if (!isOpen) return;
    const onClick = (e: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [isOpen]);

  // ============================================
  // MONTH NAVIGATION
  // ============================================
  const prevMonth = () => {
    if (viewMonth === 1) {
      setViewMonth(12);
      setViewYear((y) => y - 1);
    } else setViewMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 12) {
      setViewMonth(1);
      setViewYear((y) => y + 1);
    } else setViewMonth((m) => m + 1);
  };

  // ============================================
  // GRID
  // ============================================
  const daysInMonth = getDaysInShamsiMonth(viewYear, viewMonth);
  const firstDay = firstWeekdayOfShamsiMonth(viewYear, viewMonth);

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  // Selected day parts (for highlighting)
  const selectedShamsi = value
    ? (() => {
        try {
          return convertToShamsi(value);
        } catch {
          return null;
        }
      })()
    : null;

  const isSelected = (d: number) =>
    selectedShamsi !== null &&
    selectedShamsi.year === viewYear &&
    selectedShamsi.month === viewMonth &&
    selectedShamsi.day === d;

  const isToday = (d: number) =>
    today.year === viewYear && today.month === viewMonth && today.day === d;

  // ============================================
  // HANDLERS
  // ============================================
  const handlePick = (day: number) => {
    try {
      const iso = shamsiToBackendISO({
        year: viewYear,
        month: viewMonth,
        day,
      });
      onChange(iso);
      setIsOpen(false);
    } catch {
      /* ignore */
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
  };

  const displayText = value
    ? formatShamsi(value, "YYYY/MM/DD")
    : placeholder;

  return (
    <div ref={wrapperRef} className="relative">
      {/* ---------- INPUT-LIKE TRIGGER ---------- */}
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className={`flex w-32 items-center justify-between gap-1 rounded-lg border bg-white px-2.5 py-1.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 ${
          isOpen ? "border-blue-500 ring-2 ring-blue-100" : "border-gray-200"
        }`}
      >
        <span className={value ? "text-gray-900" : "text-gray-400"}>
          {displayText}
        </span>
        {value ? (
          <span
            onClick={handleClear}
            className="rounded p-0.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
            title="Clear"
          >
            <svg
              className="h-3.5 w-3.5"
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
          </span>
        ) : (
          <svg
            className="h-3.5 w-3.5 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        )}
      </button>

      {/* ---------- POPOVER CALENDAR ---------- */}
      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-64 rounded-xl border border-gray-200 bg-white p-3 shadow-xl">
          {/* Header: month nav */}
          <div className="mb-3 flex items-center justify-between">
            <button
              type="button"
              onClick={prevMonth}
              className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-800"
            >
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
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            <div className="text-sm font-semibold text-gray-800">
              {SHAMSI_MONTHS[viewMonth - 1]} {viewYear}
            </div>

            <button
              type="button"
              onClick={nextMonth}
              className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-800"
            >
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
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>

          {/* Day names */}
          <div className="mb-1 grid grid-cols-7 gap-1">
            {SHAMSI_DAY_NAMES.map((d) => (
              <div
                key={d}
                className="py-1 text-center text-[10px] font-bold uppercase text-gray-400"
              >
                {d}
              </div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 gap-1">
            {cells.map((d, idx) => {
              if (d === null) return <div key={idx} />;
              const sel = isSelected(d);
              const tdy = isToday(d);
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handlePick(d)}
                  className={`flex h-8 items-center justify-center rounded-lg text-xs font-medium transition ${
                    sel
                      ? "bg-blue-600 text-white shadow"
                      : tdy
                      ? "bg-blue-50 text-blue-700 ring-1 ring-blue-300"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {d}
                </button>
              );
            })}
          </div>

          {/* Footer: today shortcut */}
          <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-2">
            <button
              type="button"
              onClick={() => {
                const t = todayShamsi();
                setViewYear(t.year);
                setViewMonth(t.month);
              }}
              className="text-[11px] font-medium text-gray-500 hover:text-blue-600"
            >
              برو به امروز
            </button>
            <button
              type="button"
              onClick={() => {
                const t = todayShamsi();
                try {
                  const iso = shamsiToBackendISO(t);
                  onChange(iso);
                  setIsOpen(false);
                } catch {
                  /* ignore */
                }
              }}
              className="text-[11px] font-semibold text-blue-600 hover:text-blue-700"
            >
              انتخاب امروز
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShamsiDatePicker;