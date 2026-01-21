import React from 'react';

export default function VendedorDashboard({ datos }) {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Panel de Vendedor</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm">Clientes Asignados</p>
          <p className="text-3xl font-bold text-blue-600">{datos?.clientes?.asignados || '—'}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm">Préstamos Gestionados</p>
          <p className="text-3xl font-bold text-green-600">{datos?.prestamos?.gestionados || '—'}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm">Recaudación</p>
          <p className="text-3xl font-bold text-purple-600">${(datos?.pagosMes?.totalRecaudado || 0).toLocaleString()}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-2">Tareas</h2>
        <ul className="list-disc pl-5 text-sm text-gray-700">
          <li>Ver clientes y seguimiento</li>
          <li>Registrar pagos y novedades</li>
          <li>Solicitar aprobaciones a administradores</li>
        </ul>
      </div>
    </div>
  );
}
