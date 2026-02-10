import { 
  LayoutDashboard, 
  TrendingUp, 
  ArrowDownToLine, 
  FileSpreadsheet,
  BarChart3,
  Users // 👈 Nuevo icono para clientes
} from 'lucide-react';

export const NAV_ITEMS = [
  { 
    title: 'Dashboard', 
    path: '/', 
    icon: LayoutDashboard 
  },
  // ✅ NUEVA PÁGINA DE CLIENTES (Agregada aquí)
  { 
    title: 'Gestión de Clientes', 
    path: '/clientes', 
    icon: Users 
  },
  { 
    title: 'Interés Compuesto', 
    path: '/interes-compuesto', 
    icon: TrendingUp 
  },
  { 
    title: 'Depreciación', 
    path: '/depreciacion', 
    icon: ArrowDownToLine 
  },
  { 
    title: 'Amortización', 
    path: '/amortizacion', 
    icon: FileSpreadsheet 
  },
  { 
    title: 'Reportes', 
    path: '/reportes', 
    icon: BarChart3 
  },
  // ¿Te falta "Cuentas por Cobrar"? Si ya tienes la página, agrégala también:
  /*
  {
    title: 'Cuentas por Cobrar',
    path: '/cobranzas',
    icon: Wallet // (Importa Wallet arriba si lo usas)
  }
  */
];

export const APP_NAME = 'Sistema Financiero';
export const APP_LOGO = 'SF';