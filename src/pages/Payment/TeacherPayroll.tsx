// src/pages/Payment/TeacherPayroll.tsx
import { useEffect, useState } from "react";
import { 
  getTeacherPayrolls, 
  deleteTeacherPayroll,
  getTeacherPayrollById,
  updateTeacherPayroll,
  generateTeacherPayroll
} from "@/api/teacherPayrollApi";
import type { TeacherPayroll, UpdateTeacherPayrollData, GeneratePayrollDto } from "@/types/teacherPayroll";
import { TeacherPayrollDeleteModal, TeacherPayrollUpdateModal, TeacherPayrollGenerateModal } from "@/components/teacher-payroll";

const TeacherPayrollPage = () => {
  const [payrolls, setPayrolls] = useState<TeacherPayroll[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Delete state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [payrollToDelete, setPayrollToDelete] = useState<TeacherPayroll | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Update state
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [payrollToUpdate, setPayrollToUpdate] = useState<TeacherPayroll | null>(null);
  const [updateLoading, setUpdateLoading] = useState(false);

  // Generate state
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [generateLoading, setGenerateLoading] = useState(false);

  const fetchPayrolls = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getTeacherPayrolls();
      setPayrolls(data);
    } catch (error) {
      console.error("Failed to fetch teacher payrolls:", error);
      setError(
        error instanceof Error ? error.message : "Failed to fetch teacher payrolls"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayrolls();
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
  };

  const handleCloseUpdate = () => {
    setShowUpdateModal(false);
    setPayrollToUpdate(null);
  };

  // Generate handlers
  const handleGenerateClick = () => {
    setShowGenerateModal(true);
  };

  const handleGeneratePayroll = async (data: GeneratePayrollDto) => {
    try {
      setGenerateLoading(true);
      const newPayroll = await generateTeacherPayroll(data);
      setPayrolls((prev) => [newPayroll, ...prev]);
      setShowGenerateModal(false);
    } catch (error) {
      console.error("Failed to generate payroll:", error);
      setError(
        error instanceof Error ? error.message : "Failed to generate payroll"
      );
      throw error;
    } finally {
      setGenerateLoading(false);
    }
  };

  const handleCloseGenerate = () => {
    setShowGenerateModal(false);
  };

  // Helper function to format currency
  const formatCurrency = (amount: number): string => {
    return `$${amount.toFixed(2)}`;
  };

  // Helper function to get status badge color
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      Paid: 'bg-green-100 text-green-700',
      Pending: 'bg-yellow-100 text-yellow-700',
      Overdue: 'bg-red-100 text-red-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  // Helper function to get status dot color
  const getStatusDotColor = (status: string) => {
    const colors: Record<string, string> = {
      Paid: 'bg-green-500',
      Pending: 'bg-yellow-500',
      Overdue: 'bg-red-500'
    };
    return colors[status] || 'bg-gray-500';
  };

  // Helper function to get payment method badge
  const getPaymentMethodColor = (method: string) => {
    const colors: Record<string, string> = {
      Cash: 'bg-blue-100 text-blue-700',
      Bank: 'bg-purple-100 text-purple-700',
      Cheque: 'bg-pink-100 text-pink-700'
    };
    return colors[method] || 'bg-gray-100 text-gray-700';
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
          <p className="mt-4 text-sm text-gray-500">Loading payroll records...</p>
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
            View and manage all teacher payroll records
          </p>
        </div>
        <button
          onClick={handleGenerateClick}
          className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          Generate Payroll
        </button>
      </div>

      {/* Summary Cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Total Records</p>
          <p className="text-2xl font-bold text-gray-900">
            {payrolls.length}
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Total Salary</p>
          <p className="text-2xl font-bold text-blue-600">
            {formatCurrency(payrolls.reduce((sum, p) => sum + p.netSalary, 0))}
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Paid</p>
          <p className="text-2xl font-bold text-green-600">
            {formatCurrency(payrolls.filter(p => p.status === 'Paid').reduce((sum, p) => sum + p.netSalary, 0))}
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">
            {formatCurrency(payrolls.filter(p => p.status !== 'Paid').reduce((sum, p) => sum + p.netSalary, 0))}
          </p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-medium text-red-700">{error}</p>
        </div>
      )}

      {/* Empty State */}
      {payrolls.length === 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-10 text-center shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900">No Payroll Records Found</h3>
          <p className="mt-2 text-sm text-gray-500">
            There are no teacher payroll records yet.
          </p>
          <button
            onClick={handleGenerateClick}
            className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Generate First Payroll
          </button>
        </div>
      )}

      {/* Payroll Table */}
      {payrolls.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr className="border-b border-gray-200">
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Teacher
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Month
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Base Salary
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Bonus
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Deductions
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Net Salary
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Method
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {payrolls.map((payroll) => (
                  <tr key={payroll.id} className="transition hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {payroll.teacher.firstName} {payroll.teacher.lastName}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          {payroll.teacher.email}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-gray-900">
                        {new Date(payroll.month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-gray-900">
                        {formatCurrency(payroll.baseSalary)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-green-600">
                        {formatCurrency(payroll.bonus || 0)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-red-600">
                        {formatCurrency(payroll.deductions || 0)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-blue-600">
                        {formatCurrency(payroll.netSalary)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {payroll.paymentMethod && (
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${getPaymentMethodColor(payroll.paymentMethod)}`}>
                          {payroll.paymentMethod}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(payroll.status)}`}>
                        <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${getStatusDotColor(payroll.status)}`} />
                        {payroll.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleUpdateClick(payroll)}
                          className="inline-flex items-center rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-blue-600 transition hover:bg-blue-100"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteClick(payroll)}
                          disabled={deleteLoading}
                          className="inline-flex items-center rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Delete
                        </button>
                      </div>
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

      {/* Generate Modal */}
      <TeacherPayrollGenerateModal
        isOpen={showGenerateModal}
        onClose={handleCloseGenerate}
        onGenerate={handleGeneratePayroll}
        isLoading={generateLoading}
      />
    </div>
  );
};

export default TeacherPayrollPage;