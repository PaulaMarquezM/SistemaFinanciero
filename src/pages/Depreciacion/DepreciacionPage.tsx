// src/pages/Depreciacion/DepreciacionPage.tsx

import { useMemo, useState } from "react";
import type {
  DepreciationInput,
  DepreciationResult,
  DepreciationScheduleConfig,
} from "../../lib/depreciacion/types";

import { runDepreciation } from "../../lib/depreciacion/engine";
import { DEFAULT_CONFIG, DEFAULT_RESIDUAL_POLICY } from "../../lib/depreciacion/defaults";

type MetodoUI = "LINEA_RECTA" | "UNIDADES_PRODUCIDAS";

export default function DepreciacionPage() {
  // -------------------- Estado del formulario --------------------
  const [metodo, setMetodo] = useState<MetodoUI>("LINEA_RECTA");

  const [costo, setCosto] = useState<number>(120000);
  const [vidaUtilAnios, setVidaUtilAnios] = useState<number>(20);

  // Unidades producidas
  const [vidaTotalUnidades, setVidaTotalUnidades] = useState<number>(90000);
  const [produccionText, setProduccionText] = useState<string>(
    "1,13500\n2,15750\n3,13500\n4,18000\n5,11250\n6,9000\n7,6750\n8,2250"
  );

  // Modo / periodicidad / prorrateo
  const [periodicidad, setPeriodicidad] = useState<DepreciationScheduleConfig["periodicidad"]>(
    "ANUAL"
  );

  const [prorrateoHabilitado, setProrrateoHabilitado] = useState<boolean>(false);
  const [prorrateoModo, setProrrateoModo] = useState<
    NonNullable<DepreciationScheduleConfig["prorrateo"]>["modo"]
  >("MES_COMPLETO");
  const [fechaAdquisicion, setFechaAdquisicion] = useState<string>("2025-05-10");

  // -------------------- Config --------------------
  const config: DepreciationScheduleConfig = useMemo(() => {
    return {
      ...DEFAULT_CONFIG,
      periodicidad,
      prorrateo: {
        habilitado: prorrateoHabilitado,
        modo: prorrateoModo,
      },
      redondeo: {
        decimales: 2,
        ajustarUltimoPeriodo: true,
      },
    };
  }, [periodicidad, prorrateoHabilitado, prorrateoModo]);

  // -------------------- Parse producción --------------------
  function parseProduccion(text: string): { periodo: number; unidades: number }[] {
    // Formato: "periodo,unidades" por línea
    return text
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line, idx) => {
        const parts = line.split(",").map((x) => x.trim());
        if (parts.length !== 2) {
          throw new Error(`Línea ${idx + 1}: use formato periodo,unidades`);
        }
        const p = Number(parts[0]);
        const u = Number(parts[1]);
        if (!Number.isFinite(p) || !Number.isFinite(u)) {
          throw new Error(`Línea ${idx + 1}: valores inválidos`);
        }
        return { periodo: p, unidades: u };
      });
  }

  // -------------------- Construir input --------------------
  const input: DepreciationInput = useMemo(() => {
    const base = {
      costo,
      baseDias: 360 as const,
      residualPolicy: DEFAULT_RESIDUAL_POLICY,
      fechaAdquisicion: prorrateoHabilitado ? fechaAdquisicion : undefined,
    };

    if (metodo === "LINEA_RECTA") {
      return {
        ...base,
        metodo: "LINEA_RECTA",
        vidaUtilAnios,
      };
    }

    // UNIDADES_PRODUCIDAS
    let produccionParsed: { periodo: number; unidades: number }[] = [];
    try {
      produccionParsed = parseProduccion(produccionText);
    } catch {
      // Si hay error de parseo, dejamos arreglo vacío y el validator mostrará warnings
      produccionParsed = [];
    }

    return {
      ...base,
      metodo: "UNIDADES_PRODUCIDAS",
      vidaTotalUnidades,
      produccion: produccionParsed,
    };
  }, [
    metodo,
    costo,
    vidaUtilAnios,
    vidaTotalUnidades,
    produccionText,
    prorrateoHabilitado,
    fechaAdquisicion,
  ]);

  // -------------------- Ejecutar cálculo --------------------
  const result: DepreciationResult = useMemo(() => runDepreciation(input, config), [input, config]);

  // -------------------- UI --------------------
  const valorResidualUI = result.summary.valorResidual;
  const baseDepreciableUI = result.summary.baseDepreciable;

  const isLineaRecta = metodo === "LINEA_RECTA";
  const isUnidades = metodo === "UNIDADES_PRODUCIDAS";

  return (
    <div style={{ padding: 16, maxWidth: 1100, margin: "0 auto" }}>
      <h2>Depreciación</h2>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <section style={cardStyle}>
          <h3>Entradas</h3>

          <label style={labelStyle}>
            Método
            <select value={metodo} onChange={(e) => setMetodo(e.target.value as MetodoUI)} style={inputStyle}>
              <option value="LINEA_RECTA">Línea recta</option>
              <option value="UNIDADES_PRODUCIDAS">Unidades producidas</option>
            </select>
          </label>

          <label style={labelStyle}>
            Costo
            <input
              type="number"
              value={costo}
              onChange={(e) => setCosto(Number(e.target.value))}
              style={inputStyle}
              min={0}
            />
          </label>

          <div style={{ fontSize: 13, opacity: 0.85, marginTop: 4 }}>
            Valor residual = 10% del costo = <b>{valorResidualUI.toFixed(2)}</b>
            <br />
            Base depreciable = costo - residual = <b>{baseDepreciableUI.toFixed(2)}</b>
            <br />
            Base de días (convención): <b>360</b>
          </div>

          {isLineaRecta && (
            <label style={labelStyle}>
              Vida útil (años)
              <input
                type="number"
                value={vidaUtilAnios}
                onChange={(e) => setVidaUtilAnios(Number(e.target.value))}
                style={inputStyle}
                min={0}
              />
            </label>
          )}

          {isUnidades && (
            <>
              <label style={labelStyle}>
                Vida total estimada (unidades)
                <input
                  type="number"
                  value={vidaTotalUnidades}
                  onChange={(e) => setVidaTotalUnidades(Number(e.target.value))}
                  style={inputStyle}
                  min={0}
                />
              </label>

              <label style={labelStyle}>
                Producción por periodo (formato: periodo,unidades)
                <textarea
                  value={produccionText}
                  onChange={(e) => setProduccionText(e.target.value)}
                  style={{ ...inputStyle, minHeight: 140, fontFamily: "monospace" }}
                />
              </label>
            </>
          )}
        </section>

        <section style={cardStyle}>
          <h3>Modo de tabla</h3>

          <label style={labelStyle}>
            Periodicidad
            <select
              value={periodicidad}
              onChange={(e) => setPeriodicidad(e.target.value as DepreciationScheduleConfig["periodicidad"])}
              style={inputStyle}
            >
              <option value="ANUAL">Anual</option>
              <option value="MENSUAL">Mensual</option>
              <option value="DIARIA">Diaria (base 360, tabla agregada)</option>
            </select>
          </label>

          <label style={{ ...labelStyle, flexDirection: "row", alignItems: "center", gap: 8 }}>
            <input
              type="checkbox"
              checked={prorrateoHabilitado}
              onChange={(e) => setProrrateoHabilitado(e.target.checked)}
            />
            Prorrateo por fecha de adquisición
          </label>

          {prorrateoHabilitado && (
            <>
              <label style={labelStyle}>
                Fecha de adquisición (YYYY-MM-DD)
                <input
                  type="text"
                  value={fechaAdquisicion}
                  onChange={(e) => setFechaAdquisicion(e.target.value)}
                  style={inputStyle}
                />
              </label>

              <label style={labelStyle}>
                Modo de prorrateo
                <select
                  value={prorrateoModo}
                  onChange={(e) =>
                    setProrrateoModo(
                      e.target.value as NonNullable<DepreciationScheduleConfig["prorrateo"]>["modo"]
                    )
                  }
                  style={inputStyle}
                >
                  <option value="MES_COMPLETO">Mes completo</option>
                  <option value="PRORRATEO_DIAS">Prorrateo por días (30/360)</option>
                </select>
              </label>

              <div style={{ fontSize: 13, opacity: 0.85 }}>
                Nota: Para “DIARIA” se usa convención 30/360: cada mes se trata como 30 días y el año como 360.
              </div>
            </>
          )}
        </section>
      </div>

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

        {/* Métricas del método (académico) */}
        <div style={{ marginTop: 12 }}>
          <h4 style={{ margin: "8px 0" }}>Métricas del método</h4>

          {isLineaRecta && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
              <Stat label="Depreciación anual" value={result.summary.depreciacionAnual ?? 0} />
              <Stat label="Depreciación mensual" value={result.summary.depreciacionMensual ?? 0} />
              <Stat label={`Depreciación diaria (base ${input.baseDias})`} value={result.summary.depreciacionDiaria ?? 0} />
            </div>
          )}

          {isUnidades && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
              <Stat label="Tasa por unidad" value={result.summary.tasaPorUnidad ?? 0} />
              <Stat label="Vida total (unidades)" value={vidaTotalUnidades} />
              <Stat
                label="Unidades ingresadas"
                value={
                  Number.isFinite(vidaTotalUnidades)
                    ? result.rows.reduce((acc, r) => acc + (r.unidades ?? 0), 0)
                    : 0
                }
              />
            </div>
          )}
        </div>

        <div style={{ marginTop: 16, overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["Periodo", "Etiqueta", "V. Inicio", "Deprec.", "Acum.", "V. Fin", "Unidades", "Días", "Meses"].map(
                  (h) => (
                    <th key={h} style={thStyle}>
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {result.rows.map((r) => (
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
              {result.rows.length === 0 && (
                <tr>
                  <td style={tdStyle} colSpan={9}>
                    No hay filas para mostrar (revise inputs y warnings).
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Bloque opcional de explicación (si lo quieres ya) */}
        <div style={{ marginTop: 16, fontSize: 13, opacity: 0.9 }}>
          <h4 style={{ margin: "8px 0" }}>Explicación rápida</h4>
          {isLineaRecta ? (
            <ul style={{ marginTop: 8 }}>
              <li>Valor residual = 10% del costo.</li>
              <li>Base depreciable = costo − residual.</li>
              <li>Depreciación anual = base depreciable / vida útil (años).</li>
              <li>Depreciación mensual = depreciación anual / 12.</li>
              <li>Depreciación diaria (base 360) = depreciación anual / 360.</li>
            </ul>
          ) : (
            <ul style={{ marginTop: 8 }}>
              <li>Valor residual = 10% del costo.</li>
              <li>Base depreciable = costo − residual.</li>
              <li>Tasa por unidad = base depreciable / vida total estimada (unidades).</li>
              <li>Depreciación del periodo = unidades del periodo × tasa por unidad.</li>
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}

/* -------------------- UI helpers -------------------- */

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div style={{ padding: 12, border: "1px solid #ddd", borderRadius: 8 }}>
      <div style={{ fontSize: 12, opacity: 0.75 }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 700 }}>
        {Number.isFinite(value) ? value.toFixed(2) : "-"}
      </div>
    </div>
  );
}

const cardStyle: React.CSSProperties = {
  border: "1px solid #ddd",
  borderRadius: 10,
  padding: 16,
};

const labelStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 6,
  marginBottom: 12,
};

const inputStyle: React.CSSProperties = {
  padding: "8px 10px",
  borderRadius: 8,
  border: "1px solid #ccc",
  outline: "none",
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
