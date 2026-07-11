import { useState, useCallback } from 'react';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getProducts,
  getProductStats,
  createProduct,
  updateProduct,
  deleteProduct,
  getStock,
  getLowStock,
  getStockForProduct,
  adjustStock,
  getSuppliers,
  getSupplierStats,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  getSupplierProducts,
  addSupplierProduct,
  updateSupplierProduct,
  removeSupplierProduct,
  getPurchaseOrders,
  getPurchaseOrderStats,
  getPurchaseOrder,
  createPurchaseOrder,
  updatePurchaseOrder,
  deletePurchaseOrder,
  addPoItem,
  updatePoItem,
  deletePoItem,
  submitPo,
  receivePo,
  cancelPo,
} from "../../../api/inventory.api";

// ── Shared error → message extractor ─────────────────────────────────────────
function msgFromError(err) {
  const detail = err?.response?.data?.detail;
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) return detail.map((e) => e.msg?.replace(/^Value error, /, '')).join(' · ');
  return 'Operation failed. Please try again.';
}

function useApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  return { loading, error, setLoading, setError };
}

// ── Categories ────────────────────────────────────────────────────────────────
export function useCategories() {
  const api = useApi();
  const fetchAll = useCallback(async (params = {}) => {
    api.setLoading(true); api.setError('');
    try { return await getCategories(params); }
    catch (e) { api.setError(msgFromError(e)); throw e; }
    finally { api.setLoading(false); }
  }, []);
  const create = useCallback(async (p) => {
    api.setLoading(true); api.setError('');
    try { return await createCategory(p); }
    catch (e) { api.setError(msgFromError(e)); throw e; }
    finally { api.setLoading(false); }
  }, []);
  const update = useCallback(async (id, p) => {
    api.setLoading(true); api.setError('');
    try { return await updateCategory(id, p); }
    catch (e) { api.setError(msgFromError(e)); throw e; }
    finally { api.setLoading(false); }
  }, []);
  const remove = useCallback(async (id) => {
    api.setLoading(true); api.setError('');
    try { return await deleteCategory(id); }
    catch (e) { api.setError(msgFromError(e)); throw e; }
    finally { api.setLoading(false); }
  }, []);
  return { ...api, fetchAll, create, update, remove };
}

// ── Products ────────────────────────────────────────────────────────────────────
export function useProducts() {
  const api = useApi();
  const fetchAll = useCallback(async (params = {}) => {
    api.setLoading(true); api.setError('');
    try { return await getProducts(params); }
    catch (e) { api.setError(msgFromError(e)); throw e; }
    finally { api.setLoading(false); }
  }, []);
  const fetchStats = useCallback(async () => {
    return getProductStats();
  }, []);
  const create = useCallback(async (p) => {
    api.setLoading(true); api.setError('');
    try { return await createProduct(p); }
    catch (e) { api.setError(msgFromError(e)); throw e; }
    finally { api.setLoading(false); }
  }, []);
  const update = useCallback(async (id, p) => {
    api.setLoading(true); api.setError('');
    try { return await updateProduct(id, p); }
    catch (e) { api.setError(msgFromError(e)); throw e; }
    finally { api.setLoading(false); }
  }, []);
  const remove = useCallback(async (id) => {
    api.setLoading(true); api.setError('');
    try { return await deleteProduct(id); }
    catch (e) { api.setError(msgFromError(e)); throw e; }
    finally { api.setLoading(false); }
  }, []);
  return { ...api, fetchAll, fetchStats, create, update, remove };
}

// ── Stock ───────────────────────────────────────────────────────────────────────
export function useStock() {
  const api = useApi();
  const fetchAll = useCallback(async (params = {}) => {
    api.setLoading(true); api.setError('');
    try { return await getStock(params); }
    catch (e) { api.setError(msgFromError(e)); throw e; }
    finally { api.setLoading(false); }
  }, []);
  const fetchLow = useCallback(async () => {
    return getLowStock();
  }, []);
  const fetchOne = useCallback(async (id) => {
    return getStockForProduct(id);
  }, []);
  const adjust = useCallback(async (id, p) => {
    api.setLoading(true); api.setError('');
    try { return await adjustStock(id, p); }
    catch (e) { api.setError(msgFromError(e)); throw e; }
    finally { api.setLoading(false); }
  }, []);
  return { ...api, fetchAll, fetchLow, fetchOne, adjust };
}

