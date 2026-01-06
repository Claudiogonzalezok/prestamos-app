import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { obtenerCliente } from '../services/clienteService';

export default function DetalleCliente() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cliente, setCliente] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    cargarCliente();
  }, [id]);

  const cargarCliente = async () => {
    try {
      setLoading(true);
      const data = await obtenerCliente(id);
      setCliente(data);
    } catch (err) {
      setError(err.msg || 'Error al cargar cliente');
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
        onClick={() => navigate('/clientes')}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
      >
        Volver
      </button>
    </div>
  );
  if (!cliente) return <div className="p-8 text-center">Cliente no encontrado</div>;

  return (
    <div className="p-8">
      <button
        onClick={() => navigate('/clientes')}
        className="mb-6 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
      >
        ← Volver
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Información Personal */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-4">Información Personal</h2>
          <div className="space-y-3">
            <div>
              <p className="text-gray-600 text-sm">Nombre Completo</p>
              <p className="text-lg font-medium">{cliente.nombreCompleto}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">DNI</p>
              <p className="text-lg font-medium">{cliente.dni}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">CUIL</p>
              <p className="text-lg font-medium">{cliente.cuil}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Fecha de Nacimiento</p>
              <p className="text-lg font-medium">
                {new Date(cliente.fechaNacimiento).toLocaleDateString('es-AR')}
              </p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Estado Civil</p>
              <p className="text-lg font-medium">{cliente.estadoCivil}</p>
            </div>
          </div>
        </div>

        {/* Información de Contacto */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-4">Contacto</h2>
          <div className="space-y-3">
            <div>
              <p className="text-gray-600 text-sm">Email</p>
              <p className="text-lg font-medium">{cliente.email}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Teléfono</p>
              <p className="text-lg font-medium">{cliente.telefono || '-'}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Celular</p>
              <p className="text-lg font-medium">{cliente.celular}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">WhatsApp</p>
              <p className="text-lg font-medium">{cliente.whatsapp || '-'}</p>
            </div>
          </div>
        </div>

        {/* Dirección */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-4">Dirección</h2>
          <div className="space-y-3">
            <div>
              <p className="text-gray-600 text-sm">Calle y Número</p>
              <p className="text-lg font-medium">
                {cliente.direccion?.calle} {cliente.direccion?.numero}
              </p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Barrio</p>
              <p className="text-lg font-medium">{cliente.direccion?.barrio}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Ciudad</p>
              <p className="text-lg font-medium">{cliente.direccion?.ciudad}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Código Postal</p>
              <p className="text-lg font-medium">{cliente.direccion?.codigoPostal}</p>
            </div>
          </div>
        </div>

        {/* Información Laboral */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-4">Información Laboral</h2>
          <div className="space-y-3">
            <div>
              <p className="text-gray-600 text-sm">Ocupación</p>
              <p className="text-lg font-medium">{cliente.ocupacion}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Empleador</p>
              <p className="text-lg font-medium">{cliente.empleador}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Ingreso Mensual</p>
              <p className="text-lg font-medium">${cliente.ingresoMensual?.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Antigüedad Laboral</p>
              <p className="text-lg font-medium">{cliente.antiguedadLaboral} meses</p>
            </div>
          </div>
        </div>

        {/* Calificación */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-4">Calificación</h2>
          <div className="space-y-3">
            <div>
              <p className="text-gray-600 text-sm">Calificación</p>
              <p className={`text-lg font-medium px-3 py-1 rounded inline-block ${
                cliente.calificacion === 'A' ? 'bg-green-100 text-green-800' :
                cliente.calificacion === 'B' ? 'bg-blue-100 text-blue-800' :
                'bg-red-100 text-red-800'
              }`}>
                {cliente.calificacion}
              </p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Estado</p>
              <p className="text-lg font-medium">
                {cliente.estado === 'activo' ? '✓ Activo' : '✗ Inactivo'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
