import { Link, useLocation } from 'react-router-dom';
import { NAV_ITEMS } from '../../config/navigation';
// 1. Agregamos el icono para el reporte
import { X, FileText } from 'lucide-react'; 
import { palette } from '../../theme/theme';

interface SidebarProps {
  isOpen: boolean;
  isMobile: boolean;
  onToggle: () => void;
  onHover: () => void;
  onLeave: () => void;
}

const Sidebar = ({ isOpen, isMobile, onToggle, onHover, onLeave }: SidebarProps) => {
  const location = useLocation();

  const getWidth = () => {
    if (isMobile) return isOpen ? '280px' : '0px';
    return isOpen ? '260px' : '80px';
  };

  // Variable para saber si estamos en la página de reporte
  const isReporteActive = location.pathname === '/cuentas-por-cobrar';

  return (
    <aside 
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      style={{
        width: getWidth(),
        position: isMobile ? 'fixed' : 'sticky', 
        top: 0, 
        zIndex: 50,
        height: '100vh', 
        // VOLVEMOS A USAR TU PALETA ORIGINAL (AZUL)
        backgroundColor: palette.background.sidebar, 
        color: palette.text.sidebar,
        transition: 'width 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
        display: 'flex', flexDirection: 'column',
        borderRight: `1px solid ${palette.divider}`,
        overflow: 'hidden', whiteSpace: 'nowrap',
        boxShadow: isMobile && isOpen ? '4px 0 15px rgba(0,0,0,0.3)' : 'none',
        flexShrink: 0
      }}
    >
      {/* HEADER SIDEBAR */}
      <div style={{ 
        height: '70px', display: 'flex', alignItems: 'center', 
        borderBottom: `1px solid ${palette.divider}`,
        justifyContent: 'space-between', paddingRight: isMobile ? '10px' : '0'
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ 
            minWidth: isMobile ? '70px' : '80px', height: '100%', 
            display: 'flex', alignItems: 'center', justifyContent: 'center' 
          }}>
            {/* Logo */}
            <img 
              src="/LOGOSF.png" 
              alt="SF"
              style={{ width: '40px', height: '40px', objectFit: 'contain', borderRadius: '8px' }}
            />
          </div>
          <span style={{ fontSize: '1.1rem', fontWeight: '600', opacity: isOpen ? 1 : 0, transition: 'opacity 0.2s', marginLeft: '4px', color: palette.text.sidebarActive }}>
            S. Financiero
          </span>
        </div>

        {isMobile && isOpen && (
          <button onClick={onToggle} style={{ background: 'none', border: 'none', color: palette.text.sidebar, cursor: 'pointer' }}>
            <X size={24} />
          </button>
        )}
      </div>

      {/* NAVEGACIÓN */}
      <nav style={{ flex: 1, padding: '20px 0', overflowY: 'auto' }}>
        
        {/* Ítems originales (Dashboard, etc.) */}
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
                color: isActive ? palette.text.sidebarActive : palette.text.sidebar,
                backgroundColor: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
                borderLeft: isActive ? `4px solid ${palette.primary.main}` : '4px solid transparent',
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

        {/* --- 2. BOTÓN MANUAL: CUENTAS POR COBRAR --- */}
        <Link
          to="/cuentas-por-cobrar"
          onClick={isMobile ? onToggle : undefined}
          style={{
            display: 'flex', alignItems: 'center', height: '56px', textDecoration: 'none',
            // Usamos la lógica de "isReporteActive" para que se ilumine igual que los otros
            color: isReporteActive ? palette.text.sidebarActive : palette.text.sidebar,
            backgroundColor: isReporteActive ? 'rgba(255,255,255,0.1)' : 'transparent',
            borderLeft: isReporteActive ? `4px solid ${palette.primary.main}` : '4px solid transparent',
            transition: 'background 0.2s, color 0.2s', overflow: 'hidden'
          }}
        >
          <div style={{ minWidth: isMobile ? '70px' : '80px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <FileText size={24} strokeWidth={isReporteActive ? 2.5 : 2} />
          </div>
          <span style={{ opacity: isOpen ? 1 : 0, transition: 'opacity 0.3s', fontWeight: isReporteActive ? 600 : 400 }}>
            Cuentas por Cobrar
          </span>
        </Link>
        {/* ------------------------------------------- */}

      </nav>
    </aside>
  );
};

export default Sidebar;