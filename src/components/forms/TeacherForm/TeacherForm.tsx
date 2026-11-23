// src/components/forms/TeacherForm/TeacherForm.tsx

import React, { useEffect, useState } from "react";
import {
  useCreateTeacher,
  useUpdateTeacher,
  CreateTeacherData,
} from "../../../api/teacherApi";

// Backend supports only Fixed / PerStudent
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
  loading = false,
  isEdit = false,
}) => {
  // Teacher API hooks
  const {
    createTeacher,
    loading: createLoading,
    error: createError,
  } = useCreateTeacher();

  const {
    updateTeacher,
    loading: updateLoading,
    error: updateError,
  } = useUpdateTeacher();

  const isLoading = loading || createLoading || updateLoading;
  const apiError = createError || updateError;

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

  // Update form values when salary type changes
  useEffect(() => {
    setValues((prev) => ({ ...prev, salaryType }));
  }, [salaryType]);

  // Load existing teacher data when editing
  useEffect(() => {
    if (initialData) {
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
        hireDate:
          initialData.hireDate || new Date().toISOString().split("T")[0],
        isActive:
          initialData.isActive !== undefined ? initialData.isActive : true,
      });

      setSalaryType(initialData.salaryType || SalaryType.FIXED);
    }
  }, [initialData]);

  // Handle form field changes
  const handleChange = <K extends keyof TeacherFormValues>(
    field: K,
    value: TeacherFormValues[K],
  ) => {
    setValues((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Validate form
  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!values.firstName) {
      newErrors.firstName = "First name is required";
    }

    if (!values.lastName) {
      newErrors.lastName = "Last name is required";
    }

    if (!values.hireDate) {
      newErrors.hireDate = "Hire date is required";
    }

    if (salaryType === SalaryType.FIXED && !values.salaryAmount) {
      newErrors.salaryAmount = "Salary amount is required for fixed salary";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // Submit form using teacherApi hooks
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validate() || isLoading) {
      return;
    }

    const payload: CreateTeacherData = {
      firstName: values.firstName,
      lastName: values.lastName,
      gender: values.gender,
      phone: values.phone,
      email: values.email,
      address: values.address,
      salaryType,
      salaryAmount: Number(values.salaryAmount),
      feePercentage: Number(values.feePercentage),
      hireDate: values.hireDate,
      isActive: values.isActive,
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

    if (success) {
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

        {/* API Error */}
        {apiError && (
          <div className="text-sm text-red-600" role="alert">
            {apiError}
          </div>
        )}

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

// //commmandt for tomarrow
// <div>
// ok in backend i have these route for teacher&#x20;
// Teachers\
// Teacher management endpoints\
// \
// \
// \
// POST\
// /teachers\
// Create a new teacher\
// \
// Register a teacher. For PerStudent salary, you can set feePercentage (default 40%).\
// \
// Parameters\
// Try it out\
// No parameters\
// \
// Request body\
// \
// application/json\
// Example Value\
// Schema\
// {\
// &#x20; "firstName": "Jane",\
// &#x20; "lastName": "Smith",\
// &#x20; "gender": "Female",\
// &#x20; "phone": "+9876543210",\
// &#x20; "email": "jane@example.com",\
// &#x20; "address": "456 Oak Avenue, Town",\
// &#x20; "salaryType": "Fixed",\
// &#x20; "salaryAmount": 4000,\
// &#x20; "feePercentage": 40,\
// &#x20; "hireDate": "2025-02-01",\
// &#x20; "isActive": true\
// }\
// Responses\
// Code	Description	Links\
// 201	\
// Teacher created successfully.\
// \
// Media type\
// \
// application/json\
// Controls Accept header.\
// Example Value\
// Schema\
// {\
// &#x20; "id": "123e4567-e89b-12d3-a456-426614174000",\
// &#x20; "firstName": "John",\
// &#x20; "lastName": "Doe",\
// &#x20; "gender": "Male",\
// &#x20; "phone": "+1234567890",\
// &#x20; "email": "john@example.com",\
// &#x20; "address": "123 Main Street, City",\
// &#x20; "salaryType": "Fixed",\
// &#x20; "salaryAmount": 3500,\
// &#x20; "feePercentage": 40,\
// &#x20; "hireDate": "2025-01-15",\
// &#x20; "isActive": true,\
// &#x20; "createdAt": "2025-01-01T10:00:00.000Z",\
// &#x20; "updatedAt": "2025-01-02T12:30:00.000Z"\
// }\
// No links\
// 400	\
// Validation error.\
// \
// No links\
// \
// GET\
// /teachers\
// Get all teachers\
// \
// Returns a list of all registered teachers.\
// \
// Parameters\
// Try it out\
// No parameters\
// \
// Responses\
// Code	Description	Links\
// 200	\
// List of teachers.\
// \
// Media type\
// \
// application/json\
// Controls Accept header.\
// Example Value\
// Schema\
// [\
// &#x20; {\
// &#x20;   "id": "123e4567-e89b-12d3-a456-426614174000",\
// &#x20;   "firstName": "John",\
// &#x20;   "lastName": "Doe",\
// &#x20;   "gender": "Male",\
// &#x20;   "phone": "+1234567890",\
// &#x20;   "email": "john@example.com",\
// &#x20;   "address": "123 Main Street, City",\
// &#x20;   "salaryType": "Fixed",\
// &#x20;   "salaryAmount": 3500,\
// &#x20;   "feePercentage": 40,\
// &#x20;   "hireDate": "2025-01-15",\
// &#x20;   "isActive": true,\
// &#x20;   "createdAt": "2025-01-01T10:00:00.000Z",\
// &#x20;   "updatedAt": "2025-01-02T12:30:00.000Z"\
// &#x20; }\
// ]\
// No links\
// \
// GET\
// /teachers/active\
// Get all active teachers\
// \
// Returns a list of all teachers with isActive = true\
// \
// Parameters\
// Try it out\
// No parameters\
// \
// Responses\
// Code	Description	Links\
// 200	\
// List of active teachers.\
// \
// Media type\
// \
// application/json\
// Controls Accept header.\
// Example Value\
// Schema\
// [\
// &#x20; {\
// &#x20;   "id": "123e4567-e89b-12d3-a456-426614174000",\
// &#x20;   "firstName": "John",\
// &#x20;   "lastName": "Doe",\
// &#x20;   "gender": "Male",\
// &#x20;   "phone": "+1234567890",\
// &#x20;   "email": "john@example.com",\
// &#x20;   "address": "123 Main Street, City",\
// &#x20;   "salaryType": "Fixed",\
// &#x20;   "salaryAmount": 3500,\
// &#x20;   "feePercentage": 40,\
// &#x20;   "hireDate": "2025-01-15",\
// &#x20;   "isActive": true,\
// &#x20;   "createdAt": "2025-01-01T10:00:00.000Z",\
// &#x20;   "updatedAt": "2025-01-02T12:30:00.000Z"\
// &#x20; }\
// ]\
// No links\
// \
// GET\
// /teachers/{id}\
// Get a teacher by ID\
// \
// Parameters\
// Try it out\
// Name	Description\
// id \*\
// string\
// (path)\
// UUID of the teacher\
// \
// id\
// Responses\
// Code	Description	Links\
// 200	\
// Teacher found.\
// \
// Media type\
// \
// application/json\
// Controls Accept header.\
// Example Value\
// Schema\
// {\
// &#x20; "id": "123e4567-e89b-12d3-a456-426614174000",\
// &#x20; "firstName": "John",\
// &#x20; "lastName": "Doe",\
// &#x20; "gender": "Male",\
// &#x20; "phone": "+1234567890",\
// &#x20; "email": "john@example.com",\
// &#x20; "address": "123 Main Street, City",\
// &#x20; "salaryType": "Fixed",\
// &#x20; "salaryAmount": 3500,\
// &#x20; "feePercentage": 40,\
// &#x20; "hireDate": "2025-01-15",\
// &#x20; "isActive": true,\
// &#x20; "createdAt": "2025-01-01T10:00:00.000Z",\
// &#x20; "updatedAt": "2025-01-02T12:30:00.000Z"\
// }\
// No links\
// 404	\
// Teacher not found.\
// \
// No links\
// \
// PATCH\
// /teachers/{id}\
// Update a teacher\
// \
// All fields are optional. You can change salary type, amount, or percentage.\
// \
// Parameters\
// Try it out\
// Name	Description\
// id \*\
// string\
// (path)\
// UUID of the teacher to update\
// \
// id\
// Request body\
// \
// application/json\
// Example Value\
// Schema\
// {\
// &#x20; "firstName": "Jane",\
// &#x20; "lastName": "Smith",\
// &#x20; "gender": "Female",\
// &#x20; "phone": "+9876543210",\
// &#x20; "email": "jane@example.com",\
// &#x20; "address": "456 Oak Avenue, Town",\
// &#x20; "salaryType": "Fixed",\
// &#x20; "salaryAmount": 4000,\
// &#x20; "feePercentage": 40,\
// &#x20; "hireDate": "2025-02-01",\
// &#x20; "isActive": true\
// }\
// Responses\
// Code	Description	Links\
// 200	\
// Teacher updated successfully.\
// \
// Media type\
// \
// application/json\
// Controls Accept header.\
// Example Value\
// Schema\
// {\
// &#x20; "id": "123e4567-e89b-12d3-a456-426614174000",\
// &#x20; "firstName": "John",\
// &#x20; "lastName": "Doe",\
// &#x20; "gender": "Male",\
// &#x20; "phone": "+1234567890",\
// &#x20; "email": "john@example.com",\
// &#x20; "address": "123 Main Street, City",\
// &#x20; "salaryType": "Fixed",\
// &#x20; "salaryAmount": 3500,\
// &#x20; "feePercentage": 40,\
// &#x20; "hireDate": "2025-01-15",\
// &#x20; "isActive": true,\
// &#x20; "createdAt": "2025-01-01T10:00:00.000Z",\
// &#x20; "updatedAt": "2025-01-02T12:30:00.000Z"\
// }\
// No links\
// 404	\
// Teacher not found.\
// \
// No links\
// \
// DELETE\
// /teachers/{id}\
// Delete a teacher\
// \
// Parameters\
// Try it out\
// Name	Description\
// id \*\
// string\
// (path)\
// UUID of the teacher to delete\
// \
// id\
// Responses\
// Code	Description	Links\
// 204	\
// Teacher deleted successfully.\
// \
// No links\
// 404	\
// Teacher not found.\
// \
// No links\
// \
// PATCH\
// /teachers/{id}/status\
// Update teacher activation status

// use it and use the hoke and send me complate code and donot change the logic and style just ake it work&#x20;
// *// src/components/teachers/TeacherForm.tsx*
// import React, { useEffect, useState } from "react";
// import { useForm } from "../../../hooks/useForm";
// *// ✅ Local SalaryType — backend only supports Fixed / PerStudent*
// *// (replaces the deleted src/api/types/teacher.types.ts enum)*
// const SalaryType = {
//   FIXED: "Fixed",
//   PER_STUDENT: "PerStudent",
// } as const;
// type SalaryType = (typeof SalaryType)[keyof typeof SalaryType];

// import Button from "../../common/Button/Button";
// import Input from "../../common/Input/Input";
// import Select from "../../common/Select/Select";
// import Card from "../../common/Card/Card";

// interface TeacherFormProps {
//   initialData?: any;
//   onSubmit: (data: any) => void;
//   onCancel: () => void;
//   loading?: boolean;
//   isEdit?: boolean;
// }

// const TeacherForm: React.FC\<TeacherFormProps> = ({
//   initialData,
//   onSubmit,
//   onCancel,
//   loading = false,
//   isEdit = false,
// }) => {
//   const [salaryType, setSalaryType] = useState\<SalaryType>(
//     initialData?.salaryType || SalaryType.FIXED,
//   );

//   const { values, errors, handleChange, handleSubmit, setValues } = useForm({
//     initialValues: {
//       firstName: initialData?.firstName || "",
//       lastName: initialData?.lastName || "",
//       gender: initialData?.gender || "",
//       phone: initialData?.phone || "",
//       email: initialData?.email || "",
//       address: initialData?.address || "",
//       salaryType: initialData?.salaryType || SalaryType.FIXED,
//       salaryAmount: initialData?.salaryAmount || "",
//       feePercentage: initialData?.feePercentage || 40,
//       hireDate: initialData?.hireDate || new Date().toISOString().split("T")[0],
//       isActive:
//         initialData?.isActive !== undefined ? initialData.isActive : true,
//     },
//     validate: (vals) => {
//       const errors: any = {};
//       if (!vals.firstName) errors.firstName = "First name is required";
//       if (!vals.lastName) errors.lastName = "Last name is required";
//       if (!vals.hireDate) errors.hireDate = "Hire date is required";

//       if (vals.salaryType === SalaryType.FIXED && !vals.salaryAmount) {
//         errors.salaryAmount = "Salary amount is required for fixed salary";
//       }

//       return errors;
//     },
//     onSubmit,
//   });

//   useEffect(() => {
//     setValues((prev) => ({ ...prev, salaryType }));
//   }, [salaryType, setValues]);

//   useEffect(() => {
//     if (initialData) {
//       setValues(initialData);
//       setSalaryType(initialData.salaryType || SalaryType.FIXED);
//     }
//   }, [initialData, setValues]);

//   const salaryTypeOptions = [
//     { value: SalaryType.FIXED, label: "Fixed Salary" },
//     { value: SalaryType.PER_STUDENT, label: "Per Student" },
//   ];

//   const genderOptions = [
//     { value: "Male", label: "Male" },
//     { value: "Female", label: "Female" },
//     { value: "Other", label: "Other" },
//   ];

//   const renderSalaryFields = () => {
//     switch (salaryType) {
//       case SalaryType.FIXED:
//         return (
//           \<Input
//             label="Monthly Salary Amount"
//             name="salaryAmount"
//             type="number"
//             value={values.salaryAmount}
//             onChange={(e) => handleChange("salaryAmount", e.target.value)}
//             error={errors.salaryAmount}
//             placeholder="e.g., 20000"
//             required
//           />
//         );

//       case SalaryType.PER_STUDENT:
//         return (
//           \<Input
//             label="Amount Per Student"
//             name="salaryAmount"
//             type="number"
//             value={values.salaryAmount}
//             onChange={(e) => handleChange("salaryAmount", e.target.value)}
//             error={errors.salaryAmount}
//             placeholder="e.g., 500"
//             required
//           />
//         );

//       default:
//         return null;
//     }
//   };

//   return (
//     \<Card title={isEdit ? "Edit Teacher" : "Add New Teacher"}>
//       \<form onSubmit={handleSubmit} className="space-y-6">
//         \<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           {*/\* Personal Information \*/*}
//           \<div className="space-y-4">
//             \<h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
//               Personal Information
//             \</h3>

//             \<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//               \<Input
//                 label="First Name"
//                 name="firstName"
//                 value={values.firstName}
//                 onChange={(e) => handleChange("firstName", e.target.value)}
//                 error={errors.firstName}
//                 placeholder="Enter first name"
//                 required
//               />

//               \<Input
//                 label="Last Name"
//                 name="lastName"
//                 value={values.lastName}
//                 onChange={(e) => handleChange("lastName", e.target.value)}
//                 error={errors.lastName}
//                 placeholder="Enter last name"
//                 required
//               />
//             \</div>

//             \<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//               \<Select
//                 label="Gender"
//                 name="gender"
//                 value={values.gender}
//                 onChange={(value) => handleChange("gender", value)}
//                 options={genderOptions}
//                 placeholder="Select gender"
//               />

//               \<Input
//                 label="Phone"
//                 name="phone"
//                 type="tel"
//                 value={values.phone}
//                 onChange={(e) => handleChange("phone", e.target.value)}
//                 placeholder="+93 700 123 456"
//               />
//             \</div>

//             \<Input
//               label="Email"
//               name="email"
//               type="email"
//               value={values.email}
//               onChange={(e) => handleChange("email", e.target.value)}
//               placeholder="teacher@example.com"
//             />

//             \<Input
//               label="Address"
//               name="address"
//               value={values.address}
//               onChange={(e) => handleChange("address", e.target.value)}
//               placeholder="Enter address"
//             />
//           \</div>

//           {*/\* Employment Information \*/*}
//           \<div className="space-y-4">
//             \<h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
//               Employment Information
//             \</h3>

//             \<Input
//               label="Hire Date"
//               name="hireDate"
//               type="date"
//               value={values.hireDate}
//               onChange={(e) => handleChange("hireDate", e.target.value)}
//               error={errors.hireDate}
//               required
//             />

//             \<Select
//               label="Salary Type"
//               name="salaryType"
//               value={salaryType}
//               onChange={(value) => setSalaryType(value as SalaryType)}
//               options={salaryTypeOptions}
//               required
//             />

//             {renderSalaryFields()}

//             \<div className="flex items-center gap-2 pt-2">
//               \<input
//                 type="checkbox"
//                 id="isActive"
//                 checked={values.isActive}
//                 onChange={(e) => handleChange("isActive", e.target.checked)}
//                 className="w-4 h-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500"
//               />
//               \<label
//                 htmlFor="isActive"
//                 className="text-sm font-medium text-gray-700 cursor-pointer"
//               >
//                 Active
//               \</label>
//             \</div>
//           \</div>
//         \</div>

//         {*/\* Form Actions \*/*}
//         \<div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-gray-200">
//           \<Button
//             type="button"
//             variant="secondary"
//             onClick={onCancel}
//             disabled={loading}
//             className="order-2 sm:order-1"
//           >
//             Cancel
//           \</Button>
//           \<Button
//             type="submit"
//             variant="primary"
//             loading={loading}
//             disabled={loading}
//             className="order-1 sm:order-2"
//           >
//             {isEdit ? "Update Teacher" : "Create Teacher"}
//           \</Button>
//         \</div>
//       \</form>
//     \</Card>
//   );
// };

// export default TeacherForm;
// use the hooks and teacherApi.ts *// src/api/teacherApi.ts*
// import { useEffect, useState } from "react";
// import axios from "axios";

// const API_URL = import.meta.env.VITE_API_URL || "[http://localhost:3000](http://localhost:3000)";
// const TEACHERS_URL = \`${API_URL}/teachers\`;

// */\* ================================================================== \*/*
// */\* ApiError — KEPT HERE. Every other api file imports it.            \*/*
// */\* ================================================================== \*/*

// export class ApiError extends Error {
//   statusCode?: number;
//   details?: any;

//   constructor(message: string, statusCode?: number, details?: any) {
//     *super*(message);
//     *this*.name = "ApiError";
//     *this*.statusCode = statusCode;
//     *this*.details = details;
//   }
// }

// */\* ================================================================== \*/*
// */\* Types — inlined from src/types/teacher.ts                          \*/*
// */\* ================================================================== \*/*

// export interface Teacher {
//   id: string;
//   firstName: string;
//   lastName: string;
//   gender: string;
//   phone: string;
//   email: string;
//   address: string;
//   salaryType: string;
//   salaryAmount: number;
//   feePercentage: number;
//   hireDate: string;
//   isActive: boolean;
//   createdAt: string;
//   updatedAt: string;
// }

// export interface CreateTeacherData {
//   firstName: string;
//   lastName: string;
//   gender: string;
//   phone: string;
//   email?: string; *// optional (per types/teacher.ts)*
//   address?: string; *// optional (per types/teacher.ts)*
//   salaryType: string;
//   salaryAmount: number;
//   feePercentage: number;
//   hireDate: string;
//   isActive: boolean;
// }

// export interface UpdateTeacherData extends Partial\<CreateTeacherData> {
//   id?: string;
// }

// */\* ================================================================== \*/*
// */\* Inline helpers (same pattern as studentApi / etc.)                 \*/*
// */\* ================================================================== \*/*

// const extractErrMessage = (err: any, fallback: string): string => {
//   const m = err?.response?.data?.message;
//   if (Array.isArray(m)) return m.join(", ");
//   if (typeof m === "string") return m;
//   return err?.message || fallback;
// };

// function useRawQuery\<T>(url: string | null, enabled = true) {
//   const [data, setData] = useState\<T | null>(null);
//   const [loading, setLoading] = useState(!!url && enabled);
//   const [error, setError] = useState\<string | null>(null);
//   const [trigger, setTrigger] = useState(0);

//   useEffect(() => {
//     if (!enabled || !url) {
//       setLoading(false);
//       return;
//     }
//     let alive = true;
//     setLoading(true);
//     setError(null);

//     axios
//       .get\<T>(url)
//       .then((res) => {
//         if (alive) setData(res.data);
//       })
//       .catch((err) => {
//         if (alive) setError(extractErrMessage(err, "Something went wrong"));
//       })
//       .finally(() => {
//         if (alive) setLoading(false);
//       });

//     return () => {
//       alive = false;
//     };
//   }, [url, trigger, enabled]);

//   return { data, loading, error, refetch: () => setTrigger((n) => n + 1) };
// }

// function useRawMutation\<T>() {
//   const [data, setData] = useState\<T | null>(null);
//   const [message, setMessage] = useState\<string | null>(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState\<string | null>(null);

//   const send = async (
//     method: "post" | "patch" | "delete",
//     url: string,
//     body?: object,
//     opts: { customErrorMap?: (m: string) => string } = {},
//   ): *Promise*\<boolean> => {
//     setLoading(true);
//     setError(null);
//     setMessage(null);

//     try {
//       const res = await axios.request\<T>({
//         method,
//         url,
//         headers:
//           body !== undefined
//             ? { "Content-Type": "application/json" }
//             : undefined,
//         data: body,
//       });
//       setData(res.data);
//       setMessage((res.data as any)?.message ?? null);
//       return true;
//     } catch (err: any) {
//       const rawMsg = extractErrMessage(err, "Something went wrong");
//       setError(opts.customErrorMap ? opts.customErrorMap(rawMsg) : rawMsg);
//       return false;
//     } finally {
//       setLoading(false);
//     }
//   };

//   return { data, message, loading, error, send };
// }

// */\* ================================================================== \*/*
// */\* Shared error mapper — preserves the old Prisma-constraint logic   \*/*
// */\* ================================================================== \*/*

// const mapTeacherConstraintError = (
//   msg: string,
//   verb: "registered" | "registeredByAnother",
// ): string => {
//   const lower = msg.toLowerCase();
//   const isPhone =
//     msg.includes("UQ_9c5ae9e15a042292bb8d83ca34c") ||
//     (lower.includes("duplicate key") && lower.includes("phone"));
//   const isEmail =
//     msg.includes("UQ_6c6e1c4b7c9c8e9d2f8e9d2f8e9d2f8e") ||
//     (lower.includes("duplicate key") && lower.includes("email"));

//   if (isPhone) {
//     return verb === "registered"
//       ? "This phone number is already registered. Please use a different phone number."
//       : "This phone number is already registered by another teacher. Please use a different phone number.";
//   }
//   if (isEmail) {
//     return verb === "registered"
//       ? "This email address is already registered. Please use a different email address."
//       : "This email address is already registered by another teacher. Please use a different email address.";
//   }
//   if (
//     lower.includes("duplicate key") &&
//     (lower.includes("phone") || lower.includes("email"))
//   ) {
//     return "The phone number or email address is already registered. Please use unique values.";
//   }
//   return msg;
// };

// */\* ================================================================== \*/*
// */\* Query hooks                                                        \*/*
// */\* ================================================================== \*/*

// */\*\* GET /teachers \*/*
// export const useTeachers = () => useRawQuery\<Teacher[]>(TEACHERS_URL);

// */\*\* GET /teachers/active \*/*
// export const useActiveTeachers = () =>
//   useRawQuery\<Teacher[]>(\`${TEACHERS_URL}/active\`);

// */\*\* GET /teachers/:id \*/*
// export const useTeacherById = (id: string, enabled = true) =>
//   useRawQuery\<Teacher>(id ? \`${TEACHERS_URL}/${id}\` : null, enabled && !!id);

// */\* ================================================================== \*/*
// */\* Mutation hooks                                                     \*/*
// */\* ================================================================== \*/*

// */\*\* POST /teachers \*/*
// export const useCreateTeacher = () => {
//   const { data, message, loading, error, send } = useRawMutation\<Teacher>();

//   const createTeacher = (teacher: CreateTeacherData) =>
//     send("post", TEACHERS_URL, teacher, {
//       customErrorMap: (m) => mapTeacherConstraintError(m, "registered"),
//     });

//   return { createData: data, message, loading, error, createTeacher };
// };

// */\*\* PATCH /teachers/:id \*/*
// export const useUpdateTeacher = () => {
//   const { data, message, loading, error, send } = useRawMutation\<Teacher>();

//   const updateTeacher = (id: string, teacher: Partial\<CreateTeacherData>) =>
//     send("patch", \`${TEACHERS_URL}/${id}\`, teacher, {
//       customErrorMap: (m) =>
//         mapTeacherConstraintError(m, "registeredByAnother"),
//     });

//   return { updateData: data, message, loading, error, updateTeacher };
// };

// */\*\* DELETE /teachers/:id \*/*
// export const useDeleteTeacher = () => {
//   const { data, message, loading, error, send } = useRawMutation\<void>();
//   const remove = (id: string) => send("delete", \`${TEACHERS_URL}/${id}\`);
//   return { deleteData: data, message, loading, error, remove };
// };

// */\*\**
// *&#xA0;\* PATCH /teachers/:id/status*
// *&#xA0;\**
// *&#xA0;\* Endpoint is a sub-path (\`/status\`), so we build the full URL directly*
// *&#xA0;\* rather than going through the generic \`useUpdate\` trick.*
// *&#xA0;\*/*
// export const useUpdateTeacherStatus = () => {
//   const { data, message, loading, error, send } = useRawMutation\<Teacher>();

//   const updateStatus = (id: string, isActive: boolean) =>
//     send("patch", \`${TEACHERS_URL}/${id}/status\`, { isActive });

//   return { updateData: data, message, loading, error, updateStatus };
// };

// and send complate code for TeacherFrom.tsx with same axact logic and style with no error&#x20;
// </div>
