import apiClient from './client';

// POST /employees/
export async function createEmployee(payload) {
  const { data } = await apiClient.post('/employees/', payload);
  return data;
}

// GET /employees/
export async function getEmployees(params) {
  const { data } = await apiClient.get('/employees/', { params });
  return data;
}

// GET /employees/:id
export async function getEmployeeById(id) {
  const { data } = await apiClient.get(`/employees/${id}`);
  return data;
}

// PUT /employees/:id
export async function updateEmployee(id, payload) {
  const { data } = await apiClient.put(`/employees/${id}`, payload);
  return data;
}

// DELETE /employees/:id
export async function deleteEmployee(id) {
  const { data } = await apiClient.delete(`/employees/${id}`);
  return data;
}

// GET /employees/export/template — download as blob
export async function downloadImportTemplate() {
  const { data } = await apiClient.get('/employees/export/template', {
    responseType: 'blob',
  });
  return data;
}

// POST /employees/import — upload file
export async function importEmployees(file) {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await apiClient.post('/employees/import', formData);
  return data;
}

// GET /employees/export — download as blob
export async function exportEmployees(params) {
  const { data } = await apiClient.get('/employees/export', {
    params,
    responseType: 'blob',
  });
  return data;
}

// POST /employees/bulk/delete
export async function bulkDeleteEmployees(ids) {
  const { data } = await apiClient.post('/employees/bulk/delete', { ids });
  return data;
}

// POST /employees/bulk/status
export async function bulkChangeStatus(ids, status) {
  const { data } = await apiClient.post('/employees/bulk/status', { ids, status });
  return data;
}

export async function uploadProfilePhoto(employeeId, file, onProgress) {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await apiClient.post(`/employees/${employeeId}/photo`, formData, {
    onUploadProgress: onProgress,
  });
  return data;
}

export async function removeProfilePhoto(employeeId) {
  const { data } = await apiClient.delete(`/employees/${employeeId}/photo`);
  return data;
}

export function getProfilePhotoUrl(employeeId) {
  return `${import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'}/employees/${employeeId}/photo`;
}

export async function fetchProfilePhoto(employeeId) {
  const { data } = await apiClient.get(`/employees/${employeeId}/photo`, {
    responseType: 'blob',
  });
  return data;
}

export async function uploadAttachment(employeeId, file, fileType, onProgress) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('file_type', fileType);
  const { data } = await apiClient.post(`/employees/${employeeId}/attachments`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: onProgress,
  });
  return data;
}

export async function getAttachments(employeeId) {
  const { data } = await apiClient.get(`/employees/${employeeId}/attachments`);
  return data;
}

export function getAttachmentDownloadUrl(employeeId, attachmentId) {
  return `${import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'}/employees/${employeeId}/attachments/${attachmentId}/download`;
}

export async function deleteAttachment(employeeId, attachmentId) {
  const { data } = await apiClient.delete(`/employees/${employeeId}/attachments/${attachmentId}`);
  return data;
}

export async function getActivityLogs(employeeId) {
  const { data } = await apiClient.get(`/employees/${employeeId}/activity`);
  return data;
}