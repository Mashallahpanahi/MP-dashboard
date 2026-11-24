// src/components/teachers/TeacherForm.tsx

import React, { useEffect, useState } from "react";
import {
  useCreateTeacher,
  useUpdateTeacher,
  type CreateTeacherData,
} from "../../../api/teacherApi";

import Button from "../../common/Button/Button";
import Input from "../../common/Input/Input";
import Select from "../../common/Select/Select";
import Card from "../../common/Card/Card";

// Backend supports only Fixed / PerStudent
const SalaryType = {
  FIXED: "Fixed",
  PER_STUDENT: "PerStudent",
} as const;

type SalaryType = (typeof SalaryType)[keyof typeof SalaryType];

interface TeacherFormProps {
  initialData?: any;
  onSubmit?: (data: CreateTeacherData) => void;
  onCancel: () => void;
  loading?: boolean;
  isEdit?: boolean;
}

interface TeacherFormValues {
  firstName: string;
  lastName: string;
  gender: string;
  phone: string;
  email: string;
  address: string;
  salaryType: SalaryType;
  salaryAmount: string | number;
  feePercentage: number;
  hireDate: string;
  isActive: boolean;
}

type FormErrors = Partial<Record<keyof TeacherFormValues, string>>;

const TeacherForm: React.FC<TeacherFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  loading: externalLoading = false,
  isEdit = false,
}) => {
  // API hooks — do the actual create / update
  const {
    createTeacher,
    loading: creating,
    error: createError,
  } = useCreateTeacher();
  const {
    updateTeacher,
    loading: updating,
    error: updateError,
  } = useUpdateTeacher();

  const isLoading = externalLoading || creating || updating;
  const apiError = createError || updateError || "";

  const [salaryType, setSalaryType] = useState<SalaryType>(
    initialData?.salaryType || SalaryType.FIXED,
  );

  const [values, setValues] = useState<TeacherFormValues>({
    firstName: initialData?.firstName || "",
    lastName: initialData?.lastName || "",
    gender: initialData?.gender || "",
    phone: initialData?.phone || "",
    email: initialData?.email || "",
    address: initialData?.address || "",
    salaryType: initialData?.salaryType || SalaryType.FIXED,
    salaryAmount: initialData?.salaryAmount ?? "",
    feePercentage: initialData?.feePercentage ?? 40,
    hireDate: initialData?.hireDate || new Date().toISOString().split("T")[0],
    isActive: initialData?.isActive !== undefined ? initialData.isActive : true,
  });

  const [errors, setErrors] = useState<FormErrors>({});

  // Keep values.salaryType in sync with the Select
  useEffect(() => {
    setValues((prev) => ({ ...prev, salaryType }));
  }, [salaryType]);

  // Reload values when initialData arrives (edit mode)
  useEffect(() => {
    if (!initialData) return;
    setValues({
      firstName: initialData.firstName || "",
      lastName: initialData.lastName || "",
      gender: initialData.gender || "",
      phone: initialData.phone || "",
      email: initialData.email || "",
      address: initialData.address || "",
      salaryType: initialData.salaryType || SalaryType.FIXED,
      salaryAmount: initialData.salaryAmount ?? "",
      feePercentage: initialData.feePercentage ?? 40,
      hireDate: initialData.hireDate || new Date().toISOString().split("T")[0],
      isActive:
        initialData.isActive !== undefined ? initialData.isActive : true,
    });
    setSalaryType(initialData.salaryType || SalaryType.FIXED);
  }, [initialData]);

  const handleChange = <K extends keyof TeacherFormValues>(
    field: K,
    value: TeacherFormValues[K],
  ) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!values.firstName) newErrors.firstName = "First name is required";
    if (!values.lastName) newErrors.lastName = "Last name is required";
    if (!values.hireDate) newErrors.hireDate = "Hire date is required";
    if (salaryType === SalaryType.FIXED && !values.salaryAmount) {
      newErrors.salaryAmount = "Salary amount is required for fixed salary";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validate() || isLoading) return;

    const payload: CreateTeacherData = {
      firstName: values.firstName,
      lastName: values.lastName,
      gender: values.gender,
      phone: values.phone,
      salaryType,
      salaryAmount: Number(values.salaryAmount) || 0,
      feePercentage: Number(values.feePercentage) || 0,
      hireDate: values.hireDate,
      isActive: values.isActive,
      // Omit optional strings when empty — avoids backend @IsEmail() rejecting ""
      ...(values.email ? { email: values.email } : {}),
      ...(values.address ? { address: values.address } : {}),
    };

    let success = false;

    if (isEdit) {
      if (!initialData?.id) {
        console.error("Cannot update teacher: teacher ID is missing.");
        return;
      }
      success = await updateTeacher(initialData.id, payload);
    } else {
      success = await createTeacher(payload);
    }

    if (success && onSubmit) {
      onSubmit(payload);
    }
  };

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
      {/* API error banner (friendly-mapped in teacherApi.ts) */}
      {apiError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3">
          <p className="text-sm font-medium text-red-700">{apiError}</p>
        </div>
      )}

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
              {/* ✅ Event-based onChange — matches your Select component */}
              <Select
                label="Gender"
                name="gender"
                value={values.gender}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  handleChange("gender", e.target.value)
                }
                options={genderOptions}
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

            {/* ✅ Event-based onChange + no placeholder */}
            <Select
              label="Salary Type"
              name="salaryType"
              value={salaryType}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                setSalaryType(e.target.value as SalaryType)
              }
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
            disabled={isLoading}
            className="order-2 sm:order-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={isLoading}
            disabled={isLoading}
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
