import apiClient from './apiClient';

export const simularPrestamo = async (datos) => {
  return apiClient.post('/prestamos/simular', datos);
};

export const listarPrestamos = async (page = 1, limit = 20, filters = {}) => {
  const params = new URLSearchParams({
    page,
    limit,
    ...filters
  });
  return apiClient.get(`/prestamos?${params}`);
};

export const obtenerPrestamo = async (id) => {
  return apiClient.get(`/prestamos/${id}`);
};

export const crearPrestamo = async (datos) => {
  return apiClient.post('/prestamos', datos);
};

export const calcularCancelacionAnticipada = async (id) => {
  return apiClient.get(`/prestamos/${id}/cancelacion-anticipada`);
};

export const cambiarEstadoPrestamo = async (id, estado) => {
  return apiClient.put(`/prestamos/${id}/estado`, { estado });
};
