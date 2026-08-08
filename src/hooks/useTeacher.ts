import { useState, useCallback } from 'react';
import { teachersApi } from '../api/endpoints/teachers';
import { Teacher, CreateTeacherDto, UpdateTeacherDto, TeacherQueryParams } from '../api/types/teacher.types';

export const useTeacher = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchTeachers = useCallback(async (params?: TeacherQueryParams) => {
    setLoading(true);
    setError(null);
    try {
      const response = await teachersApi.getTeachers(params);
      setTeachers(response.data);
      setTotal(response.total);
      return response;
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || 'Failed to fetch teachers';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTeacher = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const teacher = await teachersApi.getTeacher(id);
      setSelectedTeacher(teacher);
      return teacher;
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || 'Failed to fetch teacher';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createTeacher = useCallback(async (data: CreateTeacherDto) => {
    setError(null);
    try {
      const newTeacher = await teachersApi.createTeacher(data);
      return newTeacher;
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || 'Failed to create teacher';
      setError(message);
      throw err;
    }
  }, []);

  const updateTeacher = useCallback(async (id: string, data: UpdateTeacherDto) => {
    setError(null);
    try {
      const updatedTeacher = await teachersApi.updateTeacher(id, data);
      return updatedTeacher;
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || 'Failed to update teacher';
      setError(message);
      throw err;
    }
  }, []);

  const deleteTeacher = useCallback(async (id: string) => {
    setError(null);
    try {
      await teachersApi.deleteTeacher(id);
      await fetchTeachers();
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || 'Failed to delete teacher';
      setError(message);
      throw err;
    }
  }, [fetchTeachers]);

  return {
    teachers,
    selectedTeacher,
    total,
    loading,
    error,
    fetchTeachers,
    fetchTeacher,
    createTeacher,
    updateTeacher,
    deleteTeacher,
    resetSelectedTeacher: () => setSelectedTeacher(null),
    clearError: () => setError(null),
  };
};