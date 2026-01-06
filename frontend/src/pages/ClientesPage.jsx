import { useEffect, useState } from 'react';
import { listarClientes } from '../services/clienteService';
import { Link } from 'react-router-dom';

export default function ClientesPage() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [buscar, setBuscar] = useState('');

  useEffect(() => {
    cargarClientes();
  }, [page, buscar]);

  const cargarClientes = async () => {
    try {
      setLoading(true);
      const response = await listarClientes(page, 20, { buscar: buscar || undefined });
      setClientes(response.clientes);
    } catch (err) {
      setError(err.msg || 'Error al cargar clientes');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Clientes</h1>
        <Link
          to="/clientes/nuevo"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
        >
          + Nuevo Cliente
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <input
          type="text"
          placeholder="Buscar por nombre, DNI o email..."
          value={buscar}
          onChange={(e) => {
            setBuscar(e.target.value);
            setPage(1);
          }}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
        />
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
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Nombre</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">DNI</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Email</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Teléfono</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Calificación</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {clientes.map((cliente) => (
                <tr key={cliente._id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium">{cliente.nombreCompleto}</td>
                  <td className="px-6 py-4 text-sm">{cliente.dni}</td>
                  <td className="px-6 py-4 text-sm">{cliente.email}</td>
                  <td className="px-6 py-4 text-sm">{cliente.celular}</td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {cliente.calificacion}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <Link
                      to={`/clientes/${cliente._id}`}
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
