import { useState, useMemo, useRef, useEffect } from 'react';
// Asegúrate de que estas rutas sean correctas en tu proyecto
import { 
  getAmortizationSchedule, 
  getCustomers, 
  createCredit, 
  type ScheduleRow, 
  type Customer 
} from '../api/financialApi';

// ==================== LOGO COMPONENT ====================
const SystemLogo = ({ size = 40 }: { size?: number }) => (
  <img 
    src="/LOGOSF.png" 
    alt="Logo Sistema Financiero"
    style={{
      width: size,
      height: size,
      objectFit: 'contain',
      borderRadius: 8,
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
    }}
  />
);

// ==================== ESTILOS BASE ====================
const cardStyle: React.CSSProperties = {
  border: '1px solid #ddd',
  borderRadius: 10,
  padding: 16,
  backgroundColor: 'white'
};

const labelStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
  marginBottom: 12,
  fontSize: 14,
  fontWeight: 600,
  color: '#0A3143'
};

const inputStyle: React.CSSProperties = {
  padding: '8px 10px',
  borderRadius: 8,
  border: '1px solid #ccc',
  outline: 'none',
  fontSize: 14
};

// Estilo base para botones (luego personalizamos colores)
const baseButtonStyle: React.CSSProperties = {
  padding: '8px 16px',
  borderRadius: 8,
  border: 'none',
  cursor: 'pointer',
  fontWeight: 600,
  fontSize: 14,
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  transition: 'all 0.2s'
};

const thStyle: React.CSSProperties = {
  textAlign: 'left',
  borderBottom: '2px solid #276E90',
  padding: 10,
  fontSize: 13,
  fontWeight: 700,
  color: '#0A3143',
  backgroundColor: '#f0f9ff'
};

const tdStyle: React.CSSProperties = {
  borderBottom: '1px solid #eee',
  padding: 8,
  fontSize: 13,
};

const formatMoney = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

