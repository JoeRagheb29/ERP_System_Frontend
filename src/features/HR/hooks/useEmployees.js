import { useState, useCallback } from 'react';
import {
  createEmployee,
  getEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
  downloadImportTemplate,
  importEmployees,
  exportEmployees,
  bulkDeleteEmployees,
  bulkChangeStatus,
  uploadProfilePhoto,
  removeProfilePhoto,
  uploadAttachment,
  getAttachments,
  deleteAttachment,
  getActivityLogs,
} from '../../../api/hr.api';

export function useEmployees() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const create = useCallback(async (payload) => {
    setIsLoading(true);
    setError('');
    try {
      const employee = await createEmployee(payload);
      return employee;
    } catch (err) {
      const status = err.response?.status;
      const detail = err.response?.data?.detail;
      if (status === 409) {
        setError(typeof detail === 'string' ? detail : 'An employee with these details already exists.');
      } else if (status === 422 && Array.isArray(detail)) {
        const messages = detail.map((e) => e.msg.replace(/^Value error, /, '')).join(' · ');
        setError(messages);
      } else if (typeof detail === 'string') {
        setError(detail);
      } else {
        setError('Unable to create employee. Please check the data and try again.');
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
      department,
      status,
      hire_date_from,
      hire_date_to,
      sort_by,
      sort_order,
    } = params;

    const backendParams = {
      page,
      page_size,
      search: search || undefined,
      department: department || undefined,
      status: status || undefined,
      hire_date_from: hire_date_from || undefined,
      hire_date_to: hire_date_to || undefined,
      sort_by: sort_by || undefined,
      sort_order: sort_order || undefined,
    };

    try {
      const data = await getEmployees(backendParams);

return {
  items: data.items ?? [],
  total: data.total ?? 0,
  pages: data.pages ?? 1,
};
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(typeof detail === 'string' ? detail : 'Failed to load employees.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchById = useCallback(async (id) => {
    setIsLoading(true);
    setError('');
    try {
      const employee = await getEmployeeById(id);
      return employee;
    } catch (err) {
      const status = err.response?.status;
      const detail = err.response?.data?.detail;
      if (status === 404) {
        setError('Employee not found.');
      } else if (typeof detail === 'string') {
        setError(detail);
      } else {
        setError('Failed to load employee.');
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
      const employee = await updateEmployee(id, payload);
      return employee;
    } catch (err) {
      const status = err.response?.status;
      const detail = err.response?.data?.detail;
      if (status === 404) {
        setError('Employee not found.');
      } else if (status === 422 && Array.isArray(detail)) {
        const messages = detail.map((e) => e.msg.replace(/^Value error, /, '')).join(' · ');
        setError(messages);
      } else if (typeof detail === 'string') {
        setError(detail);
      } else {
        setError('Unable to update employee. Please check the data and try again.');
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
      const result = await deleteEmployee(id);
      return result;
    } catch (err) {
      const status = err.response?.status;
      const detail = err.response?.data?.detail;
      if (status === 404) {
        setError('Employee not found.');
      } else if (typeof detail === 'string') {
        setError(detail);
      } else {
        setError('Unable to delete employee.');
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getImportTemplate = useCallback(async () => {
    return await downloadImportTemplate();
  }, []);

  const importFile = useCallback(async (file) => {
    setIsLoading(true);
    setError('');
    try {
      const result = await importEmployees(file);
      return result;
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(typeof detail === 'string' ? detail : 'Import failed.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const exportData = useCallback(async (params) => {
    return await exportEmployees(params);
  }, []);

  const bulkDelete = useCallback(async (ids) => {
    setIsLoading(true);
    setError('');
    try {
      const result = await bulkDeleteEmployees(ids);
      return result;
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(typeof detail === 'string' ? detail : 'Bulk delete failed.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const photoUpload = useCallback(async (employeeId, file, onProgress) => {
    setIsLoading(true);
    setError('');
    try {
      const result = await uploadProfilePhoto(employeeId, file, onProgress);
      return result;
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(typeof detail === 'string' ? detail : 'Photo upload failed.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const photoRemove = useCallback(async (employeeId) => {
    setIsLoading(true);
    setError('');
    try {
      const result = await removeProfilePhoto(employeeId);
      return result;
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(typeof detail === 'string' ? detail : 'Failed to remove photo.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const attachUpload = useCallback(async (employeeId, file, fileType, onProgress) => {
    setIsLoading(true);
    setError('');
    try {
      const result = await uploadAttachment(employeeId, file, fileType, onProgress);
      return result;
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(typeof detail === 'string' ? detail : 'Attachment upload failed.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const attachList = useCallback(async (employeeId) => {
    setIsLoading(true);
    setError('');
    try {
      const result = await getAttachments(employeeId);
      return result;
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(typeof detail === 'string' ? detail : 'Failed to load attachments.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const attachDelete = useCallback(async (employeeId, attachmentId) => {
    setIsLoading(true);
    setError('');
    try {
      const result = await deleteAttachment(employeeId, attachmentId);
      return result;
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(typeof detail === 'string' ? detail : 'Failed to delete attachment.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const activityLog = useCallback(async (employeeId) => {
    setIsLoading(true);
    setError('');
    try {
      const result = await getActivityLogs(employeeId);
      return result;
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(typeof detail === 'string' ? detail : 'Failed to load activity log.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const bulkStatus = useCallback(async (ids, status) => {
    setIsLoading(true);
    setError('');
    try {
      const result = await bulkChangeStatus(ids, status);
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
    getImportTemplate,
    importFile,
    exportData,
    bulkDelete,
    bulkStatus,
    photoUpload,
    photoRemove,
    attachUpload,
    attachList,
    attachDelete,
    activityLog,
    isLoading,
    error,
  };
}