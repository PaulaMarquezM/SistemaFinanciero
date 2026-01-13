import { Menu } from 'lucide-react'; // Importamos el icono de menú
import type { User } from '../../types/layout.types';

interface TopBarProps {
  user: User;
  onMenuClick?: () => void; // Función opcional
  isMobile?: boolean;       // Saber si mostrar el botón
}

const TopBar = ({ user, onMenuClick, isMobile }: TopBarProps) => {
  return (
    <header style={{
      height: '64px', backgroundColor: 'white', borderBottom: '1px solid #e2e8f0',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 24px', position: 'sticky', top: 0, zIndex: 10
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        
        {/* BOTÓN HAMBURGUESA (Solo visible en Móvil) */}
        {isMobile && (
          <button 
            onClick={onMenuClick}
            style={{ 
              background: 'none', border: 'none', cursor: 'pointer', padding: '4px', 
              color: '#334155', display: 'flex', alignItems: 'center' 
            }}
          >
            <Menu size={24} />
          </button>
        )}

        <h2 style={{ fontSize: '1.2rem', color: '#1e293b', fontWeight: 600, margin: 0 }}>
          {isMobile ? 'SF' : 'Sistema Financiero'} {/* Título corto en móvil */}
        </h2>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ textAlign: 'right', display: isMobile ? 'none' : 'block' }}> {/* Ocultar nombre en móvil si falta espacio */}
          <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600, color: '#334155' }}>{user.name}</p>
          <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>{user.role}</p>
        </div>
        <img 
          src={user.avatar} alt="User" 
          style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #e2e8f0' }} 
        />
      </div>
    </header>
  );
};

export default TopBar;