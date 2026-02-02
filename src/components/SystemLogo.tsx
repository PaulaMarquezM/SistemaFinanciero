// src/components/SystemLogo.tsx
// Componente de logo reutilizable para el sidebar y exportaciones

interface SystemLogoProps {
  size?: number;
  variant?: 'sidebar' | 'export';
}

export const SystemLogo = ({ size = 40, variant = 'sidebar' }: SystemLogoProps) => {
  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: variant === 'sidebar' ? 8 : 10,
      background: 'linear-gradient(135deg, #0A3143 0%, #276E90 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 'bold',
      fontSize: size * 0.45,
      color: 'white',
      letterSpacing: '-1px',
      boxShadow: variant === 'export' 
        ? '0 4px 12px rgba(10, 49, 67, 0.3)' 
        : '0 2px 8px rgba(10, 49, 67, 0.2)',
      flexShrink: 0
    }}>
      SF
    </div>
  );
};

// Versión para usar con imagen PNG personalizada
export const SystemLogoImage = ({ size = 40 }: { size?: number }) => {
  return (
    <img 
      src="/logo.png"  // Coloca tu logo en public/logo.png
      alt="Logo Sistema Financiero"
      style={{
        width: size,
        height: size,
        objectFit: 'contain',
        borderRadius: 8,
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        flexShrink: 0
      }}
    />
  );
};

export default SystemLogo;