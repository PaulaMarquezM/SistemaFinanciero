import { useEffect, useState } from 'react';
import { 
  getCredits, 
  deleteCredit, 
  getAmortizationSchedule, // Importamos el servicio de cálculo
  type CreditResponse,
  type AmortizationParams 
} from '../api/financialApi';
import { Eye, Trash2, X, FileText } from 'lucide-react';

const CreditsPage = () => {
  const [credits, setCredits] = useState<CreditResponse[]>([]);
  const [loading, setLoading] = useState(true);

  // --- ESTADOS DEL MODAL ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<any[]>([]);
  const [selectedCredit, setSelectedCredit] = useState<CreditResponse | null>(null);

  // Cargar créditos al iniciar
  const loadCredits = async () => {
    try {
      const data = await getCredits();
      setCredits(data);
    } catch (error) {
      console.error("Error al cargar créditos", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCredits();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("¿Estás seguro de eliminar este crédito? Se borrarán todos sus pagos.")) return;
    try {
      await deleteCredit(id);
      setCredits(prev => prev.filter(c => c.id !== id));
    } catch (error) {
      alert("Error al eliminar el crédito");
    }
  };

  // --- LÓGICA PARA VER TABLA ---
  const handleViewSchedule = async (credit: CreditResponse) => {
    setSelectedCredit(credit);
    setIsModalOpen(true);
    setModalLoading(true);
    
    try {
        // Preparamos los parámetros para recalcular la tabla
        const params: AmortizationParams = {
            principal: credit.principal,
            annual_rate: credit.annual_rate,
            periods: credit.periods,
            method: credit.method as 'frances' | 'aleman'
        };
        
        // Llamamos a la API para obtener la matemática exacta
        const schedule = await getAmortizationSchedule(params);
        setSelectedSchedule(schedule);
    } catch (error) {
        console.error(error);
        alert("No se pudo cargar la tabla.");
        setIsModalOpen(false);
    } finally {
        setModalLoading(false);
    }
  };

  const money = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

  return (
    <div style={{ padding: 32, maxWidth: 1200, margin: "0 auto", background: "#f8fafc", borderRadius: 20 }}>
      
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 }}>
        <div>
            <h1 style={{ color: '#0f172a', margin: 0, fontSize: 32, fontWeight: 900 }}>Gestión de Créditos</h1>
            <p style={{ margin: '4px 0 0', color: '#64748b' }}>Administración de cartera y tablas de amortización</p>
        </div>
        <button 
          onClick={loadCredits} 
          style={{ padding: '10px 20px', background: 'white', border: '1px solid #cbd5e1', color: '#0f172a', borderRadius: 8, cursor: 'pointer', fontWeight: 600, boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}
        >
          Actualizar Lista
        </button>
      </div>

      {loading ? (
        <p>Cargando créditos...</p>
      ) : credits.length === 0 ? (
        <div style={{ padding: 40, textAlign: 'center', background: 'white', borderRadius: 16, border: '1px solid #e2e8f0' }}>
          <p style={{color: '#64748b'}}>No hay créditos registrados.</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto', background: 'white', borderRadius: 16, border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#0A3143', color: 'white', textAlign: 'left' }}>
                <th style={{ padding: 16, fontSize: 13, textTransform: 'uppercase' }}>ID</th>
                <th style={{ padding: 16, fontSize: 13, textTransform: 'uppercase' }}>Cliente</th>
                <th style={{ padding: 16, fontSize: 13, textTransform: 'uppercase' }}>Monto</th>
                <th style={{ padding: 16, fontSize: 13, textTransform: 'uppercase' }}>Tasa</th>
                <th style={{ padding: 16, fontSize: 13, textTransform: 'uppercase' }}>Plazo</th>
                <th style={{ padding: 16, fontSize: 13, textTransform: 'uppercase' }}>Método</th>
                <th style={{ padding: 16, fontSize: 13, textTransform: 'uppercase' }}>Estado</th>
                <th style={{ padding: 16, textAlign: 'center', fontSize: 13, textTransform: 'uppercase' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {credits.map((credit, i) => (
                <tr key={credit.id} style={{ borderBottom: '1px solid #f1f5f9', background: i % 2 === 0 ? 'white' : '#f8fafc' }}>
                  <td style={{ padding: 16, fontWeight: 700, color: '#64748b' }}>#{credit.id}</td>
                  <td style={{ padding: 16, fontWeight: 700, color: '#0f172a' }}>
                    {credit.customer ? `${credit.customer.first_name} ${credit.customer.last_name}` : `Cliente ID: ${credit.customer_id}`}
                  </td>
                  <td style={{ padding: 16, fontWeight: 700, color: '#16a34a' }}>{money(credit.principal)}</td>
                  <td style={{ padding: 16 }}>{credit.annual_rate}%</td>
                  <td style={{ padding: 16 }}>{credit.periods} meses</td>
                  <td style={{ padding: 16, textTransform: 'capitalize' }}>{credit.method}</td>
                  <td style={{ padding: 16 }}>
                    <span style={{
                      padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                      background: credit.status === 'active' ? '#dcfce7' : '#fef2f2',
                      color: credit.status === 'active' ? '#166534' : '#991b1b'
                    }}>
                      {credit.status === 'active' ? 'ACTIVO' : credit.status.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: 16 }}>
                    <div style={{display: 'flex', justifyContent: 'center', gap: 8}}>
                        {/* BOTÓN VER TABLA */}
                        <button
                            onClick={() => handleViewSchedule(credit)}
                            style={{
                                padding: '8px', background: '#eff6ff', color: '#2563eb', border: 'none',
                                borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600, fontSize: 12
                            }}
                            title="Ver Tabla de Amortización"
                        >
                            <Eye size={16} /> Tabla
                        </button>

                        {/* BOTÓN ELIMINAR */}
                        <button
                            onClick={() => handleDelete(credit.id)}
                            style={{
                                padding: '8px', background: '#fee2e2', color: '#dc2626', border: 'none',
                                borderRadius: 6, cursor: 'pointer'
                            }}
                            title="Eliminar Crédito"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* --- MODAL DE TABLA DE AMORTIZACIÓN --- */}
      {isModalOpen && (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 1000,
            display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 20
        }} onClick={() => setIsModalOpen(false)}>
            <div style={{
                background: 'white', borderRadius: 16, width: '100%', maxWidth: 700, maxHeight: '90vh',
                display: 'flex', flexDirection: 'column', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
            }} onClick={e => e.stopPropagation()}>
                
                {/* Header Modal */}
                <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h3 style={{ margin: 0, color: '#0f172a', fontSize: 18 }}>Tabla de Amortización</h3>
                        {selectedCredit && (
                            <div style={{display: 'flex', alignItems: 'center', gap: 8, marginTop: 4}}>
                                <span style={{fontSize: 12, background: '#f1f5f9', padding: '2px 8px', borderRadius: 4, color: '#475569', fontWeight: 600}}>
                                    Crédito #{selectedCredit.id}
                                </span>
                                <span style={{fontSize: 13, color: '#64748b'}}>
                                    {selectedCredit.customer ? `${selectedCredit.customer.first_name} ${selectedCredit.customer.last_name}` : ''}
                                </span>
                            </div>
                        )}
                    </div>
                    <button onClick={() => setIsModalOpen(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#94a3b8' }}>
                        <X size={24} />
                    </button>
                </div>

                {/* Body Modal */}
                <div style={{ padding: 24, overflowY: 'auto' }}>
                    {modalLoading ? (
                        <div style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>Cargando tabla...</div>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                            <thead>
                                <tr style={{ background: '#0f172a', color: 'white' }}>
                                    <th style={{ padding: 10, textAlign: 'center', borderRadius: '8px 0 0 0' }}>#</th>
                                    <th style={{ padding: 10, textAlign: 'right' }}>Cuota</th>
                                    <th style={{ padding: 10, textAlign: 'right' }}>Interés</th>
                                    <th style={{ padding: 10, textAlign: 'right' }}>Capital</th>
                                    <th style={{ padding: 10, textAlign: 'right', borderRadius: '0 8px 0 0' }}>Saldo</th>
                                </tr>
                            </thead>
                            <tbody>
                                {selectedSchedule.map((row) => (
                                    <tr key={row.period} style={{ borderBottom: '1px solid #eee' }}>
                                        <td style={{ padding: 8, textAlign: 'center', fontWeight: 700 }}>{row.period}</td>
                                        <td style={{ padding: 8, textAlign: 'right', fontWeight: 700 }}>${row.payment.toFixed(2)}</td>
                                        <td style={{ padding: 8, textAlign: 'right', color: '#dc2626' }}>${row.interest.toFixed(2)}</td>
                                        <td style={{ padding: 8, textAlign: 'right', color: '#16a34a' }}>${row.principal.toFixed(2)}</td>
                                        <td style={{ padding: 8, textAlign: 'right', color: '#64748b' }}>${row.balance.toFixed(2)}</td>
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

export default CreditsPage;