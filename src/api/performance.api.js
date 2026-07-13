import apiClient from './client';

export async function getPerformance(params) {
  const { data } = await apiClient.get('/top-performance/', { params });
  return data;
}