// ── Suppliers ───────────────────────────────────────────────────────────────────
export function useSuppliers() {
  const api = useApi();
  const fetchAll = useCallback(async (params = {}) => {
    api.setLoading(true); api.setError('');
    try { return await getSuppliers(params); }
    catch (e) { api.setError(msgFromError(e)); throw e; }
    finally { api.setLoading(false); }
  }, []);
  const fetchStats = useCallback(async () => {
    return getSupplierStats();
  }, []);
  const create = useCallback(async (p) => {
    api.setLoading(true); api.setError('');
    try { return await createSupplier(p); }
    catch (e) { api.setError(msgFromError(e)); throw e; }
    finally { api.setLoading(false); }
  }, []);
  const update = useCallback(async (id, p) => {
    api.setLoading(true); api.setError('');
    try { return await updateSupplier(id, p); }
    catch (e) { api.setError(msgFromError(e)); throw e; }
    finally { api.setLoading(false); }
  }, []);
  const remove = useCallback(async (id) => {
    api.setLoading(true); api.setError('');
    try { return await deleteSupplier(id); }
    catch (e) { api.setError(msgFromError(e)); throw e; }
    finally { api.setLoading(false); }
  }, []);
  const fetchProducts = useCallback(async (supplierId) => {
    return getSupplierProducts(supplierId);
  }, []);
  const addProduct = useCallback(async (supplierId, p) => {
    api.setLoading(true); api.setError('');
    try { return await addSupplierProduct(supplierId, p); }
    catch (e) { api.setError(msgFromError(e)); throw e; }
    finally { api.setLoading(false); }
  }, []);
  const updateProductLink = useCallback(async (supplierId, productId, p) => {
    api.setLoading(true); api.setError('');
    try { return await updateSupplierProduct(supplierId, productId, p); }
    catch (e) { api.setError(msgFromError(e)); throw e; }
    finally { api.setLoading(false); }
  }, []);
  const removeProductLink = useCallback(async (supplierId, productId) => {
    api.setLoading(true); api.setError('');
    try { return await removeSupplierProduct(supplierId, productId); }
    catch (e) { api.setError(msgFromError(e)); throw e; }
    finally { api.setLoading(false); }
  }, []);
  return {
    ...api, fetchAll, fetchStats, create, update, remove,
    fetchProducts, addProduct, updateProductLink, removeProductLink,
  };
}

// ── Purchase Orders ────────────────────────────────────────────────────────────
export function usePurchaseOrders() {
  const api = useApi();
  const fetchAll = useCallback(async (params = {}) => {
    api.setLoading(true); api.setError('');
    try { return await getPurchaseOrders(params); }
    catch (e) { api.setError(msgFromError(e)); throw e; }
    finally { api.setLoading(false); }
  }, []);
  const fetchStats = useCallback(async () => {
    return getPurchaseOrderStats();
  }, []);
  const fetchOne = useCallback(async (id) => {
    return getPurchaseOrder(id);
  }, []);
  const create = useCallback(async (p) => {
    api.setLoading(true); api.setError('');
    try { return await createPurchaseOrder(p); }
    catch (e) { api.setError(msgFromError(e)); throw e; }
    finally { api.setLoading(false); }
  }, []);
  const update = useCallback(async (id, p) => {
    api.setLoading(true); api.setError('');
    try { return await updatePurchaseOrder(id, p); }
    catch (e) { api.setError(msgFromError(e)); throw e; }
    finally { api.setLoading(false); }
  }, []);
  const remove = useCallback(async (id) => {
    api.setLoading(true); api.setError('');
    try { return await deletePurchaseOrder(id); }
    catch (e) { api.setError(msgFromError(e)); throw e; }
    finally { api.setLoading(false); }
  }, []);
  const addItem = useCallback(async (id, p) => {
    api.setLoading(true); api.setError('');
    try { return await addPoItem(id, p); }
    catch (e) { api.setError(msgFromError(e)); throw e; }
    finally { api.setLoading(false); }
  }, []);
  const updateItem = useCallback(async (id, itemId, p) => {
    api.setLoading(true); api.setError('');
    try { return await updatePoItem(id, itemId, p); }
    catch (e) { api.setError(msgFromError(e)); throw e; }
    finally { api.setLoading(false); }
  }, []);
  const removeItem = useCallback(async (id, itemId) => {
    api.setLoading(true); api.setError('');
    try { return await deletePoItem(id, itemId); }
    catch (e) { api.setError(msgFromError(e)); throw e; }
    finally { api.setLoading(false); }
  }, []);
  const submit = useCallback(async (id) => {
    api.setLoading(true); api.setError('');
    try { return await submitPo(id); }
    catch (e) { api.setError(msgFromError(e)); throw e; }
    finally { api.setLoading(false); }
  }, []);
  const receive = useCallback(async (id, p) => {
    api.setLoading(true); api.setError('');
    try { return await receivePo(id, p); }
    catch (e) { api.setError(msgFromError(e)); throw e; }
    finally { api.setLoading(false); }
  }, []);
  const cancel = useCallback(async (id) => {
    api.setLoading(true); api.setError('');
    try { return await cancelPo(id); }
    catch (e) { api.setError(msgFromError(e)); throw e; }
    finally { api.setLoading(false); }
  }, []);
  return {
    ...api, fetchAll, fetchStats, fetchOne, create, update, remove,
    addItem, updateItem, removeItem, submit, receive, cancel,
  };
}
