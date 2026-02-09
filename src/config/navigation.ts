import { 
  LayoutDashboard, 
  TrendingUp, 
  ArrowDownToLine, 
  FileSpreadsheet,
  BarChart3   // 👈 nuevo icono
} from 'lucide-react';

export const NAV_ITEMS = [
  { 
    title: 'Dashboard', 
    path: '/', 
    icon: LayoutDashboard 
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

  // ✅ NUEVA PÁGINA
  { 
    title: 'Reportes', 
    path: '/reportes', 
    icon: BarChart3 
  }
];

export const APP_NAME = 'Sistema Financiero';
export const APP_LOGO = 'SF';
