import apiClient from './client';

export async function createLeave(payload) {
  const { data } = await apiClient.post('/leave-requests/', payload);
  return data;
}

export async function getLeaves(params) {
  const { data } = await apiClient.get('/leave-requests/', { params });
  return data;
}

export async function getLeaveById(id) {
  const { data } = await apiClient.get(`/leave-requests/${id}`);
  return data;
}

export async function updateLeave(id, payload) {
  const { data } = await apiClient.put(`/leave-requests/${id}`, payload);
  return data;
}

export async function deleteLeave(id) {
  const { data } = await apiClient.delete(`/leave-requests/${id}`);
  return data;
}
