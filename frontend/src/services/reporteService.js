import apiClient from './apiClient';

export const getDashboard = async () => {
  return apiClient.get('/reportes/dashboard');
};

export const getCartera = async (filtros = {}) => {
  const params = new URLSearchParams(filtros);
  return apiClient.get(`/reportes/cartera?${params}`);
};

export const getCobranza = async (filtros = {}) => {
  const params = new URLSearchParams(filtros);
  return apiClient.get(`/reportes/cobranza?${params}`);
};

export const getMorosidad = async (filtros = {}) => {
  const params = new URLSearchParams(filtros);
  return apiClient.get(`/reportes/morosidad?${params}`);
};
