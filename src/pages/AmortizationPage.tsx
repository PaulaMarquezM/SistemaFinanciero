import { useState, useMemo, useRef } from 'react';
import { getAmortizationSchedule, type ScheduleRow } from '../api/financialApi';

// ==================== LOGO COMPONENT ====================
const SystemLogo = ({ size = 40 }: { size?: number }) => (
  <img 
    src="/LOGOSF.png"  // Tu logo debe estar en public/logo.png
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

const buttonStyle: React.CSSProperties = {
  padding: '8px 12px',
  borderRadius: 8,
  border: '1px solid #ccc',
  background: 'white',
  cursor: 'pointer',
  fontWeight: 600
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
  // Datos del cliente
  const [clientName, setClientName] = useState('');
  const [clientDate, setClientDate] = useState(new Date().toISOString().split('T')[0]);

  // Datos del préstamo
  const [loanAmount, setLoanAmount] = useState('225000');
  const [interestRate, setInterestRate] = useState('28');
  const [term, setTerm] = useState('5');
  const [termType, setTermType] = useState<'months' | 'years'>('years');
  const [rateType, setRateType] = useState<'annual' | 'monthly'>('annual');
  const [method, setMethod] = useState<'frances' | 'aleman'>('frances');
  const [schedule, setSchedule] = useState<ScheduleRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copyStatus, setCopyStatus] = useState<string>("");

  const printRef = useRef<HTMLDivElement>(null);

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
    
    // Agregar encabezado con logo (texto)
    lines.push('SISTEMA FINANCIERO');
    lines.push('CRONOGRAMA DE PAGOS');
    lines.push('');
    
    // Información del préstamo
    lines.push('VALORES DEL PRESTAMO');
    lines.push(`Importe del prestamo,$${formatMoney(parseFloat(loanAmount))}`);
    lines.push(`Tasa de interes anual,${interestRate}%`);
    lines.push(`Periodo del prestamo en años,${termType === 'years' ? term : (parseInt(term) / 12).toFixed(1)}`);
    if (clientDate) lines.push(`Fecha de inicio del prestamo,${clientDate}`);
    lines.push('');
    
    // Resumen
    lines.push('RESUMEN DEL PRESTAMO');
    lines.push(`Pago mensual,$${formatMoney(schedule.length > 0 ? Number(schedule[0].payment) : 0)}`);
    lines.push(`Numero de pagos,${schedule.length}`);
    lines.push(`Importe total de los intereses,$${formatMoney(totalInterest)}`);
    lines.push(`Costo total del prestamo,$${formatMoney(totalPayment)}`);
    lines.push('');
    
    // Datos del cliente
    if (clientName) {
      lines.push('DATOS DEL CLIENTE');
      lines.push(`Cliente,${clientName}`);
      lines.push(`Fecha,${clientDate}`);
      lines.push('');
    }
    
    // Tabla
    const headers = ["N° de pago", "Fecha de pago", "Saldo Inicial", "Pago", "Capital", "Intereses", "Saldo Final"];
    lines.push(headers.join(","));

    for (const r of rows) {
      const fechaPago = clientDate ? calcularFechaPago(clientDate, r.period) : '';
      const values = [
        r.period,
        fechaPago,
        Number(r.balance) + Number(r.principal),
        Number(r.payment).toFixed(2),
        Number(r.principal).toFixed(2),
        Number(r.interest).toFixed(2),
        Number(r.balance).toFixed(2),
      ].map(escapeCSV);
      lines.push(values.join(","));
    }

    return lines.join("\n");
  };

  const calcularFechaPago = (fechaInicio: string, periodo: number): string => {
    const fecha = new Date(fechaInicio);
    fecha.setMonth(fecha.getMonth() + periodo);
    return fecha.toLocaleDateString('es-EC', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const escapeCSV = (value: string | number): string => {
    const s = String(value);
    if (/[",\n]/.test(s)) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };

  const downloadTextFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const csv = useMemo(() => buildCSV(schedule), [schedule, clientName, clientDate, loanAmount, method, interestRate, term, termType, totalPayment, totalInterest]);

  const handleDownloadCSV = () => {
    const filename = `cronograma_pagos_${new Date().toISOString().slice(0, 10)}.csv`;
    downloadTextFile(csv, filename, "text/csv;charset=utf-8;");
  };

  const handleCopyCSV = async () => {
    try {
      await navigator.clipboard.writeText(csv);
      setCopyStatus("Copiado al portapapeles.");
      window.setTimeout(() => setCopyStatus(""), 2000);
    } catch {
      setCopyStatus("No se pudo copiar. (Revise permisos del navegador)");
      window.setTimeout(() => setCopyStatus(""), 2500);
    }
  };

  // ==================== IMPRIMIR ====================
  const handlePrint = () => {
    window.print();
  };

  // ==================== DESCARGAR PDF ====================
  const handleDownloadPDF = async () => {
    const element = printRef.current;
    if (!element) return;

    try {
      const html2canvas = (await import('html2canvas')).default;
      const jsPDF = (await import('jspdf')).default;

      const canvas = await html2canvas(element, {
        scale: 2,
        logging: false,
        useCORS: true,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 5;

      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      pdf.save(`cronograma_pagos_${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (error) {
      console.error('Error al generar PDF:', error);
      alert('Error al generar el PDF. Por favor intente de nuevo.');
    }
  };

  // ==================== RENDER ====================
  return (
    <div style={{ padding: 16, maxWidth: 1100, margin: "0 auto" }}>
      {/* ENCABEZADO MEJORADO - SIN LOGO EN PANTALLA */}
      <div style={{ 
        marginBottom: 24,
        paddingBottom: 16,
        borderBottom: '2px solid #e0e0e0'
      }} className="no-print">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <div>
            <h2 style={{ 
              margin: 0, 
              fontSize: 28, 
              fontWeight: 700, 
              color: '#0A3143',
              letterSpacing: '-0.5px'
            }}>
              Amortización
            </h2>
            <p style={{ 
              margin: 0, 
              fontSize: 14, 
              color: '#666',
              fontWeight: 500,
              marginTop: 2
            }}>
              Calculadora de tablas de amortización
            </p>
          </div>
        </div>
      </div>

      {/* FORMULARIO DE ENTRADA */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }} className="no-print">
        {/* COLUMNA IZQUIERDA */}
        <section style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: 'linear-gradient(135deg, #276E90 0%, #0A3143 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(39, 110, 144, 0.3)'
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10 9 9 9 8 9"/>
              </svg>
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#0A3143' }}>
                Entradas
              </h3>
              <p style={{ margin: 0, fontSize: 12, color: '#666', marginTop: 2 }}>
                Parámetros del préstamo
              </p>
            </div>
          </div>

          {/* DATOS DEL CLIENTE */}
          <div style={{ 
            background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
            borderRadius: 8,
            padding: 12,
            marginBottom: 16,
            border: '1px solid #bae6fd'
          }}>
            <h4 style={{ 
              margin: 0, 
              fontSize: 13, 
              fontWeight: 700, 
              color: '#0369a1',
              marginBottom: 12,
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              Datos del Cliente
            </h4>
            
            <label style={{...labelStyle, marginBottom: 8}}>
              Nombre del Cliente
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                style={inputStyle}
                placeholder="Ej: Juan Pérez"
              />
            </label>

            <label style={{...labelStyle, marginBottom: 0}}>
              Fecha
              <input
                type="date"
                value={clientDate}
                onChange={(e) => setClientDate(e.target.value)}
                style={inputStyle}
              />
            </label>
          </div>

          <label style={labelStyle}>
            Método
            <select value={method} onChange={(e) => setMethod(e.target.value as 'frances' | 'aleman')} style={inputStyle}>
              <option value="frances">Francés (Cuota Fija)</option>
              <option value="aleman">Alemán (Amortización Fija)</option>
            </select>
          </label>

          <label style={labelStyle}>
            Monto del Préstamo
            <input
              type="number"
              value={loanAmount}
              onChange={(e) => setLoanAmount(e.target.value)}
              style={inputStyle}
              min={0}
            />
          </label>

          {/* TASA DE INTERÉS CON SELECTOR */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 10 }}>
            <label style={labelStyle}>
              Tasa de Interés (%)
              <input
                type="number"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
                style={inputStyle}
                step="0.01"
              />
            </label>

            <label style={labelStyle}>
              Tipo
              <select
                value={rateType}
                onChange={(e) => setRateType(e.target.value as 'annual' | 'monthly')}
                style={inputStyle}
              >
                <option value="annual">Anual</option>
                <option value="monthly">Mensual</option>
              </select>
            </label>
          </div>

          {/* PLAZO CON SELECTOR */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 10 }}>
            <label style={labelStyle}>
              Plazo
              <input
                type="number"
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                style={inputStyle}
                min={0}
              />
            </label>

            <label style={labelStyle}>
              Unidad
              <select
                value={termType}
                onChange={(e) => setTermType(e.target.value as 'years' | 'months')}
                style={inputStyle}
              >
                <option value="years">Años</option>
                <option value="months">Meses</option>
              </select>
            </label>
          </div>

          <button
            type="button"
            onClick={calculateAmortization}
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: 10,
              border: 'none',
              background: isLoading 
                ? 'linear-gradient(135deg, #94a3b8 0%, #64748b 100%)' 
                : 'linear-gradient(135deg, #0A3143 0%, #276E90 100%)',
              color: 'white',
              fontWeight: 700,
              fontSize: 15,
              cursor: isLoading ? 'not-allowed' : 'pointer',
              boxShadow: isLoading ? 'none' : '0 4px 12px rgba(10, 49, 67, 0.3)',
              transition: 'all 0.3s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              marginTop: 12
            }}
          >
            {isLoading ? (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10" opacity="0.25"/>
                  <path d="M12 2a10 10 0 0 1 10 10">
                    <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite"/>
                  </path>
                </svg>
                Calculando...
              </>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <rect x="3" y="3" width="18" height="18" rx="2"/>
                  <line x1="3" y1="9" x2="21" y2="9"/>
                  <line x1="9" y1="21" x2="9" y2="9"/>
                </svg>
                Generar Tabla
              </>
            )}
          </button>
        </section>

        {/* COLUMNA DERECHA - EXPLICACIÓN */}
        <section style={{
          ...cardStyle,
          background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
          border: '1px solid #e0e0e0'
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 16 }}>
            <div style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: 'linear-gradient(135deg, #0A3143 0%, #276E90 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 4px 12px rgba(10, 49, 67, 0.2)'
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                <path d="M2 17l10 5 10-5"/>
                <path d="M2 12l10 5 10-5"/>
              </svg>
            </div>

            <div style={{ flex: 1 }}>
              <h3 style={{ 
                margin: 0, 
                fontSize: 18, 
                fontWeight: 700, 
                color: '#0A3143',
                marginBottom: 4
              }}>
                Explicación académica
              </h3>
              <p style={{ 
                margin: 0, 
                fontSize: 12, 
                color: '#666',
                fontWeight: 500
              }}>
                Fundamentos del método {method === 'frances' ? 'francés' : 'alemán'}
              </p>
            </div>
          </div>

          <div style={{
            background: 'white',
            borderRadius: 10,
            padding: 16,
            border: '1px solid #f0f0f0',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
          }}>
            {method === 'frances' ? (
              <>
                <p style={{ 
                  marginTop: 0, 
                  marginBottom: 16, 
                  color: '#333',
                  lineHeight: 1.6,
                  fontSize: 14
                }}>
                  En el <strong style={{ color: '#0A3143' }}>método francés</strong>, la cuota total es constante durante toda la vida del préstamo.
                </p>
                <ul style={{ 
                  marginTop: 0, 
                  marginBottom: 0,
                  paddingLeft: 20,
                  color: '#555',
                  lineHeight: 1.8,
                  fontSize: 13
                }}>
                  <li style={{ marginBottom: 8 }}>La cuota se calcula usando la fórmula de anualidad.</li>
                  <li style={{ marginBottom: 8 }}>Al inicio, la mayor parte de la cuota cubre intereses.</li>
                  <li style={{ marginBottom: 8 }}>Con el tiempo, la proporción de capital amortizado aumenta.</li>
                  <li>El saldo se reduce gradualmente hasta llegar a cero.</li>
                </ul>
              </>
            ) : (
              <>
                <p style={{ 
                  marginTop: 0, 
                  marginBottom: 16, 
                  color: '#333',
                  lineHeight: 1.6,
                  fontSize: 14
                }}>
                  En el <strong style={{ color: '#0A3143' }}>método alemán</strong>, la amortización de capital es constante en cada periodo.
                </p>
                <ul style={{ 
                  marginTop: 0, 
                  marginBottom: 0,
                  paddingLeft: 20,
                  color: '#555',
                  lineHeight: 1.8,
                  fontSize: 13
                }}>
                  <li style={{ marginBottom: 8 }}>Amortización = Monto / Número de periodos.</li>
                  <li style={{ marginBottom: 8 }}>Los intereses se calculan sobre el saldo pendiente.</li>
                  <li style={{ marginBottom: 8 }}>La cuota total disminuye con el tiempo.</li>
                  <li>Al inicio las cuotas son más altas, al final más bajas.</li>
                </ul>
              </>
            )}
          </div>
        </section>
      </div>

      {/* RESULTADOS */}
      {schedule.length > 0 && (
        <div ref={printRef}>
          {/* ENCABEZADO PARA IMPRESIÓN/PDF */}
          <div style={{ display: 'none' }} className="print-only">
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              marginBottom: 20, 
              paddingBottom: 16, 
              borderBottom: '3px solid #276E90',
              background: 'linear-gradient(135deg, #f0f9ff 0%, #ffffff 100%)',
              padding: '16px',
              borderRadius: '10px 10px 0 0'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <SystemLogo size={60} />
                <div>
                  <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#0A3143', letterSpacing: '-0.5px' }}>
                    SISTEMA FINANCIERO
                  </h1>
                  <h2 style={{ margin: '4px 0 0', fontSize: 16, fontWeight: 600, color: '#276E90' }}>
                    CRONOGRAMA DE PAGOS
                  </h2>
                </div>
              </div>
            </div>
            
            {/* VALORES DEL PRÉSTAMO */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr', 
              gap: 16, 
              marginBottom: 16 
            }}>
              <div style={{ 
                background: '#fef9e7',
                borderRadius: 8,
                padding: 12,
                border: '2px solid #f4d03f'
              }}>
                <h3 style={{ 
                  margin: '0 0 12px', 
                  fontSize: 13, 
                  fontWeight: 700, 
                  color: '#0A3143',
                  background: '#f4d03f',
                  padding: '6px 10px',
                  borderRadius: 4,
                  textAlign: 'center'
                }}>
                  VALORES DEL PRÉSTAMO
                </h3>
                <table style={{ width: '100%', fontSize: 11 }}>
                  <tbody>
                    <tr>
                      <td style={{ padding: '4px 0', color: '#555' }}>Importe del préstamo</td>
                      <td style={{ padding: '4px 0', textAlign: 'right', fontWeight: 600 }}>${formatMoney(parseFloat(loanAmount))}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '4px 0', color: '#555' }}>Tasa de interés anual</td>
                      <td style={{ padding: '4px 0', textAlign: 'right', fontWeight: 600 }}>{interestRate}%</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '4px 0', color: '#555' }}>Periodo del préstamo en años</td>
                      <td style={{ padding: '4px 0', textAlign: 'right', fontWeight: 600 }}>
                        {termType === 'years' ? term : (parseInt(term) / 12).toFixed(1)}
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: '4px 0', color: '#555' }}>Fecha de inicio del préstamo</td>
                      <td style={{ padding: '4px 0', textAlign: 'right', fontWeight: 600 }}>{clientDate}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div style={{ 
                background: '#fef9e7',
                borderRadius: 8,
                padding: 12,
                border: '2px solid #f4d03f'
              }}>
                <h3 style={{ 
                  margin: '0 0 12px', 
                  fontSize: 13, 
                  fontWeight: 700, 
                  color: '#0A3143',
                  background: '#f4d03f',
                  padding: '6px 10px',
                  borderRadius: 4,
                  textAlign: 'center'
                }}>
                  RESUMEN DEL PRÉSTAMO
                </h3>
                <table style={{ width: '100%', fontSize: 11 }}>
                  <tbody>
                    <tr>
                      <td style={{ padding: '4px 0', color: '#555' }}>Pago mensual</td>
                      <td style={{ padding: '4px 0', textAlign: 'right', fontWeight: 600 }}>
                        ${formatMoney(schedule.length > 0 ? Number(schedule[0].payment) : 0)}
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: '4px 0', color: '#555' }}>Número de pagos</td>
                      <td style={{ padding: '4px 0', textAlign: 'right', fontWeight: 600 }}>{schedule.length}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '4px 0', color: '#555' }}>Importe total de los intereses</td>
                      <td style={{ padding: '4px 0', textAlign: 'right', fontWeight: 600 }}>${formatMoney(totalInterest)}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '4px 0', color: '#555' }}>Costo total del préstamo</td>
                      <td style={{ padding: '4px 0', textAlign: 'right', fontWeight: 600 }}>${formatMoney(totalPayment)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Datos del cliente */}
            {clientName && (
              <div style={{ 
                marginBottom: 16, 
                padding: 10, 
                background: '#e8f4f8', 
                borderRadius: 8,
                border: '1px solid #276E90'
              }}>
                <p style={{ margin: '2px 0', fontSize: 11, color: '#0A3143' }}>
                  <strong>Cliente:</strong> {clientName}
                </p>
              </div>
            )}
          </div>

          <section style={{ ...cardStyle, marginTop: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }} className="no-print">
              <div style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)'
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                </svg>
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#0A3143' }}>
                  Resultados
                </h3>
                <p style={{ margin: 0, fontSize: 12, color: '#666', marginTop: 2 }}>
                  Análisis financiero completo
                </p>
              </div>
            </div>

            {/* RESUMEN */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }} className="no-print">
              <div style={{ 
                padding: 16, 
                border: '1px solid #e0e0e0', 
                borderRadius: 10,
                background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
              }}>
                <div style={{ fontSize: 11, opacity: 0.7, fontWeight: 600, color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Monto Préstamo</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: '#0A3143', marginTop: 8 }}>${formatMoney(parseFloat(loanAmount))}</div>
              </div>
              <div style={{ 
                padding: 16, 
                border: '1px solid #e0f2fe', 
                borderRadius: 10,
                background: 'linear-gradient(135deg, #e0f2fe 0%, #ffffff 100%)',
                boxShadow: '0 2px 8px rgba(14, 165, 233, 0.1)'
              }}>
                <div style={{ fontSize: 11, opacity: 0.7, fontWeight: 600, color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Pagado</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: '#0369a1', marginTop: 8 }}>${formatMoney(totalPayment)}</div>
              </div>
              <div style={{ 
                padding: 16, 
                border: '1px solid #fef3c7', 
                borderRadius: 10,
                background: 'linear-gradient(135deg, #fef3c7 0%, #ffffff 100%)',
                boxShadow: '0 2px 8px rgba(245, 158, 11, 0.1)'
              }}>
                <div style={{ fontSize: 11, opacity: 0.7, fontWeight: 600, color: '#d97706', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Intereses</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: '#b45309', marginTop: 8 }}>${formatMoney(totalInterest)}</div>
              </div>
              <div style={{ 
                padding: 16, 
                border: '1px solid #dcfce7', 
                borderRadius: 10,
                background: 'linear-gradient(135deg, #dcfce7 0%, #ffffff 100%)',
                boxShadow: '0 2px 8px rgba(16, 185, 129, 0.1)'
              }}>
                <div style={{ fontSize: 11, opacity: 0.7, fontWeight: 600, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Capital</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: '#047857', marginTop: 8 }}>${formatMoney(totalPrincipal)}</div>
              </div>
            </div>

            {/* ACCIONES */}
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 16, flexWrap: 'wrap' }} className="no-print">
              <button 
                type="button" 
                onClick={handleDownloadCSV} 
                style={{
                  ...buttonStyle,
                  background: 'linear-gradient(135deg, #0A3143 0%, #276E90 100%)',
                  color: 'white',
                  border: 'none',
                  boxShadow: '0 2px 8px rgba(10, 49, 67, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                CSV
              </button>

              <button 
                type="button" 
                onClick={handleDownloadPDF} 
                style={{
                  ...buttonStyle,
                  background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                  color: 'white',
                  border: 'none',
                  boxShadow: '0 2px 8px rgba(220, 38, 38, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                </svg>
                PDF
              </button>

              <button 
                type="button" 
                onClick={handlePrint} 
                style={{
                  ...buttonStyle,
                  background: 'white',
                  color: '#0A3143',
                  border: '1px solid #e0e0e0',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 6 2 18 2 18 9"/>
                  <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
                  <rect x="6" y="14" width="12" height="8"/>
                </svg>
                Imprimir
              </button>

              <button 
                type="button" 
                onClick={handleCopyCSV} 
                style={{
                  ...buttonStyle,
                  background: 'white',
                  color: '#0A3143',
                  border: '1px solid #e0e0e0',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                </svg>
                Copiar
              </button>

              {copyStatus && (
                <span style={{ 
                  fontSize: 13, 
                  color: '#059669',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  {copyStatus}
                </span>
              )}
            </div>

            {/* TABLA */}
            <div style={{ marginTop: 12, overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'linear-gradient(135deg, #f4d03f 0%, #f9e79f 100%)' }}>
                    {["N° de pago", "Fecha de pago", "Saldo Inicial", "Pago", "Capital", "Intereses", "Saldo Final"].map((h) => (
                      <th key={h} style={thStyle}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {schedule.map((row, index) => {
                    const fechaPago = calcularFechaPago(clientDate, row.period);
                    const saldoInicial = Number(row.balance) + Number(row.principal);
                    
                    return (
                      <tr key={index} style={{ 
                        backgroundColor: index % 2 === 0 ? '#f8f9fa' : 'white'
                      }}>
                        <td style={tdStyle}>{row.period}</td>
                        <td style={tdStyle}>{fechaPago}</td>
                        <td style={tdStyle}>${formatMoney(saldoInicial)}</td>
                        <td style={tdStyle}>${formatMoney(Number(row.payment))}</td>
                        <td style={tdStyle}>${formatMoney(Number(row.principal))}</td>
                        <td style={tdStyle}>${formatMoney(Number(row.interest))}</td>
                        <td style={tdStyle}>${formatMoney(Number(row.balance))}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}

      {/* ESTILOS PARA IMPRESIÓN */}
      <style>{`
        @media print {
          .no-print {
            display: none !important;
          }
          .print-only {
            display: block !important;
          }
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          table {
            page-break-inside: auto;
          }
          tr {
            page-break-inside: avoid;
            page-break-after: auto;
          }
          thead {
            display: table-header-group;
          }
        }
        .print-only {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default AmortizationPage;