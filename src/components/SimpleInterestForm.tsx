import { useMemo, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

type InterestType = "simple" | "compound";

type Row = {
  period: number;
  start: number;
  interest: number;
  end: number;
};

const styles = {
  page: {
    background: "#f8fafc",
    borderRadius: 20,
    padding: 28,
  } as React.CSSProperties,

  title: {
    fontWeight: 900,
    fontSize: 34,
    margin: "0 0 18px",
    color: "#0f172a",
    letterSpacing: -0.5,
  } as React.CSSProperties,

  subtitle: {
    marginTop: -6,
    marginBottom: 22,
    color: "#475569",
    fontSize: 14,
  } as React.CSSProperties,

  grid2: {
    display: "grid",
    gridTemplateColumns: "1.2fr 1fr",
    gap: 18,
  } as React.CSSProperties,

  card: {
    background: "white",
    borderRadius: 16,
    padding: 18,
    boxShadow: "0 10px 20px rgba(2, 6, 23, 0.06)",
    border: "1px solid rgba(15, 23, 42, 0.08)",
  } as React.CSSProperties,

  cardTitle: {
    fontWeight: 800,
    color: "#0f172a",
    margin: "0 0 12px",
    fontSize: 16,
  } as React.CSSProperties,

  formGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 14,
  } as React.CSSProperties,

  field: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  } as React.CSSProperties,

  label: {
    fontSize: 13,
    color: "#334155",
    fontWeight: 700,
  } as React.CSSProperties,

  input: {
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid rgba(15, 23, 42, 0.18)",
    outline: "none",
    fontSize: 14,
  } as React.CSSProperties,

  select: {
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid rgba(15, 23, 42, 0.18)",
    outline: "none",
    fontSize: 14,
    background: "white",
  } as React.CSSProperties,

  btnRow: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
    marginTop: 14,
  } as React.CSSProperties,

  primaryBtn: {
    padding: "12px 18px",
    borderRadius: 12,
    border: "none",
    background: "#0f3d4c",
    color: "white",
    fontWeight: 800,
    cursor: "pointer",
  } as React.CSSProperties,

  ghostBtn: {
    padding: "12px 18px",
    borderRadius: 12,
    border: "1px solid rgba(15, 23, 42, 0.18)",
    background: "white",
    color: "#0f172a",
    fontWeight: 800,
    cursor: "pointer",
  } as React.CSSProperties,

  hint: {
    fontSize: 13,
    color: "#475569",
    lineHeight: 1.5,
  } as React.CSSProperties,

  metricsGrid: {
    marginTop: 18,
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 12,
  } as React.CSSProperties,

  metric: {
    background: "white",
    borderRadius: 16,
    padding: 16,
    boxShadow: "0 10px 20px rgba(2, 6, 23, 0.06)",
    border: "1px solid rgba(15, 23, 42, 0.08)",
  } as React.CSSProperties,

  metricLabel: {
    color: "#475569",
    fontSize: 13,
    fontWeight: 700,
  } as React.CSSProperties,

  metricValue: {
    marginTop: 6,
    fontSize: 22,
    fontWeight: 900,
    color: "#0f172a",
  } as React.CSSProperties,

  sectionTitle: {
    marginTop: 22,
    marginBottom: 10,
    fontSize: 18,
    fontWeight: 900,
    color: "#0f172a",
  } as React.CSSProperties,

  tableWrap: {
    background: "white",
    borderRadius: 16,
    padding: 14,
    boxShadow: "0 10px 20px rgba(2, 6, 23, 0.06)",
    border: "1px solid rgba(15, 23, 42, 0.08)",
    overflowX: "auto",
  } as React.CSSProperties,

  table: {
    width: "100%",
    borderCollapse: "collapse",
    textAlign: "center",
    minWidth: 680,
  } as React.CSSProperties,

  th: {
    padding: 12,
    fontWeight: 900,
    color: "#0f172a",
    background: "#f1f5f9",
    borderBottom: "1px solid rgba(15, 23, 42, 0.08)",
    fontSize: 13,
  } as React.CSSProperties,

  td: {
    padding: 12,
    color: "#334155",
    borderBottom: "1px solid rgba(15, 23, 42, 0.08)",
    fontSize: 13,
  } as React.CSSProperties,
};

