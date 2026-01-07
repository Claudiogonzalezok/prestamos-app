import apiClient from './apiClient';

export const listarClientes = async (page = 1, limit = 20, filters = {}) => {
  const params = new URLSearchParams({
    page,
    limit,
    ...filters
  });
  return apiClient.get(`/clientes?${params}`);
};

export const obtenerCliente = async (id) => {
  return apiClient.get(`/clientes/${id}`);
};

export const crearCliente = async (datos) => {
  return apiClient.post('/clientes', datos);
};

export const actualizarCliente = async (id, datos) => {
  return apiClient.put(`/clientes/${id}`, datos);
};

export const eliminarCliente = async (id) => {
  return apiClient.delete(`/clientes/${id}`);
};
