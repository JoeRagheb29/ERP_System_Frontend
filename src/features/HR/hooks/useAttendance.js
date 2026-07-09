import { useState, useCallback } from 'react';
import {
  createAttendance,
  getAttendance,
  getAttendanceById,
  updateAttendance,
  deleteAttendance,
} from '../../../api/attendance.api';

export function useAttendance() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const create = useCallback(async (payload) => {
    setIsLoading(true);
    setError('');
    try {
      const record = await createAttendance(payload);
      return record;
    } catch (err) {
      const status = err.response?.status;
      const detail = err.response?.data?.detail;
      if (status === 409) {
        setError(typeof detail === 'string' ? detail : 'An attendance record already exists for this employee on this date.');
      } else if (status === 422 && Array.isArray(detail)) {
        const messages = detail.map((e) => e.msg.replace(/^Value error, /, '')).join(' · ');
        setError(messages);
      } else if (typeof detail === 'string') {
        setError(detail);
      } else {
        setError('Unable to create attendance record. Please check the data and try again.');
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchAll = useCallback(async (params = {}) => {
    setIsLoading(true);
    setError('');

    const {
      page = 1,
      page_size = 20,
      search,
      status,
      attendance_date_from,
      attendance_date_to,
      department,
      sort_by,
      sort_order,
    } = params;

    const backendParams = {
      page,
      page_size,
      search: search || undefined,
      status: status || undefined,
      attendance_date_from: attendance_date_from || undefined,
      attendance_date_to: attendance_date_to || undefined,
      department: department || undefined,
      sort_by: sort_by || undefined,
      sort_order: sort_order || undefined,
    };

    try {
      const data = await getAttendance(backendParams);
      return {
        items: data.items ?? [],
        total: data.total ?? 0,
        pages: data.pages ?? 1,
      };
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(typeof detail === 'string' ? detail : 'Failed to load attendance records.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchById = useCallback(async (id) => {
    setIsLoading(true);
    setError('');
    try {
      const record = await getAttendanceById(id);
      return record;
    } catch (err) {
      const status = err.response?.status;
      const detail = err.response?.data?.detail;
      if (status === 404) {
        setError('Attendance record not found.');
      } else if (typeof detail === 'string') {
        setError(detail);
      } else {
        setError('Failed to load attendance record.');
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const update = useCallback(async (id, payload) => {
    setIsLoading(true);
    setError('');
    try {
      const record = await updateAttendance(id, payload);
      return record;
    } catch (err) {
      const status = err.response?.status;
      const detail = err.response?.data?.detail;
      if (status === 404) {
        setError('Attendance record not found.');
      } else if (status === 422 && Array.isArray(detail)) {
        const messages = detail.map((e) => e.msg.replace(/^Value error, /, '')).join(' · ');
        setError(messages);
      } else if (typeof detail === 'string') {
        setError(detail);
      } else {
        setError('Unable to update attendance record. Please check the data and try again.');
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const remove = useCallback(async (id) => {
    setIsLoading(true);
    setError('');
    try {
      const result = await deleteAttendance(id);
      return result;
    } catch (err) {
      const status = err.response?.status;
      const detail = err.response?.data?.detail;
      if (status === 404) {
        setError('Attendance record not found.');
      } else if (typeof detail === 'string') {
        setError(detail);
      } else {
        setError('Unable to delete attendance record.');
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    create,
    fetchAll,
    fetchById,
    update,
    remove,
    isLoading,
    error,
  };
}
