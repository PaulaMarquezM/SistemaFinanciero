import { useState, useEffect } from 'react';
import { 
  DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent
} from '@dnd-kit/core';
import { 
  arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy 
} from '@dnd-kit/sortable';
import { 
  DollarSign, TrendingUp, TrendingDown, Activity, Plus, FileText, Users,
  Settings, Save, X, PlusCircle, CreditCard, Wallet
} from 'lucide-react';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell 
} from 'recharts';

import { SortableItem } from '../components/SortableItem';
import useIsMobile from '../hooks/useIsMobile'; // <--- IMPORTANTE: Importamos el hook

// --- DEFINICIÓN DE WIDGETS ---
const ALL_WIDGETS_DEF = [
  // KPIs
  { id: 'ingresos', title: 'Ingresos', span: 1 },
  { id: 'gastos', title: 'Gastos', span: 1 },
  { id: 'balance', title: 'Balance Neto', span: 1 },
  // Gráficos Grandes
  { id: 'flujo', title: 'Flujo de Caja (Anual)', span: 2 },
  { id: 'distribucion', title: 'Gastos por Categoría', span: 1 },
  // Listas y Acciones
  { id: 'cuentas', title: 'Mis Cuentas', span: 1 },
  { id: 'acciones', title: 'Acciones Rápidas', span: 1 },
  { id: 'transacciones', title: 'Transacciones Recientes', span: 1 }
];

