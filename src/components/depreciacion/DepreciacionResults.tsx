// src/components/depreciacion/DepreciacionResults.tsx

import { useMemo, useState } from "react";
import type { DepreciationInput, DepreciationResult, DepreciationRow } from "../../lib/depreciacion/types";

type MetodoUI = "LINEA_RECTA" | "UNIDADES_PRODUCIDAS";

export default function DepreciacionResults(props: {
  result: DepreciationResult;
  input: DepreciationInput;
  metodoUI: MetodoUI;
  vidaTotalUnidades: number;
}) {
  const { result, input, metodoUI, vidaTotalUnidades } = props;

  const isLineaRecta = metodoUI === "LINEA_RECTA";
  const isUnidades = metodoUI === "UNIDADES_PRODUCIDAS";

  const [copyStatus, setCopyStatus] = useState<string>("");

  // CSV generado una sola vez por render (si cambia rows, cambia el csv)
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
  // Encabezados consistentes con la tabla
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
  // Si contiene coma, comillas o salto de línea, se envuelve en comillas y se escapan comillas dobles
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
