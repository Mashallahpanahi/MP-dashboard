// src/api/classApi.ts
import type { Class, CreateClassData, UpdateClassData } from "@/types/class";
import { ApiError } from "./teacherApi";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

/**
 * Get all classes
 * GET /classes
 */
export const getClasses = async (): Promise<Class[]> => {
  const response = await fetch(`${API_URL}/classes`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new ApiError(
      `Failed to fetch classes. Status: ${response.status}`,
      response.status
    );
  }

  const data: Class[] = await response.json();
  return data;
};

/**
 * Get all active classes
 * GET /classes/active
 */
export const getActiveClasses = async (): Promise<Class[]> => {
  const response = await fetch(`${API_URL}/classes/active`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new ApiError(
      `Failed to fetch active classes. Status: ${response.status}`,
      response.status
    );
  }

  const data: Class[] = await response.json();
  return data;
};

/**
 * Get a class by ID
 * GET /classes/{id}
 */
export const getClassById = async (id: string): Promise<Class> => {
  const response = await fetch(`${API_URL}/classes/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new ApiError(
      `Failed to fetch class. Status: ${response.status}`,
      response.status
    );
  }

  const data: Class = await response.json();
  return data;
};

/**
 * Create a new class
 * POST /classes
 */
export const createClass = async (classData: CreateClassData): Promise<Class> => {
  const response = await fetch(`${API_URL}/classes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(classData),
  });

  if (!response.ok) {
    let errorMessage = `Failed to create class. Status: ${response.status}`;
    let errorDetails = null;

    try {
      const errorData = await response.json();
      errorDetails = errorData;

      if (errorData.message && typeof errorData.message === 'string') {
        if (errorData.message.includes('duplicate') && 
            errorData.message.toLowerCase().includes('classname')) {
          errorMessage = 'This class name is already registered. Please use a different name.';
        } else if (Array.isArray(errorData.message)) {
          errorMessage = errorData.message.join(", ");
        } else {
          errorMessage = errorData.message;
        }
      } else if (Array.isArray(errorData.message)) {
        errorMessage = errorData.message.join(", ");
      }
    } catch {
      // Keep the default error message
    }

    throw new ApiError(errorMessage, response.status, errorDetails);
  }

  const data: Class = await response.json();
  return data;
};

/**
 * Update a class
 * PATCH /classes/{id}
 */
export const updateClass = async (
  id: string,
  classData: UpdateClassData
): Promise<Class> => {
  const response = await fetch(`${API_URL}/classes/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(classData),
  });

  if (!response.ok) {
    let errorMessage = `Failed to update class. Status: ${response.status}`;
    let errorDetails = null;

    try {
      const errorData = await response.json();
      errorDetails = errorData;

      if (errorData.message && typeof errorData.message === 'string') {
        if (errorData.message.includes('duplicate') && 
            errorData.message.toLowerCase().includes('classname')) {
          errorMessage = 'This class name is already registered by another class. Please use a different name.';
        } else if (Array.isArray(errorData.message)) {
          errorMessage = errorData.message.join(", ");
        } else {
          errorMessage = errorData.message;
        }
      } else if (Array.isArray(errorData.message)) {
        errorMessage = errorData.message.join(", ");
      }
    } catch {
      // Keep the default error message
    }

    throw new ApiError(errorMessage, response.status, errorDetails);
  }

  const data: Class = await response.json();
  return data;
};

/**
 * Delete a class
 * DELETE /classes/{id}
 */
export const deleteClass = async (id: string): Promise<void> => {
  const response = await fetch(`${API_URL}/classes/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    let errorMessage = `Failed to delete class. Status: ${response.status}`;

    try {
      const errorData = await response.json();
      if (Array.isArray(errorData.message)) {
        errorMessage = errorData.message.join(", ");
      } else if (errorData.message) {
        errorMessage = errorData.message;
      }
    } catch {
      // Keep the default error message
    }

    throw new ApiError(errorMessage, response.status);
  }
};

/**
 * Update class activation status
 * PATCH /classes/{id}/status
 */
export const updateClassStatus = async (
  id: string,
  data: { isActive: boolean }
): Promise<Class> => {
  const response = await fetch(`${API_URL}/classes/${id}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    let errorMessage = `Failed to update class status. Status: ${response.status}`;
    let errorDetails = null;

    try {
      const errorData = await response.json();
      errorDetails = errorData;
      if (errorData.message && typeof errorData.message === 'string') {
        errorMessage = errorData.message;
      } else if (Array.isArray(errorData.message)) {
        errorMessage = errorData.message.join(", ");
      }
    } catch {
      // Keep the default error message
    }

    throw new ApiError(errorMessage, response.status, errorDetails);
  }

  const result: Class = await response.json();
  return result;
};