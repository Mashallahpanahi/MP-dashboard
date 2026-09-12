// src/pages/Payment/TeacherPayroll.tsx
import { useEffect, useState } from "react";
import { 
  getTeacherPayrolls, 
  deleteTeacherPayroll,
  getTeacherPayrollById,
  updateTeacherPayroll,
  createTeacherPayroll,
  addPaymentToPayroll,
  getUnpaidSalaries
} from "@/api/teacherPayrollApi";
import type { 
  TeacherPayroll, 
  UpdateTeacherPayrollData, 
  CreateTeacherPayrollData, 
  AddPaymentData,
  UnpaidSalaryRecord
} from "@/types/teacherPayroll";
import { 
  TeacherPayrollDeleteModal, 
  TeacherPayrollUpdateModal, 
  TeacherPayrollCreateModal,
  TeacherPayrollAddPaymentModal,
  TeacherPayrollHistoryModal  // ✅ Add this
} from "@/components/teacher-payroll";

const TeacherPayrollPage = () => {
  const [payrolls, setPayrolls] = useState<TeacherPayroll[]>([]);
  const [unpaidRecords, setUnpaidRecords] = useState<UnpaidSalaryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingUnpaid, setLoadingUnpaid] = useState(true);
  const [error, setError] = useState("");

  // Delete state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [payrollToDelete, setPayrollToDelete] = useState<TeacherPayroll | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Update state
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [payrollToUpdate, setPayrollToUpdate] = useState<TeacherPayroll | null>(null);
  const [updateLoading, setUpdateLoading] = useState(false);

  // Create state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);

  // Add Payment state
  const [showAddPaymentModal, setShowAddPaymentModal] = useState(false);
  const [payrollToAddPayment, setPayrollToAddPayment] = useState<TeacherPayroll | null>(null);
  const [addPaymentLoading, setAddPaymentLoading] = useState(false);

  // ✅ History state
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  // Search state
  const [searchTerm, setSearchTerm] = useState("");

  // Pre-fill data for create modal when paying from unpaid record
  const [prefillData, setPrefillData] = useState<CreateTeacherPayrollData | null>(null);

  const fetchPayrolls = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getTeacherPayrolls();
      setPayrolls(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch teacher payrolls:", error);
      setError(
        error instanceof Error ? error.message : "Failed to fetch teacher payrolls"
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchUnpaidSalaries = async () => {
    try {
      setLoadingUnpaid(true);
      const data = await getUnpaidSalaries();
      setUnpaidRecords(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch unpaid salaries:", error);
    } finally {
      setLoadingUnpaid(false);
    }
  };

  useEffect(() => {
    fetchPayrolls();
    fetchUnpaidSalaries();
  }, []);

  // Delete handlers
  const handleDeleteClick = (payroll: TeacherPayroll) => {
    setPayrollToDelete(payroll);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!payrollToDelete) return;

    try {
      setDeleteLoading(true);
      await deleteTeacherPayroll(payrollToDelete.id);
      setPayrolls((prev) => prev.filter((p) => p.id !== payrollToDelete.id));
      setShowDeleteModal(false);
      setPayrollToDelete(null);
      fetchUnpaidSalaries();
    } catch (error) {
      console.error("Failed to delete payroll:", error);
      setError(
        error instanceof Error ? error.message : "Failed to delete payroll"
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setPayrollToDelete(null);
  };

  // Update handlers
  const handleUpdateClick = async (payroll: TeacherPayroll) => {
    try {
      setUpdateLoading(true);
      const payrollData = await getTeacherPayrollById(payroll.id);
      setPayrollToUpdate(payrollData);
      setShowUpdateModal(true);
    } catch (error) {
      console.error("Failed to fetch payroll for update:", error);
      setError(
        error instanceof Error ? error.message : "Failed to load payroll data"
      );
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleUpdatePayroll = async (id: string, data: UpdateTeacherPayrollData) => {
    const updatedPayroll = await updateTeacherPayroll(id, data);
    setPayrolls((prev) =>
      prev.map((p) =>
        p.id === updatedPayroll.id ? updatedPayroll : p
      )
    );
    fetchUnpaidSalaries();
  };

  const handleCloseUpdate = () => {
    setShowUpdateModal(false);
    setPayrollToUpdate(null);
  };

  // Create handlers
  const handleCreateClick = () => {
    setPrefillData(null);
    setShowCreateModal(true);
  };

  // Handle paying salary for a specific unpaid record
  const handlePayForMonth = (record: UnpaidSalaryRecord) => {
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    const monthNumber = monthNames.indexOf(record.month) + 1;

    const baseSalary = typeof record.salaryAmount === 'string' 
      ? parseFloat(record.salaryAmount) 
      : record.salaryAmount;

    console.log('📤 Prefilling for:', {
      teacher: `${record.firstName} ${record.lastName}`,
      month: record.month,
      monthNumber,
      year: record.year,
      baseSalary,
    });

    setPrefillData({
      teacherId: record.teacherId,
      month: monthNumber,
      year: record.year,
      baseSalary: baseSalary,
      paidAmount: baseSalary,
      remainingSalary: 0,
      date: new Date().toISOString().split('T')[0],
      status: 'Completed',
      notes: `Salary for ${record.month} ${record.year}`,
    });
    setShowCreateModal(true);
  };

  const handleCreatePayroll = async (data: CreateTeacherPayrollData) => {
    try {
      setCreateLoading(true);
      const newPayroll = await createTeacherPayroll(data);
      setPayrolls((prev) => [newPayroll, ...prev]);
      setShowCreateModal(false);
      setPrefillData(null);
      fetchUnpaidSalaries();
    } catch (error) {
      console.error("Failed to create payroll:", error);
      throw error;
    } finally {
      setCreateLoading(false);
    }
  };

  const handleCloseCreate = () => {
    setShowCreateModal(false);
    setPrefillData(null);
  };

  // Add Payment handlers
  const handleAddPaymentClick = (payroll: TeacherPayroll) => {
    setPayrollToAddPayment(payroll);
    setShowAddPaymentModal(true);
  };

  const handleAddPayment = async (id: string, data: AddPaymentData) => {
    try {
      setAddPaymentLoading(true);
      const updatedPayroll = await addPaymentToPayroll(id, data);
      setPayrolls((prev) =>
        prev.map((p) =>
          p.id === updatedPayroll.id ? updatedPayroll : p
        )
      );
      setShowAddPaymentModal(false);
      setPayrollToAddPayment(null);
    } catch (error) {
      console.error("Failed to add payment:", error);
      throw error;
    } finally {
      setAddPaymentLoading(false);
    }
  };

  const handleCloseAddPayment = () => {
    setShowAddPaymentModal(false);
    setPayrollToAddPayment(null);
  };

  // ✅ History handlers
  const handleHistoryClick = () => {
    setShowHistoryModal(true);
  };

  const handleCloseHistory = () => {
    setShowHistoryModal(false);
  };

  // Helper functions
  const formatCurrency = (amount: number | string | null | undefined): string => {
    if (amount === null || amount === undefined || amount === '') return '$0.00';
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(numAmount)) return '$0.00';
    return `$${numAmount.toFixed(2)}`;
  };

  const safeNumber = (value: number | string | null | undefined): number => {
    if (value === null || value === undefined || value === '') return 0;
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return isNaN(num) ? 0 : num;
  };

  const formatDate = (date: string) => {
    if (!date) return 'N/A';
    try {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return 'Invalid date';
    }
  };

  // Filter unpaid records by search
  const filteredUnpaidRecords = unpaidRecords.filter((record) => {
    if (searchTerm === "") return true;
    return (
      record.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.month.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.year.toString().includes(searchTerm)
    );
  });

  if (loadingUnpaid) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
          <p className="mt-4 text-sm text-gray-500">Loading unpaid salaries...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Teacher Payroll</h1>
          <p className="mt-1 text-sm text-gray-500">
            Teachers who haven't received their salary
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {/* ✅ See History of Payment button */}
          <button
            onClick={handleHistoryClick}
            className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            See History of Payment
          </button>
          {/* Refresh button */}
          <button
            onClick={fetchUnpaidSalaries}
            disabled={loadingUnpaid}
            className="inline-flex items-center rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-medium text-red-700">{error}</p>
        </div>
      )}

      {/* Search Bar */}
      <div className="mb-4">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by name, month, or year..."
          className="w-full max-w-md rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
      </div>

      {/* Empty State */}
      {filteredUnpaidRecords.length === 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-10 text-center shadow-sm">
          <div className="mb-4 text-4xl">✅</div>
          <h3 className="text-lg font-semibold text-gray-900">
            {unpaidRecords.length === 0 
              ? "All Teachers Are Paid!" 
              : "No Results Match Your Search"}
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            {unpaidRecords.length === 0 
              ? "All active teachers have received their salaries for all months."
              : "Try adjusting your search criteria."}
          </p>
        </div>
      )}

      {/* Unpaid Records Table */}
      {filteredUnpaidRecords.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr className="border-b border-gray-200">
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Teacher Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Month
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUnpaidRecords.map((record, index) => (
                  <tr
                    key={`${record.teacherId}-${record.monthKey}-${index}`}
                    className="transition hover:bg-gray-50"
                  >
                    {/* Teacher Name */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                          <span className="text-sm font-bold text-red-700">
                            {record.firstName?.charAt(0)}
                            {record.lastName?.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {record.firstName} {record.lastName}
                          </p>
                          <p className="mt-1 text-xs text-gray-500">
                            {record.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Month */}
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-800">
                        {record.month} {record.year}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handlePayForMonth(record)}
                        className="inline-flex items-center rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-700"
                      >
                        <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        Pay Salary
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      <TeacherPayrollDeleteModal
        isOpen={showDeleteModal}
        payroll={payrollToDelete}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        isLoading={deleteLoading}
      />

      {/* Update Modal */}
      <TeacherPayrollUpdateModal
        isOpen={showUpdateModal}
        payroll={payrollToUpdate}
        onClose={handleCloseUpdate}
        onUpdate={handleUpdatePayroll}
        isLoading={updateLoading}
      />

      {/* Create/Pay Salary Modal */}
      <TeacherPayrollCreateModal
        isOpen={showCreateModal}
        onClose={handleCloseCreate}
        onCreate={handleCreatePayroll}
        isLoading={createLoading}
        prefillData={prefillData}
      />

      {/* Add Payment Modal */}
      <TeacherPayrollAddPaymentModal
        isOpen={showAddPaymentModal}
        payroll={payrollToAddPayment}
        onClose={handleCloseAddPayment}
        onAddPayment={handleAddPayment}
        isLoading={addPaymentLoading}
      />

      {/* ✅ History Modal */}
      <TeacherPayrollHistoryModal
        isOpen={showHistoryModal}
        onClose={handleCloseHistory}
      />
    </div>
  );
};

export default TeacherPayrollPage;