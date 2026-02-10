import { useState, useEffect, useMemo } from 'react';
import { 
  getAmortizationSchedule, 
  getCustomers, 
  createCredit, 
  type ScheduleRow, 
  type Customer 
} from '../api/financialApi';
import { 
  Calculator, 
  Calendar, 
  User, 
  DollarSign, 
  Percent, 
  FileText, 
  Save, 
  Printer, 
  FileSpreadsheet, 
  Copy, 
  X 
} from 'lucide-react';

// --- ESTILOS (Idénticos a Depreciación para consistencia) ---
const styles = {
  page: {
    background: "#f8fafc",
    borderRadius: 20,
    padding: 32,
    maxWidth: 1200,
    margin: "0 auto",
  } as React.CSSProperties,

  headerContainer: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    marginBottom: 24,
  } as React.CSSProperties,

  title: {
    fontWeight: 900,
    fontSize: 32,
    color: "#0f172a",
    margin: 0,
    letterSpacing: -0.5,
  } as React.CSSProperties,

  subtitle: {
    marginTop: 4,
    color: "#64748b",
    fontSize: 14,
    margin: 0,
  } as React.CSSProperties,

  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr", // Dos columnas equilibradas
    gap: 24,
    alignItems: "start",
  } as React.CSSProperties,

  card: {
    background: "white",
    borderRadius: 16,
    padding: 24,
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    border: "1px solid #e2e8f0",
  } as React.CSSProperties,

  cardTitle: {
    fontWeight: 800,
    color: "#0f172a",
    margin: "0 0 16px",
    fontSize: 18,
    borderBottom: "1px solid #f1f5f9",
    paddingBottom: 12,
    display: 'flex', 
    alignItems: 'center', 
    gap: 8
  } as React.CSSProperties,

  field: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    marginBottom: 16,
  } as React.CSSProperties,

  label: {
    fontSize: 13,
    color: "#334155",
    fontWeight: 700,
  } as React.CSSProperties,

  input: {
    padding: "10px 12px",
    borderRadius: 8,
    border: "1px solid #cbd5e1",
    outline: "none",
    fontSize: 14,
    transition: "all 0.2s",
    width: "100%",
  } as React.CSSProperties,

  select: {
    padding: "10px 12px",
    borderRadius: 8,
    border: "1px solid #cbd5e1",
    outline: "none",
    fontSize: 14,
    background: "white",
    width: "100%",
  } as React.CSSProperties,

  primaryBtn: {
    padding: "12px 20px",
    borderRadius: 8,
    border: "none",
    background: "#0f172a", // Azul oscuro corporativo
    color: "white",
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 4px 6px rgba(15, 23, 42, 0.2)",
    width: '100%',
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    gap: 8
  } as React.CSSProperties,

  actionBtn: {
    padding: "8px 14px",
    borderRadius: 6,
    border: "1px solid #e2e8f0",
    background: "white",
    color: "#334155",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    display: 'flex',
    alignItems: 'center',
    gap: 6
  } as React.CSSProperties,

  metricCard: { 
    background: '#f8fafc', 
    padding: '16px', 
    borderRadius: '12px', 
    border: '1px solid #e2e8f0' 
  } as React.CSSProperties,
};

const formatMoney = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

