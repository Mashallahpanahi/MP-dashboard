// src/pages/Dashboard/Dashboard.tsx
import { useEffect, useState, useMemo } from "react";
import {
  getDashboardReport,
  type DashboardReportResponse,
} from "@/api/dashboardApi";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
// ✅ Shamsi date picker (from utils)
import ShamsiDatePicker from "@/utils/ShamsiDatePicker";
// ✅ Shamsi conversion utils
import {
  convertToMillady,
  convertToShamsi,
  formatShamsi,
  todayShamsi,
  SHAMSI_MONTHS,
} from "@/utils/dateConverter";

// ============================================
// HELPERS
// ============================================
const formatCurrency = (v: number) =>
  `$${v.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const formatCompact = (v: number) =>
  v >= 1000 ? `${(v / 1000).toFixed(v >= 10000 ? 0 : 1)}k` : `${v}`;

// ============================================
// SUMMARY CARD
// ============================================
interface SummaryCardProps {
  title: string;
  value: string;
  color: string;
  iconColor: string;
  icon: React.ReactNode;
}

const SummaryCard = ({
  title,
  value,
  color,
  iconColor,
  icon,
}: SummaryCardProps) => (
  <div className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition hover:shadow-md sm:p-5">
    <div
      className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full ${color} ${iconColor} sm:h-14 sm:w-14`}
    >
      {icon}
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-xs font-medium text-gray-500">{title}</p>
      <p className="mt-1 truncate text-xl font-bold text-gray-900 sm:text-2xl">
        {value}
      </p>
    </div>
  </div>
);