const DashboardPage = () => {
  const isMobile = useIsMobile(); // <--- DETECTAMOS EL MÓVIL
  const [isCustomizing, setIsCustomizing] = useState(false);
  
  // Estado inicial
  const [items, setItems] = useState<string[]>(() => {
    const saved = localStorage.getItem('dashboard-v5-order');
    return saved ? JSON.parse(saved) : [
      'ingresos', 'gastos', 'balance', 
      'flujo', 'distribucion', 
      'cuentas', 'acciones', 'transacciones'
    ];
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    localStorage.setItem('dashboard-v5-order', JSON.stringify(items));
  }, [items]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.indexOf(active.id.toString());
        const newIndex = items.indexOf(over.id.toString());
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const removeWidget = (id: string) => setItems(items.filter(item => item !== id));
  const addWidget = (id: string) => setItems([...items, id]);
  
  const hiddenWidgets = ALL_WIDGETS_DEF.filter(w => !items.includes(w.id));

  // --- LÓGICA DE ESTILOS INTELIGENTE ---
  const getWidgetStyle = (id: string) => {
    // Si es móvil, FORZAMOS a que todo ocupe 1 sola columna.
    // Esto evita que los gráficos grandes intenten ocupar 2 espacios y rompan la pantalla.
    if (isMobile) {
      return { gridColumn: 'span 1' };
    }

    // Si es PC, usamos la configuración original (span 1 o 2)
    const widgetDef = ALL_WIDGETS_DEF.find(w => w.id === id);
    const span = widgetDef?.span || 1;
    return { gridColumn: `span ${span}` };
  };

  const renderWidgetContent = (id: string) => {
    const commonProps = { isEditing: isCustomizing };
    
    let content = null;
    switch (id) {
      case 'ingresos': content = <StatCard title="Ingresos Totales" amount="$763,432" trend="+12%" icon={TrendingUp} iconColor="#10b981" {...commonProps} />; break;
      case 'gastos': content = <StatCard title="Gastos" amount="$24,654" trend="-2%" icon={TrendingDown} iconColor="#ef4444" {...commonProps} />; break;
      case 'balance': content = <StatCard title="Balance Neto" amount="$738,778" trend="Estable" icon={DollarSign} iconColor="#E3A358" {...commonProps} />; break;
      case 'flujo': content = <ChartWidget {...commonProps} />; break;
      case 'distribucion': content = <ExpensesPieWidget {...commonProps} />; break;
      case 'cuentas': content = <AccountsWidget {...commonProps} />; break;
      case 'acciones': content = <ActionsWidget {...commonProps} />; break;
      case 'transacciones': content = <TransactionsWidget {...commonProps} />; break;
      default: content = null;
    }

    return (
      <div style={{ position: 'relative', height: '100%' }}>
        {isCustomizing && (
          <button 
            onClick={() => removeWidget(id)}
            style={{
              position: 'absolute', top: '-10px', right: '-10px',
              background: '#ef4444', color: 'white', border: 'none',
              borderRadius: '50%', width: '24px', height: '24px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', zIndex: 10, boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
            }}
          >
            <X size={14} strokeWidth={3} />
          </button>
        )}
        {content}
      </div>
    );
  };

  return (
    // Padding lateral reducido en móvil (16px) para ganar espacio
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: isMobile ? '16px' : '20px', paddingBottom: '40px' }}>
      
      <header style={{ 
        marginBottom: '24px', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        flexWrap: 'wrap', 
        gap: '16px'
      }}>
        <div>
          <h1 style={{ fontSize: isMobile ? '1.5rem' : '1.8rem', fontWeight: '700', color: '#1e293b', marginBottom: '8px' }}>
            Resumen Financiero
          </h1>
          <p style={{ color: '#64748b', fontSize: isMobile ? '0.9rem' : '1rem' }}>
            {isCustomizing ? 'Organiza tu espacio.' : 'Visión general de tu negocio.'}
          </p>
        </div>
        
        <button 
          onClick={() => setIsCustomizing(!isCustomizing)}
          style={{
            ...primaryButtonStyle,
            backgroundColor: isCustomizing ? '#10b981' : 'white',
            color: isCustomizing ? 'white' : '#533E54',
            border: isCustomizing ? 'none' : '1px solid #533E54'
          }}
        >
          {isCustomizing ? <Save size={18} /> : <Settings size={18} />}
          <span>{isCustomizing ? 'Guardar' : 'Personalizar'}</span>
        </button>
      </header>

      {/* BARRA DE WIDGETS DISPONIBLES */}
      {isCustomizing && hiddenWidgets.length > 0 && (
        <div style={{
          backgroundColor: '#f8fafc', border: '2px dashed #cbd5e1', borderRadius: '12px',
          padding: '16px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap'
        }}>
          <span style={{ fontSize: '0.9rem', fontWeight: '600', color: '#64748b' }}>Disponibles:</span>
          {hiddenWidgets.map(widget => (
            <button
              key={widget.id}
              onClick={() => addWidget(widget.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px',
                backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '20px',
                cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                fontSize: '0.9rem', color: '#334155', fontWeight: '500'
              }}
            >
              <PlusCircle size={16} color="#10b981" />
              {widget.title}
            </button>
          ))}
        </div>
      )}

      {/* GRID PRINCIPAL RESPONSIVE */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items} strategy={rectSortingStrategy}>
          <div style={{ 
            display: 'grid',
            // --- CORRECCIÓN FINAL PARA MÓVIL ---
            // Si es móvil: '1fr' (Una sola columna que llena el ancho disponible).
            // Si es PC: 'repeat(auto-fill...)' (Grid inteligente de columnas).
            gridTemplateColumns: isMobile 
              ? '1fr' 
              : 'repeat(auto-fill, minmax(300px, 1fr))',
            
            gridAutoFlow: 'dense', 
            gap: '24px', 
            minHeight: isCustomizing && items.length === 0 ? '200px' : 'auto',
            border: isCustomizing && items.length === 0 ? '2px dashed #cbd5e1' : 'none',
            borderRadius: '12px'
          }}>
            {items.map((id) => (
              <SortableItem key={id} id={id} enabled={isCustomizing} style={getWidgetStyle(id)}>
                {renderWidgetContent(id)}
              </SortableItem>
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
};

/* --- COMPONENTES VISUALES --- */

const ChartWidget = ({ isEditing }: any) => {
  const data = [
    { name: 'Ene', Ingresos: 4000, Gastos: 2400 },
    { name: 'Feb', Ingresos: 3000, Gastos: 1398 },
    { name: 'Mar', Ingresos: 2000, Gastos: 9800 },
    { name: 'Abr', Ingresos: 2780, Gastos: 3908 },
    { name: 'May', Ingresos: 1890, Gastos: 4800 },
    { name: 'Jun', Ingresos: 2390, Gastos: 3800 },
    { name: 'Jul', Ingresos: 3490, Gastos: 4300 },
  ];

  return (
    <div style={{ ...baseCardStyle, height: '350px', border: isEditing ? '2px dashed #cbd5e1' : '1px solid #f1f5f9' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h3 style={cardTitleStyle}>Flujo de Caja</h3>
      </div>
      <div style={{ width: '100%', height: 'calc(100% - 40px)' }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#533E54" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#533E54" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorGastos" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#9C777C" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#9C777C" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
            <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
            <CartesianGrid vertical={false} stroke="#f1f5f9" />
            <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
            <Area type="monotone" dataKey="Ingresos" stroke="#533E54" fillOpacity={1} fill="url(#colorIngresos)" />
            <Area type="monotone" dataKey="Gastos" stroke="#9C777C" fillOpacity={1} fill="url(#colorGastos)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const ExpensesPieWidget = ({ isEditing }: any) => {
  const data = [
    { name: 'Servidores', value: 400, color: '#533E54' },
    { name: 'Nómina', value: 300, color: '#E3A358' },
    { name: 'Oficina', value: 300, color: '#9C777C' },
    { name: 'Marketing', value: 200, color: '#cbd5e1' },
  ];

  return (
    <div style={{ 
      ...baseCardStyle, 
      height: '350px', 
      border: isEditing ? '2px dashed #cbd5e1' : '1px solid #f1f5f9',
      display: 'flex', flexDirection: 'column', alignItems: 'center' 
    }}>
      <h3 style={{ ...cardTitleStyle, alignSelf: 'flex-start' }}>Distribución de Gastos</h3>
      <div style={{ width: '100%', height: '100%', position: 'relative' }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
          <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>Total</p>
          <p style={{ margin: 0, fontWeight: 'bold', color: '#1e293b' }}>$1,200</p>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '10px' }}>
        {data.map(d => (
          <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: d.color }}></div>
            <span style={{ color: '#64748b' }}>{d.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const AccountsWidget = ({ isEditing }: any) => (
  <div style={{ ...baseCardStyle, border: isEditing ? '2px dashed #cbd5e1' : '1px solid #f1f5f9' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
      <h3 style={cardTitleStyle}>Mis Cuentas</h3>
      <Wallet size={20} color="#64748b" />
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <AccountItem name="Banco Pichincha" type="Corriente" amount="$12,450.00" />
      <AccountItem name="Banco Guayaquil" type="Ahorros" amount="$4,200.50" />
      <AccountItem name="Caja Chica" type="Efectivo" amount="$350.00" />
    </div>
    <button style={{ marginTop: '20px', width: '100%', padding: '8px', background: '#f1f5f9', border: 'none', borderRadius: '8px', color: '#475569', fontSize: '0.85rem', fontWeight: '500', cursor: 'pointer' }}>
      Gestionar Cuentas
    </button>
  </div>
);

const AccountItem = ({ name, type, amount }: any) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e2e8f0' }}>
        <CreditCard size={18} color="#64748b" />
      </div>
      <div>
        <p style={{ margin: 0, fontWeight: '600', color: '#334155', fontSize: '0.9rem' }}>{name}</p>
        <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8' }}>{type}</p>
      </div>
    </div>
    <span style={{ fontWeight: '600', color: '#1e293b' }}>{amount}</span>
  </div>
);

const StatCard = ({ title, amount, trend, icon: Icon, iconColor, isEditing }: any) => (
  <div style={{ 
    ...baseCardStyle, 
    // Altura mínima para asegurar que no se aplaste en móvil
    minHeight: '160px', 
    height: '100%',
    border: isEditing ? '2px dashed #cbd5e1' : '1px solid #f1f5f9', 
    boxShadow: isEditing ? 'none' : baseCardStyle.boxShadow,
    display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
  }}> 
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '4px' }}>{title}</p>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>{amount}</h2>
      </div>
      <div style={{ padding: '10px', backgroundColor: `${iconColor}20`, borderRadius: '12px' }}>
        <Icon size={24} color={iconColor} />
      </div>
    </div>
    <div style={{ marginTop: '12px', fontSize: '0.85rem', color: trend.includes('+') ? '#10b981' : '#64748b' }}>{trend}</div>
  </div>
);

const ActionsWidget = ({ isEditing }: any) => (
  <div style={{ ...baseCardStyle, border: isEditing ? '2px dashed #cbd5e1' : '1px solid #f1f5f9', boxShadow: isEditing ? 'none' : baseCardStyle.boxShadow }}>
    <h3 style={cardTitleStyle}>Acciones Rápidas</h3>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '12px' }}>
      <ActionButton icon={FileText} text="Crear Factura" />
      <ActionButton icon={Users} text="Añadir Cliente" />
      <ActionButton icon={Activity} text="Ver Reportes" />
      <ActionButton icon={Plus} text="Otro Ingreso" />
    </div>
  </div>
);

const TransactionsWidget = ({ isEditing }: any) => (
  <div style={{ ...baseCardStyle, border: isEditing ? '2px dashed #cbd5e1' : '1px solid #f1f5f9', boxShadow: isEditing ? 'none' : baseCardStyle.boxShadow }}>
    <h3 style={cardTitleStyle}>Transacciones Recientes</h3>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <TransactionItem title="Pago de Cliente #001" date="Hoy, 10:23 AM" amount="+$1,200" type="income" />
      <TransactionItem title="Servidor AWS" date="Ayer, 4:50 PM" amount="-$85.00" type="expense" />
    </div>
    <button style={{ marginTop: '16px', width: '100%', padding: '10px', background: 'none', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#533E54', fontWeight: '600', cursor: 'pointer' }}>Ver todas</button>
  </div>
);

const ActionButton = ({ icon: Icon, text }: any) => (
  <button style={{
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    padding: '16px', border: '1px solid #e2e8f0', borderRadius: '12px', background: 'white',
    cursor: 'pointer', transition: 'all 0.2s', gap: '8px'
  }}
  onMouseEnter={(e) => e.currentTarget.style.borderColor = '#E3A358'}
  onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
  >
    <Icon size={20} color="#533E54" />
    <span style={{ fontSize: '0.85rem', color: '#475569', fontWeight: '500', textAlign: 'center' }}>{text}</span>
  </button>
);

const TransactionItem = ({ title, date, amount, type }: any) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: '1px solid #f1f5f9' }}>
    <div><p style={{ margin: 0, fontWeight: '600', color: '#334155' }}>{title}</p><p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8' }}>{date}</p></div>
    <span style={{ fontWeight: '600', color: type === 'income' ? '#10b981' : '#ef4444' }}>{amount}</span>
  </div>
);

// ESTILOS BASE
const baseCardStyle: React.CSSProperties = {
  backgroundColor: 'white', borderRadius: '16px', padding: '24px',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', height: '100%', boxSizing: 'border-box', transition: 'all 0.2s'
};
const cardTitleStyle = { fontSize: '1.1rem', fontWeight: '700', color: '#1e293b', marginBottom: '20px', marginTop: 0 };
const primaryButtonStyle: React.CSSProperties = { backgroundColor: '#533E54', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '10px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(83, 62, 84, 0.1)', transition: 'all 0.2s' };

export default DashboardPage;