import apiClient from './client';

// ── Customers ──────────────────────────────────────────────────────────────

// GET /customers/
export async function getCustomers(params) {
  const { data } = await apiClient.get('/customers/', { params });
  return data;
}

// GET /customers/:id
export async function getCustomerById(id) {
  const { data } = await apiClient.get(`/customers/${id}`);
  return data;
}

// POST /customers/
export async function createCustomer(payload) {
  const { data } = await apiClient.post('/customers/', payload);
  return data;
}

// PUT /customers/:id
export async function updateCustomer(id, payload) {
  const { data } = await apiClient.put(`/customers/${id}`, payload);
  return data;
}

// DELETE /customers/:id
export async function deleteCustomer(id) {
  const { data } = await apiClient.delete(`/customers/${id}`);
  return data;
}

// ── Sales Orders ───────────────────────────────────────────────────────────

// GET /sales-orders/
export async function getSalesOrders(params) {
  const { data } = await apiClient.get('/sales-orders/', { params });
  return data;
}

// GET /sales-orders/:id
export async function getSalesOrderById(id) {
  const { data } = await apiClient.get(`/sales-orders/${id}`);
  return data;
}

// POST /sales-orders/
export async function createSalesOrder(payload) {
  const { data } = await apiClient.post('/sales-orders/', payload);
  return data;
}

// PUT /sales-orders/:id
export async function updateSalesOrder(id, payload) {
  const { data } = await apiClient.put(`/sales-orders/${id}`, payload);
  return data;
}

// DELETE /sales-orders/:id
export async function deleteSalesOrder(id) {
  const { data } = await apiClient.delete(`/sales-orders/${id}`);
  return data;
}
