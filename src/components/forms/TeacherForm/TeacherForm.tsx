// src/components/teachers/TeacherForm.tsx
import React, { useEffect, useState } from "react";
import { useForm } from "../../../hooks/useForm";
// ✅ Local SalaryType — backend only supports Fixed / PerStudent
// (replaces the deleted src/api/types/teacher.types.ts enum)
const SalaryType = {
  FIXED: "Fixed",
  PER_STUDENT: "PerStudent",
} as const;
type SalaryType = (typeof SalaryType)[keyof typeof SalaryType];

import Button from "../../common/Button/Button";
import Input from "../../common/Input/Input";
import Select from "../../common/Select/Select";
import Card from "../../common/Card/Card";

interface TeacherFormProps {
  initialData?: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  loading?: boolean;
  isEdit?: boolean;
}

const TeacherForm: React.FC<TeacherFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  loading = false,
  isEdit = false,
}) => {
  const [salaryType, setSalaryType] = useState<SalaryType>(
    initialData?.salaryType || SalaryType.FIXED,
  );

  const { values, errors, handleChange, handleSubmit, setValues } = useForm({
    initialValues: {
      firstName: initialData?.firstName || "",
      lastName: initialData?.lastName || "",
      gender: initialData?.gender || "",
      phone: initialData?.phone || "",
      email: initialData?.email || "",
      address: initialData?.address || "",
      salaryType: initialData?.salaryType || SalaryType.FIXED,
      salaryAmount: initialData?.salaryAmount || "",
      feePercentage: initialData?.feePercentage || 40,
      hireDate: initialData?.hireDate || new Date().toISOString().split("T")[0],
      isActive:
        initialData?.isActive !== undefined ? initialData.isActive : true,
    },
    validate: (vals) => {
      const errors: any = {};
      if (!vals.firstName) errors.firstName = "First name is required";
      if (!vals.lastName) errors.lastName = "Last name is required";
      if (!vals.hireDate) errors.hireDate = "Hire date is required";

      if (vals.salaryType === SalaryType.FIXED && !vals.salaryAmount) {
        errors.salaryAmount = "Salary amount is required for fixed salary";
      }

      return errors;
    },
    onSubmit,
  });

  useEffect(() => {
    setValues((prev) => ({ ...prev, salaryType }));
  }, [salaryType, setValues]);

  useEffect(() => {
    if (initialData) {
      setValues(initialData);
      setSalaryType(initialData.salaryType || SalaryType.FIXED);
    }
  }, [initialData, setValues]);

  const salaryTypeOptions = [
    { value: SalaryType.FIXED, label: "Fixed Salary" },
    { value: SalaryType.PER_STUDENT, label: "Per Student" },
  ];

  const genderOptions = [
    { value: "Male", label: "Male" },
    { value: "Female", label: "Female" },
    { value: "Other", label: "Other" },
  ];

  const renderSalaryFields = () => {
    switch (salaryType) {
      case SalaryType.FIXED:
        return (
          <Input
            label="Monthly Salary Amount"
            name="salaryAmount"
            type="number"
            value={values.salaryAmount}
            onChange={(e) => handleChange("salaryAmount", e.target.value)}
            error={errors.salaryAmount}
            placeholder="e.g., 20000"
            required
          />
        );

      case SalaryType.PER_STUDENT:
        return (
          <Input
            label="Amount Per Student"
            name="salaryAmount"
            type="number"
            value={values.salaryAmount}
            onChange={(e) => handleChange("salaryAmount", e.target.value)}
            error={errors.salaryAmount}
            placeholder="e.g., 500"
            required
          />
        );

      default:
        return null;
    }
  };

  return (
    <Card title={isEdit ? "Edit Teacher" : "Add New Teacher"}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
              Personal Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="First Name"
                name="firstName"
                value={values.firstName}
                onChange={(e) => handleChange("firstName", e.target.value)}
                error={errors.firstName}
                placeholder="Enter first name"
                required
              />

              <Input
                label="Last Name"
                name="lastName"
                value={values.lastName}
                onChange={(e) => handleChange("lastName", e.target.value)}
                error={errors.lastName}
                placeholder="Enter last name"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Gender"
                name="gender"
                value={values.gender}
                onChange={(value) => handleChange("gender", value)}
                options={genderOptions}
                placeholder="Select gender"
              />

              <Input
                label="Phone"
                name="phone"
                type="tel"
                value={values.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                placeholder="+93 700 123 456"
              />
            </div>

            <Input
              label="Email"
              name="email"
              type="email"
              value={values.email}
              onChange={(e) => handleChange("email", e.target.value)}
              placeholder="teacher@example.com"
            />

            <Input
              label="Address"
              name="address"
              value={values.address}
              onChange={(e) => handleChange("address", e.target.value)}
              placeholder="Enter address"
            />
          </div>

          {/* Employment Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
              Employment Information
            </h3>

            <Input
              label="Hire Date"
              name="hireDate"
              type="date"
              value={values.hireDate}
              onChange={(e) => handleChange("hireDate", e.target.value)}
              error={errors.hireDate}
              required
            />

            <Select
              label="Salary Type"
              name="salaryType"
              value={salaryType}
              onChange={(value) => setSalaryType(value as SalaryType)}
              options={salaryTypeOptions}
              required
            />

            {renderSalaryFields()}

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="isActive"
                checked={values.isActive}
                onChange={(e) => handleChange("isActive", e.target.checked)}
                className="w-4 h-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500"
              />
              <label
                htmlFor="isActive"
                className="text-sm font-medium text-gray-700 cursor-pointer"
              >
                Active
              </label>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-gray-200">
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={loading}
            className="order-2 sm:order-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={loading}
            disabled={loading}
            className="order-1 sm:order-2"
          >
            {isEdit ? "Update Teacher" : "Create Teacher"}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default TeacherForm;
