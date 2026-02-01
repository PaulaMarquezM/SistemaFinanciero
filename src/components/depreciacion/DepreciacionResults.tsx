// src/components/depreciacion/DepreciacionResults.tsx

import { useMemo, useState } from "react";
import type { DepreciationInput, DepreciationResult, DepreciationRow } from "../../lib/depreciacion/types";
import type { TipoActivoSRI } from "./DepreciacionForm";
import { TABLA_SRI } from "./DepreciacionForm";

type MetodoUI = "LINEA_RECTA" | "UNIDADES_PRODUCIDAS";

export default function DepreciacionResults(props: {
  result: DepreciationResult;
  input: DepreciationInput;
  metodoUI: MetodoUI;
  vidaTotalUnidades: number;
  tipoActivo: TipoActivoSRI;
}) {
  const { result, input, metodoUI, vidaTotalUnidades, tipoActivo } = props;

  const isLineaRecta = metodoUI === "LINEA_RECTA";
  const isUnidades = metodoUI === "UNIDADES_PRODUCIDAS";

  const [copyStatus, setCopyStatus] = useState<string>("");

  const csv = useMemo(() => buildCSV(result.rows), [result.rows]);

  function handleDownloadCSV() {
    const filename = `depreciacion_${metodoUI.toLowerCase()}_${new Date().toISOString().slice(0, 10)}.csv`;
    downloadTextFile(csv, filename, "text/csv;charset=utf-8;");
  }

  async function handleCopyCSV() {
    try {
      await navigator.clipboard.writeText(csv);
      setCopyStatus("Copiado al portapapeles.");
      window.setTimeout(() => setCopyStatus(""), 2000);
    } catch {
      setCopyStatus("No se pudo copiar. (Revise permisos del navegador)");
      window.setTimeout(() => setCopyStatus(""), 2500);
    }
  }

  async function handleDownloadPDF() {
    if (result.rows.length === 0) return;

    try {
      const jsPDF = (await import("jspdf")).default;
      const autoTable = (await import("jspdf-autotable")).default;

      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const margin = 14;

      // --- Colores del tema ---
      const primaryColor: [number, number, number] = [39, 110, 144];   // #276E90
      const darkColor: [number, number, number] = [10, 49, 67];        // #0A3143
      const lightGray: [number, number, number] = [245, 245, 245];

      // --- Encabezado ---
      pdf.setFillColor(...darkColor);
      pdf.rect(0, 0, pageWidth, 32, "F");

      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(18);
      pdf.setFont("helvetica", "bold");
      pdf.text("Reporte de Depreciación", margin, 14);

      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      const metodoLabel = isLineaRecta ? "Método: Línea Recta" : "Método: Unidades de Producción";
      pdf.text(metodoLabel, margin, 22);

      const fecha = new Date().toLocaleDateString("es-EC", { year: "numeric", month: "long", day: "numeric" });
      pdf.text(`Fecha: ${fecha}`, margin, 28);

      // Tipo de activo (derecha del header)
      if (isLineaRecta) {
        const sri = TABLA_SRI[tipoActivo];
        pdf.text(`Tipo de activo (SRI): ${sri.label}`, pageWidth - margin, 22, { align: "right" });
      }

      let y = 40;

      // --- Resumen ---
      pdf.setTextColor(...darkColor);
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "bold");
      pdf.text("Resumen del Activo", margin, y);
      y += 2;

      const summaryData = [
        ["Costo del activo", `$ ${result.summary.costo.toFixed(2)}`],
        ["Valor residual (10%)", `$ ${result.summary.valorResidual.toFixed(2)}`],
        ["Base depreciable", `$ ${result.summary.baseDepreciable.toFixed(2)}`],
        ["Total depreciado", `$ ${result.summary.totalDepreciado.toFixed(2)}`],
      ];

      if (isLineaRecta && input.metodo === "LINEA_RECTA") {
        summaryData.push(["Vida útil", `${input.vidaUtilAnios} años`]);
      }

      autoTable(pdf, {
        startY: y,
        head: [],
        body: summaryData,
        theme: "plain",
        margin: { left: margin, right: margin },
        styles: { fontSize: 9, cellPadding: 2.5 },
        columnStyles: {
          0: { fontStyle: "bold", cellWidth: 55, textColor: darkColor },
          1: { halign: "left", textColor: [60, 60, 60] },
        },
        didParseCell(data) {
          if (data.row.index % 2 === 0) {
            data.cell.styles.fillColor = lightGray;
          }
        },
      });

      y = (pdf as any).lastAutoTable.finalY + 6;

      // --- Métricas del método ---
      pdf.setTextColor(...darkColor);
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "bold");
      pdf.text("Métricas del Método", margin, y);
      y += 2;

      const metricsData: string[][] = [];
      if (isLineaRecta) {
        metricsData.push(["Depreciación anual", `$ ${(result.summary.depreciacionAnual ?? 0).toFixed(2)}`]);
        metricsData.push(["Depreciación mensual", `$ ${(result.summary.depreciacionMensual ?? 0).toFixed(2)}`]);
        metricsData.push([`Depreciación diaria (base ${input.baseDias})`, `$ ${(result.summary.depreciacionDiaria ?? 0).toFixed(2)}`]);
      } else {
        metricsData.push(["Tasa por unidad", `$ ${(result.summary.tasaPorUnidad ?? 0).toFixed(4)}`]);
        metricsData.push(["Vida total (unidades)", vidaTotalUnidades.toFixed(0)]);
        metricsData.push(["Unidades ingresadas", sumUnits(result.rows).toFixed(0)]);
      }

      autoTable(pdf, {
        startY: y,
        head: [],
        body: metricsData,
        theme: "plain",
        margin: { left: margin, right: margin },
        styles: { fontSize: 9, cellPadding: 2.5 },
        columnStyles: {
          0: { fontStyle: "bold", cellWidth: 55, textColor: darkColor },
          1: { halign: "left", textColor: [60, 60, 60] },
        },
        didParseCell(data) {
          if (data.row.index % 2 === 0) {
            data.cell.styles.fillColor = lightGray;
          }
        },
      });

      y = (pdf as any).lastAutoTable.finalY + 8;

      // --- Tabla de depreciación ---
      pdf.setTextColor(...darkColor);
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "bold");
      pdf.text("Tabla de Depreciación", margin, y);
      y += 2;

      const headers = ["Periodo", "Etiqueta", "V. Inicio", "Deprec.", "Acum.", "V. Fin"];
      if (isUnidades) headers.push("Unidades");
      if (result.rows.some((r) => r.diasAplicados != null)) headers.push("Días");
      if (result.rows.some((r) => r.mesesAplicados != null)) headers.push("Meses");

      const tableBody = result.rows.map((r) => {
        const row: string[] = [
          String(r.periodo),
          r.etiquetaPeriodo ?? "",
          r.valorEnLibrosInicio.toFixed(2),
          r.depreciacionPeriodo.toFixed(2),
          r.depreciacionAcumulada.toFixed(2),
          r.valorEnLibrosFin.toFixed(2),
        ];
        if (isUnidades) row.push(r.unidades != null ? String(r.unidades) : "");
        if (result.rows.some((r) => r.diasAplicados != null)) row.push(r.diasAplicados != null ? String(r.diasAplicados) : "");
        if (result.rows.some((r) => r.mesesAplicados != null)) row.push(r.mesesAplicados != null ? String(r.mesesAplicados) : "");
        return row;
      });

      autoTable(pdf, {
        startY: y,
        head: [headers],
        body: tableBody,
        theme: "grid",
        margin: { left: margin, right: margin },
        styles: {
          fontSize: 8,
          cellPadding: 2,
          lineColor: [200, 200, 200],
          lineWidth: 0.2,
        },
        headStyles: {
          fillColor: primaryColor,
          textColor: [255, 255, 255],
          fontStyle: "bold",
          fontSize: 8,
          halign: "center",
        },
        bodyStyles: {
          halign: "right",
        },
        columnStyles: {
          0: { halign: "center", cellWidth: 14 },
          1: { halign: "left" },
        },
        alternateRowStyles: {
          fillColor: [240, 248, 252],
        },
        didDrawPage(data) {
          // Pie de página en cada página
          const pageCount = (pdf as any).internal.getNumberOfPages();
          pdf.setFontSize(8);
          pdf.setTextColor(150, 150, 150);
          pdf.text(
            `Sistema Financiero — Reporte de Depreciación`,
            margin,
            pdf.internal.pageSize.getHeight() - 8
          );
          pdf.text(
            `Página ${data.pageNumber} de ${pageCount}`,
            pageWidth - margin,
            pdf.internal.pageSize.getHeight() - 8,
            { align: "right" }
          );
        },
      });

      pdf.save(`depreciacion_${metodoUI.toLowerCase()}_${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (error) {
      console.error("Error al generar PDF:", error);
      alert("Error al generar el PDF. Por favor intente de nuevo.");
    }
  }

  return (
    <section style={{ ...cardStyle, marginTop: 16 }}>
      <h3>Resultados</h3>

      {result.warnings.length > 0 && (
        <div style={{ padding: 12, border: "1px solid #999", marginBottom: 12 }}>
          <b>Warnings / Validaciones</b>
          <ul style={{ marginTop: 8 }}>
            {result.warnings.map((w, idx) => (
              <li key={idx}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Resumen base */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        <Stat label="Costo" value={result.summary.costo} />
        <Stat label="Residual (10%)" value={result.summary.valorResidual} />
        <Stat label="Base depreciable" value={result.summary.baseDepreciable} />
        <Stat label="Total depreciado" value={result.summary.totalDepreciado} />
      </div>

      {/* Métricas del método */}
      <div style={{ marginTop: 12 }}>
        <h4 style={{ margin: "8px 0" }}>Métricas del método</h4>

        {isLineaRecta && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
            <Stat label="Depreciación anual" value={result.summary.depreciacionAnual ?? NaN} />
            <Stat label="Depreciación mensual" value={result.summary.depreciacionMensual ?? NaN} />
            <Stat label={`Depreciación diaria (base ${input.baseDias})`} value={result.summary.depreciacionDiaria ?? NaN} />
          </div>
        )}

        {isUnidades && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
            <Stat label="Tasa por unidad" value={result.summary.tasaPorUnidad ?? NaN} />
            <Stat label="Vida total (unidades)" value={vidaTotalUnidades} />
            <Stat label="Unidades ingresadas" value={sumUnits(result.rows)} />
          </div>
        )}
      </div>

      {/* Acciones */}
      <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 16, flexWrap: "wrap" }}>
        <button type="button" onClick={handleDownloadCSV} style={buttonStyle} disabled={result.rows.length === 0}>
          Exportar CSV
        </button>

        <button type="button" onClick={handleCopyCSV} style={buttonStyle} disabled={result.rows.length === 0}>
          Copiar CSV
        </button>

        <button type="button" onClick={handleDownloadPDF} style={buttonStyle} disabled={result.rows.length === 0}>
          Descargar PDF
        </button>

        {copyStatus && <span style={{ fontSize: 13, opacity: 0.85 }}>{copyStatus}</span>}
      </div>

      {/* Tabla */}
      <DepreciacionTable rows={result.rows} />
    </section>
  );
}

/* -------------------- Tabla -------------------- */

function DepreciacionTable({ rows }: { rows: DepreciationRow[] }) {
  return (
    <div style={{ marginTop: 12, overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            {["Periodo", "Etiqueta", "V. Inicio", "Deprec.", "Acum.", "V. Fin", "Unidades", "Días", "Meses"].map((h) => (
              <th key={h} style={thStyle}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.periodo}>
              <td style={tdStyle}>{r.periodo}</td>
              <td style={tdStyle}>{r.etiquetaPeriodo ?? ""}</td>
              <td style={tdStyle}>{r.valorEnLibrosInicio.toFixed(2)}</td>
              <td style={tdStyle}>{r.depreciacionPeriodo.toFixed(2)}</td>
              <td style={tdStyle}>{r.depreciacionAcumulada.toFixed(2)}</td>
              <td style={tdStyle}>{r.valorEnLibrosFin.toFixed(2)}</td>
              <td style={tdStyle}>{r.unidades ?? ""}</td>
              <td style={tdStyle}>{r.diasAplicados ?? ""}</td>
              <td style={tdStyle}>{r.mesesAplicados ?? ""}</td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td style={tdStyle} colSpan={9}>
                No hay filas para mostrar (revise inputs y warnings).
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

/* -------------------- Export helpers -------------------- */

function buildCSV(rows: DepreciationRow[]): string {
  const headers = [
    "Periodo",
    "Etiqueta",
    "ValorEnLibrosInicio",
    "DepreciacionPeriodo",
    "DepreciacionAcumulada",
    "ValorEnLibrosFin",
    "Unidades",
    "DiasAplicados",
    "MesesAplicados",
  ];

  const lines: string[] = [];
  lines.push(headers.join(","));

  for (const r of rows) {
    const values = [
      r.periodo,
      r.etiquetaPeriodo ?? "",
      r.valorEnLibrosInicio.toFixed(2),
      r.depreciacionPeriodo.toFixed(2),
      r.depreciacionAcumulada.toFixed(2),
      r.valorEnLibrosFin.toFixed(2),
      r.unidades ?? "",
      r.diasAplicados ?? "",
      r.mesesAplicados ?? "",
    ].map(escapeCSV);

    lines.push(values.join(","));
  }

  return lines.join("\n");
}

function escapeCSV(value: string | number): string {
  const s = String(value);
  if (/[",\n]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function downloadTextFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();

  URL.revokeObjectURL(url);
}

/* -------------------- Helpers UI -------------------- */

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div style={{ padding: 12, border: "1px solid #ddd", borderRadius: 8 }}>
      <div style={{ fontSize: 12, opacity: 0.75 }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 700 }}>{Number.isFinite(value) ? value.toFixed(2) : "-"}</div>
    </div>
  );
}

function sumUnits(rows: DepreciationRow[]): number {
  return rows.reduce((acc, r) => acc + (r.unidades ?? 0), 0);
}

/* -------------------- estilos locales -------------------- */

const cardStyle: React.CSSProperties = {
  border: "1px solid #ddd",
  borderRadius: 10,
  padding: 16,
};

const thStyle: React.CSSProperties = {
  textAlign: "left",
  borderBottom: "1px solid #ccc",
  padding: 8,
  fontSize: 13,
};

const tdStyle: React.CSSProperties = {
  borderBottom: "1px solid #eee",
  padding: 8,
  fontSize: 13,
};

const buttonStyle: React.CSSProperties = {
  padding: "8px 12px",
  borderRadius: 8,
  border: "1px solid #ccc",
  background: "white",
  cursor: "pointer",
};
