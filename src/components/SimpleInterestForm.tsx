import { useMemo, useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { Printer, User, Calendar, DollarSign, Percent, FileText, FileSpreadsheet } from "lucide-react";
// Importamos la API de clientes
import { getCustomers, type Customer } from '../api/financialApi';

type InterestType = "simple" | "compound";

type Row = {
  period: number;
  start: number;
  interest: number;
  end: number;
};

// --- ESTILOS ---
const styles = {
  page: {
    background: "white", // Fondo blanco para que se integre mejor sin tarjeta externa
    borderRadius: 20,
    padding: 20,
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

  grid2: {
    display: "grid",
    gridTemplateColumns: "1.2fr 1fr",
    gap: 24,
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
  } as React.CSSProperties,

  formGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 16,
  } as React.CSSProperties,

  field: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  } as React.CSSProperties,

  label: {
    fontSize: 13,
    color: "#334155",
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    gap: 6
  } as React.CSSProperties,

  input: {
    padding: "10px 12px",
    borderRadius: 8,
    border: "1px solid #cbd5e1",
    outline: "none",
    fontSize: 14,
    transition: "border-color 0.2s",
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

  btnRow: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
    marginTop: 24,
  } as React.CSSProperties,

  primaryBtn: {
    padding: "12px 20px",
    borderRadius: 8,
    border: "none",
    background: "#0f172a",
    color: "white",
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 4px 6px rgba(15, 23, 42, 0.2)",
  } as React.CSSProperties,

  ghostBtn: {
    padding: "12px 20px",
    borderRadius: 8,
    border: "1px solid #cbd5e1",
    background: "white",
    color: "#334155",
    fontWeight: 600,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
  } as React.CSSProperties,

  hint: {
    fontSize: 14,
    color: "#475569",
    lineHeight: 1.6,
  } as React.CSSProperties,

  metricsGrid: {
    marginTop: 24,
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: 16,
  } as React.CSSProperties,

  metric: {
    background: "white",
    borderRadius: 12,
    padding: 20,
    border: "1px solid #e2e8f0",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
  } as React.CSSProperties,

  metricLabel: {
    color: "#64748b",
    fontSize: 13,
    fontWeight: 600,
    marginBottom: 4,
  } as React.CSSProperties,

  metricValue: {
    fontSize: 24,
    fontWeight: 800,
    color: "#0f172a",
  } as React.CSSProperties,

  sectionTitle: {
    marginTop: 32,
    marginBottom: 16,
    fontSize: 20,
    fontWeight: 800,
    color: "#0f172a",
  } as React.CSSProperties,

  tableWrap: {
    background: "white",
    borderRadius: 16,
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
    border: "1px solid #e2e8f0",
    overflow: "hidden",
    overflowX: "auto",
  } as React.CSSProperties,

  table: {
    width: "100%",
    borderCollapse: "collapse",
    textAlign: "center",
    minWidth: 600,
  } as React.CSSProperties,

  th: {
    padding: "16px",
    fontWeight: 700,
    color: "white",
    background: "#0A3143",
    fontSize: 13,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  } as React.CSSProperties,

  td: {
    padding: "14px",
    color: "#334155",
    borderBottom: "1px solid #f1f5f9",
    fontSize: 14,
  } as React.CSSProperties,
};

