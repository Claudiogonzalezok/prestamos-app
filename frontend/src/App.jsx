import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Common/Header';
import ProtectedRoute from './components/Common/ProtectedRoute';

import LoginPage from './pages/LoginPage';
import RegistroPage from './pages/RegistroPage';
import DashboardPage from './pages/DashboardPage';
import PrestamosPage from './pages/PrestamosPage';
import DetallePrestamo from './pages/DetallePrestamo';
import ClientesPage from './pages/ClientesPage';
import DetalleCliente from './pages/DetalleCliente';
import PagosPage from './pages/PagosPage';
import DetallePago from './pages/DetallePago';

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/registro" element={<RegistroPage />} />

          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <>
                  <Header />
                  <Routes>
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/prestamos" element={<PrestamosPage />} />
                    <Route path="/prestamos/:id" element={<DetallePrestamo />} />
                    <Route path="/clientes" element={<ClientesPage />} />
                    <Route path="/clientes/:id" element={<DetalleCliente />} />
                    <Route path="/pagos" element={<PagosPage />} />
                    <Route path="/pagos/:id" element={<DetallePago />} />
                    <Route path="/" element={<Navigate to="/dashboard" />} />
                  </Routes>
                </>
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
}
