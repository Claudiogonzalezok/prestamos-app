import React from 'react';

export default function AdminDashboard({ datos }) {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Panel de Administración</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm">Usuarios</p>
          <p className="text-3xl font-bold text-blue-600">{datos?.usuarios?.total || '—'}</p>
          <p className="text-xs text-gray-500 mt-2">Activos: {datos?.usuarios?.activos || 0}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm">Clientes</p>
          <p className="text-3xl font-bold text-green-600">{datos?.clientes?.total || '—'}</p>
          <p className="text-xs text-gray-500 mt-2">Activos: {datos?.clientes?.activos || 0}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm">Préstamos</p>
          <p className="text-3xl font-bold text-purple-600">{datos?.prestamos?.activos || '—'}</p>
          <p className="text-xs text-gray-500 mt-2">Atrasados: {datos?.prestamos?.atrasados || 0}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-2">Resumen</h2>
        <p className="text-sm text-gray-600">Usa este panel para supervisar la financiera, usuarios y configuración del sistema.</p>
      </div>
    </div>
  );
}
