import { useEffect, useState } from 'react';
import { listarPagos } from '../services/pagoService';
import { Link } from 'react-router-dom';

export default function PagosPage() {
  const [pagos, setPagos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    cargarPagos();
  }, [page]);

  const cargarPagos = async () => {
    try {
      setLoading(true);
      const response = await listarPagos(page, 50);
      setPagos(response.pagos);
    } catch (err) {
      setError(err.msg || 'Error al cargar pagos');
    } finally {
      setLoading(false);
    }
  };

  const getMetodoColor = (metodo) => {
    const colores = {
      efectivo: 'bg-green-100 text-green-800',
      transferencia: 'bg-blue-100 text-blue-800',
      deposito: 'bg-purple-100 text-purple-800',
      tarjeta_debito: 'bg-yellow-100 text-yellow-800',
      cheque: 'bg-red-100 text-red-800'
    };
    return colores[metodo] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Pagos</h1>
        <Link
          to="/pagos/nuevo"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
        >
          + Registrar Pago
        </Link>
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
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Recibo</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Cliente</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Préstamo</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Monto</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Método</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Fecha</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {pagos.map((pago) => (
                <tr key={pago._id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium">{pago.numeroRecibo}</td>
                  <td className="px-6 py-4 text-sm">{pago.cliente.nombreCompleto}</td>
                  <td className="px-6 py-4 text-sm">{pago.prestamo.numeroPrestamo}</td>
                  <td className="px-6 py-4 text-sm font-medium">${pago.monto.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getMetodoColor(pago.metodoPago)}`}>
                      {pago.metodoPago}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">{new Date(pago.fechaPago).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-sm">
                    <Link
                      to={`/pagos/${pago._id}`}
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
