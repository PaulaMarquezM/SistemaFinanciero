import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout";
import DashboardPage from "./pages/DashboardPage";
import CompoundInterestPage from "./pages/CompoundInterestPage";
import DepreciacionPage from "./pages/Depreciacion/DepreciacionPage";
import AmortizationPage from "./pages/AmortizationPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import type { User } from "./types/layout.types";

// Datos de ejemplo (esto sí déjalo por ahora)
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
          <Route index element={<DashboardPage />} />
          <Route path="interes-compuesto" element={<CompoundInterestPage />} />
          <Route path="depreciacion" element={<DepreciacionPage />} />
          <Route path="amortizacion" element={<AmortizationPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
