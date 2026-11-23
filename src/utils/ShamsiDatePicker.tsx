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
  value?: string | null;
  onChange: (miladiISO: string) => void;
  placeholder?: string;
  compact?: boolean;
  disabled?: boolean;
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
  return (jsDay + 1) % 7;
};

const SHAMSI_DAY_NAMES = ["ش", "ی", "د", "س", "چ", "پ", "ج"];

/**
 * Parse a partially-typed string into { year, month, day } if it's a valid
 * complete Shamsi date. Returns null for incomplete/invalid input.
 * Accepts:
 *   "1403/07/02"
 *   "1403-07-02"
 *   "14030702"
 */
const parseShamsiText = (
  text: string,
): { year: number; month: number; day: number } | null => {
  const cleaned = text.replace(/[^\d]/g, ""); // digits only
  if (cleaned.length !== 8) return null;

  const year = parseInt(cleaned.slice(0, 4), 10);
  const month = parseInt(cleaned.slice(4, 6), 10);
  const day = parseInt(cleaned.slice(6, 8), 10);

  if (year < 1200 || year > 1600) return null;
  if (month < 1 || month > 12) return null;
  const maxDay = getDaysInShamsiMonth(year, month);
  if (day < 1 || day > maxDay) return null;

  return { year, month, day };
};

/**
 * Auto-insert "/" separators as the user types so the input always looks
 * like YYYY/MM/DD.
 */
const formatShamsiText = (raw: string): string => {
  const digits = raw.replace(/[^\d]/g, "").slice(0, 8);

  const y = digits.slice(0, 4);
  const m = digits.slice(4, 6);
  const d = digits.slice(6, 8);

  let out = y;
  if (m) out += `/${m}`;
  if (d) out += `/${d}`;
  return out;
};

// ============================================
// COMPONENT
// ============================================
const ShamsiDatePicker = ({
  value,
  onChange,
  placeholder = "انتخاب تاریخ",
  compact = false,
  disabled = false,
}: ShamsiDatePickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [text, setText] = useState("");

  const today = todayShamsi();
  const [viewYear, setViewYear] = useState(today.year);
  const [viewMonth, setViewMonth] = useState(today.month);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync input text from external value
  useEffect(() => {
    setText(value ? formatShamsi(value, "YYYY/MM/DD") : "");
  }, [value]);

  // Sync calendar view with the value
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

  // Close on outside click / Escape
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
  // MONTH NAV
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

  /** User picks a day from the popup */
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

  /** User types in the input */
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatShamsiText(e.target.value);
    setText(formatted);

    // Try to parse it → emit Miladi ISO if valid
    const parsed = parseShamsiText(formatted);
    if (parsed) {
      try {
        const iso = shamsiToBackendISO(parsed);
        onChange(iso);
      } catch {
        /* ignore */
      }
    } else if (formatted === "") {
      onChange("");
    }
  };

  /** On blur, snap to the last valid value (or clear if invalid) */
  const handleBlur = () => {
    const parsed = parseShamsiText(text);
    if (!parsed) {
      // Revert to the external value's display text
      setText(value ? formatShamsi(value, "YYYY/MM/DD") : "");
    } else {
      setText(formatShamsi(shamsiToBackendISO(parsed), "YYYY/MM/DD"));
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setText("");
    onChange("");
    inputRef.current?.focus();
  };

  const handleOpenPopup = () => {
    if (disabled) return;
    setIsOpen(true);
  };

  // ============================================
  // RENDER
  // ============================================
  return (
    <div ref={wrapperRef} className="relative">
      {/* ---------- INPUT-LIKE TRIGGER (now a real input) ---------- */}
      <div
        className={`flex items-center justify-between gap-1 rounded-lg border bg-white transition focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 ${
          isOpen ? "border-blue-500 ring-2 ring-blue-100" : "border-gray-300"
        } ${
          compact ? "h-[36px] w-32 px-2" : "h-[42px] w-full px-4"
        } ${disabled ? "cursor-not-allowed bg-gray-50 opacity-60" : ""}`}
      >
        <input
          ref={inputRef}
          type="text"
          inputMode="numeric"
          value={text}
          onChange={handleTextChange}
          onBlur={handleBlur}
          onFocus={handleOpenPopup}
          onClick={handleOpenPopup}
          disabled={disabled}
          placeholder={placeholder}
          className={`h-full w-full border-none bg-transparent text-sm outline-none ${
            compact ? "text-xs" : "text-sm"
          } ${disabled ? "cursor-not-allowed" : ""}`}
        />

        {/* Clear button — only when there's a value */}
        {text ? (
          <button
            type="button"
            onClick={handleClear}
            className="rounded p-0.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
            title="Clear"
            disabled={disabled}
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
          </button>
        ) : (
          <button
            type="button"
            onClick={handleOpenPopup}
            className="rounded p-0.5 text-gray-400 transition hover:text-gray-700"
            title="Open calendar"
            disabled={disabled}
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
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </button>
        )}
      </div>

      {/* ---------- POPOVER CALENDAR ---------- */}
      {isOpen && !disabled && (
        <div className="absolute right-0 z-50 mt-2 w-64 rounded-xl border border-gray-200 bg-white p-3 shadow-xl">
          {/* Header */}
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

          {/* Footer shortcuts */}
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
