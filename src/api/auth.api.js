import apiClient from './client';

/**
 * Auth API — functions that map to your FastAPI /auth & /users & /rbac endpoints.
 *
 * CRITICAL — Login uses x-www-form-urlencoded, NOT JSON.
 * Your backend declares `OAuth2PasswordRequestForm` which FastAPI
 * reads as form data. Sending JSON will return a 422 Unprocessable Entity.
 * URLSearchParams automatically sets the correct Content-Type header.
 */

// POST /auth/login
export async function loginUser(username, password) {
  const formData = new URLSearchParams();
  formData.append('username', username);
  formData.append('password', password);

  // Override the default application/json for this one endpoint
  const { data } = await apiClient.post('/auth/login', formData, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });

  return data; // { access_token: string, token_type: "bearer" }
}

// POST /auth/register
export async function registerUser(payload) {
  // Registration also uses Form() in FastAPI — send as form data
  const formData = new URLSearchParams(payload);
  const { data } = await apiClient.post('/auth/register', formData, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
  return data; // UserResponse
}

// GET /users/me
export async function getCurrentUser() {
  const { data } = await apiClient.get('/users/me');
  return data; // UserResponse
}

// GET /rbac/mypermissions
export async function getMyPermissions() {
  const { data } = await apiClient.get('/rbac/mypermissions');
  return data; // UserPermissionsMatrixResponse
}