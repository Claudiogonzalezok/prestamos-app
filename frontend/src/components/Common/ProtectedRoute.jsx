import { useAuth } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';

// ProtectedRoute now supports optional role-based access control.
// Props:
// - children: React nodes to render when allowed
// - allowedRoles: optional array of role strings (e.g. ["admin", "empleado"])
export default function ProtectedRoute({ children, allowedRoles = null }) {
  const { isAuthenticated, loading, usuario } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If allowedRoles is provided, check the current user's role (usuario.rol).
  if (allowedRoles && Array.isArray(allowedRoles)) {
    const rolUsuario = usuario?.rol || null;
    if (!rolUsuario || !allowedRoles.includes(rolUsuario)) {
      // Redirigir al dashboard principal (que mostrará el dashboard según rol)
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
}
