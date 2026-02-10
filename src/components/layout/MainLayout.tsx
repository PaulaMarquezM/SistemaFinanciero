import { useState, useEffect, useMemo } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import useIsMobile from '../../hooks/useIsMobile';
import type { User } from '../../types/layout.types';

interface MainLayoutProps {
  user: User; // Este prop puede venir del App.tsx como fallback
}

const MainLayout = ({ user: initialUser }: MainLayoutProps) => {
  const isMobile = useIsMobile();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => !isMobile);

  // ✅ LOGICA PARA CARGAR EL USUARIO REAL
  const currentUser = useMemo(() => {
    const savedUser = localStorage.getItem("auth_user");
    if (savedUser) {
      try {
        return JSON.parse(savedUser) as User;
      } catch (e) {
        console.error("Error parsing user data", e);
      }
    }
    // Si no hay nada en localStorage, usamos el usuario inicial ( Richard Burgos )
    return initialUser;
  }, [initialUser]);

  useEffect(() => {
    setIsSidebarOpen(!isMobile);
  }, [isMobile]);

  // Cerrar sidebar al cambiar de ruta en móviles
  useEffect(() => {
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  }, [location.pathname, isMobile]);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100%', backgroundColor: '#F5F7FA' }}>
      
      <Sidebar 
        isOpen={isSidebarOpen} 
        isMobile={isMobile}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        onHover={() => !isMobile && setIsSidebarOpen(true)}
        onLeave={() => !isMobile && setIsSidebarOpen(false)}
      />

      {/* Overlay para móviles */}
      {isMobile && isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 40
          }}
        />
      )}

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* ✅ Pasamos 'currentUser' (dinámico) en lugar del prop estático */}
        <TopBar user={currentUser} onMenuClick={() => setIsSidebarOpen(true)} isMobile={isMobile} />
        
        <main style={{ flex: 1, padding: isMobile ? '16px' : '24px' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;