const AmortizationPage = () => {
  // ==================== ESTADO ====================
  
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(""); 
  
  const [clientName, setClientName] = useState('');
  const [clientDate, setClientDate] = useState(new Date().toISOString().split('T')[0]);

  const [loanAmount, setLoanAmount] = useState('225000');
  const [interestRate, setInterestRate] = useState('28');
  const [term, setTerm] = useState('5');
  const [termType, setTermType] = useState<'months' | 'years'>('years');
  const [rateType, setRateType] = useState<'annual' | 'monthly'>('annual');
  const [method, setMethod] = useState<'frances' | 'aleman'>('frances');
  
  const [schedule, setSchedule] = useState<ScheduleRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [copyStatus, setCopyStatus] = useState<string>("");

  const printRef = useRef<HTMLDivElement>(null);

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
  const calculateAmortization = async () => {
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
      alert("⚠️ ATENCIÓN: Debes seleccionar un cliente de la lista para guardar.");
      return;
    }
    if (schedule.length === 0) {
      alert("Primero genera la tabla de amortización.");
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
    } catch (error: any) {
      console.error(error);
      alert(`❌ Error al guardar: ${error.message || "Error desconocido"}`);
    } finally {
      setIsSaving(false);
    }
  };

  // ==================== TOTALES ====================
  const totalPayment = useMemo(() => 
    schedule.reduce((acc, row) => acc + Number(row.payment), 0), [schedule]
  );
  const totalInterest = useMemo(() => 
    schedule.reduce((acc, row) => acc + Number(row.interest), 0), [schedule]
  );
  const totalPrincipal = useMemo(() => 
    schedule.reduce((acc, row) => acc + Number(row.principal), 0), [schedule]
  );

  // ==================== EXPORT CSV ====================
  const buildCSV = (rows: ScheduleRow[]): string => {
    const lines: string[] = [];
    lines.push('SISTEMA FINANCIERO - TABLA DE AMORTIZACION');
    lines.push(`Cliente,${clientName}`);
    lines.push(`Monto,$${loanAmount}`);
    lines.push('');
    const headers = ["N°", "Fecha", "Saldo Inicial", "Pago", "Capital", "Interes", "Saldo Final"];
    lines.push(headers.join(","));

    for (const r of rows) {
      const fechaPago = clientDate ? calcularFechaPago(clientDate, r.period) : '';
      const values = [
        r.period,
        fechaPago,
        Number(r.balance) + Number(r.principal),
        Number(r.payment),
        Number(r.principal),
        Number(r.interest),
        Number(r.balance),
      ].map(v => typeof v === 'number' ? v.toFixed(2) : v);
      lines.push(values.join(","));
    }
    return lines.join("\n");
  };

  const calcularFechaPago = (fechaInicio: string, periodo: number): string => {
    const fecha = new Date(fechaInicio);
    fecha.setMonth(fecha.getMonth() + periodo);
    fecha.setDate(fecha.getDate() + 1); 
    return fecha.toLocaleDateString('es-EC', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const handleDownloadCSV = () => {
    const csv = buildCSV(schedule);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `amortizacion_${clientName || 'cliente'}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const handleCopyCSV = async () => {
    try {
      await navigator.clipboard.writeText(buildCSV(schedule));
      setCopyStatus("¡Copiado!");
      setTimeout(() => setCopyStatus(""), 2000);
    } catch {
      setCopyStatus("Error al copiar");
    }
  };

  // ==================== PDF & IMPRIMIR ====================
  const handlePrint = () => window.print();

  const handleDownloadPDF = async () => {
    const element = printRef.current;
    if (!element) return;
    try {
      const html2canvas = (await import('html2canvas')).default;
      const jsPDF = (await import('jspdf')).default;
      const canvas = await html2canvas(element, { scale: 2, backgroundColor: '#ffffff' });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, imgHeight);
      pdf.save(`amortizacion_${clientName || 'cliente'}.pdf`);
    } catch (error) {
      alert('Error al generar PDF');
    }
  };

  // ==================== RENDER ====================
  return (
    <div style={{ padding: 16, maxWidth: 1100, margin: "0 auto" }}>
      {/* HEADER */}
      <div style={{ marginBottom: 24, paddingBottom: 16, borderBottom: '2px solid #e0e0e0' }} className="no-print">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
           <SystemLogo size={40} />
           <div>
             <h2 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: '#0A3143' }}>Sistema Financiero</h2>
             <p style={{ margin: 0, fontSize: 14, color: '#666' }}>Simulador de Créditos y Amortización</p>
           </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }} className="no-print">
        {/* ENTRADAS */}
        <section style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <div style={{ background: '#0A3143', padding: 8, borderRadius: 8, color: 'white' }}>
               <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/></svg>
            </div>
            <h3 style={{ margin: 0, fontSize: 18, color: '#0A3143' }}>Entradas</h3>
          </div>

          {/* VINCULAR CLIENTE */}
          <div style={{ background: '#f0f9ff', padding: 12, borderRadius: 8, border: '1px solid #bae6fd', marginBottom: 16 }}>
             <h4 style={{ margin: '0 0 10px', fontSize: 13, color: '#0369a1' }}>👤 Vincular Cliente (Opcional)</h4>
             <label style={{...labelStyle, marginBottom: 8}}>
               Seleccionar Cliente Registrado
               <select value={selectedCustomerId} onChange={(e) => setSelectedCustomerId(e.target.value)} style={{...inputStyle, background: 'white'}}>
                 <option value="">-- Usar nombre manual --</option>
                 {customers.map(c => (
                   <option key={c.id} value={c.id}>{(c as any).full_name || `${c.first_name} ${c.last_name}`} (ID: {c.id})</option>
                 ))}
               </select>
             </label>
             <input type="text" value={clientName} onChange={(e) => setClientName(e.target.value)} style={inputStyle} placeholder="Nombre Manual" disabled={!!selectedCustomerId} />
             <input type="date" value={clientDate} onChange={(e) => setClientDate(e.target.value)} style={{...inputStyle, marginTop: 8, width: '100%'}} />
          </div>

          {/* FORMULARIO */}
          <label style={labelStyle}>Método
            <select value={method} onChange={(e) => setMethod(e.target.value as 'frances' | 'aleman')} style={inputStyle}>
              <option value="frances">Francés (Cuota Fija)</option>
              <option value="aleman">Alemán (Amortización Fija)</option>
            </select>
          </label>
          <label style={labelStyle}>Monto del Préstamo
            <input type="number" value={loanAmount} onChange={(e) => setLoanAmount(e.target.value)} style={inputStyle} />
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 10 }}>
             <label style={labelStyle}>Tasa (%)
               <input type="number" value={interestRate} onChange={(e) => setInterestRate(e.target.value)} style={inputStyle} />
             </label>
             <label style={labelStyle}>Tipo
               <select value={rateType} onChange={(e) => setRateType(e.target.value as any)} style={inputStyle}>
                 <option value="annual">Anual</option>
                 <option value="monthly">Mensual</option>
               </select>
             </label>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 10 }}>
             <label style={labelStyle}>Plazo
               <input type="number" value={term} onChange={(e) => setTerm(e.target.value)} style={inputStyle} />
             </label>
             <label style={labelStyle}>Unidad
               <select value={termType} onChange={(e) => setTermType(e.target.value as any)} style={inputStyle}>
                 <option value="years">Años</option>
                 <option value="months">Meses</option>
               </select>
             </label>
          </div>

          <button onClick={calculateAmortization} disabled={isLoading} style={{
             width: '100%', padding: 14, marginTop: 16, borderRadius: 10, border: 'none',
             background: '#0A3143', color: 'white', fontWeight: 'bold', cursor: 'pointer'
          }}>
             {isLoading ? 'Calculando...' : 'Generar Tabla'}
          </button>
        </section>

        {/* EXPLICACIÓN ACADÉMICA */}
        <section style={cardStyle}>
           <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <div style={{ background: '#0A3143', padding: 8, borderRadius: 8, color: 'white' }}>
                 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
              </div>
              <h3 style={{ margin: 0, fontSize: 18, color: '#0A3143' }}>Explicación académica</h3>
           </div>
           <div style={{ background: '#f8f9fa', padding: 16, borderRadius: 8, fontSize: 14, lineHeight: 1.6, color: '#444' }}>
              <p><strong>Método {method === 'frances' ? 'Francés' : 'Alemán'}:</strong></p>
              {method === 'frances' ? (
                <ul>
                  <li>Cuota total constante.</li>
                  <li>Interés decreciente, capital creciente.</li>
                  <li>Fórmula de anualidad vencida.</li>
                </ul>
              ) : (
                <ul>
                  <li>Amortización de capital constante.</li>
                  <li>Cuota decreciente.</li>
                  <li>Interés calculado sobre saldo.</li>
                </ul>
              )}
           </div>
        </section>
      </div>

      {/* RESULTADOS */}
      {schedule.length > 0 && (
        <div ref={printRef}>
          <section style={{ ...cardStyle, marginTop: 16 }}>
             <h3 style={{ margin: '0 0 20px', fontSize: 18, color: '#0A3143' }} className="no-print">Resultados</h3>

             {/* TARJETAS KPI (4 TARJETAS RESTAURADAS) */}
             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }} className="no-print">
                <div style={{ padding: 12, border: '1px solid #ddd', borderRadius: 8, background: '#f9fafb' }}>
                   <div style={{fontSize: 11, textTransform: 'uppercase', color: '#666', fontWeight: 600}}>Monto Préstamo</div>
                   <div style={{fontSize: 20, fontWeight: 700, color: '#111', marginTop: 5}}>${formatMoney(parseFloat(loanAmount))}</div>
                </div>
                <div style={{ padding: 12, border: '1px solid #bae6fd', borderRadius: 8, background: '#f0f9ff' }}>
                   <div style={{fontSize: 11, textTransform: 'uppercase', color: '#0284c7', fontWeight: 600}}>Total Pagado</div>
                   <div style={{fontSize: 20, fontWeight: 700, color: '#0369a1', marginTop: 5}}>${formatMoney(totalPayment)}</div>
                </div>
                <div style={{ padding: 12, border: '1px solid #fde68a', borderRadius: 8, background: '#fffbeb' }}>
                   <div style={{fontSize: 11, textTransform: 'uppercase', color: '#d97706', fontWeight: 600}}>Total Intereses</div>
                   <div style={{fontSize: 20, fontWeight: 700, color: '#b45309', marginTop: 5}}>${formatMoney(totalInterest)}</div>
                </div>
                {/* 4TA TARJETA RESTAURADA */}
                <div style={{ padding: 12, border: '1px solid #bbf7d0', borderRadius: 8, background: '#f0fdf4' }}>
                   <div style={{fontSize: 11, textTransform: 'uppercase', color: '#16a34a', fontWeight: 600}}>Total Capital</div>
                   <div style={{fontSize: 20, fontWeight: 700, color: '#15803d', marginTop: 5}}>${formatMoney(totalPrincipal)}</div>
                </div>
             </div>

             {/* BOTONES DE ACCIÓN (RESTAURADOS COLORES) */}
             <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }} className="no-print">
                <button onClick={handleSaveCredit} disabled={isSaving} style={{...baseButtonStyle, background: '#10B981', color: 'white', boxShadow: '0 2px 5px rgba(16,185,129,0.3)'}}>
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"/></svg>
                  {isSaving ? 'Guardando...' : 'GUARDAR CRÉDITO REAL'}
                </button>
                
                <div style={{width: 1, background: '#ddd', margin: '0 5px'}}></div>

                <button onClick={handleDownloadCSV} style={{...baseButtonStyle, background: '#1e3a8a', color: 'white'}}>
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                  CSV
                </button>
                <button onClick={handleDownloadPDF} style={{...baseButtonStyle, background: '#dc2626', color: 'white'}}>
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>
                  PDF
                </button>
                <button onClick={handlePrint} style={{...baseButtonStyle, background: 'white', border: '1px solid #ccc', color: '#333'}}>
                  🖨️ Imprimir
                </button>
                <button onClick={handleCopyCSV} style={{...baseButtonStyle, background: 'white', border: '1px solid #ccc', color: '#333'}}>
                  📋 Copiar {copyStatus && '✅'}
                </button>
             </div>

             {/* TABLA DE RESULTADOS */}
             <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                   <thead>
                      <tr style={{ background: '#f4d03f' }}>
                         {["N°", "Fecha", "Saldo Inicial", "Pago", "Capital", "Interés", "Saldo Final"].map(h => (
                           <th key={h} style={thStyle}>{h}</th>
                         ))}
                      </tr>
                   </thead>
                   <tbody>
                      {schedule.map((row, i) => {
                         const saldoIni = Number(row.balance) + Number(row.principal);
                         return (
                           <tr key={i} style={{ background: i % 2 === 0 ? '#fafafa' : 'white' }}>
                              <td style={tdStyle}>{row.period}</td>
                              <td style={tdStyle}>{clientDate ? calcularFechaPago(clientDate, row.period) : '-'}</td>
                              <td style={tdStyle}>${formatMoney(saldoIni)}</td>
                              <td style={{...tdStyle, fontWeight: 'bold'}}>${formatMoney(Number(row.payment))}</td>
                              <td style={{...tdStyle, color: '#15803d'}}>${formatMoney(Number(row.principal))}</td>
                              <td style={{...tdStyle, color: '#b45309'}}>${formatMoney(Number(row.interest))}</td>
                              <td style={tdStyle}>${formatMoney(Number(row.balance))}</td>
                           </tr>
                         )
                      })}
                   </tbody>
                </table>
             </div>
          </section>
        </div>
      )}
    </div>
  );
};

export default AmortizationPage;