const AmortizationPage = () => {
  // ==================== ESTADOS ====================
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(""); 
  
  const [clientName, setClientName] = useState('');
  const [clientDate, setClientDate] = useState(new Date().toISOString().split('T')[0]);

  const [loanAmount, setLoanAmount] = useState('25000'); // Valor default más realista
  const [interestRate, setInterestRate] = useState('12');
  const [term, setTerm] = useState('24');
  const [termType, setTermType] = useState<'months' | 'years'>('months');
  const [rateType, setRateType] = useState<'annual' | 'monthly'>('annual');
  const [method, setMethod] = useState<'frances' | 'aleman'>('frances');
  
  const [schedule, setSchedule] = useState<ScheduleRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // ==================== CARGAR CLIENTES ====================
  useEffect(() => {
    const loadCustomers = async () => {
      try {
        const data = await getCustomers();
        setCustomers(data);
      } catch (error) {
        console.error("Error cargando clientes", error);
      }
    };
    loadCustomers();
  }, []);

  useEffect(() => {
    if (selectedCustomerId) {
        const customer = customers.find(c => String(c.id) === String(selectedCustomerId));
        if (customer) {
            const fullName = (customer as any).full_name || `${customer.first_name} ${customer.last_name}`;
            setClientName(fullName);
        }
    }
  }, [selectedCustomerId, customers]);

  // ==================== CÁLCULO ====================
  const calculateAmortization = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const principal = parseFloat(loanAmount);
    const rateInput = parseFloat(interestRate);
    const termInput = parseInt(term);

    if (!principal || isNaN(rateInput) || !termInput) {
      alert('Por favor complete todos los campos correctamente');
      return;
    }

    const finalPeriods = termType === 'years' ? termInput * 12 : termInput;
    const finalAnnualRate = rateType === 'monthly' ? rateInput * 12 : rateInput;

    setIsLoading(true);

    try {
      const data = await getAmortizationSchedule({
        principal,
        annual_rate: finalAnnualRate,
        periods: finalPeriods,
        method
      });

      setSchedule(data);
      setShowModal(true); // Abrimos el modal con los resultados
    } catch (error) {
      console.error("Failed to fetch schedule:", error);
      alert("Error al conectar con el servidor.");
    } finally {
      setIsLoading(false);
    }
  };

  // ==================== GUARDAR CRÉDITO ====================
  const handleSaveCredit = async () => {
    if (!selectedCustomerId) {
      alert("⚠️ Para guardar, primero debes seleccionar un cliente de la lista.");
      return;
    }
    
    const principal = parseFloat(loanAmount);
    const termInput = parseInt(term);
    const rateInput = parseFloat(interestRate);
    const finalPeriods = termType === 'years' ? termInput * 12 : termInput;
    const finalAnnualRate = rateType === 'monthly' ? rateInput * 12 : rateInput;

    if (!confirm(`¿Confirmas crear este crédito para ${clientName}?`)) return;

    setIsSaving(true);
    try {
      await createCredit({
        customer_id: parseInt(selectedCustomerId),
        principal: principal,
        annual_rate: finalAnnualRate,
        periods: finalPeriods,
        method: method,
        start_date: clientDate,
        description: `Préstamo web - ${method.toUpperCase()}`
      });
      
      alert("✅ ¡Crédito guardado exitosamente!");
      setShowModal(false); // Cerramos el modal tras guardar
    } catch (error: any) {
      console.error(error);
      alert(`❌ Error al guardar: ${error.message || "Error desconocido"}`);
    } finally {
      setIsSaving(false);
    }
  };

  // ==================== TOTALES & EXPORTACIÓN ====================
  const totals = useMemo(() => {
    return schedule.reduce((acc, row) => ({
        payment: acc.payment + Number(row.payment),
        interest: acc.interest + Number(row.interest),
        principal: acc.principal + Number(row.principal)
    }), { payment: 0, interest: 0, principal: 0 });
  }, [schedule]);

  const calcularFechaPago = (fechaInicio: string, periodo: number): string => {
    const fecha = new Date(fechaInicio);
    fecha.setMonth(fecha.getMonth() + periodo);
    fecha.setDate(fecha.getDate() + 1); 
    return fecha.toLocaleDateString('es-EC', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const downloadCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += `Cooperativa - Sistema Financiero\n`;
    csvContent += `Tabla de Amortización (${method === 'frances' ? 'Francés' : 'Alemán'})\n`;
    csvContent += `Cliente: ${clientName},Monto: ${loanAmount},Fecha: ${clientDate}\n\n`;
    
    csvContent += "Periodo,Fecha,Saldo Inicial,Pago,Capital,Interés,Saldo Final\n";
    
    schedule.forEach(r => {
        const fecha = calcularFechaPago(clientDate, r.period);
        const saldoIni = (Number(r.balance) + Number(r.principal)).toFixed(2);
        csvContent += `${r.period},${fecha},${saldoIni},${Number(r.payment).toFixed(2)},${Number(r.principal).toFixed(2)},${Number(r.interest).toFixed(2)},${Number(r.balance).toFixed(2)}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `amortizacion_${clientName || 'simulacion'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyToClipboard = () => {
    let text = "Periodo\tFecha\tPago\tCapital\tInterés\tSaldo Final\n";
    schedule.forEach(r => {
        const fecha = calcularFechaPago(clientDate, r.period);
        text += `${r.period}\t${fecha}\t${Number(r.payment).toFixed(2)}\t${Number(r.principal).toFixed(2)}\t${Number(r.interest).toFixed(2)}\t${Number(r.balance).toFixed(2)}\n`;
    });
    navigator.clipboard.writeText(text);
    alert("¡Tabla copiada al portapapeles!");
  };

  const printPDF = () => window.print();

  return (
    <div style={styles.page}>
      
      {/* HEADER VISUAL */}
      <div className="no-print" style={styles.headerContainer}>
         <img 
            src="/logo.png" 
            alt="Logo Sistema" 
            style={{ width: 48, height: 48, objectFit: 'contain' }}
            onError={(e) => (e.target as HTMLImageElement).src = '/LOGOSF.png'}
         />
         <div>
            <h1 style={styles.title}>Simulador de Crédito</h1>
            <p style={styles.subtitle}>Amortización Francesa y Alemana</p>
         </div>
      </div>

      <div className="no-print" style={styles.grid}>
        
        {/* --- TARJETA 1: PARAMETROS --- */}
        <div style={styles.card}>
          <div style={styles.cardTitle}>
            <Calculator size={20} className="text-blue-600" /> Parámetros del Crédito
          </div>
          
          <form onSubmit={calculateAmortization}>
            {/* SELECCIÓN CLIENTE */}
            <div style={{background: '#f0f9ff', padding: 12, borderRadius: 8, border: '1px solid #bae6fd', marginBottom: 16}}>
                <label style={{...styles.label, color: '#0369a1', display: 'flex', alignItems: 'center', gap: 6}}>
                    <User size={16}/> Cliente (Opcional)
                </label>
                <select 
                    value={selectedCustomerId} 
                    onChange={(e) => setSelectedCustomerId(e.target.value)} 
                    style={{...styles.select, marginBottom: 8}}
                >
                    <option value="">-- Seleccionar de la lista --</option>
                    {customers.map(c => (
                        <option key={c.id} value={c.id}>{(c as any).full_name || `${c.first_name} ${c.last_name}`}</option>
                    ))}
                </select>
                <input 
                    placeholder="Nombre manual (si no está en lista)" 
                    value={clientName} 
                    onChange={(e) => setClientName(e.target.value)} 
                    style={styles.input} 
                    disabled={!!selectedCustomerId}
                />
            </div>

            <div style={styles.field}>
                <label style={styles.label}><Calendar size={16} style={{verticalAlign: 'text-bottom'}}/> Fecha de Inicio</label>
                <input type="date" value={clientDate} onChange={(e) => setClientDate(e.target.value)} style={styles.input} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={styles.field}>
                    <label style={styles.label}><DollarSign size={16}/> Monto ($)</label>
                    <input type="number" value={loanAmount} onChange={(e) => setLoanAmount(e.target.value)} style={styles.input} min="1"/>
                </div>
                <div style={styles.field}>
                    <label style={styles.label}><Percent size={16}/> Tasa Anual</label>
                    <input type="number" value={interestRate} onChange={(e) => setInterestRate(e.target.value)} style={styles.input} />
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={styles.field}>
                    <label style={styles.label}>Plazo (Meses)</label>
                    <div style={{display: 'flex', gap: 4}}>
                        <input type="number" value={term} onChange={(e) => setTerm(e.target.value)} style={styles.input} />
                        <select value={termType} onChange={(e) => setTermType(e.target.value as any)} style={{...styles.select, width: 'auto'}}>
                            <option value="months">Meses</option>
                            <option value="years">Años</option>
                        </select>
                    </div>
                </div>
                <div style={styles.field}>
                    <label style={styles.label}>Método</label>
                    <select value={method} onChange={(e) => setMethod(e.target.value as any)} style={styles.select}>
                        <option value="frances">Francés (Cuota Fija)</option>
                        <option value="aleman">Alemán (Capital Fijo)</option>
                    </select>
                </div>
            </div>

            <button type="submit" disabled={isLoading} style={{...styles.primaryBtn, marginTop: 10, opacity: isLoading ? 0.7 : 1}}>
              {isLoading ? "Calculando..." : "Generar Tabla"}
            </button>
          </form>
        </div>

        {/* --- TARJETA 2: EXPLICACIÓN --- */}
        <div style={styles.card}>
          <div style={styles.cardTitle}>
            <FileText size={20} className="text-blue-600" /> Guía de Amortización
          </div>
          <div style={{color: '#475569', fontSize: 14, lineHeight: 1.6}}>
            <p style={{marginBottom: 12}}>
                <strong>Sistema Francés:</strong> Se caracteriza por tener una <em>cuota fija</em> durante todo el periodo. Al principio se paga más interés y menos capital.
            </p>
            <p style={{marginBottom: 12}}>
                <strong>Sistema Alemán:</strong> Se caracteriza por tener una <em>amortización de capital fija</em>. La cuota es variable (decreciente) porque los intereses bajan mes a mes.
            </p>
            
            <div style={{background: '#f1f5f9', padding: 16, borderRadius: 12, marginTop: 20}}>
                <h4 style={{margin: '0 0 10px', color: '#0f172a'}}>Resumen de Simulación:</h4>
                <ul style={{paddingLeft: 20, margin: 0}}>
                    <li>Monto: <strong>${formatMoney(parseFloat(loanAmount))}</strong></li>
                    <li>Tasa: <strong>{interestRate}% {rateType === 'annual' ? 'Anual' : 'Mensual'}</strong></li>
                    <li>Plazo: <strong>{term} {termType === 'years' ? 'Años' : 'Meses'}</strong></li>
                </ul>
            </div>
          </div>
        </div>
      </div>

      {/* --- MODAL DE REPORTE (IDÉNTICO A DEPRECIACIÓN) --- */}
      {showModal && schedule.length > 0 && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <div id="printable-section" style={{ background: 'white', padding: '32px', borderRadius: '16px', width: '90%', maxWidth: '1000px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            
            {/* Header Modal (No Print) */}
            <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '25px' }}>
              <div>
                  <h2 style={{ margin: 0, color: '#1e293b', fontSize: '1.5rem', fontWeight: 800 }}>Tabla de Amortización</h2>
                  <p style={{ margin: '5px 0 0 0', color: '#64748b' }}>Método: {method === 'frances' ? 'Francés (Cuota Nivelada)' : 'Alemán (Cuota Decreciente)'}</p>
              </div>
              <button onClick={() => setShowModal(false)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: 36, height: 36, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                  <X size={20} />
              </button>
            </div>

            {/* ENCABEZADO IMPRESIÓN (Con Logo Imagen) */}
            <div className="print-only-header" style={{ display: 'none', marginBottom: '30px', fontFamily: 'Arial, sans-serif' }}>
              <div style={{ display: 'flex', alignItems: 'center', borderBottom: '2px solid #e2e8f0', paddingBottom: '20px', marginBottom: '20px' }}>
                <div style={{ marginRight: 20 }}>
                    <img 
                      src="/logo.png" 
                      alt="Logo Cooperativa" 
                      style={{ width: 80, height: 'auto', objectFit: 'contain' }}
                      onError={(e) => (e.target as HTMLImageElement).src = '/LOGOSF.png'} 
                    />
                </div>
                <div>
                  <h2 style={{ margin: 0, color: '#0f172a', fontSize: '22px' }}>Cooperativa — Sistema Financiero</h2>
                  <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '14px' }}>Reporte generado automáticamente</p>
                </div>
              </div>

              <h1 style={{ fontSize: '24px', color: '#1e293b', marginBottom: '20px' }}>Tabla de Amortización de Crédito</h1>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', fontSize: '14px', color: '#334155', marginBottom: '30px' }}>
                <div><strong>Cliente:</strong> {clientName || 'Consumidor Final'}</div>
                <div><strong>Fecha Emisión:</strong> {new Date().toLocaleDateString()}</div>
                <div><strong>Monto Préstamo:</strong> ${formatMoney(parseFloat(loanAmount))}</div>
                <div><strong>Tasa de Interés:</strong> {interestRate}%</div>
                <div><strong>Plazo:</strong> {term} {termType}</div>
                <div><strong>Método:</strong> {method.toUpperCase()}</div>
              </div>
            </div>

            {/* TARJETAS KPI (No Print) */}
            <div className="no-print" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginBottom: '30px' }}>
              <div style={{...styles.metricCard, background: '#eff6ff', borderColor: '#bfdbfe'}}>
                  <span style={{color: '#1e40af', fontSize: '0.85rem', fontWeight: 600}}>Total a Pagar</span>
                  <div style={{fontSize: '1.4rem', fontWeight: 'bold', color: '#1d4ed8'}}>${formatMoney(totals.payment)}</div>
              </div>
              <div style={{...styles.metricCard, background: '#fef3c7', borderColor: '#fde68a'}}>
                  <span style={{color: '#92400e', fontSize: '0.85rem', fontWeight: 600}}>Total Intereses</span>
                  <div style={{fontSize: '1.4rem', fontWeight: 'bold', color: '#b45309'}}>${formatMoney(totals.interest)}</div>
              </div>
              <div style={{...styles.metricCard, background: '#f0fdf4', borderColor: '#bbf7d0'}}>
                  <span style={{color: '#166534', fontSize: '0.85rem', fontWeight: 600}}>Capital Amortizado</span>
                  <div style={{fontSize: '1.4rem', fontWeight: 'bold', color: '#15803d'}}>${formatMoney(totals.principal)}</div>
              </div>
            </div>

            {/* BARRA DE ACCIONES (Guardar, Exportar) */}
            <div className="no-print" style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
              <button onClick={handleSaveCredit} disabled={isSaving} style={{...styles.actionBtn, background: '#10B981', color: 'white', borderColor: '#059669'}}>
                 <Save size={16} /> {isSaving ? 'Guardando...' : 'Guardar Crédito'}
              </button>
              <div style={{width: 1, background: '#e2e8f0', margin: '0 5px'}}></div>
              <button onClick={downloadCSV} style={styles.actionBtn}><FileSpreadsheet size={16} /> Excel / CSV</button>
              <button onClick={copyToClipboard} style={styles.actionBtn}><Copy size={16} /> Copiar</button>
              <button onClick={printPDF} style={styles.actionBtn}><Printer size={16} /> Imprimir PDF</button>
            </div>

            <h4 className="no-print" style={{marginBottom: 15, color: '#334155', fontWeight: 800}}>Detalle de Cuotas</h4>
            
            {/* TABLA PRINCIPAL */}
            <div className="table-container" style={{ border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ background: '#0A3143', color: 'white' }}> 
                    <th style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold' }}>N°</th>
                    <th style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold' }}>Fecha</th>
                    <th style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold' }}>Saldo Inicial</th>
                    <th style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold' }}>Cuota (Pago)</th>
                    <th style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold' }}>Capital</th>
                    <th style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold' }}>Interés</th>
                    <th style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold' }}>Saldo Final</th>
                  </tr>
                </thead>
                <tbody>
                  {schedule.map((row, index) => {
                    const saldoInicial = Number(row.balance) + Number(row.principal);
                    return (
                      <tr key={index} style={{ background: index % 2 === 0 ? 'white' : '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '10px', textAlign: 'center', color: '#64748b' }}>{row.period}</td>
                        <td style={{ padding: '10px', textAlign: 'center', color: '#64748b' }}>{calcularFechaPago(clientDate, row.period)}</td>
                        <td style={{ padding: '10px', textAlign: 'right', color: '#64748b' }}>${formatMoney(saldoInicial)}</td>
                        <td style={{ padding: '10px', textAlign: 'right', fontWeight: 'bold', color: '#0f172a' }}>${formatMoney(Number(row.payment))}</td>
                        <td style={{ padding: '10px', textAlign: 'right', color: '#15803d' }}>${formatMoney(Number(row.principal))}</td>
                        <td style={{ padding: '10px', textAlign: 'right', color: '#b45309' }}>${formatMoney(Number(row.interest))}</td>
                        <td style={{ padding: '10px', textAlign: 'right', fontWeight: 'bold', color: '#0A3143' }}>${formatMoney(Number(row.balance))}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

             <div className="print-only-header" style={{ display: 'none', marginTop: '40px', borderTop: '1px solid #e2e8f0', paddingTop: '20px', textAlign: 'center', color: '#64748b', fontSize: '12px' }}>
              <p>Documento generado por el Sistema Financiero - Uso Interno</p>
            </div>
            
          </div>
        </div>
      )}

      {/* --- ESTILOS DE IMPRESIÓN (Critical) --- */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .modal-overlay { position: absolute !important; top: 0 !important; left: 0 !important; width: 100% !important; height: auto !important; z-index: 9999 !important; overflow: visible !important; display: block !important; background: white !important; }
          #printable-section, #printable-section * { visibility: visible !important; }
          #printable-section { position: static !important; width: 100% !important; max-width: 100% !important; height: auto !important; max-height: none !important; overflow: visible !important; padding: 20px !important; margin: 0 !important; box-shadow: none !important; }
          .table-container { border: none !important; overflow: visible !important; }
          
          /* COLOR DE TABLA EN IMPRESIÓN (AZUL PETRÓLEO) */
          thead tr { background: #0A3143 !important; color: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }

          .no-print { display: none !important; }
          .print-only-header { display: block !important; }
        }
      `}</style>
    </div>
  );
};

export default AmortizationPage;