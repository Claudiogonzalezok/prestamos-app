//Ese código implementa un contexto de autenticación en React (con Context + useState + useEffect) 
//para manejar el login, registro y logout de usuarios, además de persistir la sesión en localStorage. 

import { createContext, useState, useContext, useEffect } from 'react';
import { loginUsuario, registroFinanciera, getMe, logoutUsuario } from '../services/authService';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [financiera, setFinanciera] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Cargar datos al montar
  useEffect(() => {
    const tokenGuardado = localStorage.getItem('token');
    const usuarioGuardado = localStorage.getItem('usuario');
    const financieraGuardada = localStorage.getItem('financiera');

    if (tokenGuardado && usuarioGuardado) {
      setToken(tokenGuardado);
      setUsuario(JSON.parse(usuarioGuardado));
      setFinanciera(JSON.parse(financieraGuardada));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const data = await loginUsuario(email, password);
      setToken(data.accessToken);
      setUsuario(data.usuario);
      setFinanciera(data.financiera);
      
      localStorage.setItem('token', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('usuario', JSON.stringify(data.usuario));
      localStorage.setItem('financiera', JSON.stringify(data.financiera));
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.msg || error.message };
    }
  };

  const registro = async (financieraData, usuarioData) => {
    try {
      const data = await registroFinanciera(financieraData, usuarioData);
      setToken(data.accessToken || data.token);
      setUsuario(data.usuario);
      setFinanciera(data.financiera);
      
      localStorage.setItem('token', data.accessToken || data.token);
      if (data.refreshToken) {
        localStorage.setItem('refreshToken', data.refreshToken);
      }
      localStorage.setItem('usuario', JSON.stringify(data.usuario));
      localStorage.setItem('financiera', JSON.stringify(data.financiera));
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.msg || error.message };
    }
  };

  const logout = async () => {
    try {
      await logoutUsuario();
    } finally {
      setToken(null);
      setUsuario(null);
      setFinanciera(null);
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      localStorage.removeItem('financiera');
    }
  };

  return (
    <AuthContext.Provider value={{
      usuario,
      financiera,
      token,
      loading,
      login,
      registro,
      logout,
      isAuthenticated: !!token
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  return context;
}
