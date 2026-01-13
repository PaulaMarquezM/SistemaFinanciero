import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import DashboardPage from './pages/DashboardPage';
// Importamos tus páginas reales
import CompoundInterestPage from './pages/CompoundInterestPage';
import DepreciationPage from './pages/DepreciationPage';
import AmortizationPage from './pages/AmortizationPage';
import type { User } from './types/layout.types';

// Datos de ejemplo (esto sí déjalo)
const mockUser: User = {
  name: 'Carlos Rodríguez',
  role: 'Administrador Financiero',
  avatar: 'https://ui-avatars.com/api/?name=Carlos+Rodriguez&background=533E54&color=fff'
};

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainLayout user={mockUser} />}>
          <Route index element={<DashboardPage />} />
          <Route path="interes-compuesto" element={<CompoundInterestPage />} />
          <Route path="depreciacion" element={<DepreciationPage />} />
          <Route path="amortizacion" element={<AmortizationPage />} />
          {/* Redireccionar cualquier ruta desconocida al home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;