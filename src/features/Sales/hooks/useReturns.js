import { useState, useCallback } from 'react';
import {
  getReturns,
  getReturnById,
  createReturn,
  updateReturn,
  deleteReturn,
} from '../../../api/sales.api';

export function useReturns() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchAll = useCallback(async (params = {}) => {
    setIsLoading(true);
    setError('');

    const {
      page = 1,
      page_size = 20,
      search,
      status,
      order_id,
      sort_by,
      sort_order,
    } = params;

    const backendParams = {
      page,
      page_size,
      search: search || undefined,
      status: status || undefined,
      order_id: order_id || undefined,
      sort_by: sort_by || undefined,
      sort_order: sort_order || undefined,
    };

    try {
      const data = await getReturns(backendParams);
      console.log('[useReturns] API response:', JSON.stringify(data));
      return {
        items: data.items ?? [],
        total: data.total ?? 0,
        pages: data.pages ?? 1,
      };
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(typeof detail === 'string' ? detail : 'Failed to load returns.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchById = useCallback(async (id) => {
    setIsLoading(true);
    setError('');
    try {
      const ret = await getReturnById(id);
      return ret;
    } catch (err) {
      const status = err.response?.status;
      const detail = err.response?.data?.detail;
      if (status === 404) {
        setError('Return not found.');
      } else if (typeof detail === 'string') {
        setError(detail);
      } else {
        setError('Failed to load return.');
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const create = useCallback(async (payload) => {
    setIsLoading(true);
    setError('');
    try {
      const ret = await createReturn(payload);
      return ret;
    } catch (err) {
      const status = err.response?.status;
      const detail = err.response?.data?.detail;
      if (status === 422 && Array.isArray(detail)) {
        const messages = detail.map((e) => e.msg.replace(/^Value error, /, '')).join(' · ');
        setError(messages);
      } else if (typeof detail === 'string') {
        setError(detail);
      } else {
        setError('Unable to create return. Please check the data and try again.');
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
      const ret = await updateReturn(id, payload);
      return ret;
    } catch (err) {
      const status = err.response?.status;
      const detail = err.response?.data?.detail;
      if (status === 404) {
        setError('Return not found.');
      } else if (status === 422 && Array.isArray(detail)) {
        const messages = detail.map((e) => e.msg.replace(/^Value error, /, '')).join(' · ');
        setError(messages);
      } else if (typeof detail === 'string') {
        setError(detail);
      } else {
        setError('Unable to update return. Please check the data and try again.');
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
      const result = await deleteReturn(id);
      return result;
    } catch (err) {
      const status = err.response?.status;
      const detail = err.response?.data?.detail;
      if (status === 404) {
        setError('Return not found.');
      } else if (typeof detail === 'string') {
        setError(detail);
      } else {
        setError('Unable to delete return.');
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    fetchAll,
    fetchById,
    create,
    update,
    remove,
    isLoading,
    error,
  };
}
