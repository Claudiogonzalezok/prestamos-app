import React from 'react';

export default function ClienteDashboard({ cliente }) {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Portal del Cliente</h1>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <p className="text-gray-600 text-sm">Bienvenido{cliente?.nombre ? `, ${cliente.nombre}` : ''}</p>
        <p className="text-lg font-medium mt-2">Resumen de tu cuenta</p>
        <div className="mt-4 text-sm text-gray-700">
          <p>Préstamos activos: {cliente?.prestamosActivos || 0}</p>
          <p>Cuotas pendientes: {cliente?.cuotasPendientes || 0}</p>
          <p>Contacto: {cliente?.email || cliente?.telefono || '—'}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-2">Acciones</h2>
        <ul className="list-disc pl-5 text-sm text-gray-700">
          <li>Ver detalle de préstamos</li>
          <li>Descargar recibos</li>
          <li>Actualizar datos de contacto</li>
        </ul>
      </div>
    </div>
  );
}
