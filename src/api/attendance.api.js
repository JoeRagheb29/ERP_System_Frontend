import apiClient from './client';

export async function createAttendance(payload) {
  const { data } = await apiClient.post('/attendance/', payload);
  return data;
}

export async function getAttendance(params) {
  const { data } = await apiClient.get('/attendance/', { params });
  return data;
}

export async function getAttendanceById(id) {
  const { data } = await apiClient.get(`/attendance/${id}`);
  return data;
}

export async function updateAttendance(id, payload) {
  const { data } = await apiClient.put(`/attendance/${id}`, payload);
  return data;
}

export async function deleteAttendance(id) {
  const { data } = await apiClient.delete(`/attendance/${id}`);
  return data;
}

export async function downloadAttendanceTemplate() {
  const { data } = await apiClient.get('/attendance/export/template', {
    responseType: 'blob',
  });
  return data;
}

export async function importAttendance(file) {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await apiClient.post('/attendance/import', formData);
  return data;
}

export async function exportAttendance(params) {
  const { data } = await apiClient.get('/attendance/export', {
    params,
    responseType: 'blob',
  });
  return data;
}