// ============================================
// MINI CALENDAR (Shamsi)
// ============================================
const MiniCalendar = () => {
  const todayS = todayShamsi();
  const [currentYear, setCurrentYear] = useState(todayS.year);
  const [currentMonth, setCurrentMonth] = useState(todayS.month); // 1..12

  const dayNames = ["ش", "ی", "د", "س", "چ", "پ", "ج"];

  // Days in Shamsi month
  const getDaysInShamsiMonth = (year: number, month: number): number => {
    if (month <= 6) return 31;
    if (month <= 11) return 30;
    const leapRemainders = [1, 5, 9, 13, 17, 22, 26, 30];
    return leapRemainders.includes((year + 12) % 33) ? 30 : 29;
  };

  const daysInMonth = getDaysInShamsiMonth(currentYear, currentMonth);

  // Weekday of first day (Sat=0 ... Fri=6)
  const firstMiladi = convertToMillady({
    year: currentYear,
    month: currentMonth,
    day: 1,
  });
  const firstJsDate = new Date(
    firstMiladi.year,
    firstMiladi.month - 1,
    firstMiladi.day
  );
  const jsDay = firstJsDate.getDay(); // Sun=0..Sat=6
  const firstDay = (jsDay + 1) % 7;

  const days: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);

  const isToday = (d: number) =>
    d === todayS.day &&
    currentMonth === todayS.month &&
    currentYear === todayS.year;

  const prevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear((y) => y - 1);
    } else setCurrentMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear((y) => y + 1);
    } else setCurrentMonth((m) => m + 1);
  };

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-semibold text-gray-900">Calendar</h3>
        <div className="flex items-center gap-1">
          <button
            onClick={prevMonth}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="text-sm font-medium text-gray-700">
            {SHAMSI_MONTHS[currentMonth - 1]} {currentYear}
          </span>
          <button
            onClick={nextMonth}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      <div className="mb-2 grid grid-cols-7 gap-1">
        {dayNames.map((d) => (
          <div
            key={d}
            className="py-1 text-center text-[10px] font-semibold uppercase text-gray-400"
          >
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((d, idx) => (
          <div
            key={idx}
            className={`flex h-8 items-center justify-center rounded-lg text-xs font-medium transition ${
              d === null
                ? ""
                : isToday(d)
                ? "bg-blue-600 text-white"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            {d || ""}
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================
// MAIN DASHBOARD
// ============================================
const Dashboard = () => {
  const [report, setReport] = useState<DashboardReportResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  // ⚠️ Stored as MILADI ISO ("YYYY-MM-DD") for the backend
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // ============================================
  // FETCH
  // ============================================
  const fetchReport = async (
    fDate?: string,
    tDate?: string,
    isRefresh = false
  ) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError("");

      const data = await getDashboardReport(fDate, tDate);
      setReport(data);
    } catch (err) {
      console.error("Failed to fetch dashboard report:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load dashboard report"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleApply = () => {
    fetchReport(fromDate || undefined, toDate || undefined);
  };

  const handleClear = () => {
    setFromDate("");
    setToDate("");
    fetchReport();
  };

  const data = report?.data;

  // ============================================
  // CHART DATA
  // ============================================
  const donutData = useMemo(() => {
    if (!data) return [];
    return [
      { name: "Active", value: data.totalActiveStudents, color: "#3b82f6" },
      { name: "Inactive", value: data.totalInactiveStudents, color: "#10b981" },
    ];
  }, [data]);

  const totalStudentsForDonut =
    (data?.totalActiveStudents || 0) + (data?.totalInactiveStudents || 0);

  const barData = useMemo(() => {
    if (!data) return [];
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const income = data.totalIncome || 0;
    const expenses = data.totalExpenses || 0;

    const incomePattern = [0.85, 0.6, 0.7, 0.5, 0.65, 0.9];
    const expensePattern = [0.2, 0.15, 0.18, 0.12, 0.14, 0.21];

    return days.map((d, i) => ({
      day: d,
      Income: Math.round(income * incomePattern[i]),
      Expenses: Math.round(expenses * expensePattern[i]),
    }));
  }, [data]);

  // ============================================
  // LOADING
  // ============================================
  if (loading && !report) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
          <p className="mt-4 text-sm text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // ============================================
  // RENDER
  // ============================================
  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
      {/* ============================================ */}
      {/* TOP BAR */}
      {/* ============================================ */}
      <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
          Welcome Back <span className="inline-block">👋</span>
        </h1>

        <div className="flex flex-wrap items-center gap-2">
          {/* From Date — Shamsi picker */}
          <div className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5">
            <label className="text-xs font-medium text-gray-500">From:</label>
            <ShamsiDatePicker
              value={fromDate}
              onChange={setFromDate}
              placeholder="1403/07/02"
            />
          </div>

          {/* To Date — Shamsi picker */}
          <div className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5">
            <label className="text-xs font-medium text-gray-500">To:</label>
            <ShamsiDatePicker
              value={toDate}
              onChange={setToDate}
              placeholder="1403/12/29"
            />
          </div>

          {/* Apply */}
          <button
            onClick={handleApply}
            disabled={loading}
            className="rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Apply
          </button>

          {/* Clear */}
          <button
            onClick={handleClear}
            disabled={loading}
            className="rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Clear
          </button>

          {/* Refresh */}
          <button
            onClick={() =>
              fetchReport(fromDate || undefined, toDate || undefined, true)
            }
            disabled={refreshing}
            className="rounded-full border border-gray-300 bg-white p-2.5 text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            title="Refresh"
          >
            <svg
              className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>

          {/* Avatar */}
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-sm font-semibold text-white shadow-sm">
            JA
          </div>
        </div>
      </div>

      {/* Filter info — display in Shamsi */}
      {report?.filters && (
        <div className="mb-4 text-xs text-gray-500">
          {report.filters.effectiveFrom || report.filters.effectiveTo ? (
            <>
              Showing:{" "}
              <span className="font-medium text-gray-700">
                {report.filters.effectiveFrom
                  ? formatShamsi(report.filters.effectiveFrom, "YYYY/MM/DD")
                  : "Beginning"}{" "}
                →{" "}
                {report.filters.effectiveTo
                  ? formatShamsi(report.filters.effectiveTo, "YYYY/MM/DD")
                  : "Now"}
              </span>
            </>
          ) : (
            <span className="font-medium text-gray-700">All-time totals</span>
          )}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-medium text-red-700">{error}</p>
        </div>
      )}

      {/* ============================================ */}
      {/* 1. CHARTS */}
      {/* ============================================ */}
      <div className="mb-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Donut */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-base font-semibold text-gray-900">
            Total Students by Status
          </h3>

          <div className="relative h-56 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={donutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={95}
                  paddingAngle={2}
                  dataKey="value"
                  startAngle={90}
                  endAngle={-270}
                  stroke="none"
                >
                  {donutData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-3xl font-bold text-gray-900">
                {totalStudentsForDonut.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500">Total</p>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-center gap-6">
            {donutData.map((d) => (
              <div key={d.name} className="flex items-center gap-2">
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: d.color }}
                />
                <span className="text-xs font-medium text-gray-600">
                  {d.name}: {d.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Bar */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm xl:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-900">
              Financial Activity
            </h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-blue-500" />
                <span className="text-xs font-medium text-gray-600">Income</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-emerald-400" />
                <span className="text-xs font-medium text-gray-600">Expenses</span>
              </div>
            </div>
          </div>

          <div className="h-56 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={barData}
                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                barGap={8}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 12, fill: "#64748b" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "#64748b" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) =>
                    v >= 1000 ? `${(v / 1000).toFixed(0)}k` : `${v}`
                  }
                />
                <Tooltip
                  formatter={(value: number) => `$${value.toLocaleString()}`}
                  contentStyle={{
                    borderRadius: 8,
                    border: "1px solid #e5e7eb",
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="Income" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Expenses" fill="#34d399" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ============================================ */}
      {/* 2. ALL SUMMARY CARDS IN ONE GRID */}
      {/* ============================================ */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {/* Total Students */}
        <SummaryCard
          title="Total Students"
          value={formatCompact(data?.totalStudents || 0)}
          color="bg-blue-100"
          iconColor="text-blue-600"
          icon={
            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
            </svg>
          }
        />

        {/* Active Students */}
        <SummaryCard
          title="Active Students"
          value={formatCompact(data?.totalActiveStudents || 0)}
          color="bg-emerald-100"
          iconColor="text-emerald-600"
          icon={
            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />

        {/* Inactive Students */}
        <SummaryCard
          title="Inactive Students"
          value={formatCompact(data?.totalInactiveStudents || 0)}
          color="bg-orange-100"
          iconColor="text-orange-600"
          icon={
            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          }
        />

        {/* Enrolled Students */}
        <SummaryCard
          title="Enrolled Students"
          value={formatCompact(data?.totalEnrolledStudents || 0)}
          color="bg-purple-100"
          iconColor="text-purple-600"
          icon={
            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
        />

        {/* Active Teachers */}
        <SummaryCard
          title="Active Teachers"
          value={formatCompact(data?.totalActiveTeachers || 0)}
          color="bg-indigo-100"
          iconColor="text-indigo-600"
          icon={
            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          }
        />

        {/* Total Income */}
        <SummaryCard
          title="Total Income"
          value={formatCurrency(data?.totalIncome || 0)}
          color="bg-green-100"
          iconColor="text-green-600"
          icon={
            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />

        {/* Payroll Expenses */}
        <SummaryCard
          title="Payroll Expenses"
          value={formatCurrency(data?.totalPayrollExpenses || 0)}
          color="bg-amber-100"
          iconColor="text-amber-600"
          icon={
            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          }
        />

        {/* Other Expenses */}
        <SummaryCard
          title="Other Expenses"
          value={formatCurrency(data?.totalOtherExpenses || 0)}
          color="bg-rose-100"
          iconColor="text-rose-600"
          icon={
            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5h.01M15 14.5h.01" />
            </svg>
          }
        />

        {/* Total Expenses */}
        <SummaryCard
          title="Total Expenses"
          value={formatCurrency(data?.totalExpenses || 0)}
          color="bg-red-100"
          iconColor="text-red-600"
          icon={
            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4m16 0l-4-4m4 4l-4 4" />
            </svg>
          }
        />

        {/* Total Benefit */}
        <SummaryCard
          title="Total Benefit"
          value={formatCurrency(data?.totalBenefit || 0)}
          color={
            (data?.totalBenefit || 0) >= 0 ? "bg-emerald-100" : "bg-red-100"
          }
          iconColor={
            (data?.totalBenefit || 0) >= 0
              ? "text-emerald-600"
              : "text-red-600"
          }
          icon={
            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          }
        />
      </div>

      {/* ============================================ */}
      {/* 3. NOTICE BOARD + CALENDAR */}
      {/* ============================================ */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm xl:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-900">
              Notice Board
            </h3>
            <button className="rounded-lg bg-blue-600 p-2 text-white transition hover:bg-blue-700">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>

          <div className="space-y-4">
            {[
              {
                title: "School annual sports day celebration 2026",
                date: "20 July, 2026",
                color: "from-blue-500 to-cyan-500",
                highlight: true,
              },
              {
                title: "Annual Function celebration 2026–27",
                date: "05 July, 2026",
                color: "from-pink-500 to-rose-500",
              },
              {
                title: "Mid term examination routine published",
                date: "15 June, 2026",
                color: "from-amber-500 to-orange-500",
              },
              {
                title: "Inter school annual painting competition",
                date: "18 May, 2026",
                color: "from-purple-500 to-indigo-500",
              },
            ].map((notice, idx) => (
              <div
                key={idx}
                className="flex items-center gap-4 rounded-xl border border-gray-100 p-3 transition hover:bg-gray-50"
              >
                <div
                  className={`h-14 w-14 flex-shrink-0 rounded-lg bg-gradient-to-br ${notice.color}`}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-gray-900">
                    {notice.title}
                  </p>
                  <div className="mt-1 flex items-center gap-3">
                    <span
                      className={`rounded-md px-2 py-0.5 text-xs font-medium ${
                        notice.highlight
                          ? "bg-blue-100 text-blue-700"
                          : "text-gray-500"
                      }`}
                    >
                      {notice.date}
                    </span>
                  </div>
                </div>
                <button className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <circle cx="4" cy="10" r="1.5" />
                    <circle cx="10" cy="10" r="1.5" />
                    <circle cx="16" cy="10" r="1.5" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>

        <MiniCalendar />
      </div>
    </div>
  );
};

export default Dashboard;