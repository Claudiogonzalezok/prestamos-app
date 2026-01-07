import apiClient from './apiClient';

export const loginUsuario = async (email, password) => {
  return apiClient.post('/auth/login', { email, password });
};

export const registroFinanciera = async (financieraData, usuarioData) => {
  return apiClient.post('/auth/registro', {
    financiera: financieraData,
    usuario: usuarioData
  });
};

export const getMe = async () => {
  return apiClient.get('/auth/me');
};

export const logoutUsuario = async () => {
  return apiClient.post('/auth/logout');
};

export const cambiarPassword = async (passwordActual, nuevaPassword) => {
  return apiClient.put('/auth/cambiar-password', {
    passwordActual,
    nuevaPassword
  });
};
