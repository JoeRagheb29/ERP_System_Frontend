import apiClient from './client';

export async function getPayroll(params) {
  const { data } = await apiClient.get('/payroll/', { params });
  return data;
}

export async function getPayrollById(id) {
  const { data } = await apiClient.get(`/payroll/${id}`);
  return data;
}

export async function generatePayroll(payload) {
  const { data } = await apiClient.post('/payroll/generate', payload);
  return data;
}

export async function updatePayroll(id, payload) {
  const { data } = await apiClient.patch(`/payroll/${id}`, payload);
  return data;
}

export async function deletePayroll(id) {
  const { data } = await apiClient.delete(`/payroll/${id}`);
  return data;
}
