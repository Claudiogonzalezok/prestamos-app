import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { listarPagos } from '../services/pagoService';

export default function DetallePago() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pago, setPago] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    cargarPago();
  }, [id]);

  const cargarPago = async () => {
    try {
      setLoading(true);
      const data = await listarPagos({ id });
      const pagoEncontrado = data.pagos?.[0];
      if (pagoEncontrado) {
        setPago(pagoEncontrado);
      } else {
        setError('Pago no encontrado');
      }
    } catch (err) {
      setError(err.msg || 'Error al cargar pago');
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
        onClick={() => navigate('/pagos')}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
      >
        Volver
      </button>
    </div>
  );
  if (!pago) return <div className="p-8 text-center">Pago no encontrado</div>;

  return (
    <div className="p-8">
      <button
        onClick={() => navigate('/pagos')}
        className="mb-6 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
      >
        ← Volver
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Información del Pago */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-4">Información del Pago</h2>
          <div className="space-y-3">
            <div>
              <p className="text-gray-600 text-sm">Cliente</p>
              <p className="text-lg font-medium">{pago.cliente?.nombreCompleto}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Monto</p>
              <p className="text-2xl font-bold text-green-600">${pago.monto?.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Tipo de Pago</p>
              <p className="text-lg font-medium">{pago.tipoPago}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Método</p>
              <p className="text-lg font-medium capitalize">{pago.metodoPago}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Fecha de Pago</p>
              <p className="text-lg font-medium">
                {new Date(pago.fechaPago).toLocaleDateString('es-AR')}
              </p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Estado</p>
              <p className={`text-lg font-medium px-3 py-1 rounded inline-block ${
                pago.estado === 'confirmado' ? 'bg-green-100 text-green-800' :
                pago.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {pago.estado}
              </p>
            </div>
          </div>
        </div>

        {/* Distribución */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-4">Distribución</h2>
          <div className="space-y-3">
            <div>
              <p className="text-gray-600 text-sm">Capital</p>
              <p className="text-lg font-medium">${pago.distribucion?.capital?.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Interés</p>
              <p className="text-lg font-medium">${pago.distribucion?.interes?.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Mora</p>
              <p className="text-lg font-medium">${pago.distribucion?.mora?.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Información del Préstamo */}
        {pago.prestamo && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold mb-4">Préstamo Asociado</h2>
            <div className="space-y-3">
              <div>
                <p className="text-gray-600 text-sm">Número de Préstamo</p>
                <p className="text-lg font-medium">{pago.prestamo?.numeroPrestamo}</p>
              </div>
            </div>
          </div>
        )}

        {/* Registrado Por */}
        {pago.registradoPor && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold mb-4">Registro</h2>
            <div className="space-y-3">
              <div>
                <p className="text-gray-600 text-sm">Registrado por</p>
                <p className="text-lg font-medium">{pago.registradoPor?.nombreCompleto}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
