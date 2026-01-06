import { useEffect, useState } from 'react';
import { listarPrestamos } from '../services/prestamoService';
import { Link } from 'react-router-dom';

export default function PrestamosPage() {
  const [prestamos, setPrestamos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [filtro, setFiltro] = useState('');

  useEffect(() => {
    cargarPrestamos();
  }, [page, filtro]);

  const cargarPrestamos = async () => {
    try {
      setLoading(true);
      const response = await listarPrestamos(page, 20, { estado: filtro || undefined });
      setPrestamos(response.prestamos);
    } catch (err) {
      setError(err.msg || 'Error al cargar préstamos');
    } finally {
      setLoading(false);
    }
  };

  const getEstadoColor = (estado) => {
    const colores = {
      activo: 'bg-green-100 text-green-800',
      atrasado: 'bg-red-100 text-red-800',
      finalizado: 'bg-blue-100 text-blue-800',
      rechazado: 'bg-gray-100 text-gray-800'
    };
    return colores[estado] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Préstamos</h1>
        <Link
          to="/prestamos/nuevo"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
        >
          + Nuevo Préstamo
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <select
          value={filtro}
          onChange={(e) => {
            setFiltro(e.target.value);
            setPage(1);
          }}
          className="px-4 py-2 border border-gray-300 rounded-lg"
        >
          <option value="">Todos los estados</option>
          <option value="activo">Activo</option>
          <option value="atrasado">Atrasado</option>
          <option value="finalizado">Finalizado</option>
          <option value="rechazado">Rechazado</option>
        </select>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">Cargando...</div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Número</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Cliente</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Monto</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Plazo</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Estado</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {prestamos.map((prestamo) => (
                <tr key={prestamo._id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium">{prestamo.numeroPrestamo}</td>
                  <td className="px-6 py-4 text-sm">{prestamo.cliente.nombreCompleto}</td>
                  <td className="px-6 py-4 text-sm">${prestamo.montoAprobado.toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm">{prestamo.plazoMeses} meses</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getEstadoColor(prestamo.estado)}`}>
                      {prestamo.estado}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <Link
                      to={`/prestamos/${prestamo._id}`}
                      className="text-blue-600 hover:underline"
                    >
                      Ver
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