export default function SimpleInterestForm() {
  const [capital, setCapital] = useState<number>(0);
  const [rate, setRate] = useState<number>(0);
  const [time, setTime] = useState<number>(0);
  const [type, setType] = useState<InterestType>("simple");

  const [clientName, setClientName] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));

  const [rows, setRows] = useState<Row[]>([]);
  const [interestTotal, setInterestTotal] = useState(0);
  const [finalAmount, setFinalAmount] = useState(0);

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

      current = end;
      totalInterest += interest;
    }

    setRows(data);
    setInterestTotal(totalInterest);
    setFinalAmount(current);
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

  // ✅ PDF con encabezado + logo + footer con fecha/hora y páginas
  const exportPDF = async () => {
    if (rows.length === 0) return;

    const doc = new jsPDF();

    const formatMoney = (n: number) => `$${n.toFixed(2)}`;

    const loadImageAsDataURL = (url: string) =>
      new Promise<string>((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");
          if (!ctx) return reject(new Error("No se pudo obtener contexto 2D"));
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL("image/png"));
        };
        img.onerror = () => reject(new Error("No se pudo cargar el logo"));
        img.src = url;
      });

    const marginX = 14;
    const headerHeight = 26;
    const footerHeight = 14;

    // Cargar logo desde /public
    let logoDataUrl = "";
    try {
      logoDataUrl = await loadImageAsDataURL("/LOGOSF.png");
    } catch {
      logoDataUrl = "";
    }

    // Header (se usará en cada página)
    const drawHeader = () => {
      const pageW = doc.internal.pageSize.getWidth();

      doc.setFillColor(241, 245, 249);
      doc.rect(0, 0, pageW, headerHeight, "F");

      if (logoDataUrl) {
        doc.addImage(logoDataUrl, "PNG", marginX, 4, 18, 18);
      }

      const titleX = logoDataUrl ? marginX + 22 : marginX;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(15, 23, 42);
      doc.text("Cooperativa — Sistema Financiero", titleX, 12);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(71, 85, 105);
      doc.text("Reporte generado automáticamente", titleX, 18);

      doc.setDrawColor(226, 232, 240);
      doc.line(marginX, headerHeight, pageW - marginX, headerHeight);
    };

    // Footer (se usará en cada página)
    const drawFooter = (pageNumber: number, totalPages: number) => {
      const pageH = doc.internal.pageSize.getHeight();
      const pageW = doc.internal.pageSize.getWidth();

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);

      doc.text(`Generado: ${new Date().toLocaleString()}`, marginX, pageH - 8);
      doc.text(
        `Página ${pageNumber} de ${totalPages}`,
        pageW - marginX,
        pageH - 8,
        { align: "right" }
      );
    };

    // --- Primera página ---
    drawHeader();

    let y = headerHeight + 10;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.setTextColor(15, 23, 42);
    doc.text("Cálculo de Interés Simple y Compuesto", marginX, y);
    y += 8;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(51, 65, 85);

    const infoLines = [
      `Cliente: ${clientName || "—"}`,
      `Fecha: ${date}`,
      `Tipo: ${type === "simple" ? "Interés Simple" : "Interés Compuesto"}`,
      `Capital: ${formatMoney(capital)}`,
      `Tasa anual: ${rate}%`,
      `Tiempo: ${time} años`,
    ];

    infoLines.forEach((line) => {
      doc.text(line, marginX, y);
      y += 6;
    });

    // Tabla con repetición de encabezado en cada página (didDrawPage)
    autoTable(doc, {
      startY: y + 4,
      margin: {
        top: headerHeight + 8,
        bottom: footerHeight + 6,
        left: marginX,
        right: marginX,
      },
      head: [["Periodo", "Capital Inicial", "Interés", "Capital Final"]],
      body: rows.map((r) => [
        r.period,
        r.start.toFixed(2),
        r.interest.toFixed(2),
        r.end.toFixed(2),
      ]),
      styles: { fontSize: 10 },
      headStyles: { fillColor: [15, 61, 76] },
      didDrawPage: () => {
        // Se ejecuta en cada página creada por la tabla
        drawHeader();
      },
    });

    // Resumen (si hay poco espacio, jsPDF lo baja, y si no cabe, crea página)
    const lastY = (doc as any).lastAutoTable?.finalY ?? y + 30;

    // Si el resumen se va a salir, creamos nueva página
    const pageH = doc.internal.pageSize.getHeight();
    if (lastY + 38 > pageH - footerHeight) {
      doc.addPage();
      drawHeader();
    }

    const startSummaryY =
      (doc as any).lastAutoTable?.finalY && (doc as any).lastAutoTable.finalY < pageH - 60
        ? (doc as any).lastAutoTable.finalY + 12
        : headerHeight + 20;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text("Resumen", marginX, startSummaryY);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(51, 65, 85);
    doc.text(`Capital: ${formatMoney(capital)}`, marginX, startSummaryY + 8);
    doc.text(
      `Interés generado: ${formatMoney(interestTotal)}`,
      marginX,
      startSummaryY + 14
    );
    doc.text(
      `Monto final: ${formatMoney(finalAmount)}`,
      marginX,
      startSummaryY + 20
    );

    // Footer en todas las páginas (después de que el PDF ya tiene todas las páginas)
    const totalPages = doc.getNumberOfPages();
    for (let p = 1; p <= totalPages; p++) {
      doc.setPage(p);
      drawFooter(p, totalPages);
    }

    doc.save("calculo-interes.pdf");
  };

  return (
    <div style={styles.page}>
      <div style={styles.grid2}>
        {/* ===== CARD ENTRADAS ===== */}
        <div style={styles.card}>
          <div style={styles.cardTitle}>Entradas</div>

          <div style={styles.formGrid}>
            <div style={styles.field}>
              <label style={styles.label}>Capital ($)</label>
              <input
                style={styles.input}
                type="number"
                value={capital || ""}
                onChange={(e) => setCapital(Number(e.target.value))}
                placeholder="Ej: 10000"
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Tasa anual (%)</label>
              <input
                style={styles.input}
                type="number"
                value={rate || ""}
                onChange={(e) => setRate(Number(e.target.value))}
                placeholder="Ej: 12"
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Tiempo (años)</label>
              <input
                style={styles.input}
                type="number"
                value={time || ""}
                onChange={(e) => setTime(Number(e.target.value))}
                placeholder="Ej: 5"
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Tipo de interés</label>
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

          <div style={{ marginTop: 14, ...styles.formGrid }}>
            <div style={styles.field}>
              <label style={styles.label}>Nombre del cliente (opcional)</label>
              <input
                style={styles.input}
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Ej: Juan Pérez"
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
              Calcular
            </button>

            <button
              style={styles.ghostBtn}
              onClick={exportPDF}
              disabled={rows.length === 0}
            >
              Exportar PDF
            </button>

            <button
              style={styles.ghostBtn}
              onClick={exportExcel}
              disabled={rows.length === 0}
            >
              Exportar Excel
            </button>
          </div>

          {!canCalculate && (
            <div
              style={{
                marginTop: 10,
                color: "#ef4444",
                fontSize: 13,
                fontWeight: 700,
              }}
            >
              * Completa Capital, Tasa y Tiempo (mayores que 0).
            </div>
          )}
        </div>

        {/* ===== CARD EXPLICACIÓN ===== */}
        <div style={styles.card}>
          <div style={styles.cardTitle}>Explicación académica</div>
          <div style={styles.hint}>
            <strong>Interés simple:</strong> el interés se calcula siempre sobre el
            capital inicial durante todos los periodos.
            <br />
            <br />
            <strong>Interés compuesto:</strong> el interés se calcula sobre el
            capital acumulado, por eso el crecimiento aumenta con el tiempo.
            <br />
            <br />
            Fórmula simple: <strong>I = C · i · t</strong> <br />
            Monto simple: <strong>M = C + I</strong>
          </div>
        </div>
      </div>

      {/* ===== RESULTADOS ===== */}
      {rows.length > 0 && (
        <>
          <div style={styles.metricsGrid}>
            <div style={styles.metric}>
              <div style={styles.metricLabel}>Capital</div>
              <div style={styles.metricValue}>${capital.toFixed(2)}</div>
            </div>

            <div style={styles.metric}>
              <div style={styles.metricLabel}>Interés generado</div>
              <div style={styles.metricValue}>${interestTotal.toFixed(2)}</div>
            </div>

            <div style={styles.metric}>
              <div style={styles.metricLabel}>Monto final</div>
              <div style={styles.metricValue}>${finalAmount.toFixed(2)}</div>
            </div>
          </div>

          <div style={styles.sectionTitle}>Evolución del capital</div>

          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Periodo</th>
                  <th style={styles.th}>Capital inicial</th>
                  <th style={styles.th}>Interés</th>
                  <th style={styles.th}>Capital final</th>
                </tr>
              </thead>

              <tbody>
                {rows.map((r) => (
                  <tr key={r.period}>
                    <td style={styles.td}>{r.period}</td>
                    <td style={styles.td}>${r.start.toFixed(2)}</td>
                    <td style={styles.td}>${r.interest.toFixed(2)}</td>
                    <td style={{ ...styles.td, fontWeight: 900, color: "#0f172a" }}>
                      ${r.end.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
