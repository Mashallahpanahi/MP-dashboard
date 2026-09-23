// src/utils/dateConverter.ts
import jalaali from "jalaali-js";

// ============================================================
// TYPES
// ============================================================

export interface ShamsiParts {
  year: number;  // e.g. 1403
  month: number; // 1–12
  day: number;   // 1–31
}

export interface MiladiParts {
  year: number;  // e.g. 2024
  month: number; // 1–12
  day: number;   // 1–31
}

// Persian month names (for display)
export const SHAMSI_MONTHS = [
  "حمل",
  "ثور",
  "جوزا",
  "سرطان",
  "اسد",
  "سنبله",
  "میزان",
  "عقرب",
  "قوس",
  "جدی",
  "دلو",
  "حوت",
];

// English/Dari transliteration (optional)
export const SHAMSI_MONTHS_EN = [
  "Hamal",
  "Sawr",
  "Jawza",
  "Saratan",
  "Asad",
  "Sunbula",
  "Mizan",
  "Aqrab",
  "Qaws",
  "Jadi",
  "Dalwa",
  "Hoot",
];

// ============================================================
// HELPERS
// ============================================================

const pad2 = (n: number) => (n < 10 ? `0${n}` : `${n}`);

/**
 * Parse any incoming date input into { year, month, day } Miladi parts.
 * Supports:
 *   - ISO string:      "2024-09-23" or "2024-09-23T10:30:00Z"
 *   - JS Date object
 *   - MiladiParts:     { year, month, day }
 */
const toMiladiParts = (
  input: string | Date | MiladiParts
): MiladiParts => {
  if (typeof input === "string") {
    // Handle plain "YYYY-MM-DD" without timezone shift
    const isoDateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(input);
    if (isoDateOnly) {
      return {
        year: parseInt(isoDateOnly[1], 10),
        month: parseInt(isoDateOnly[2], 10),
        day: parseInt(isoDateOnly[3], 10),
      };
    }
    const d = new Date(input);
    if (isNaN(d.getTime())) {
      throw new Error(`Invalid date string: ${input}`);
    }
    return {
      year: d.getFullYear(),
      month: d.getMonth() + 1,
      day: d.getDate(),
    };
  }

  if (input instanceof Date) {
    if (isNaN(input.getTime())) {
      throw new Error("Invalid Date object");
    }
    return {
      year: input.getFullYear(),
      month: input.getMonth() + 1,
      day: input.getDate(),
    };
  }

  // Already parts
  return input;
};

/**
 * Parse any incoming Shamsi input into { year, month, day } Shamsi parts.
 * Supports:
 *   - String "1403/07/02" or "1403-07-02"
 *   - ShamsiParts: { year, month, day }
 */
const toShamsiParts = (input: string | ShamsiParts): ShamsiParts => {
  if (typeof input === "string") {
    const match = /^(\d{4})[/-](\d{1,2})[/-](\d{1,2})$/.exec(input.trim());
    if (!match) {
      throw new Error(`Invalid Shamsi date string: ${input}`);
    }
    return {
      year: parseInt(match[1], 10),
      month: parseInt(match[2], 10),
      day: parseInt(match[3], 10),
    };
  }
  return input;
};

// ============================================================
// MAIN CONVERTERS
// ============================================================

/**
 * Convert a Miladi (Gregorian) date → Shamsi (Solar Hijri / Jalali) date.
 *
 * @example
 *   convertToShamsi("2024-09-23")
 *   // → { year: 1403, month: 7, day: 2 }
 *
 *   convertToShamsi(new Date())
 *   // → { year: 1403, month: 7, day: 2 }
 *
 *   convertToShamsi({ year: 2024, month: 9, day: 23 })
 *   // → { year: 1403, month: 7, day: 2 }
 */
export const convertToShamsi = (
  input: string | Date | MiladiParts
): ShamsiParts => {
  const m = toMiladiParts(input);
  const j = jalaali.toJalaali(m.year, m.month, m.day);
  return { year: j.jy, month: j.jm, day: j.jd };
};

/**
 * Convert a Shamsi (Solar Hijri / Jalali) date → Miladi (Gregorian) date.
 *
 * @example
 *   convertToMillady("1403/07/02")
 *   // → { year: 2024, month: 9, day: 23 }
 *
 *   convertToMillady({ year: 1403, month: 7, day: 2 })
 *   // → { year: 2024, month: 9, day: 23 }
 */
