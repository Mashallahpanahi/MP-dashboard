// src/pages/Students/PrintResultCard.tsx
import { useEffect, useState, useMemo } from "react";
import {
  findStudentsForScoring,
  type StudentForScoring,
} from "@/api/studentApi";
import { getTeachers, type Teacher } from "@/api/teacherApi";
import { getBooks, type Book } from "@/api/bookApi";
import { getClasses, type Class } from "@/api/classApi";
// ✅ Shamsi date picker + formatter
import ShamsiDatePicker from "@/utils/ShamsiDatePicker";
import { formatShamsi } from "@/utils/dateConverter";

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

const parseScore = (
  value: string | number | null | undefined
): number | null => {
  if (value === null || value === undefined) return null;
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return null;
  return num;
};

type ResultCardDesign = "design-1" | "design-2";

// ============================================
// DESIGN 1 — Certificate (existing)
// ============================================
interface ResultCardProps {
  student: StudentForScoring;
}

const ResultCardDesign1 = ({ student }: ResultCardProps) => {
  const midterm = parseScore(student.midtermScore);
  const final = parseScore(student.finalScore);
  const total =
    parseScore(student.totalScore) ??
    (midterm !== null || final !== null ? (midterm || 0) + (final || 0) : null);
  const passed = total !== null && total >= student.passingScore;

  const message = passed
    ? `You have shown remarkable dedication and a genuine love for learning. Your hard work in "${student.bookName}" has truly paid off, and your achievement is something to be proud of. Keep shining and continue to inspire those around you with your commitment and passion for knowledge.`
    : `Every step you take is a step toward growth. Although this chapter has come to a close, your journey is far from over. Use this experience as fuel for the next challenge — with persistence and a willing heart, success will surely follow.`;

  return (
    <div
      className="result-card relative mx-auto overflow-hidden rounded-sm bg-white shadow-xl print:shadow-none"
      style={{
        width: "210mm",
        height: "148.5mm",
        pageBreakInside: "avoid",
        breakInside: "avoid",
      }}
    >
      {/* DECORATIVE BORDERS */}
      <div className="pointer-events-none absolute inset-0 z-20 border-[3px] border-amber-500" />
      <div className="pointer-events-none absolute inset-[8px] z-20 border border-blue-900/60" />
      <div className="pointer-events-none absolute left-0 top-0 z-20 h-16 w-16 border-l-4 border-t-4 border-amber-500" />
      <div className="pointer-events-none absolute right-0 top-0 z-20 h-16 w-16 border-r-4 border-t-4 border-amber-500" />
      <div className="pointer-events-none absolute bottom-0 left-0 z-20 h-16 w-16 border-b-4 border-l-4 border-amber-500" />
      <div className="pointer-events-none absolute bottom-0 right-0 z-20 h-16 w-16 border-b-4 border-r-4 border-amber-500" />

      {/* BLUE CURVED SHAPE */}
      <div className="pointer-events-none absolute -bottom-32 -right-32 z-0 h-[320px] w-[320px] rounded-full bg-gradient-to-br from-blue-700 to-blue-900 opacity-40" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 z-0 h-[260px] w-[260px] rounded-full bg-gradient-to-br from-amber-400 to-amber-600 opacity-25" />
      <div className="pointer-events-none absolute -bottom-16 -right-16 z-0 h-[200px] w-[200px] rounded-full bg-gradient-to-br from-blue-800 to-blue-950 opacity-50" />

      {/* STUDENT PHOTO */}
      <div className="absolute right-12 top-14 z-30">
        {student.studentImage ? (
          <div className="relative">
            <div className="absolute -inset-[2px] rounded-md bg-gradient-to-br from-amber-300 via-amber-500 to-amber-700 opacity-90" />
            <div className="relative h-28 w-20 overflow-hidden rounded-md border border-white shadow-md">
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
          <div className="flex h-28 w-20 items-center justify-center rounded-md bg-gradient-to-br from-blue-100 to-blue-200 text-2xl font-bold text-blue-700 shadow-sm ring-1 ring-amber-400">
            {getInitials(student.studentName, student.studentLastName)}
          </div>
        )}
      </div>

      {/* CONTENT */}
      <div className="relative z-10 flex h-full flex-col px-14 pt-14 pb-6">
        <div className="max-w-[500px]">
          <h1
            className="text-4xl font-bold tracking-widest text-blue-900"
            style={{ fontFamily: "Cinzel, serif" }}
          >
            CERTIFICATE
          </h1>
          <p
            className="mt-1 text-lg font-semibold tracking-[0.35em] text-amber-600"
            style={{ fontFamily: "Cinzel, serif" }}
          >
            OF APPRECIATION
          </p>
        </div>

        <p className="mt-5 text-xs font-bold uppercase tracking-widest text-blue-900">
          This certificate is proudly presented to:
        </p>

        <div className="mt-2">
          <h2
            className="max-w-[560px] text-5xl leading-tight text-blue-900"
            style={{ fontFamily: "'Great Vibes', cursive" }}
          >
            {student.studentName} {student.studentLastName}
          </h2>
          <div className="mt-1 h-[2px] w-[380px] bg-gradient-to-r from-amber-600 via-amber-400 to-transparent" />
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="font-bold uppercase tracking-widest text-blue-900">
              Score:
            </span>
            <span
              className={`text-xl font-bold ${
                passed ? "text-emerald-600" : "text-red-600"
              }`}
            >
              {total !== null ? total.toFixed(1) : "—"}
            </span>
          </div>
          <span className="text-gray-300">|</span>
          <span
            className={`font-bold uppercase tracking-widest ${
              passed ? "text-emerald-600" : "text-red-600"
            }`}
          >
            {passed ? "✓ Passed" : " Not Passed"}
          </span>
          <span className="text-gray-300">|</span>
          <span className="text-gray-600">
            <span className="font-semibold text-blue-900">
              {student.bookName}
            </span>{" "}
            · Taught by{" "}
            <span className="font-semibold">
              {student.teacherName} {student.teacherLastName}
            </span>
          </span>
        </div>

        <p
          className="mt-4 max-w-[560px] text-[11px] leading-relaxed text-gray-700"
          style={{ fontFamily: "Inter, sans-serif" }}
        >
          {message}
        </p>

        <div className="mt-auto flex items-end justify-between pb-2">
          <div className="text-center">
            <div className="mb-1 h-[2px] w-32 bg-amber-500" />
            <p className="text-[11px] font-bold uppercase tracking-widest text-blue-900">
              {formatShamsi(new Date(), "YYYY/MM/DD")}
            </p>
            <p className="mt-0.5 text-[9px] uppercase tracking-widest text-gray-500">
              Date
            </p>
          </div>

          <div className="text-center">
            <p className="text-[11px] font-semibold text-gray-700">
              {student.studentNumber || "—"}
            </p>
            <p className="mt-0.5 text-[9px] uppercase tracking-widest text-gray-500">
              Student No.
            </p>
          </div>

          <div className="text-center">
            <div className="mb-1 h-[2px] w-32 bg-amber-500" />
            <p
              className="text-base leading-tight text-blue-900"
              style={{ fontFamily: "'Great Vibes', cursive" }}
            >
              School Director
            </p>
            <p className="mt-0.5 text-[9px] uppercase tracking-widest text-gray-500">
              Signature
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================
// DESIGN 2 — Elegant Ribbon (uses Great Vibes font)
// A4 width (210mm) × half-A4 height (148.5mm)
// Logo: /images/cours-log.png (same size as the photo: 26mm × 34mm)
// ============================================
// const ResultCardDesign2 = ({ student }: ResultCardProps) => {
//   const midterm = parseScore(student.midtermScore);
//   const final = parseScore(student.finalScore);
//   const total =
//     parseScore(student.totalScore) ??
//     (midterm !== null || final !== null ? (midterm || 0) + (final || 0) : null);
//   const passed = total !== null && total >= student.passingScore;

//   const percentage = total !== null ? total.toFixed(1) : "—";
//   const resultText = passed ? "Passed" : "Failed";

//   // Shamsi date split into day / month / year
//   const todayShamsi = formatShamsi(new Date(), "YYYY/MM/DD");
//   const [y, m, d] = todayShamsi.split("/");

//   return (
//     <div
//       className="result-card relative mx-auto overflow-hidden bg-white shadow-xl print:shadow-none"
//       style={{
//         width: "210mm",
//         height: "148.5mm",
//         pageBreakInside: "avoid",
//         breakInside: "avoid",
//         fontFamily: "'Great Vibes', cursive",
//       }}
//     >
//       {/* ============================================
//           TOP-LEFT RIBBON — 5 layered shapes
//           ============================================ */}
//       <div className="pointer-events-none absolute left-0 top-0 z-0">
//         <div
//           className="h-[58mm] w-[58mm]"
//           style={{
//             backgroundColor: "#0a1a5c",
//             clipPath: "polygon(0 0, 100% 0, 0 100%)",
//           }}
//         />
//         <div
//           className="absolute left-0 top-0 h-[52mm] w-[52mm]"
//           style={{
//             background:
//               "linear-gradient(135deg, #f5d77a 0%, #c9a227 50%, #7a5c14 100%)",
//             clipPath: "polygon(0 0, 100% 0, 0 100%)",
//           }}
//         />
//         <div
//           className="absolute left-0 top-0 h-[46mm] w-[46mm] bg-white"
//           style={{ clipPath: "polygon(0 0, 100% 0, 0 100%)" }}
//         />
//         <div
//           className="absolute left-0 top-0 h-[26mm] w-[26mm]"
//           style={{
//             background:
//               "linear-gradient(135deg, #f5d77a 0%, #c9a227 50%, #7a5c14 100%)",
//             clipPath: "polygon(0 0, 100% 0, 0 100%)",
//           }}
//         />
//         <div
//           className="absolute left-0 top-0 h-[18mm] w-[18mm]"
//           style={{
//             backgroundColor: "#0a1a5c",
//             clipPath: "polygon(0 0, 100% 0, 0 100%)",
//           }}
//         />
//       </div>

//       {/* ============================================
//           BOTTOM-RIGHT RIBBON
//           ============================================ */}
//       <div className="pointer-events-none absolute bottom-0 right-0 z-0">
//         <div
//           className="h-[58mm] w-[58mm]"
//           style={{
//             backgroundColor: "#0a1a5c",
//             clipPath: "polygon(100% 100%, 100% 0, 0 100%)",
//           }}
//         />
//         <div
//           className="absolute bottom-0 right-0 h-[52mm] w-[52mm]"
//           style={{
//             background:
//               "linear-gradient(315deg, #f5d77a 0%, #c9a227 50%, #7a5c14 100%)",
//             clipPath: "polygon(100% 100%, 100% 0, 0 100%)",
//           }}
//         />
//         <div
//           className="absolute bottom-0 right-0 h-[46mm] w-[46mm] bg-white"
//           style={{ clipPath: "polygon(100% 100%, 100% 0, 0 100%)" }}
//         />
//         <div
//           className="absolute bottom-[24mm] right-0 h-[3mm] w-[60mm]"
//           style={{
//             backgroundColor: "#1e8a3c",
//             transform: "rotate(-45deg)",
//             transformOrigin: "right center",
//           }}
//         />
//         <div
//           className="absolute bottom-0 right-0 h-[26mm] w-[26mm]"
//           style={{
//             background:
//               "linear-gradient(315deg, #f5d77a 0%, #c9a227 50%, #7a5c14 100%)",
//             clipPath: "polygon(100% 100%, 100% 0, 0 100%)",
//           }}
//         />
//         <div
//           className="absolute bottom-0 right-0 h-[18mm] w-[18mm]"
//           style={{
//             backgroundColor: "#0a1a5c",
//             clipPath: "polygon(100% 100%, 100% 0, 0 100%)",
//           }}
//         />
//       </div>

//       {/* ============================================
//           HEADER — Logo · Center · Photo
//           ============================================ */}
//       <div className="relative z-10 flex items-start justify-between gap-3 px-10 pt-10">
//         {/* Logo */}
//         <div className="flex h-[40mm] w-[40mm] shrink-0 items-center justify-center">
//           <img
//             src="/images/cours-log.png"
//             alt="Center Logo"
//             className="h-full w-full object-contain"
//             onError={(e) => {
//               const parent = e.currentTarget.parentElement;
//               if (parent) {
//                 parent.innerHTML = `
//                   <div style="
//                     display:flex; align-items:center; justify-content:center;
//                     width:100%; height:100%; border-radius:9999px;
//                     background:#0a1a5c; border:3px solid #c9a227;
//                     color:#f5d77a; font-family:'Great Vibes',cursive; font-weight:700;
//                     font-size:11px; line-height:1.2; text-align:center;
//                   ">
//                     <span>MODERN<br/>MOAFAQ</span>
//                   </div>
//                 `;
//               }
//             }}
//           />
//         </div>

//         {/* Center name + subtitle + tagline */}
//         <div className="min-w-0 flex-1 px-2 text-center">
//           <h1
//             className="whitespace-nowrap text-[26px] leading-[1.15] text-[#0a1a5c]"
//             style={{ fontFamily: "'Great Vibes', cursive" }}
//           >
//             Modern Moafaq Educational Center
//           </h1>

//           <h2
//             className="mt-2 whitespace-nowrap text-[24px] leading-[1.15] text-[#0a1a5c]"
//             style={{ fontFamily: "'Great Vibes', cursive" }}
//           >
//             English Certificate
//           </h2>

//           <p
//             className="mt-2 whitespace-nowrap text-[16px] leading-[1.2] text-[#1c3ca8]"
//             style={{ fontFamily: "'Great Vibes', cursive" }}
//           >
//             Enlightening Minds Empowering Tomorrow
//           </p>
//         </div>

//         {/* Photo frame */}
//         <div className="flex h-[34mm] w-[26mm] shrink-0 items-center justify-center border-[3px] border-[#0a1a5c] bg-white p-1">
//           {student.studentImage ? (
//             <img
//               src={getImageUrl(student.studentImage) || ""}
//               alt={`${student.studentName} ${student.studentLastName}`}
//               className="h-full w-full object-cover"
//               crossOrigin="anonymous"
//               onError={(e) => {
//                 e.currentTarget.style.display = "none";
//               }}
//             />
//           ) : (
//             <div
//               className="flex h-full w-full items-center justify-center bg-blue-50 text-[22px] font-bold text-blue-900"
//               style={{ fontFamily: "'Great Vibes', cursive" }}
//             >
//               {getInitials(student.studentName, student.studentLastName)}
//             </div>
//           )}
//         </div>
//       </div>

//       {/* ============================================
//           BODY — Reduced padding, left-aligned rows
//           ============================================ */}
//       <div
//         className="relative z-10 mt-[8mm] px-8"
//         style={{
//           fontFamily: "'Great Vibes', cursive",
//         }}
//       >
//         {/* Row 1 */}
//        {/* Row 1 — Student name + S/D of Father name */}
// <div className="flex items-baseline whitespace-nowrap text-[16px] leading-[2]">
//   <span>This Certificate is awarded to</span>
//   <span
//     className="mx-2 inline-block min-w-[55mm] border-b-2 border-dotted border-black text-center"
//     style={{ lineHeight: 1.1 }}
//   >
//     {student.studentName} {student.studentLastName}
//   </span>
//   <span>S/D of</span>
//   <span
//     className="mx-2 inline-block min-w-[40mm] border-b-2 border-dotted border-black text-center"
//     style={{ lineHeight: 1.1 }}
//   >
//     {student.studentFatherName || ""}
//   </span>
// </div>

//         {/* Row 2 */}
//         <div className="flex items-baseline whitespace-nowrap text-[16px] leading-[2]">
//           <span>Course Level:</span>
//           <span
//             className="mx-2 inline-block min-w-[55mm] border-b-2 border-dotted border-black text-center"
//             style={{ lineHeight: 1.1 }}
//           >
//             {student.bookLevelOrder ? `Level ${student.bookLevelOrder}` : ""}
//           </span>
//           <span>English for Level:</span>
//           <span
//             className="mx-2 inline-block min-w-[40mm] border-b-2 border-dotted border-black text-center"
//             style={{ lineHeight: 1.1 }}
//           >
//             {student.bookName}
//           </span>
//           <span>at final</span>
//         </div>

//         {/* Row 3 */}
//         <div className="flex items-baseline whitespace-nowrap text-[16px] leading-[2]">
//           <span>grade: (</span>
//           <span
//             className="mx-2 inline-block min-w-[16mm] border-b-2 border-dotted border-black text-center"
//             style={{ lineHeight: 1.1 }}
//           >
//             {percentage}
//           </span>
//           <span>% result:</span>
//           <span
//             className="mx-2 inline-block min-w-[40mm] border-b-2 border-dotted border-black text-center"
//             style={{ lineHeight: 1.1 }}
//           >
//             {resultText}
//           </span>
//           <span>) Date Awarded:</span>
//           <span
//             className="mx-2 inline-block min-w-[12mm] border-b-2 border-dotted border-black text-center"
//             style={{ lineHeight: 1.1 }}
//           >
//             {d}
//           </span>
//           <span>/</span>
//           <span
//             className="mx-2 inline-block min-w-[12mm] border-b-2 border-dotted border-black text-center"
//             style={{ lineHeight: 1.1 }}
//           >
//             {m}
//           </span>
//           <span>/</span>
//           <span
//             className="mx-2 inline-block min-w-[16mm] border-b-2 border-dotted border-black text-center"
//             style={{ lineHeight: 1.1 }}
//           >
//             {y}
//           </span>
//         </div>
//       </div>

//       {/* ============================================
//           FOOTER — Signatures
//           ============================================ */}
//       <div className="absolute bottom-[10mm] left-0 right-0 z-10 flex items-end justify-around px-[22mm]">
//         <p
//           className="text-[26px]"
//           style={{
//             fontFamily: "'Great Vibes', cursive",
//             color: "#c9a227",
//           }}
//         >
//           Director sign
//         </p>
//         <p
//           className="text-[26px]"
//           style={{
//             fontFamily: "'Great Vibes', cursive",
//             color: "#c9a227",
//           }}
//         >
//           Instructor sign
//         </p>
//       </div>
//     </div>
//   );
// };

const ResultCardDesign2 = ({ student }: ResultCardProps) => {
  const midterm = parseScore(student.midtermScore);
  const final = parseScore(student.finalScore);
  const total =
    parseScore(student.totalScore) ??
    (midterm !== null || final !== null ? (midterm || 0) + (final || 0) : null);
  const passed = total !== null && total >= student.passingScore;

  const percentage = total !== null ? total.toFixed(1) : "—";
  const resultText = passed ? "Passed" : "Failed";

  // Shamsi date split into day / month / year
  const todayShamsi = formatShamsi(new Date(), "YYYY/MM/DD");
  const [y, m, d] = todayShamsi.split("/");

  return (
    <div
      className="result-card relative mx-auto overflow-hidden bg-white shadow-xl print:shadow-none"
      style={{
        width: "210mm",
        height: "148.5mm",
        pageBreakInside: "avoid",
        breakInside: "avoid",
        fontFamily: "'Great Vibes', cursive",
      }}
    >
      {/* ============================================
          TOP-LEFT RIBBON — 5 layered shapes
          ============================================ */}
      <div className="pointer-events-none absolute left-0 top-0 z-0">
        <div
          className="h-[58mm] w-[58mm]"
          style={{
            backgroundColor: "#0a1a5c",
            clipPath: "polygon(0 0, 100% 0, 0 100%)",
          }}
        />
        <div
          className="absolute left-0 top-0 h-[52mm] w-[52mm]"
          style={{
            background:
              "linear-gradient(135deg, #f5d77a 0%, #c9a227 50%, #7a5c14 100%)",
            clipPath: "polygon(0 0, 100% 0, 0 100%)",
          }}
        />
        <div
          className="absolute left-0 top-0 h-[46mm] w-[46mm] bg-white"
          style={{ clipPath: "polygon(0 0, 100% 0, 0 100%)" }}
        />
        <div
          className="absolute left-0 top-0 h-[26mm] w-[26mm]"
          style={{
            background:
              "linear-gradient(135deg, #f5d77a 0%, #c9a227 50%, #7a5c14 100%)",
            clipPath: "polygon(0 0, 100% 0, 0 100%)",
          }}
        />
        <div
          className="absolute left-0 top-0 h-[18mm] w-[18mm]"
          style={{
            backgroundColor: "#0a1a5c",
            clipPath: "polygon(0 0, 100% 0, 0 100%)",
          }}
        />
      </div>

      {/* ============================================
          BOTTOM-RIGHT RIBBON
          ============================================ */}
      <div className="pointer-events-none absolute bottom-0 right-0 z-0">
        <div
          className="h-[58mm] w-[58mm]"
          style={{
            backgroundColor: "#0a1a5c",
            clipPath: "polygon(100% 100%, 100% 0, 0 100%)",
          }}
        />
        <div
          className="absolute bottom-0 right-0 h-[52mm] w-[52mm]"
          style={{
            background:
              "linear-gradient(315deg, #f5d77a 0%, #c9a227 50%, #7a5c14 100%)",
            clipPath: "polygon(100% 100%, 100% 0, 0 100%)",
          }}
        />
        <div
          className="absolute bottom-0 right-0 h-[46mm] w-[46mm] bg-white"
          style={{ clipPath: "polygon(100% 100%, 100% 0, 0 100%)" }}
        />
        <div
          className="absolute bottom-[24mm] right-0 h-[3mm] w-[60mm]"
          style={{
            backgroundColor: "#1e8a3c",
            transform: "rotate(-45deg)",
            transformOrigin: "right center",
          }}
        />
        <div
          className="absolute bottom-0 right-0 h-[26mm] w-[26mm]"
          style={{
            background:
              "linear-gradient(315deg, #f5d77a 0%, #c9a227 50%, #7a5c14 100%)",
            clipPath: "polygon(100% 100%, 100% 0, 0 100%)",
          }}
        />
        <div
          className="absolute bottom-0 right-0 h-[18mm] w-[18mm]"
          style={{
            backgroundColor: "#0a1a5c",
            clipPath: "polygon(100% 100%, 100% 0, 0 100%)",
          }}
        />
      </div>

      {/* ============================================
          HEADER — Logo · Center · Photo
          ============================================ */}
      <div className="relative z-10 flex items-start justify-between gap-3 px-10 pt-10">
        {/* Logo */}
        <div className="flex h-[40mm] w-[40mm] shrink-0 items-center justify-center">
          <img
            src="/images/cours-log.png"
            alt="Center Logo"
            className="h-full w-full object-contain"
            onError={(e) => {
              const parent = e.currentTarget.parentElement;
              if (parent) {
                parent.innerHTML = `
                  <div style="
                    display:flex; align-items:center; justify-content:center;
                    width:100%; height:100%; border-radius:9999px;
                    background:#0a1a5c; border:3px solid #c9a227;
                    color:#f5d77a; font-family:'Great Vibes',cursive;
                    font-size:11px; line-height:1.2; text-align:center;
                  ">
                    <span>MODERN<br/>MOAFAQ</span>
                  </div>
                `;
              }
            }}
          />
        </div>

        {/* Center name + subtitle + tagline */}
        <div className="min-w-0 flex-1 px-2 text-center">
          <h1
            className="whitespace-nowrap text-[32px] leading-[1.15] text-[#0a1a5c]"
            style={{ fontFamily: "'Great Vibes', cursive" }}
          >
            Modern Moafaq Educational Center
          </h1>

          <h2
            className="mt-2 whitespace-nowrap text-[30px] leading-[1.15] text-[#0a1a5c]"
            style={{ fontFamily: "'Great Vibes', cursive" }}
          >
            English Certificate
          </h2>

          <p
            className="mt-2 whitespace-nowrap text-[20px] leading-[1.2] text-[#1c3ca8]"
            style={{ fontFamily: "'Great Vibes', cursive" }}
          >
            Enlightening Minds Empowering Tomorrow
          </p>
        </div>

        {/* Photo frame */}
        <div className="flex h-[34mm] w-[26mm] shrink-0 items-center justify-center border-[3px] border-[#0a1a5c] bg-white p-1">
          {student.studentImage ? (
            <img
              src={getImageUrl(student.studentImage) || ""}
              alt={`${student.studentName} ${student.studentLastName}`}
              className="h-full w-full object-cover"
              crossOrigin="anonymous"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <div
              className="flex h-full w-full items-center justify-center bg-blue-50 text-[22px] text-blue-900"
              style={{ fontFamily: "'Great Vibes', cursive" }}
            >
              {getInitials(student.studentName, student.studentLastName)}
            </div>
          )}
        </div>
      </div>

      {/* ============================================
          BODY — BIGGER fonts only (no bold)
          ============================================ */}
      <div
        className="relative z-10 mt-[8mm] px-8"
        style={{
          fontFamily: "'Great Vibes', cursive",
        }}
      >
        {/* Row 1 — Student name + S/D of Father name */}
        <div className="flex items-baseline whitespace-nowrap text-[22px] leading-[2]">
          <span>This Certificate is awarded to</span>
          <span
            className="mx-2 inline-block min-w-[65mm] border-b-2 border-dotted border-black text-center"
            style={{ lineHeight: 1.2 }}
          >
            {student.studentName} {student.studentLastName}
          </span>
          <span>S/D of</span>
          <span
            className="mx-2 inline-block min-w-[48mm] border-b-2 border-dotted border-black text-center"
            style={{ lineHeight: 1.2 }}
          >
            {student.studentFatherName || ""}
          </span>
        </div>

        {/* Row 2 */}
        <div className="flex items-baseline whitespace-nowrap text-[22px] leading-[2]">
          <span>Course Level:</span>
          <span
            className="mx-2 inline-block min-w-[60mm] border-b-2 border-dotted border-black text-center"
            style={{ lineHeight: 1.2 }}
          >
            {student.bookLevelOrder ? `Level ${student.bookLevelOrder}` : ""}
          </span>
          <span>English for Level:</span>
          <span
            className="mx-2 inline-block min-w-[45mm] border-b-2 border-dotted border-black text-center"
            style={{ lineHeight: 1.2 }}
          >
            {student.bookName}
          </span>
          <span>at final</span>
        </div>

        {/* Row 3 */}
        <div className="flex items-baseline whitespace-nowrap text-[22px] leading-[2]">
          <span>grade: (</span>
          <span
            className="mx-2 inline-block min-w-[18mm] border-b-2 border-dotted border-black text-center"
            style={{ lineHeight: 1.2 }}
          >
            {percentage}
          </span>
          <span>% result:</span>
          <span
            className="mx-2 inline-block min-w-[45mm] border-b-2 border-dotted border-black text-center"
            style={{ lineHeight: 1.2 }}
          >
            {resultText}
          </span>
          <span>) Date Awarded:</span>
          <span
            className="mx-2 inline-block min-w-[14mm] border-b-2 border-dotted border-black text-center"
            style={{ lineHeight: 1.2 }}
          >
            {d}
          </span>
          <span>/</span>
          <span
            className="mx-2 inline-block min-w-[14mm] border-b-2 border-dotted border-black text-center"
            style={{ lineHeight: 1.2 }}
          >
            {m}
          </span>
          <span>/</span>
          <span
            className="mx-2 inline-block min-w-[18mm] border-b-2 border-dotted border-black text-center"
            style={{ lineHeight: 1.2 }}
          >
            {y}
          </span>
        </div>
      </div>

      {/* ============================================
          FOOTER — Signatures (bigger, no bold)
          ============================================ */}
      <div className="absolute bottom-[10mm] left-0 right-0 z-10 flex items-end justify-around px-[22mm]">
        <p
          className="text-[32px]"
          style={{
            fontFamily: "'Great Vibes', cursive",
            color: "#c9a227",
          }}
        >
          Director sign
        </p>
        <p
          className="text-[32px]"
          style={{
            fontFamily: "'Great Vibes', cursive",
            color: "#c9a227",
          }}
        >
          Instructor sign
        </p>
      </div>
    </div>
  );
};


//   const midterm = parseScore(student.midtermScore);
//   const final = parseScore(student.finalScore);

//   const total =
//     parseScore(student.totalScore) ??
//     (midterm !== null || final !== null
//       ? (midterm || 0) + (final || 0)
//       : null);

//   const passed = total !== null && total >= student.passingScore;
//   const percentage = total !== null ? total.toFixed(1) : "—";
//   const resultText = passed ? "Passed" : "Failed";

//   // Shamsi date split into day / month / year
//   const todayShamsi = formatShamsi(new Date(), "YYYY/MM/DD");
//   const [y, m, d] = todayShamsi.split("/");

//   return (
//     <div
//       className="result-card relative mx-auto overflow-hidden bg-white shadow-xl print:shadow-none"
//       style={{
//         width: "210mm",
//         height: "148.5mm",
//         pageBreakInside: "avoid",
//         breakInside: "avoid",
//         fontFamily: "'CertificateScript', cursive",
//       }}
//     >
//       {/* TOP-LEFT RIBBON — 5 layered shapes */}
//       <div className="pointer-events-none absolute left-0 top-0 z-0">
//         <div
//           className="h-[58mm] w-[58mm]"
//           style={{
//             backgroundColor: "#0a1a5c",
//             clipPath: "polygon(0 0, 100% 0, 0 100%)",
//           }}
//         />
//         <div
//           className="absolute left-0 top-0 h-[52mm] w-[52mm]"
//           style={{
//             background:
//               "linear-gradient(135deg, #f5d77a 0%, #c9a227 50%, #7a5c14 100%)",
//             clipPath: "polygon(0 0, 100% 0, 0 100%)",
//           }}
//         />
//         <div
//           className="absolute left-0 top-0 h-[46mm] w-[46mm] bg-white"
//           style={{ clipPath: "polygon(0 0, 100% 0, 0 100%)" }}
//         />
//         <div
//           className="absolute left-0 top-0 h-[26mm] w-[26mm]"
//           style={{
//             background:
//               "linear-gradient(135deg, #f5d77a 0%, #c9a227 50%, #7a5c14 100%)",
//             clipPath: "polygon(0 0, 100% 0, 0 100%)",
//           }}
//         />
//         <div
//           className="absolute left-0 top-0 h-[18mm] w-[18mm]"
//           style={{
//             backgroundColor: "#0a1a5c",
//             clipPath: "polygon(0 0, 100% 0, 0 100%)",
//           }}
//         />
//       </div>

//       {/* BOTTOM-RIGHT RIBBON */}
//       <div className="pointer-events-none absolute bottom-0 right-0 z-0">
//         <div
//           className="h-[58mm] w-[58mm]"
//           style={{
//             backgroundColor: "#0a1a5c",
//             clipPath: "polygon(100% 100%, 100% 0, 0 100%)",
//           }}
//         />
//         <div
//           className="absolute bottom-0 right-0 h-[52mm] w-[52mm]"
//           style={{
//             background:
//               "linear-gradient(315deg, #f5d77a 0%, #c9a227 50%, #7a5c14 100%)",
//             clipPath: "polygon(100% 100%, 100% 0, 0 100%)",
//           }}
//         />
//         <div
//           className="absolute bottom-0 right-0 h-[46mm] w-[46mm] bg-white"
//           style={{ clipPath: "polygon(100% 100%, 100% 0, 0 100%)" }}
//         />
//         <div
//           className="absolute bottom-[24mm] right-0 h-[3mm] w-[60mm]"
//           style={{
//             backgroundColor: "#1e8a3c",
//             transform: "rotate(-45deg)",
//             transformOrigin: "right center",
//           }}
//         />
//         <div
//           className="absolute bottom-0 right-0 h-[26mm] w-[26mm]"
//           style={{
//             background:
//               "linear-gradient(315deg, #f5d77a 0%, #c9a227 50%, #7a5c14 100%)",
//             clipPath: "polygon(100% 100%, 100% 0, 0 100%)",
//           }}
//         />
//         <div
//           className="absolute bottom-0 right-0 h-[18mm] w-[18mm]"
//           style={{
//             backgroundColor: "#0a1a5c",
//             clipPath: "polygon(100% 100%, 100% 0, 0 100%)",
//           }}
//         />
//       </div>

//       {/* HEADER — Logo · Center · Photo */}
//       <div className="relative z-10 flex items-start justify-between gap-3 px-10 pt-10">
//         {/* Logo */}
//         <div className="flex h-[40mm] w-[40mm] shrink-0 items-center justify-center">
//           <img
//             src="/images/cours-log.png"
//             alt="Center Logo"
//             className="h-full w-full object-contain"
//             onError={(e) => {
//               const parent = e.currentTarget.parentElement;
//               if (parent) {
//                 parent.innerHTML = `
//                   <div style="
//                     display:flex; align-items:center; justify-content:center;
//                     width:100%; height:100%; border-radius:9999px;
//                     background:#0a1a5c; border:3px solid #c9a227;
//                     color:#f5d77a; font-family:'CertificateScript',cursive;
//                     font-weight:700; font-size:11px; line-height:1.2;
//                     text-align:center;
//                   ">
//                     <span>MODERN<br/>MOAFAQ</span>
//                   </div>
//                 `;
//               }
//             }}
//           />
//         </div>

//         {/* Center name + subtitle + tagline */}
//         <div className="min-w-0 flex-1 px-2 text-center">
//           <h1
//             className="whitespace-nowrap text-[26px] leading-[1.15] text-[#0a1a5c]"
//             style={{ fontFamily: "'CertificateScript', cursive" }}
//           >
//             Modern Moafaq Educational Center
//           </h1>

//           <h2
//             className="mt-2 whitespace-nowrap text-[24px] leading-[1.15] text-[#0a1a5c]"
//             style={{ fontFamily: "'CertificateScript', cursive" }}
//           >
//             English Certificate
//           </h2>

//           <p
//             className="mt-2 whitespace-nowrap text-[16px] leading-[1.2] text-[#1c3ca8]"
//             style={{ fontFamily: "'CertificateScript', cursive" }}
//           >
//             Enlightening Minds Empowering Tomorrow
//           </p>
//         </div>

//         {/* Photo frame */}
//         <div className="flex h-[34mm] w-[26mm] shrink-0 items-center justify-center border-[3px] border-[#0a1a5c] bg-white p-1">
//           {student.studentImage ? (
//             <img
//               src={getImageUrl(student.studentImage) || ""}
//               alt={`${student.studentName} ${student.studentLastName}`}
//               className="h-full w-full object-cover"
//               crossOrigin="anonymous"
//               onError={(e) => {
//                 e.currentTarget.style.display = "none";
//               }}
//             />
//           ) : (
//             <div
//               className="flex h-full w-full items-center justify-center bg-blue-50 text-[22px] font-bold text-blue-900"
//               style={{ fontFamily: "'CertificateScript', cursive" }}
//             >
//               {getInitials(student.studentName, student.studentLastName)}
//             </div>
//           )}
//         </div>
//       </div>

//       {/* BODY — Student details */}
//       <div
//         className="relative z-10 mt-[8mm] px-8"
//         style={{ fontFamily: "'CertificateScript', cursive" }}
//       >
//         {/* Row 1 — Student name + S/D of Father name */}
//         <div className="flex items-baseline whitespace-nowrap text-[16px] leading-[2]">
//           <span>This Certificate is awarded to</span>
//           <span
//             className="mx-2 inline-block min-w-[55mm] border-b-2 border-dotted border-black text-center"
//             style={{ lineHeight: 1.1 }}
//           >
//             {student.studentName} {student.studentLastName}
//           </span>
//           <span>S/D of</span>
//           <span
//             className="mx-2 inline-block min-w-[40mm] border-b-2 border-dotted border-black text-center"
//             style={{ lineHeight: 1.1 }}
//           >
//             {student.studentFatherName || ""}
//           </span>
//         </div>

//         {/* Row 2 */}
//         <div className="flex items-baseline whitespace-nowrap text-[16px] leading-[2]">
//           <span>Course Level:</span>
//           <span
//             className="mx-2 inline-block min-w-[55mm] border-b-2 border-dotted border-black text-center"
//             style={{ lineHeight: 1.1 }}
//           >
//             {student.bookLevelOrder ? `Level ${student.bookLevelOrder}` : ""}
//           </span>
//           <span>English for Level:</span>
//           <span
//             className="mx-2 inline-block min-w-[40mm] border-b-2 border-dotted border-black text-center"
//             style={{ lineHeight: 1.1 }}
//           >
//             {student.bookName}
//           </span>
//           <span>at final</span>
//         </div>

//         {/* Row 3 */}
//         <div className="flex items-baseline whitespace-nowrap text-[16px] leading-[2]">
//           <span>grade: (</span>
//           <span
//             className="mx-2 inline-block min-w-[16mm] border-b-2 border-dotted border-black text-center"
//             style={{ lineHeight: 1.1 }}
//           >
//             {percentage}
//           </span>
//           <span>% result:</span>
//           <span
//             className="mx-2 inline-block min-w-[40mm] border-b-2 border-dotted border-black text-center"
//             style={{ lineHeight: 1.1 }}
//           >
//             {resultText}
//           </span>
//           <span>) Date Awarded:</span>
//           <span
//             className="mx-2 inline-block min-w-[12mm] border-b-2 border-dotted border-black text-center"
//             style={{ lineHeight: 1.1 }}
//           >
//             {d}
//           </span>
//           <span>/</span>
//           <span
//             className="mx-2 inline-block min-w-[12mm] border-b-2 border-dotted border-black text-center"
//             style={{ lineHeight: 1.1 }}
//           >
//             {m}
//           </span>
//           <span>/</span>
//           <span
//             className="mx-2 inline-block min-w-[16mm] border-b-2 border-dotted border-black text-center"
//             style={{ lineHeight: 1.1 }}
//           >
//             {y}
//           </span>
//         </div>
//       </div>

//       {/* FOOTER — Signatures */}
//       <div className="absolute bottom-[10mm] left-0 right-0 z-10 flex items-end justify-around px-[22mm]">
//         <p
//           className="text-[26px]"
//           style={{
//             fontFamily: "'CertificateScript', cursive",
//             color: "#c9a227",
//           }}
//         >
//           Director sign
//         </p>

//         <p
//           className="text-[26px]"
//           style={{
//             fontFamily: "'CertificateScript', cursive",
//             color: "#c9a227",
//           }}
//         >
//           Instructor sign
//         </p>
//       </div>
//     </div>
//   );
// };




// Wrapper that switches between the two designs based on the selected design
const ResultCard = ({
  student,
  design,
}: {
  student: StudentForScoring;
  design: ResultCardDesign;
}) => {
  if (design === "design-2") {
    return <ResultCardDesign2 student={student} />;
  }
  return <ResultCardDesign1 student={student} />;
};

// ============================================
// MAIN PAGE
// ============================================
const PrintResultCard = () => {
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

  const [students, setStudents] = useState<StudentForScoring[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const [loading, setLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [error, setError] = useState("");

  // ✅ Design selection
  const [design, setDesign] = useState<ResultCardDesign>("design-1");

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
  // DOWNLOAD AS PDF (2 cards per A4 page)
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
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const cards = document.querySelectorAll<HTMLElement>(".result-card");
      if (cards.length === 0) return;

      const A4_W = 210;
      const A4_H = 297;
      const CARD_H = A4_H / 2; // 148.5mm

      for (let i = 0; i < cards.length; i++) {
        const canvas = await html2canvas(cards[i], {
          scale: 2,
          useCORS: true,
          backgroundColor: "#ffffff",
          logging: false,
        });

        const imgData = canvas.toDataURL("image/jpeg", 0.95);

        const slot = i % 2;
        const y = slot * CARD_H;

        if (i > 0 && slot === 0) pdf.addPage();

        pdf.addImage(imgData, "JPEG", 0, y, A4_W, CARD_H, undefined, "FAST");
      }

      const fileName = `result-cards-${formatShamsi(
        new Date(),
        "YYYY-MM-DD"
      )}.pdf`;
      pdf.save(fileName);
    } catch (err) {
      console.error("Failed to generate PDF:", err);
      setError(err instanceof Error ? err.message : "Failed to generate PDF");
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
      {/* HEADER */}
      <div className="mb-6 print:hidden">
        <h1 className="text-2xl font-bold text-gray-900">Print Result Card</h1>
        <p className="mt-1 text-sm text-gray-500">
          چاپ نمودن ریزلت کارت — Print or download PDF (2 cards per A4 page)
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 print:hidden">
          <p className="text-sm font-medium text-red-700">{error}</p>
        </div>
      )}

      {/* FILTERS */}
      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm print:hidden">
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
                <ShamsiDatePicker
                  value={fromDate}
                  onChange={setFromDate}
                  placeholder="انتخاب تاریخ"
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
                <ShamsiDatePicker
                  value={toDate}
                  onChange={setToDate}
                  placeholder="انتخاب تاریخ"
                />
              </div>

              {/* ✅ Design selector */}
              <div className="sm:col-span-2 lg:col-span-3">
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Result Card Design
                </label>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {/* Design 1 */}
                  <button
                    type="button"
                    onClick={() => setDesign("design-1")}
                    className={`flex items-center gap-3 rounded-lg border-2 px-4 py-3 text-left transition ${
                      design === "design-1"
                        ? "border-blue-600 bg-blue-50"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    <div className="flex h-10 w-16 shrink-0 items-center justify-center rounded border border-amber-500 bg-white">
                      <span className="text-[9px] font-bold text-blue-900">
                        CERT
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        Design 1 — Certificate
                      </p>
                      <p className="text-xs text-gray-500">
                        Traditional certificate with gold & blue border
                      </p>
                    </div>
                    {design === "design-1" && (
                      <svg
                        className="ml-auto h-5 w-5 text-blue-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </button>

                  {/* Design 2 */}
                  <button
                    type="button"
                    onClick={() => setDesign("design-2")}
                    className={`flex items-center gap-3 rounded-lg border-2 px-4 py-3 text-left transition ${
                      design === "design-2"
                        ? "border-blue-600 bg-blue-50"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    <div className="flex h-10 w-16 shrink-0 items-center justify-center rounded border border-blue-900 bg-gradient-to-br from-blue-50 to-amber-50">
                      <span className="text-[9px] font-bold text-blue-900">
                        RIBBON
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        Design 2 — Elegant Ribbon
                      </p>
                      <p className="text-xs text-gray-500">
                        Corner ribbons, logo, dotted fill-in lines
                      </p>
                    </div>
                    {design === "design-2" && (
                      <svg
                        className="ml-auto h-5 w-5 text-blue-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </button>
                </div>
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

      {/* NO RESULTS */}
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

      {/* ACTION BUTTONS */}
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

      {/* RESULT CARDS */}
      {hasResults && (
        <div
          id="print-area"
          className="mx-auto flex flex-col items-center gap-10 print:gap-0"
        >
          {students.map((student) => (
            <ResultCard
              key={student.enrollmentId}
              student={student}
              design={design}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default PrintResultCard;