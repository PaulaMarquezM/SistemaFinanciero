import { Link, useLocation } from 'react-router-dom';
import { NAV_ITEMS, APP_LOGO } from '../../config/navigation';
import { X } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  isMobile: boolean;
  onToggle: () => void;
  onHover: () => void;
  onLeave: () => void;
}

const theme = {
  bg: '#533E54', text: '#F1F0E6', active: '#E3A358',
};

const Sidebar = ({ isOpen, isMobile, onToggle, onHover, onLeave }: SidebarProps) => {
  const location = useLocation();

  const getWidth = () => {
    if (isMobile) return isOpen ? '280px' : '0px';
    return isOpen ? '260px' : '80px';
  };

  return (
    <aside 
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      style={{
        width: getWidth(),
        // CAMBIO CLAVE: En PC usamos 'sticky' para que baje contigo
        // En Móvil usamos 'fixed' para que flote encima
        position: isMobile ? 'fixed' : 'sticky', 
        top: 0, // Necesario para que 'sticky' funcione
        zIndex: 50,
        height: '100vh', // Ocupa siempre toda la altura de la ventana visible
        backgroundColor: theme.bg,
        color: theme.text,
        transition: 'width 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
        display: 'flex', flexDirection: 'column',
        borderRight: '1px solid rgba(0,0,0,0.1)',
        overflow: 'hidden', whiteSpace: 'nowrap',
        boxShadow: isMobile && isOpen ? '4px 0 15px rgba(0,0,0,0.3)' : 'none',
        flexShrink: 0 // Evita que la barra se aplaste si falta espacio
      }}
    >
      {/* HEADER SIDEBAR */}
      <div style={{ 
        height: '70px', display: 'flex', alignItems: 'center', 
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        justifyContent: 'space-between', paddingRight: isMobile ? '10px' : '0'
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ 
            minWidth: isMobile ? '70px' : '80px', height: '100%', 
            display: 'flex', alignItems: 'center', justifyContent: 'center' 
          }}>
            <div style={{ width: '40px', height: '40px', background: theme.active, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'white' }}>
              {APP_LOGO}
            </div>
          </div>
          <span style={{ fontSize: '1.1rem', fontWeight: '600', opacity: isOpen ? 1 : 0, transition: 'opacity 0.2s', marginLeft: '4px' }}>
            S. Financiero
          </span>
        </div>

        {isMobile && isOpen && (
          <button onClick={onToggle} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
            <X size={24} />
          </button>
        )}
      </div>

      {/* NAVEGACIÓN */}
      <nav style={{ flex: 1, padding: '20px 0', overflowY: 'auto' }}> {/* overflowY para scroll interno si el menú es muy largo */}
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={isMobile ? onToggle : undefined} 
              style={{
                display: 'flex', alignItems: 'center', height: '56px', textDecoration: 'none',
                color: isActive ? theme.active : theme.text,
                backgroundColor: isActive ? 'rgba(255,255,255,0.05)' : 'transparent',
                borderLeft: isActive ? `4px solid ${theme.active}` : '4px solid transparent',
                transition: 'background 0.2s, color 0.2s', overflow: 'hidden'
              }}
            >
              <div style={{ minWidth: isMobile ? '70px' : '80px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span style={{ opacity: isOpen ? 1 : 0, transition: 'opacity 0.3s', fontWeight: isActive ? 600 : 400 }}>
                {item.title}
              </span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;