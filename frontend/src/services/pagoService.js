import apiClient from './apiClient';

export const listarPagos = async (page = 1, limit = 50, filters = {}) => {
  const params = new URLSearchParams({
    page,
    limit,
    ...filters
  });
  return apiClient.get(`/pagos?${params}`);
};

export const registrarPago = async (datos) => {
  return apiClient.post('/pagos', datos);
};

export const obtenerPago = async (id) => {
  return apiClient.get(`/pagos/${id}`);
};

export const anularPago = async (id, motivo) => {
  return apiClient.put(`/pagos/${id}/anular`, { motivo });
};

export const resumenHoy = async () => {
  return apiClient.get('/pagos/resumen-hoy');
};