export default function SimpleInterestForm() {
  const [capital, setCapital] = useState<number>(0);
  const [rate, setRate] = useState<number>(0);
  const [time, setTime] = useState<number>(0);
  const [type, setType] = useState<InterestType>("simple");

  const [clientName, setClientName] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));

  // --- ESTADOS PARA CLIENTES ---
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");

  const [rows, setRows] = useState<Row[]>([]);
  const [interestTotal, setInterestTotal] = useState(0);
  const [finalAmount, setFinalAmount] = useState(0);

  // Cargar clientes al inicio
  useEffect(() => {
    getCustomers()
      .then(data => setCustomers(data))
      .catch(err => console.error("Error cargando clientes:", err));
  }, []);

  // Al seleccionar cliente, rellenar nombre
  useEffect(() => {
    if (selectedCustomerId) {
      const customer = customers.find(c => String(c.id) === String(selectedCustomerId));
      if (customer) {
        // @ts-ignore
        const fullName = customer.full_name || `${customer.first_name} ${customer.last_name}`;
        setClientName(fullName);
      }
    }
  }, [selectedCustomerId, customers]);

  const canCalculate = useMemo(
    () => capital > 0 && rate > 0 && time > 0,
    [capital, rate, time]
  );

  const calculate = () => {
    if (!canCalculate) return;

    const data: Row[] = [];
    let current = capital;
    let totalInterest = 0;
    const r = rate / 100;

    for (let i = 1; i <= time; i++) {
      const interest = type === "simple" ? capital * r : current * r;
      const end = current + interest;

      data.push({ period: i, start: current, interest, end });

      if (type === "compound") {
          current = end;
      } else {
          current = end; 
      }
      
      totalInterest += interest;
    }

    setRows(data);
    setInterestTotal(totalInterest);
    setFinalAmount(capital + totalInterest);
  };

  const exportExcel = () => {
    if (rows.length === 0) return;

    const headerInfo = [
      ["Reporte", "Cálculo de Interés Simple y Compuesto"],
      ["Cliente", clientName || "—"],
      ["Fecha", date],
      ["Tipo", type === "simple" ? "Interés Simple" : "Interés Compuesto"],
      ["Capital", capital],
      ["Tasa anual (%)", rate],
      ["Tiempo (años)", time],
      [],
    ];

    const tableData = [
      ["Periodo", "Capital Inicial", "Interés", "Capital Final"],
      ...rows.map((r) => [
        r.period,
        Number(r.start.toFixed(2)),
        Number(r.interest.toFixed(2)),
        Number(r.end.toFixed(2)),
      ]),
    ];

    const summary = [
      [],
      ["Resumen", "", "", ""],
      ["Capital", Number(capital.toFixed(2)), "", ""],
      ["Interés generado", Number(interestTotal.toFixed(2)), "", ""],
      ["Monto final", Number(finalAmount.toFixed(2)), "", ""],
    ];

    const ws = XLSX.utils.aoa_to_sheet([...headerInfo, ...tableData, ...summary]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Interés");
    const out = XLSX.write(wb, { bookType: "xlsx", type: "array" });

    saveAs(
      new Blob([out], { type: "application/octet-stream" }),
      "calculo-interes.xlsx"
    );
  };

  // ✅ NUEVA FUNCIÓN DE IMPRESIÓN (ABRE VISTA PREVIA)
  const handlePrint = () => {
    window.print();
  };

  const formatMoney = (val: number) => `$${val.toFixed(2)}`;

  return (
    <div style={styles.page}>
      
      {/* HEADER VISUAL EN PANTALLA */}
      <div style={styles.headerContainer} className="no-print">
         <img 
            src="/logo.png" 
            alt="Logo Sistema Financiero" 
            style={{ width: 48, height: 48, objectFit: 'contain' }}
            onError={(e) => { (e.target as HTMLImageElement).src = '/LOGOSF.png'; }}
         />
         <div>
            <h1 style={styles.title}>Cálculo de Interés</h1>
            <p style={styles.subtitle}>Herramienta de proyección financiera</p>
         </div>
      </div>

      <div style={styles.grid2} className="no-print">
        {/* FORMULARIO */}
        <div style={styles.card}>
          <div style={styles.cardTitle}>Datos del Préstamo</div>

          <div style={styles.formGrid}>
            <div style={styles.field}>
              <label style={styles.label}><DollarSign size={16}/> Capital ($)</label>
              <input
                style={styles.input}
                type="number"
                value={capital || ""}
                onChange={(e) => setCapital(Number(e.target.value))}
                placeholder="Ej: 10000"
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}><Percent size={16}/> Tasa anual (%)</label>
              <input
                style={styles.input}
                type="number"
                value={rate || ""}
                onChange={(e) => setRate(Number(e.target.value))}
                placeholder="Ej: 12"
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}><Calendar size={16}/> Tiempo (años)</label>
              <input
                style={styles.input}
                type="number"
                value={time || ""}
                onChange={(e) => setTime(Number(e.target.value))}
                placeholder="Ej: 5"
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}><FileText size={16}/> Tipo de interés</label>
              <select
                style={styles.select}
                value={type}
                onChange={(e) => setType(e.target.value as InterestType)}
              >
                <option value="simple">Interés Simple</option>
                <option value="compound">Interés Compuesto</option>
              </select>
            </div>
          </div>

          <div style={{ marginTop: 14 }}>
            {/* SELECTOR DE CLIENTE */}
            <div style={{background: '#f0f9ff', padding: 12, borderRadius: 8, border: '1px solid #bae6fd', marginBottom: 12}}>
                <label style={{...styles.label, color: '#0369a1', marginBottom: 8}}>
                    <User size={16}/> Cliente (Opcional)
                </label>
                <select 
                    value={selectedCustomerId} 
                    onChange={(e) => setSelectedCustomerId(e.target.value)} 
                    style={{...styles.select, marginBottom: 8}}
                >
                    <option value="">-- Seleccionar de la lista --</option>
                    {customers.map(c => (
                        <option key={c.id} value={c.id}>
                            {/* @ts-ignore */}
                            {(c as any).full_name || `${c.first_name} ${c.last_name}`}
                        </option>
                    ))}
                </select>
                <input
                    style={styles.input}
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Nombre manual (si no está en lista)"
                    disabled={!!selectedCustomerId}
                />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Fecha</label>
              <input
                style={styles.input}
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>

          <div style={styles.btnRow}>
            <button
              style={styles.primaryBtn}
              onClick={calculate}
              disabled={!canCalculate}
            >
              Calcular Proyección
            </button>

            {/* AHORA ABRE VISTA PREVIA IGUAL QUE DEPRECIACIÓN */}
            <button
              style={styles.ghostBtn}
              onClick={handlePrint} 
              disabled={rows.length === 0}
            >
              <Printer size={16} style={{marginRight: 8}}/>
              Imprimir / PDF
            </button>

            <button
              style={styles.ghostBtn}
              onClick={exportExcel}
              disabled={rows.length === 0}
            >
              <FileSpreadsheet size={16} style={{marginRight: 8}}/>
              Excel
            </button>
          </div>

          {!canCalculate && (
            <div
              style={{
                marginTop: 12,
                color: "#64748b",
                fontSize: 13,
                fontStyle: "italic",
              }}
            >
              * Ingresa valores numéricos válidos para habilitar el cálculo.
            </div>
          )}
        </div>

        {/* CARD EXPLICACIÓN */}
        <div style={styles.card}>
          <div style={styles.cardTitle}>Guía Rápida</div>
          <div style={styles.hint}>
            <p style={{marginBottom: 12}}>
              <strong>Interés Simple:</strong> Los intereses se calculan siempre sobre el capital inicial. El dinero crece de forma lineal. Ideal para préstamos cortos.
            </p>
            <p style={{marginBottom: 12}}>
              <strong>Interés Compuesto:</strong> Los intereses se suman al capital (se capitalizan) para generar nuevos intereses. Crecimiento exponencial. Ideal para inversiones.
            </p>
            <div style={{background: '#f1f5f9', padding: 12, borderRadius: 8, marginTop: 16}}>
                <code style={{display: 'block', marginBottom: 4, color: '#0f172a'}}>I = C · i · t (Simple)</code>
                <code style={{display: 'block', color: '#0f172a'}}>M = C · (1 + i)^t (Compuesto)</code>
            </div>
          </div>
        </div>
      </div>

      {/* ===== RESULTADOS (ZONA PANTALLA) ===== */}
      {rows.length > 0 && (
        <div className="no-print">
          <div style={styles.metricsGrid}>
            <div style={styles.metric}>
              <div style={styles.metricLabel}>Capital Invertido</div>
              <div style={styles.metricValue}>${capital.toFixed(2)}</div>
            </div>

            <div style={{...styles.metric, borderLeft: '4px solid #22c55e'}}>
              <div style={styles.metricLabel}>Interés Total Ganado</div>
              <div style={{...styles.metricValue, color: '#16a34a'}}>${interestTotal.toFixed(2)}</div>
            </div>

            <div style={{...styles.metric, borderLeft: '4px solid #0f172a'}}>
              <div style={styles.metricLabel}>Monto Final Acumulado</div>
              <div style={styles.metricValue}>${finalAmount.toFixed(2)}</div>
            </div>
          </div>

          <div style={styles.sectionTitle}>Tabla de Proyección</div>

          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Periodo</th>
                  <th style={styles.th}>Capital inicial</th>
                  <th style={styles.th}>Interés Ganado</th>
                  <th style={styles.th}>Capital final</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={r.period} style={{background: i % 2 === 0 ? 'white' : '#f8fafc', borderBottom: '1px solid #f1f5f9'}}>
                    <td style={styles.td}>{r.period}</td>
                    <td style={styles.td}>${r.start.toFixed(2)}</td>
                    <td style={{...styles.td, color: '#16a34a', fontWeight: 600}}>+${r.interest.toFixed(2)}</td>
                    <td style={{ ...styles.td, fontWeight: 900, color: "#0f172a" }}>
                      ${r.end.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ===== RESULTADOS (ZONA IMPRESIÓN OCULTA) ===== */}
      <div id="printable-area" style={{ display: 'none' }}>
          {/* ENCABEZADO DE REPORTE */}
          <div className="print-only-header" style={{ marginBottom: '30px', fontFamily: 'Arial, sans-serif' }}>
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

              <h1 style={{ fontSize: '24px', color: '#1e293b', marginBottom: '20px' }}>Cálculo de Interés {type === 'simple' ? 'Simple' : 'Compuesto'}</h1>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', fontSize: '14px', color: '#334155', marginBottom: '30px' }}>
                <div><strong>Cliente:</strong> {clientName || 'Consumidor Final'}</div>
                <div><strong>Fecha:</strong> {date}</div>
                <div><strong>Capital Inicial:</strong> {formatMoney(capital)}</div>
                <div><strong>Tasa Anual:</strong> {rate}%</div>
                <div><strong>Tiempo:</strong> {time} años</div>
              </div>
          </div>

          {/* TABLA DE IMPRESIÓN */}
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', fontFamily: 'Arial, sans-serif' }}>
              <thead>
                <tr style={{ background: '#0A3143', color: 'white' }}> 
                  <th style={{ padding: '10px', textAlign: 'center' }}>Periodo</th>
                  <th style={{ padding: '10px', textAlign: 'center' }}>Capital Inicial</th>
                  <th style={{ padding: '10px', textAlign: 'right' }}>Interés Ganado</th>
                  <th style={{ padding: '10px', textAlign: 'right' }}>Capital Final</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={r.period} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '8px', textAlign: 'center' }}>{r.period}</td>
                    <td style={{ padding: '8px', textAlign: 'center' }}>{formatMoney(r.start)}</td>
                    <td style={{ padding: '8px', textAlign: 'right' }}>{formatMoney(r.interest)}</td>
                    <td style={{ padding: '8px', textAlign: 'right', fontWeight: 'bold' }}>{formatMoney(r.end)}</td>
                  </tr>
                ))}
              </tbody>
          </table>

          {/* TOTALES AL PIE */}
          <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end', gap: 30, fontSize: '14px', fontWeight: 'bold' }}>
             <div>Interés Total: {formatMoney(interestTotal)}</div>
             <div>Monto Final: {formatMoney(finalAmount)}</div>
          </div>
      </div>

      {/* --- ESTILOS DE IMPRESIÓN CORREGIDOS --- */}
      <style>{`
        @media print {
          /* 1. Ocultar todo lo que no sea necesario */
          body * { visibility: hidden; }
          .no-print { display: none !important; }

          /* 2. Mostrar el área de impresión y sus hijos */
          #printable-area { 
            visibility: visible !important; 
            display: block !important; 
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 20px !important;
          }
          
          #printable-area * { visibility: visible !important; }

          /* 3. FORZAR ESTRUCTURA DE TABLA (La clave está aquí) */
          #printable-area table { 
            display: table !important; 
            width: 100% !important; 
            border-collapse: collapse !important;
          }
          #printable-area thead { display: table-header-group !important; }
          #printable-area tbody { display: table-row-group !important; }
          #printable-area tr { display: table-row !important; }
          #printable-area th, #printable-area td { 
            display: table-cell !important; 
            border: 1px solid #e2e8f0 !important;
            padding: 8px !important;
          }
          
          /* 4. Colores y Ajustes Visuales */
          thead tr { 
            background: #0A3143 !important; 
            color: white !important; 
            -webkit-print-color-adjust: exact; 
            print-color-adjust: exact; 
          }
        }
      `}</style>
    </div>
    
  );
  
}
