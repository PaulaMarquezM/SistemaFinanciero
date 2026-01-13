import { 
  LayoutDashboard, 
  TrendingUp, 
  ArrowDownToLine, 
  FileSpreadsheet 
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
  }
];

export const APP_NAME = 'Sistema Financiero';
export const APP_LOGO = 'SF'; // O puedes importar un icono aquí también