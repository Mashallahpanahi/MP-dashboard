// src/pages/Dashboard/Dashboard.tsx
import { useEffect, useState } from "react";
import { getStudentStatistics } from "@/api/dashboardApi";
import type { StudentStatistics } from "@/types/dashboard";

const Dashboard = () => {
  const [stats, setStats] = useState<StudentStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  // ✅ Check if stats need to be refreshed (only for initial load)
  const shouldRefreshStats = () => {
    const lastFetch = localStorage.getItem("studentStatsLastFetch");
    
    if (!lastFetch) return true;
    
    // Refresh if more than 5 minutes have passed
    const fiveMinutes = 5 * 60 * 1000;
    const timeSinceLastFetch = Date.now() - parseInt(lastFetch);
    
    return timeSinceLastFetch > fiveMinutes;
  };

  // ✅ Fetch statistics - forceRefresh = true will always call API
  const fetchStats = async (forceRefresh = false) => {
    try {
      // ✅ Only use cache for initial load if recently fetched
      if (!forceRefresh && !shouldRefreshStats()) {
        const cachedData = localStorage.getItem("studentStats");
        if (cachedData) {
          setStats(JSON.parse(cachedData));
          setLoading(false);
          return;
        }
      }

      // Show loading state
      if (forceRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError("");
      
      // ✅ Always fetch from API when forceRefresh is true
      const data = await getStudentStatistics();
      setStats(data);
      
      // ✅ Update cache
      localStorage.setItem("studentStats", JSON.stringify(data));
      localStorage.setItem("studentStatsLastFetch", Date.now().toString());
    } catch (error) {
      console.error("Failed to fetch student statistics:", error);
      setError(
        error instanceof Error ? error.message : "Failed to load statistics"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // ✅ Listen for force refresh flag from other pages
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "forceRefreshStats" && e.newValue === "true") {
        fetchStats(true);
        localStorage.removeItem("forceRefreshStats");
      }
    };
    
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // ✅ Manual refresh handler - ALWAYS fetches fresh data
  const handleRefresh = () => {
    fetchStats(true);
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
          <p className="mt-4 text-sm text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Overview of your management system
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="inline-flex items-center rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {/* ✅ Show spinner while refreshing */}
          <svg
            className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
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
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm font-medium text-red-700">{error}</p>
            <button
              onClick={() => fetchStats(true)}
              className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* ✅ Student Statistics Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Students */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Total Students
              </p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {stats?.totalStudents || 0}
              </p>
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100">
              <svg
                className="h-7 w-7 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Active Students */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Active Students
              </p>
              <p className="mt-2 text-3xl font-bold text-green-600">
                {stats?.totalActive || 0}
              </p>
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
              <svg
                className="h-7 w-7 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Graduated Students */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Graduated Students
              </p>
              <p className="mt-2 text-3xl font-bold text-purple-600">
                {stats?.totalGraduated || 0}
              </p>
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-purple-100">
              <svg
                className="h-7 w-7 text-purple-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 14l9-5-9-5-9 5 9 5z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Inactive Students */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Inactive Students
              </p>
              <p className="mt-2 text-3xl font-bold text-orange-600">
                {stats?.totalInactive || 0}
              </p>
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-orange-100">
              <svg
                className="h-7 w-7 text-orange-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;