import { useState, useCallback } from 'react';
import {
  getPayroll,
  getPayrollById,
  generatePayroll,
  updatePayroll,
  deletePayroll,
} from '../../../api/payroll.api';

const MONTH_MAP = {
  1: 'january', 2: 'february', 3: 'march', 4: 'april',
  5: 'may', 6: 'june', 7: 'july', 8: 'august',
  9: 'september', 10: 'october', 11: 'november', 12: 'december',
};

export function usePayroll() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchAll = useCallback(async (params = {}) => {
    setIsLoading(true);
    setError('');
    const { page = 1, page_size = 100, search, department, month, year, status } = params;
    const backendParams = {
      page, page_size,
      search: search || undefined,
      department: department || undefined,
      month: month || undefined,
      year: year || undefined,
      status: status || undefined,
    };
    try {
      const data = await getPayroll(backendParams);
      const items = (data.items ?? []).map(normalizeRecord);
      return { items, total: data.total ?? 0, pages: data.pages ?? 1 };
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(typeof detail === 'string' ? detail : 'Failed to load payroll records.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchById = useCallback(async (id) => {
    setIsLoading(true);
    setError('');
    try {
      const record = await getPayrollById(id);
      return normalizeRecord(record);
    } catch (err) {
      const detail = err.response?.data?.detail;
      if (err.response?.status === 404) {
        setError('Payroll record not found.');
      } else if (typeof detail === 'string') {
        setError(detail);
      } else {
        setError('Failed to load payroll record.');
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const generate = useCallback(async (payload) => {
    setIsLoading(true);
    setError('');
    try {
      const result = await generatePayroll(payload);
      return result;
    } catch (err) {
      const status = err.response?.status;
      const detail = err.response?.data?.detail;
      if (status === 409) {
        setError(typeof detail === 'string' ? detail : 'Payroll already exists for this period.');
      } else if (typeof detail === 'string') {
        setError(detail);
      } else {
        setError('Failed to generate payroll.');
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
      const record = await updatePayroll(id, payload);
      return normalizeRecord(record);
    } catch (err) {
      const detail = err.response?.data?.detail;
      if (err.response?.status === 404) {
        setError('Payroll record not found.');
      } else if (typeof detail === 'string') {
        setError(detail);
      } else {
        setError('Failed to update payroll record.');
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
      const result = await deletePayroll(id);
      return result;
    } catch (err) {
      const detail = err.response?.data?.detail;
      if (err.response?.status === 404) {
        setError('Payroll record not found.');
      } else if (typeof detail === 'string') {
        setError(detail);
      } else {
        setError('Failed to delete payroll record.');
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { fetchAll, fetchById, generate, update, remove, isLoading, error };
}

function normalizeRecord(r) {
  return {
    ...r,
    month: MONTH_MAP[r.month] ?? r.month,
    year: String(r.year),
    deduction: r.deductions ?? 0,
  };
}
