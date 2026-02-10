import { useState, useEffect } from 'react';
import {
  getReceivables,
  getCredit,
  getAmortizationSchedule,
  type AmortizationParams,
  type CreditResponse,
  type ScheduleRow
} from './api/financialApi';
import { 
  TrendingUp, Users, FileText, Filter, Search, Calendar, Eye, X 
} from 'lucide-react';

// ✅ CORRECCIÓN DE TIPADO PARA EVITAR EL ERROR 'BADGE' EN VS CODE
const styles: { [key: string]: React.CSSProperties } = {
  page: { background: "#f8fafc", borderRadius: 20, padding: 32, maxWidth: 1200, margin: "0 auto", position: 'relative' },
  headerContainer: { display: "flex", alignItems: "center", gap: 16, marginBottom: 32 },
  title: { fontWeight: 900, fontSize: 32, color: "#0f172a", margin: 0, letterSpacing: -0.5 },
  subtitle: { marginTop: 4, color: "#64748b", fontSize: 14, margin: 0 },
  kpiGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, marginBottom: 32 },
  kpiCard: { background: 'white', padding: 24, borderRadius: 16, border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', display: 'flex', justifyContent: 'space-between', alignItems: 'start' },
  filterBar: { background: 'white', padding: 16, borderRadius: 12, border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, flexWrap: 'wrap' },
  select: { padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14, background: '#f8fafc', fontWeight: 600, color: '#334155' },
  btnFilter: { background: '#2563eb', color: 'white', border: 'none', padding: '8px 16px', borderRadius: 8, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 },
  tableCard: { background: 'white', borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '16px 20px', fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' },
  td: { padding: '16px 20px', borderBottom: '1px solid #f8fafc', fontSize: 14, color: '#334155' },
  badge: { padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700, display: 'inline-block' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { background: 'white', borderRadius: 16, width: '100%', maxWidth: 750, maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' },
  modalHeader: { padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  modalBody: { padding: 24, overflowY: 'auto' }
};

interface ReceivableRow {
  credit_id?: number;
  reference?: string;
  description?: string;
  due_date: string;
  customer_name: string;
  amount_due: number;
}

const ReporteCobros = () => {
  const [year, setYear] = useState(2026);
  const [month, setMonth] = useState(2);
  const [stats, setStats] = useState<{ total_amount: number; count: number; rows: ReceivableRow[] }>({ total_amount: 0, count: 0, rows: [] });
  const [loading, setLoading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<ScheduleRow[]>([]);
  const [selectedCredit, setSelectedCredit] = useState<CreditResponse | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getReceivables(year, month);
      setStats(data);
    } catch (error) { console.error(error); } 
    finally { setLoading(false); }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { loadData(); }, []);

  const handleViewTable = async (row: ReceivableRow) => {
    // ✅ BUSQUEDA AVANZADA DEL ID: Priorizamos el campo credit_id si existe, si no, lo buscamos en el texto
    let creditId = row.credit_id;
    
    if (!creditId) {
        const reference = row.reference || row.description || "";
        const match = reference.match(/#(\d+)/);
        creditId = match ? parseInt(match[1]) : undefined;
    }

    if (!creditId) {
        alert("No se pudo identificar el préstamo original. Asegúrate de que los datos incluyan el ID del crédito.");
        return;
    }

    setIsModalOpen(true);
    setModalLoading(true);

    try {
        const credit = await getCredit(creditId);
        setSelectedCredit(credit);

        const params: AmortizationParams = {
            principal: credit.principal,
            annual_rate: credit.annual_rate,
            periods: credit.periods,
            method: credit.method as 'frances' | 'aleman'
        };
        const schedule = await getAmortizationSchedule(params);
        setSelectedSchedule(schedule);
    } catch {
        alert("Error al cargar la tabla de amortización original.");
        setIsModalOpen(false);
    } finally {
        setModalLoading(false);
    }
  };

  const formatMoney = (val: number) => `$${(val || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

  return (
    <div style={styles.page}>
      <div style={styles.headerContainer}>
         <img src="/logo.png" alt="Logo" style={{ width: 48, height: 48, objectFit: 'contain' }} onError={(e) => (e.target as HTMLImageElement).src = '/LOGOSF.png'} />
         <div><h1 style={styles.title}>Gestión de Cobranzas</h1><p style={styles.subtitle}>Visión general de cuotas pendientes.</p></div>
      </div>

      <div style={styles.filterBar}>
        <div style={{display:'flex', alignItems:'center', gap: 8, color: '#64748b', fontWeight: 600}}><Filter size={18} /> Filtrar Periodo:</div>
        <div style={{marginLeft: 'auto', display: 'flex', gap: 12, alignItems: 'center'}}>
            <label style={{fontSize: 12, fontWeight: 700, color: '#94a3b8'}}>AÑO</label>
            <input type="number" value={year} onChange={(e) => setYear(Number(e.target.value))} style={{...styles.select, width: 80}} />
            <label style={{fontSize: 12, fontWeight: 700, color: '#94a3b8'}}>MES</label>
            <select value={month} onChange={(e) => setMonth(Number(e.target.value))} style={styles.select}>
                <option value={1}>Enero</option><option value={2}>Febrero</option><option value={3}>Marzo</option>
            </select>
            <button onClick={loadData} style={styles.btnFilter}>{loading ? '...' : <><Search size={16}/> Actualizar</>}</button>
        </div>
      </div>

      {/* TARJETAS DE INDICADORES (KPIs RESTAURADAS) */}
      <div style={styles.kpiGrid}>
        <div style={styles.kpiCard}>
            <div>
                <p style={{margin:'0 0 8px', color:'#64748b', fontSize:13, fontWeight:600}}>Proyección de Recaudo</p>
                <h2 style={{margin:0, fontSize:32, color:'#0f172a', fontWeight:800}}>{formatMoney(stats.total_amount)}</h2>
                <div style={{display:'flex', alignItems:'center', gap:4, marginTop:8, color:'#16a34a', fontSize:12, fontWeight:700}}><TrendingUp size={14}/> +100% vs mes anterior</div>
            </div>
            <div style={{background:'#f0fdf4', padding:10, borderRadius:12}}><TrendingUp color='#16a34a' size={24}/></div>
        </div>
        <div style={styles.kpiCard}>
            <div><p style={{margin:'0 0 8px', color:'#64748b', fontSize:13, fontWeight:600}}>Clientes Pendientes</p><h2 style={{margin:0, fontSize:32, color:'#0f172a', fontWeight:800}}>{stats.count || 0}</h2><div style={{marginTop:8, color:'#16a34a', fontSize:12, fontWeight:700}}>Usuarios activos</div></div>
            <div style={{background:'#eff6ff', padding:10, borderRadius:12}}><Users color='#2563eb' size={24}/></div>
        </div>
        <div style={styles.kpiCard}>
            <div><p style={{margin:'0 0 8px', color:'#64748b', fontSize:13, fontWeight:600}}>Cuotas por Vencer</p><h2 style={{margin:0, fontSize:32, color:'#0f172a', fontWeight:800}}>{stats.rows?.length || 0}</h2><div style={{marginTop:8, color:'#16a34a', fontSize:12, fontWeight:700}}>Transacciones</div></div>
            <div style={{background:'#fff7ed', padding:10, borderRadius:12}}><FileText color='#ea580c' size={24}/></div>
        </div>
      </div>

      <div style={styles.tableCard}>
        <div style={{overflowX: 'auto'}}>
            <table style={styles.table}>
                <thead>
                    <tr>
                        <th style={styles.th}>Vencimiento</th>
                        <th style={styles.th}>Cliente</th>
                        <th style={styles.th}>Referencia</th>
                        <th style={styles.th}>Monto</th>
                        <th style={styles.th}>Estado</th>
                        <th style={styles.th}>Acción</th>
                    </tr>
                </thead>
                <tbody>
                    {stats.rows?.map((row, i) => (
                        <tr key={i}>
                            <td style={styles.td}><div style={{display:'flex', alignItems:'center', gap:8}}><Calendar size={14} color="#94a3b8"/> {row.due_date}</div></td>
                            <td style={styles.td}><div style={{fontWeight:700, color:'#0f172a'}}>{row.customer_name}</div></td>
                            <td style={styles.td}>
                                <span style={{background:'#eff6ff', color:'#2563eb', padding:'4px 10px', borderRadius:6, fontSize:11, fontWeight:700}}>
                                    {row.reference || row.description || "Crédito SF"}
                                </span>
                            </td>
                            <td style={{...styles.td, fontWeight:700, color:'#16a34a'}}>{formatMoney(row.amount_due)}</td>
                            <td style={styles.td}><span style={{background:'#f1f5f9', color:'#475569', ...styles.badge}}>Pendiente</span></td>
                            <td style={styles.td}>
                                <button 
                                    onClick={() => handleViewTable(row)} 
                                    style={{cursor:'pointer', border:'none', background:'transparent', color:'#0f172a', display:'flex', alignItems:'center', gap:6, fontWeight:700}}
                                >
                                    <Eye size={18} /> Ver Tabla
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>

      {isModalOpen && (
        <div style={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
            <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
                <div style={styles.modalHeader}>
                    <div>
                        <h3 style={{margin:0, color:'#0f172a', fontSize:18}}>Plan de Pagos Original</h3>
                        {selectedCredit && (
                            <p style={{margin:0, color:'#64748b', fontSize:13}}>
                                Cliente: {selectedCredit.customer ? `${selectedCredit.customer.first_name} ${selectedCredit.customer.last_name}` : 'N/A'} • Crédito #{selectedCredit.id}
                            </p>
                        )}
                    </div>
                    <button onClick={() => setIsModalOpen(false)} style={{border:'none', background:'transparent', cursor:'pointer'}}><X size={24}/></button>
                </div>
                <div style={styles.modalBody}>
                    {modalLoading ? <p style={{textAlign:'center', color:'#64748b'}}>Cargando tabla de amortización...</p> : (
                        <table style={{width:'100%', borderCollapse:'collapse', fontSize:12}}>
                            <thead>
                                <tr style={{background:'#0f172a', color:'white'}}>
                                    <th style={{padding:10}}>#</th>
                                    <th style={{padding:10, textAlign:'right'}}>Cuota</th>
                                    <th style={{padding:10, textAlign:'right'}}>Interés</th>
                                    <th style={{padding:10, textAlign:'right'}}>Capital</th>
                                    <th style={{padding:10, textAlign:'right'}}>Saldo</th>
                                </tr>
                            </thead>
                            <tbody>
                                {selectedSchedule.map(r => (
                                    <tr key={r.period} style={{borderBottom:'1px solid #eee'}}>
                                        <td style={{padding:8, textAlign:'center', fontWeight:700}}>{r.period}</td>
                                        <td style={{padding:8, textAlign:'right', fontWeight:700}}>{formatMoney(r.payment)}</td>
                                        <td style={{padding:8, textAlign:'right', color:'#dc2626'}}>{formatMoney(r.interest)}</td>
                                        <td style={{padding:8, textAlign:'right', color:'#16a34a'}}>{formatMoney(r.principal)}</td>
                                        <td style={{padding:8, textAlign:'right', color:'#64748b'}}>{formatMoney(r.balance)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default ReporteCobros;