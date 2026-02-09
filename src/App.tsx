import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout";
import DashboardPage from "./pages/DashboardPage";
import CompoundInterestPage from "./pages/SimpleInterestPage";
import DepreciacionPage from "./pages/Depreciacion/DepreciacionPage";
import AmortizationPage from "./pages/AmortizationPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import Reportes from "./pages/Reportes";

// --- IMPORTACIONES NUEVAS ---
import CustomersPage from "./pages/CustomersPage";
import CreditsPage from "./pages/CreditsPage";
import ReporteCobros from "./ReporteCobros"; // Asegúrate que la ruta sea correcta

import type { User } from "./types/layout.types";

const mockUser: User = {
  name: "Carlos Rodríguez",
  role: "Administrador Financiero",
  avatar: "https://ui-avatars.com/api/?name=Carlos+Rodriguez&background=533E54&color=fff",
};

const RequireAuth = ({ children }: { children: React.ReactNode }) => {
  const userId = localStorage.getItem("auth_user_id");
  if (!userId) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Rutas protegidas */}
        <Route
          path="/"
          element={
            <RequireAuth>
              <MainLayout user={mockUser} />
            </RequireAuth>
          }
        >
          {/* Dashboard Principal */}
          <Route index element={<DashboardPage />} />

          {/* Módulos Financieros */}
          <Route path="interes-compuesto" element={<CompoundInterestPage />} />
          <Route path="depreciacion" element={<DepreciacionPage />} />
          <Route path="amortizacion" element={<AmortizationPage />} />
          
          {/* Gestión de Datos (NUEVAS RUTAS) */}
          <Route path="clientes" element={<CustomersPage />} />
          <Route path="creditos" element={<CreditsPage />} />

          {/* Reportes */}
          <Route path="cuentas-por-cobrar" element={<ReporteCobros />} />
          <Route path="reportes" element={<Reportes />} />

          {/* Redirección por defecto */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;