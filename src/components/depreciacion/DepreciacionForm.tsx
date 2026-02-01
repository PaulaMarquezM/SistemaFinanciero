// src/components/depreciacion/DepreciacionForm.tsx

import type { DepreciationScheduleConfig } from "../../lib/depreciacion/types";

type MetodoUI = "LINEA_RECTA" | "UNIDADES_PRODUCIDAS";

export type TipoActivoSRI = "EDIFICIO" | "MAQUINARIA" | "VEHICULO" | "COMPUTO";

export const TABLA_SRI: Record<TipoActivoSRI, { label: string }> = {
  EDIFICIO:   { label: "Inmuebles (excepto terrenos)" },
  MAQUINARIA: { label: "Maquinarias, equipos y muebles" },
  VEHICULO:   { label: "Vehículos" },
  COMPUTO:    { label: "Equipos de cómputo y software" },
};

export default function DepreciacionForm(props: {
  metodo: MetodoUI;
  setMetodo: (v: MetodoUI) => void;

  costo: number;
  setCosto: (v: number) => void;

  tipoActivo: TipoActivoSRI;
  setTipoActivo: (v: TipoActivoSRI) => void;

  vidaUtilAnios: number;
  setVidaUtilAnios: (v: number) => void;

  vidaTotalUnidades: number;
  setVidaTotalUnidades: (v: number) => void;

  produccionText: string;
  setProduccionText: (v: string) => void;

  periodicidad: DepreciationScheduleConfig["periodicidad"];
  setPeriodicidad: (v: DepreciationScheduleConfig["periodicidad"]) => void;

  prorrateoHabilitado: boolean;
  setProrrateoHabilitado: (v: boolean) => void;

  prorrateoModo: NonNullable<DepreciationScheduleConfig["prorrateo"]>["modo"];
  setProrrateoModo: (v: NonNullable<DepreciationScheduleConfig["prorrateo"]>["modo"]) => void;

  fechaAdquisicion: string;
  setFechaAdquisicion: (v: string) => void;

  valorResidualUI: number;
  baseDepreciableUI: number;
}) {
  const isLineaRecta = props.metodo === "LINEA_RECTA";
  const isUnidades = props.metodo === "UNIDADES_PRODUCIDAS";

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
      <section style={cardStyle}>
        <h3>Entradas</h3>

        <label style={labelStyle}>
          Método
          <select value={props.metodo} onChange={(e) => props.setMetodo(e.target.value as MetodoUI)} style={inputStyle}>
            <option value="LINEA_RECTA">Línea recta</option>
            <option value="UNIDADES_PRODUCIDAS">Unidades producidas</option>
          </select>
        </label>

        <label style={labelStyle}>
          Costo
          <input
            type="number"
            value={props.costo}
            onChange={(e) => props.setCosto(Number(e.target.value))}
            style={inputStyle}
            min={0}
          />
        </label>

        <div style={{ fontSize: 13, opacity: 0.85, marginTop: 4 }}>
          Valor residual = 10% del costo = <b>{props.valorResidualUI.toFixed(2)}</b>
          <br />
          Base depreciable = costo - residual = <b>{props.baseDepreciableUI.toFixed(2)}</b>
          <br />
          Base de días (convención): <b>360</b>
        </div>

        {isLineaRecta && (
          <>
            <label style={labelStyle}>
              Tipo de activo (Tabla SRI)
              <select
                value={props.tipoActivo}
                onChange={(e) => {
                  props.setTipoActivo(e.target.value as TipoActivoSRI);
                }}
                style={inputStyle}
              >
                <option value="EDIFICIO">Inmuebles (excepto terrenos)</option>
                <option value="MAQUINARIA">Maquinarias, equipos y muebles</option>
                <option value="VEHICULO">Vehículos</option>
                <option value="COMPUTO">Equipos de cómputo y software</option>
              </select>
            </label>

            <label style={labelStyle}>
              Vida útil (años)
              <input
                type="number"
                value={props.vidaUtilAnios}
                onChange={(e) => props.setVidaUtilAnios(Number(e.target.value))}
                style={inputStyle}
                min={0}
              />
            </label>
          </>
        )}

        {isUnidades && (
          <>
            <label style={labelStyle}>
              Vida total estimada (unidades)
              <input
                type="number"
                value={props.vidaTotalUnidades}
                onChange={(e) => props.setVidaTotalUnidades(Number(e.target.value))}
                style={inputStyle}
                min={0}
              />
            </label>

            <label style={labelStyle}>
              Producción por periodo (formato: periodo,unidades)
              <textarea
                value={props.produccionText}
                onChange={(e) => props.setProduccionText(e.target.value)}
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
            value={props.periodicidad}
            onChange={(e) => props.setPeriodicidad(e.target.value as DepreciationScheduleConfig["periodicidad"])}
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
            checked={props.prorrateoHabilitado}
            onChange={(e) => props.setProrrateoHabilitado(e.target.checked)}
          />
          Prorrateo por fecha de adquisición
        </label>

        {props.prorrateoHabilitado && (
          <>
            <label style={labelStyle}>
              Fecha de adquisición (YYYY-MM-DD)
              <input
                type="text"
                value={props.fechaAdquisicion}
                onChange={(e) => props.setFechaAdquisicion(e.target.value)}
                style={inputStyle}
              />
            </label>

            <label style={labelStyle}>
              Modo de prorrateo
              <select
                value={props.prorrateoModo}
                onChange={(e) =>
                  props.setProrrateoModo(
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
  );
}

/* estilos locales (puedes moverlos a theme luego) */
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
