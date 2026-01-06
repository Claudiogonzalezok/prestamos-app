import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Header() {
  const { usuario, financiera, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <div className="flex items-center gap-8">
          <h1 className="text-2xl font-bold text-blue-600">CreditosPro</h1>
          {financiera && (
            <div>
              <p className="text-sm text-gray-600">Financiera</p>
              <p className="font-medium">{financiera.razonSocial}</p>
            </div>
          )}
        </div>

        <div className="flex items-center gap-6">
          {usuario && (
            <>
              <div className="text-right">
                <p className="text-sm text-gray-600">Rol</p>
                <p className="font-medium text-gray-900">{usuario.rol}</p>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
              >
                Cerrar Sesión
              </button>
            </>
          )}
        </div>
      </div>

      <nav className="bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ul className="flex gap-6 py-3 text-white">
            <li><a href="/dashboard" className="hover:opacity-80 transition">Dashboard</a></li>
            <li><a href="/prestamos" className="hover:opacity-80 transition">Préstamos</a></li>
            <li><a href="/clientes" className="hover:opacity-80 transition">Clientes</a></li>
            <li><a href="/pagos" className="hover:opacity-80 transition">Pagos</a></li>
          </ul>
        </div>
      </nav>
    </header>
  );
}
