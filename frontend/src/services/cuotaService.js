import apiClient from './apiClient';

export const listarCuotas = async (page = 1, limit = 50, filters = {}) => {
  const params = new URLSearchParams({
    page,
    limit,
    ...filters
  });
  return apiClient.get(`/cuotas?${params}`);
};

export const proximasVencer = async () => {
  return apiClient.get('/cuotas/proximas-vencer');
};

export const cuotasVencidas = async () => {
  return apiClient.get('/cuotas/vencidas');
};

export const obtenerCuota = async (id) => {
  return apiClient.get(`/cuotas/${id}`);
};

export const actualizarMora = async (id, mora) => {
  return apiClient.put(`/cuotas/${id}/actualizar-mora`, { mora });
};
