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

export async function exportLeaveRequests(params) {
  const { data } = await apiClient.get('/leave-requests/export', {
    params,
    responseType: 'blob',
  });
  return data;
}

export async function downloadLeaveTemplate() {
  const { data } = await apiClient.get('/leave-requests/export/template', {
    responseType: 'blob',
  });
  return data;
}

export async function importLeaveRequests(file) {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await apiClient.post('/leave-requests/import', formData);
  return data;
}

export async function bulkDeleteLeaveRequests(ids) {
  const { data } = await apiClient.post('/leave-requests/bulk/delete', { ids });
  return data;
}

export async function bulkChangeLeaveStatus(ids, status) {
  const { data } = await apiClient.post('/leave-requests/bulk/status', { ids, status });
  return data;
}
