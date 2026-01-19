import { Menu, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { User } from '../../types/layout.types';

interface TopBarProps {
  user: User;
  onMenuClick?: () => void; // Función opcional
  isMobile?: boolean;       // Saber si mostrar el botón
}

const TopBar = ({ user, onMenuClick, isMobile }: TopBarProps) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('auth_user_id');
    navigate('/login', { replace: true });
  };

  return (
    <header
      style={{
        height: '64px',
        backgroundColor: 'white',
        borderBottom: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}
    >
      {/* LADO IZQUIERDO */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* BOTÓN HAMBURGUESA (solo móvil) */}
        {isMobile && (
          <button
            onClick={onMenuClick}
            type="button"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              color: '#334155',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Menu size={24} />
          </button>
        )}

        <h2
          style={{
            fontSize: '1.2rem',
            color: '#1e293b',
            fontWeight: 600,
            margin: 0,
          }}
        >
          {isMobile ? 'SF' : 'Sistema Financiero'}
        </h2>
      </div>

      {/* LADO DERECHO */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* BOTÓN LOGOUT */}
        <button
          onClick={handleLogout}
          type="button"
          title="Cerrar sesión"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 12px',
            borderRadius: '10px',
            border: '1px solid #e2e8f0',
            background: 'white',
            cursor: 'pointer',
            color: '#334155',
            fontWeight: 600,
            fontSize: '0.9rem',
          }}
        >
          <LogOut size={18} />
          {!isMobile && <span>Salir</span>}
        </button>

        {/* INFO USUARIO (oculta en móvil) */}
        <div
          style={{
            textAlign: 'right',
            display: isMobile ? 'none' : 'block',
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: '0.9rem',
              fontWeight: 600,
              color: '#334155',
            }}
          >
            {user.name}
          </p>
          <p
            style={{
              margin: 0,
              fontSize: '0.75rem',
              color: '#64748b',
            }}
          >
            {user.role}
          </p>
        </div>

        {/* AVATAR */}
        <img
          src={user.avatar}
          alt="User"
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            objectFit: 'cover',
            border: '2px solid #e2e8f0',
          }}
        />
      </div>
    </header>
  );
};

export default TopBar;
