//Ese archivo configura un cliente Axios con interceptores para:

//Adjuntar el token JWT en cada request (Authorization: Bearer ...).
//Normalizar responses devolviendo response.data.
//Manejar 401 (no autorizado): limpiar localStorage y redirigir a /login

import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api'
});

// Interceptor de request: agregar token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor de response: manejar errores
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      localStorage.removeItem('financiera');
      window.location.href = '/login';
    }
    return Promise.reject(error.response?.data || error);
  }
);

export default apiClient;
