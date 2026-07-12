import apiClient from './client';

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
