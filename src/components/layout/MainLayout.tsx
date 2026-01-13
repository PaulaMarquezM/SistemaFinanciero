import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import useIsMobile from '../../hooks/useIsMobile';
import type { User } from '../../types/layout.types';

interface MainLayoutProps {
  user: User;
}

const MainLayout = ({ user }: MainLayoutProps) => {
  const isMobile = useIsMobile();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(!isMobile);

  useEffect(() => {
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  }, [location, isMobile]);

  return (
    // CAMBIO IMPORTANTE: Quitamos 'overflow: hidden' y 'position: relative' restrictivo
    // Dejamos que el documento fluya (App-shell natural)
    <div style={{ display: 'flex', minHeight: '100vh', width: '100%', backgroundColor: '#F5F7FA' }}>
      
      <Sidebar 
        isOpen={isSidebarOpen} 
        isMobile={isMobile}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        onHover={() => !isMobile && setIsSidebarOpen(true)}
        onLeave={() => !isMobile && setIsSidebarOpen(false)}
      />

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
        <TopBar user={user} onMenuClick={() => setIsSidebarOpen(true)} isMobile={isMobile} />
        
        {/* CAMBIO: Quitamos overflowY: 'auto' interno. 
            Ahora el scroll es de toda la página (body scroll), que es más nativo y compatible. */}
        <main style={{ flex: 1, padding: isMobile ? '16px' : '24px' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;