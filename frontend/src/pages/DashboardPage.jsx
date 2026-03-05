import { useEffect, useState } from 'react';
import { getDashboard } from '../services/reporteService';
import { useAuth } from '../context/AuthContext';

import AdminDashboard from './AdminDashboard';
import VendedorDashboard from './VendedorDashboard';
import ClienteDashboard from './ClienteDashboard';

export default function DashboardPage() {
  const [datos, setDatos] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { usuario } = useAuth();

  useEffect(() => {
    cargarDatos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cargarDatos = async () => {
    try {
      const response = await getDashboard();
      setDatos(response);
    } catch (err) {
      setError(err.msg || 'Error al cargar dashboard');
    } finally {
      setLoading(false);
    }
  };

  // Mientras cargan los datos, mostramos un placeholder general
  if (loading) {
    return <div className="p-8">Cargando...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-600">{error}</div>;
  }

  // Elección de dashboard según rol
  const rol = usuario?.rol || null;

  if (rol === 'admin') {
    return <AdminDashboard datos={datos} />;
  }

  if (rol === 'empleado' || rol === 'cobrador') {
    return <VendedorDashboard datos={datos} />;
  }

  // Soporte para clientes (si la app guarda un objeto 'cliente' en localStorage)
  try {
    const clienteLocal = JSON.parse(localStorage.getItem('cliente'));
    if (clienteLocal) {
      return <ClienteDashboard cliente={clienteLocal} />;
    }
  } catch (e) {
    // ignore
  }

  // Fallback: si no se reconoce el rol, mostrar el admin-like dashboard
  return <AdminDashboard datos={datos} />;
}
