import { useState, useEffect } from 'react';
import { Calendar, Search, Users, FileText, AlertCircle, TrendingUp, Filter } from 'lucide-react';

interface Cobro {
  fecha_vencimiento: string;
  monto_esperado: number;
  nombre_cliente: string;
  documento_cliente: string;
  id_credito: number;
  numero_cuota: number;
  estado: string;
}

const ReporteCobros = () => {
  const [cobros, setCobros] = useState<Cobro[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);

  const cargarReporte = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/v1/receivables/report?year=${year}&month=${month}`);
      if (!response.ok) throw new Error('Error de conexión');
      
      const data = await response.json();
      console.log("Respuesta del Backend:", data); 

      // --- CORRECCIÓN PRINCIPAL ---
      let datosCrudos: any[] = [];

      // 1. Detectamos dónde viene la lista (prioridad a 'rows' que es lo que vimos en consola)
      if (data && Array.isArray(data.rows)) {
        datosCrudos = data.rows;
      } else if (data && Array.isArray(data.data)) {
        datosCrudos = data.data;
      } else if (Array.isArray(data)) {
        datosCrudos = data;
      }

      // 2. Convertimos los nombres de variables (Backend Inglés -> Frontend Español)
      // Esto evita que la tabla salga vacía si los nombres no coinciden
      const cobrosFormateados: Cobro[] = datosCrudos.map((item: any) => ({
        fecha_vencimiento: item.due_date || item.fecha_vencimiento,
        monto_esperado: item.amount_due || item.monto_esperado || 0,
        nombre_cliente: item.customer_name || item.nombre_cliente || "Cliente",
        documento_cliente: item.customer_id ? String(item.customer_id) : (item.documento_cliente || "N/A"),
        id_credito: item.id || item.id_credito || 0, 
        numero_cuota: item.number || item.numero_cuota || 1, // Si no viene, asumimos 1
        estado: item.status || item.estado || "Pendiente"
      }));

      setCobros(cobrosFormateados);
      // ----------------------------

    } catch (err) {
      setError('No se pudo cargar la información.');
      console.error(err);
      setCobros([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarReporte();
  }, []); // Carga inicial

  // Cálculos para las tarjetas KPI
  const totalMonto = cobros.reduce((acc, curr) => acc + curr.monto_esperado, 0);
  const totalClientes = new Set(cobros.map(c => c.documento_cliente)).size;

  return (
    <div style={styles.container}>
      
      {/* HEADER: Título y Bienvenida */}
      <div style={styles.pageHeader}>
        <h1 style={styles.pageTitle}>Gestión de Cobranzas</h1>
        <p style={styles.pageSubtitle}>Visión general de cuotas pendientes para este periodo.</p>
      </div>

      {/* FILTROS: Estilo "Barra de Herramientas" */}
      <div style={styles.filterCard}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Filter size={18} color="#6B7280" />
            <span style={{ fontWeight: 600, color: '#374151', fontSize: '14px' }}>Filtrar Periodo:</span>
        </div>
        
        <div style={styles.filterControls}>
            <div style={styles.inputGroup}>
                <span style={styles.inputLabel}>Año</span>
                <input 
                type="number" 
                value={year} 
                onChange={(e) => setYear(Number(e.target.value))}
                style={styles.input}
                />
            </div>

            <div style={styles.inputGroup}>
                <span style={styles.inputLabel}>Mes</span>
                <select 
                    value={month} 
                    onChange={(e) => setMonth(Number(e.target.value))}
                    style={styles.select}
                >
                    {['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'].map((m, i) => (
                        <option key={i} value={i + 1}>{m}</option>
                    ))}
                </select>
            </div>

            <button 
                onClick={cargarReporte}
                style={styles.buttonPrimary}
            >
                <Search size={18} />
                Actualizar
            </button>
        </div>
      </div>

      {/* TARJETAS KPI */}
      <div style={styles.statsGrid}>
        {/* Card 1: Total Dinero */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <span style={styles.cardLabel}>Proyección de Recaudo</span>
            <div style={{ ...styles.iconBox, backgroundColor: '#ECFDF5', color: '#10B981' }}>
              <TrendingUp size={20} />
            </div>
          </div>
          <h2 style={styles.cardValue}>${totalMonto.toLocaleString('en-US', { minimumFractionDigits: 2 })}</h2>
          <span style={styles.cardTrend}>+100% vs mes anterior</span>
        </div>

        {/* Card 2: Clientes */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <span style={styles.cardLabel}>Clientes Pendientes</span>
            <div style={{ ...styles.iconBox, backgroundColor: '#EFF6FF', color: '#3B82F6' }}>
              <Users size={20} />
            </div>
          </div>
          <h2 style={styles.cardValue}>{totalClientes}</h2>
          <span style={styles.cardTrend}>Usuarios activos</span>
        </div>

        {/* Card 3: Cuotas */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <span style={styles.cardLabel}>Cuotas por Vencer</span>
            <div style={{ ...styles.iconBox, backgroundColor: '#FFF7ED', color: '#F97316' }}>
              <FileText size={20} />
            </div>
          </div>
          <h2 style={styles.cardValue}>{cobros.length}</h2>
          <span style={styles.cardTrend}>Transacciones</span>
        </div>
      </div>

      {error && (
        <div style={styles.errorBanner}>
          <AlertCircle size={20} /> {error}
        </div>
      )}

      {/* TABLA: Estilo "Transacciones Recientes" */}
      <div style={styles.tableCard}>
        <div style={styles.tableHeader}>
            <h3 style={styles.tableTitle}>Detalle de Cobros</h3>
        </div>
        
        <div style={{ overflowX: 'auto' }}>
            <table style={styles.table}>
            <thead>
                <tr style={styles.tableHeadRow}>
                <th style={styles.th}>Vencimiento</th>
                <th style={styles.th}>Cliente</th>
                <th style={styles.th}>Referencia</th>
                <th style={styles.thRight}>Monto</th>
                <th style={styles.thCenter}>Estado</th>
                </tr>
            </thead>
            <tbody>
                {loading ? (
                <tr><td colSpan={5} style={styles.emptyState}>Cargando datos...</td></tr>
                ) : cobros.length > 0 ? (
                cobros.map((c, index) => (
                    <tr key={index} style={styles.tr}>
                    <td style={styles.td}>
                        <div style={styles.dateBadge}>
                            <Calendar size={14} />
                            {c.fecha_vencimiento}
                        </div>
                    </td>
                    <td style={styles.td}>
                        <span style={styles.clientName}>{c.nombre_cliente}</span>
                        <div style={styles.clientSub}>{c.documento_cliente}</div>
                    </td>
                    <td style={styles.td}>
                        <span style={styles.refBadge}>Crédito #{c.id_credito} - Cuota {c.numero_cuota}</span>
                    </td>
                    <td style={{ ...styles.td, ...styles.tdRight }}>
                        <span style={styles.amount}>${c.monto_esperado.toFixed(2)}</span>
                    </td>
                    <td style={{ ...styles.td, ...styles.tdCenter }}>
                        <span style={styles.statusBadge}>{c.estado}</span>
                    </td>
                    </tr>
                ))
                ) : (
                <tr>
                    <td colSpan={5} style={styles.emptyState}>
                        <div style={{ padding: '40px 0' }}>
                            <FileText size={40} color="#D1D5DB" />
                            <p>No hay cobros pendientes para este mes.</p>
                        </div>
                    </td>
                </tr>
                )}
            </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

// ESTILOS ESTILO DASHBOARD (Clean UI)
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    padding: '30px',
    backgroundColor: '#F3F4F6',
    minHeight: '100vh',
    fontFamily: "'Inter', sans-serif",
    color: '#1F2937',
  },
  pageHeader: {
    marginBottom: '24px',
  },
  pageTitle: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#111827',
    marginBottom: '4px',
  },
  pageSubtitle: {
    color: '#6B7280',
    fontSize: '14px',
  },
  // FILTROS
  filterCard: {
    backgroundColor: 'white',
    padding: '16px 24px',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    marginBottom: '24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '15px',
  },
  filterControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  inputGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#F9FAFB',
    padding: '6px 12px',
    borderRadius: '8px',
    border: '1px solid #E5E7EB',
  },
  inputLabel: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'uppercase',
  },
  input: {
    border: 'none',
    background: 'transparent',
    fontWeight: '600',
    color: '#111827',
    width: '60px',
    outline: 'none',
  },
  select: {
    border: 'none',
    background: 'transparent',
    fontWeight: '600',
    color: '#111827',
    outline: 'none',
    cursor: 'pointer',
  },
  buttonPrimary: {
    backgroundColor: '#2563EB',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '8px 16px',
    fontWeight: '600',
    fontSize: '14px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
  },
  // KPI CARDS
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '24px',
    marginBottom: '24px',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '12px',
  },
  cardLabel: {
    color: '#6B7280',
    fontSize: '14px',
    fontWeight: '500',
  },
  iconBox: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardValue: {
    fontSize: '30px',
    fontWeight: '700',
    color: '#111827',
    margin: 0,
    letterSpacing: '-0.02em',
  },
  cardTrend: {
    fontSize: '13px',
    color: '#10B981',
    fontWeight: '500',
    marginTop: '4px',
    display: 'block',
  },
  // TABLA
  tableCard: {
    backgroundColor: 'white',
    borderRadius: '16px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
    overflow: 'hidden',
    padding: '20px',
  },
  tableHeader: {
    marginBottom: '20px',
    paddingBottom: '15px',
    borderBottom: '1px solid #F3F4F6',
  },
  tableTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#111827',
    margin: 0,
  },
  table: {
    width: '100%',
    borderCollapse: 'separate',
    borderSpacing: '0 8px',
  },
  tableHeadRow: {
    textAlign: 'left',
  },
  th: {
    padding: '12px 16px',
    fontSize: '12px',
    fontWeight: '600',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  thRight: {
    padding: '12px 16px',
    textAlign: 'right',
    fontSize: '12px',
    fontWeight: '600',
    color: '#9CA3AF',
    textTransform: 'uppercase',
  },
  thCenter: {
    padding: '12px 16px',
    textAlign: 'center',
    fontSize: '12px',
    fontWeight: '600',
    color: '#9CA3AF',
    textTransform: 'uppercase',
  },
  tr: {
    backgroundColor: '#F9FAFB',
    transition: 'transform 0.1s',
  },
  td: {
    padding: '16px',
    fontSize: '14px',
    color: '#374151',
    borderTop: '1px solid #F3F4F6',
    borderBottom: '1px solid #F3F4F6',
    backgroundColor: 'white',
  },
  tdRight: { textAlign: 'right' },
  tdCenter: { textAlign: 'center' },
  
  // ELEMENTOS UI
  dateBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontWeight: '500',
    color: '#4B5563',
  },
  clientName: {
    display: 'block',
    fontWeight: '600',
    color: '#111827',
  },
  clientSub: {
    fontSize: '12px',
    color: '#9CA3AF',
    marginTop: '2px',
  },
  refBadge: {
    backgroundColor: '#EEF2FF',
    color: '#4F46E5',
    padding: '4px 8px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '600',
  },
  amount: {
    fontWeight: '700',
    color: '#059669',
    fontSize: '15px',
  },
  statusBadge: {
    backgroundColor: '#FEF2F2',
    color: '#EF4444',
    padding: '4px 12px',
    borderRadius: '999px',
    fontSize: '12px',
    fontWeight: '600',
  },
  emptyState: {
    textAlign: 'center',
    padding: '40px',
    color: '#9CA3AF',
  },
  errorBanner: {
    backgroundColor: '#FEF2F2',
    color: '#991B1B',
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
};

export default ReporteCobros;