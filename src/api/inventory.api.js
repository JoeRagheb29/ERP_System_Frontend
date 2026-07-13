import apiClient from './client';

// ── Categories ───────────────────────────────────────────────────────────────
export async function getCategories(params) {
  const { data } = await apiClient.get('/inventory/categories', { params });
  return data;
}

export async function createCategory(payload) {
  const { data } = await apiClient.post('/inventory/categories', payload);
  return data;
}

export async function updateCategory(id, payload) {
  const { data } = await apiClient.put(`/inventory/categories/${id}`, payload);
  return data;
}

export async function deleteCategory(id) {
  const { data } = await apiClient.delete(`/inventory/categories/${id}`);
  return data;
}

// ── Products ─────────────────────────────────────────────────────────────────
export async function getProducts(params) {
  const { data } = await apiClient.get('/inventory/products', { params });
  return data;
}

export async function getProductStats() {
  const { data } = await apiClient.get('/inventory/products/stats');
  return data;
}

export async function createProduct(payload) {
  const { data } = await apiClient.post('/inventory/products', payload);
  return data;
}

export async function updateProduct(id, payload) {
  const { data } = await apiClient.put(`/inventory/products/${id}`, payload);
  return data;
}

export async function deleteProduct(id) {
  const { data } = await apiClient.delete(`/inventory/products/${id}`);
  return data;
}

// ── Stock ────────────────────────────────────────────────────────────────────
export async function getStock(params) {
  const { data } = await apiClient.get('/inventory/stock', { params });
  return data;
}

export async function getLowStock() {
  const { data } = await apiClient.get('/inventory/stock/low');
  return data;
}

export async function getStockForProduct(productId) {
  const { data } = await apiClient.get(`/inventory/stock/${productId}`);
  return data;
}

export async function adjustStock(productId, payload) {
  const { data } = await apiClient.patch(`/inventory/stock/${productId}`, payload);
  return data;
}

// ── Suppliers ────────────────────────────────────────────────────────────────
export async function getSuppliers(params) {
  const { data } = await apiClient.get('/inventory/suppliers', { params });
  return data;
}

export async function getSupplierStats() {
  const { data } = await apiClient.get('/inventory/suppliers/stats');
  return data;
}

export async function createSupplier(payload) {
  const { data } = await apiClient.post('/inventory/suppliers', payload);
  return data;
}

export async function updateSupplier(id, payload) {
  const { data } = await apiClient.put(`/inventory/suppliers/${id}`, payload);
  return data;
}

export async function deleteSupplier(id) {
  const { data } = await apiClient.delete(`/inventory/suppliers/${id}`);
  return data;
}

export async function getSupplierProducts(supplierId) {
  const { data } = await apiClient.get(`/inventory/suppliers/${supplierId}/products`);
  return data;
}

export async function addSupplierProduct(supplierId, payload) {
  const { data } = await apiClient.post(`/inventory/suppliers/${supplierId}/products`, payload);
  return data;
}

export async function updateSupplierProduct(supplierId, productId, payload) {
  const { data } = await apiClient.put(`/inventory/suppliers/${supplierId}/products/${productId}`, payload);
  return data;
}

export async function removeSupplierProduct(supplierId, productId) {
  const { data } = await apiClient.delete(`/inventory/suppliers/${supplierId}/products/${productId}`);
  return data;
}

// ── Purchase Orders ───────────────────────────────────────────────────────────
export async function getPurchaseOrders(params) {
  const { data } = await apiClient.get('/inventory/purchase-orders', { params });
  return data;
}

export async function getPurchaseOrderStats() {
  const { data } = await apiClient.get('/inventory/purchase-orders/stats');
  return data;
}

export async function getPurchaseOrder(id) {
  const { data } = await apiClient.get(`/inventory/purchase-orders/${id}`);
  return data;
}

export async function createPurchaseOrder(payload) {
  const { data } = await apiClient.post('/inventory/purchase-orders', payload);
  return data;
}

export async function updatePurchaseOrder(id, payload) {
  const { data } = await apiClient.put(`/inventory/purchase-orders/${id}`, payload);
  return data;
}

export async function deletePurchaseOrder(id) {
  const { data } = await apiClient.delete(`/inventory/purchase-orders/${id}`);
  return data;
}

export async function addPoItem(id, payload) {
  const { data } = await apiClient.post(`/inventory/purchase-orders/${id}/items`, payload);
  return data;
}

export async function updatePoItem(id, itemId, payload) {
  const { data } = await apiClient.put(`/inventory/purchase-orders/${id}/items/${itemId}`, payload);
  return data;
}

export async function deletePoItem(id, itemId) {
  const { data } = await apiClient.delete(`/inventory/purchase-orders/${id}/items/${itemId}`);
  return data;
}

export async function submitPo(id) {
  const { data } = await apiClient.post(`/inventory/purchase-orders/${id}/submit`, {});
  return data;
}

export async function receivePo(id, payload) {
  const { data } = await apiClient.post(`/inventory/purchase-orders/${id}/receive`, payload ?? {});
  return data;
}

export async function cancelPo(id) {
  const { data } = await apiClient.post(`/inventory/purchase-orders/${id}/cancel`, {});
  return data;
}
