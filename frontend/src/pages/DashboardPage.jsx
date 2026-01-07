import { useEffect, useState } from 'react';
import { getDashboard } from '../services/reporteService';

export default function DashboardPage() {
  const [datos, setDatos] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    cargarDatos();
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

  if (loading) {
    return <div className="p-8">Cargando...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-600">{error}</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm">Total Clientes</p>
          <p className="text-3xl font-bold text-blue-600">{datos?.clientes?.total || 0}</p>
          <p className="text-xs text-gray-500 mt-2">{datos?.clientes?.activos || 0} activos</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm">Préstamos Activos</p>
          <p className="text-3xl font-bold text-green-600">{datos?.prestamos?.activos || 0}</p>
          <p className="text-xs text-gray-500 mt-2">{datos?.prestamos?.atrasados || 0} atrasados</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm">Capital Prestado</p>
          <p className="text-3xl font-bold text-purple-600">
            ${(datos?.prestamos?.capitalPrestado || 0).toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 mt-2">Cartera activa</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm">Cuotas Vencidas</p>
          <p className="text-3xl font-bold text-red-600">{datos?.cuotasVencidas?.cantidad || 0}</p>
          <p className="text-xs text-gray-500 mt-2">
            ${(datos?.cuotasVencidas?.montoTotal || 0).toLocaleString()}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Recaudación del Mes</h2>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-gray-600 text-sm">Total</p>
            <p className="text-2xl font-bold">${(datos?.pagosMes?.totalRecaudado || 0).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-gray-600 text-sm">Capital</p>
            <p className="text-2xl font-bold">${(datos?.pagosMes?.capitalRecaudado || 0).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-gray-600 text-sm">Intereses</p>
            <p className="text-2xl font-bold">${(datos?.pagosMes?.interesRecaudado || 0).toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
