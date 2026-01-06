import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { obtenerPrestamo } from '../services/prestamoService';
import { listarCuotas } from '../services/cuotaService';

export default function DetallePrestamo() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [prestamo, setPrestamo] = useState(null);
  const [cuotas, setCuotas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    cargarDatos();
  }, [id]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [prestamoData, cuotasData] = await Promise.all([
        obtenerPrestamo(id),
        listarCuotas({ prestamo: id })
      ]);
      setPrestamo(prestamoData);
      setCuotas(cuotasData.cuotas || []);
    } catch (err) {
      setError(err.msg || 'Error al cargar préstamo');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Cargando...</div>;
  if (error) return (
    <div className="p-8">
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
        {error}
      </div>
      <button
        onClick={() => navigate('/prestamos')}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
      >
        Volver
      </button>
    </div>
  );
  if (!prestamo) return <div className="p-8 text-center">Préstamo no encontrado</div>;

  return (
    <div className="p-8">
      <button
        onClick={() => navigate('/prestamos')}
        className="mb-6 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
      >
        ← Volver
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Información General */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-4">Información del Préstamo</h2>
          <div className="space-y-3">
            <div>
              <p className="text-gray-600 text-sm">Cliente</p>
              <p className="text-lg font-medium">{prestamo.cliente?.nombreCompleto}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Monto Aprobado</p>
              <p className="text-lg font-medium">${prestamo.montoAprobado?.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Tasa de Interés</p>
              <p className="text-lg font-medium">{prestamo.tasaInteres}% {prestamo.tipoTasa}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Plazo</p>
              <p className="text-lg font-medium">{prestamo.plazoMeses} meses</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Estado</p>
              <p className={`text-lg font-medium px-3 py-1 rounded inline-block ${
                prestamo.estado === 'activo' ? 'bg-green-100 text-green-800' :
                prestamo.estado === 'atrasado' ? 'bg-red-100 text-red-800' :
                prestamo.estado === 'finalizado' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {prestamo.estado}
              </p>
            </div>
          </div>
        </div>

        {/* Resumen Financiero */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-4">Resumen Financiero</h2>
          <div className="space-y-3">
            <div>
              <p className="text-gray-600 text-sm">Total a Pagar</p>
              <p className="text-lg font-medium">${prestamo.totalAPagar?.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Total Intereses</p>
              <p className="text-lg font-medium">${prestamo.totalIntereses?.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Capital Pagado</p>
              <p className="text-lg font-medium">${prestamo.capitalPagado?.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Saldo Pendiente</p>
              <p className="text-lg font-medium text-red-600">${prestamo.saldoTotal?.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Cuota Mensual</p>
              <p className="text-lg font-medium">${prestamo.montoCuota?.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de Cuotas */}
      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">Cuotas</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Número</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Vencimiento</th>
                <th className="px-4 py-3 text-right font-medium text-gray-700">Capital</th>
                <th className="px-4 py-3 text-right font-medium text-gray-700">Interés</th>
                <th className="px-4 py-3 text-right font-medium text-gray-700">Cuota</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Estado</th>
              </tr>
            </thead>
            <tbody>
              {cuotas.length > 0 ? (
                cuotas.map((cuota) => (
                  <tr key={cuota._id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3">{cuota.numeroCuota}</td>
                    <td className="px-4 py-3">
                      {new Date(cuota.fechaVencimiento).toLocaleDateString('es-AR')}
                    </td>
                    <td className="px-4 py-3 text-right">${cuota.capital?.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right">${cuota.interes?.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right font-medium">${cuota.montoCuota?.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        cuota.estado === 'pagada' ? 'bg-green-100 text-green-800' :
                        cuota.estado === 'vencida' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {cuota.estado}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-4 py-4 text-center text-gray-500">
                    No hay cuotas registradas
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