export const convertToMillady = (
  input: string | ShamsiParts
): MiladiParts => {
  const s = toShamsiParts(input);
  const g = jalaali.toGregorian(s.year, s.month, s.day);
  return { year: g.gy, month: g.gm, day: g.gd };
};

// ============================================================
// FORMAT HELPERS
// ============================================================

/**
 * Format a Miladi date as a Shamsi string.
 *
 * @param input  - any Miladi date
 * @param format - output format
 *   "YYYY/MM/DD"      → "1403/07/02"
 *   "YYYY-MM-DD"      → "1403-07-02"
 *   "DD/MM/YYYY"      → "02/07/1403"
 *   "D MonthName YYYY"→ "2 Mizan 1403"
 */
export const formatShamsi = (
  input: string | Date | MiladiParts,
  format: "YYYY/MM/DD" | "YYYY-MM-DD" | "DD/MM/YYYY" | "D MonthName YYYY" =
    "YYYY/MM/DD"
): string => {
  const s = convertToShamsi(input);

  switch (format) {
    case "YYYY-MM-DD":
      return `${s.year}-${pad2(s.month)}-${pad2(s.day)}`;
    case "DD/MM/YYYY":
      return `${pad2(s.day)}/${pad2(s.month)}/${s.year}`;
    case "D MonthName YYYY":
      return `${s.day} ${SHAMSI_MONTHS[s.month - 1]} ${s.year}`;
    case "YYYY/MM/DD":
    default:
      return `${s.year}/${pad2(s.month)}/${pad2(s.day)}`;
  }
};

/**
 * Format a Miladi date into an ISO Miladi string for the backend.
 *
 * @example
 *   formatMiladiISO(new Date())
 *   // → "2024-09-23"
 */
export const formatMiladiISO = (
  input: string | Date | MiladiParts
): string => {
  const m = toMiladiParts(input);
  return `${m.year}-${pad2(m.month)}-${pad2(m.day)}`;
};

/**
 * Convert a Shamsi date string into an ISO Miladi string for the backend.
 *
 * @example
 *   shamsiToBackendISO("1403/07/02")
 *   // → "2024-09-23"
 */
export const shamsiToBackendISO = (
  input: string | ShamsiParts
): string => {
  const m = convertToMillady(input);
  return `${m.year}-${pad2(m.month)}-${pad2(m.day)}`;
};

/**
 * Convert a Miladi date string / Date from the backend into Shamsi parts.
 * Useful for displaying in UI.
 */
export const miladiToShamsiParts = (
  input: string | Date | MiladiParts
): ShamsiParts => convertToShamsi(input);

// ============================================================
// VALIDATION HELPERS
// ============================================================

/**
 * Validate a Miladi date — checks if the year/month/day combination is real.
 */
export const isValidMiladi = (
  input: string | Date | MiladiParts
): boolean => {
  try {
    const m = toMiladiParts(input);
    const d = new Date(m.year, m.month - 1, m.day);
    return (
      d.getFullYear() === m.year &&
      d.getMonth() + 1 === m.month &&
      d.getDate() === m.day
    );
  } catch {
    return false;
  }
};

/**
 * Validate a Shamsi date — checks if the year/month/day combination is real.
 */
export const isValidShamsi = (
  input: string | ShamsiParts
): boolean => {
  try {
    const s = toShamsiParts(input);
    if (s.year < 1200 || s.year > 1600) return false;
    if (s.month < 1 || s.month > 12) return false;
    if (s.day < 1 || s.day > 31) return false;
    // Attempt conversion — will throw if invalid
    jalaali.toGregorian(s.year, s.month, s.day);
    // Round-trip check
    const back = jalaali.toJalaali(
      ...(Object.values(
        jalaali.toGregorian(s.year, s.month, s.day)
      ) as [number, number, number])
    );
    return back.jy === s.year && back.jm === s.month && back.jd === s.day;
  } catch {
    return false;
  }
};

// ============================================================
// TODAY HELPERS
// ============================================================

/** Today's date in Shamsi parts */
export const todayShamsi = (): ShamsiParts => convertToShamsi(new Date());

/** Today's date in Miladi parts */
export const todayMiladi = (): MiladiParts => toMiladiParts(new Date());

/** Today's date as a Shamsi display string */
export const todayShamsiString = (
  format: "YYYY/MM/DD" | "YYYY-MM-DD" | "DD/MM/YYYY" | "D MonthName YYYY" =
    "YYYY/MM/DD"
): string => formatShamsi(new Date(), format);