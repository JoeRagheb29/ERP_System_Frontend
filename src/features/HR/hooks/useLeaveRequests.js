import { useState, useCallback } from 'react';
import {
  createLeave,
  getLeaves,
  getLeaveById,
  updateLeave,
  deleteLeave,
  exportLeaveRequests,
  downloadLeaveTemplate,
  importLeaveRequests,
  bulkDeleteLeaveRequests,
  bulkChangeLeaveStatus,
} from '../../../api/leave_requests.api';

export function useLeaveRequests() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const create = useCallback(async (payload) => {
    setIsLoading(true);
    setError('');
    try {
      const record = await createLeave(payload);
      return record;
    } catch (err) {
      const status = err.response?.status;
      const detail = err.response?.data?.detail;
      if (status === 422 && Array.isArray(detail)) {
        const messages = detail.map((e) => e.msg.replace(/^Value error, /, '')).join(' \u00b7 ');
        setError(messages);
      } else if (typeof detail === 'string') {
        setError(detail);
      } else {
        setError('Unable to create leave request. Please check the data and try again.');
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
      leave_type,
      date_from,
      date_to,
      department,
      sort_by,
      sort_order,
    } = params;

    const backendParams = {
      page,
      page_size,
      search: search || undefined,
      status: status || undefined,
      leave_type: leave_type || undefined,
      date_from: date_from || undefined,
      date_to: date_to || undefined,
      department: department || undefined,
      sort_by: sort_by || undefined,
      sort_order: sort_order || undefined,
    };

    try {
      const data = await getLeaves(backendParams);
      return {
        items: data.items ?? [],
        total: data.total ?? 0,
        pages: data.pages ?? 1,
      };
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(typeof detail === 'string' ? detail : 'Failed to load leave requests.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchById = useCallback(async (id) => {
    setIsLoading(true);
    setError('');
    try {
      const record = await getLeaveById(id);
      return record;
    } catch (err) {
      const status = err.response?.status;
      const detail = err.response?.data?.detail;
      if (status === 404) {
        setError('Leave request not found.');
      } else if (typeof detail === 'string') {
        setError(detail);
      } else {
        setError('Failed to load leave request.');
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
      const record = await updateLeave(id, payload);
      return record;
    } catch (err) {
      const status = err.response?.status;
      const detail = err.response?.data?.detail;
      if (status === 404) {
        setError('Leave request not found.');
      } else if (status === 422 && Array.isArray(detail)) {
        const messages = detail.map((e) => e.msg.replace(/^Value error, /, '')).join(' \u00b7 ');
        setError(messages);
      } else if (typeof detail === 'string') {
        setError(detail);
      } else {
        setError('Unable to update leave request. Please check the data and try again.');
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
      const result = await deleteLeave(id);
      return result;
    } catch (err) {
      const status = err.response?.status;
      const detail = err.response?.data?.detail;
      if (status === 404) {
        setError('Leave request not found.');
      } else if (typeof detail === 'string') {
        setError(detail);
      } else {
        setError('Unable to delete leave request.');
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const exportData = useCallback(async (params = {}) => {
    setIsLoading(true);
    setError('');
    try {
      const blob = await exportLeaveRequests(params);
      return blob;
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(typeof detail === 'string' ? detail : 'Export failed.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getImportTemplate = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const blob = await downloadLeaveTemplate();
      return blob;
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(typeof detail === 'string' ? detail : 'Failed to download template.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const importFile = useCallback(async (file) => {
    setIsLoading(true);
    setError('');
    try {
      const result = await importLeaveRequests(file);
      return result;
    } catch (err) {
      const detail = err.response?.data?.detail;
      if (typeof detail === 'string') {
        setError(detail);
      } else {
        setError('Import failed. Please check the file and try again.');
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const bulkDelete = useCallback(async (ids) => {
    setIsLoading(true);
    setError('');
    try {
      const result = await bulkDeleteLeaveRequests(ids);
      return result;
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(typeof detail === 'string' ? detail : 'Bulk delete failed.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const bulkStatus = useCallback(async (ids, status) => {
    setIsLoading(true);
    setError('');
    try {
      const result = await bulkChangeLeaveStatus(ids, status);
      return result;
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(typeof detail === 'string' ? detail : 'Bulk status change failed.');
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
    exportData,
    getImportTemplate,
    importFile,
    bulkDelete,
    bulkStatus,
    isLoading,
    error,
  };
}
