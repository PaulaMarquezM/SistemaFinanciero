// src/lib/depreciacion/types.ts

export type DepreciationMethod =
  | "LINEA_RECTA"
  | "UNIDADES_PRODUCIDAS";

export type Periodicity =
  | "ANUAL"
  | "MENSUAL"
  | "DIARIA";

export type DayCountBasis = 360 | 365;

export type ProrationMode = "MES_COMPLETO" | "PRORRATEO_DIAS";

export type ResidualPolicy =
  | { type: "PORCENTAJE_COSTO"; rate: number }  // ej. 0.10
  | { type: "FIJO"; amount: number };          // si la profe cambiara

export interface DepreciationCommonInput {
  costo: number;
  fechaAdquisicion?: string; // "YYYY-MM-DD" si hay prorrateo
  baseDias: DayCountBasis;   // tu caso: 360
  residualPolicy: ResidualPolicy; // por ahora: {type:"PORCENTAJE_COSTO", rate:0.10}
}

export interface DepreciationScheduleConfig {
  periodicidad: Periodicity;
  prorrateo?: {
    habilitado: boolean;
    modo: ProrationMode; // MES_COMPLETO o PRORRATEO_DIAS
  };
  redondeo?: {
    decimales: number; // recomendado: 2
    ajustarUltimoPeriodo: boolean; // recomendado: true
  };
}

/* ---------- Inputs por método (unión discriminada) ---------- */

export interface StraightLineInput extends DepreciationCommonInput {
  metodo: "LINEA_RECTA";
  vidaUtilAnios: number;
  // Si la profe pide tabla en años calendario:
  anioInicio?: number;
}

export interface UnitsOfProductionPeriod {
  periodo: number;  // 1..n
  unidades: number; // producción del periodo
}

export interface UnitsOfProductionInput extends DepreciationCommonInput {
  metodo: "UNIDADES_PRODUCIDAS";
  vidaTotalUnidades: number;
  produccion: UnitsOfProductionPeriod[];
}

export type DepreciationInput = StraightLineInput | UnitsOfProductionInput;

/* ---------- Salida estándar ---------- */

export interface DepreciationRow {
  periodo: number;
  etiquetaPeriodo?: string; // "2025", "2025-08", etc.

  valorEnLibrosInicio: number;
  depreciacionPeriodo: number;
  depreciacionAcumulada: number;
  valorEnLibrosFin: number;

  // Campos opcionales según método/modo
  unidades?: number;
  tasaPorUnidad?: number;
  diasAplicados?: number;
  mesesAplicados?: number;
}

export interface DepreciationSummary {
  costo: number;
  valorResidual: number;
  baseDepreciable: number;

  totalDepreciado: number;
  valorEnLibrosFinal: number;

  // Derivados útiles
  depreciacionAnual?: number;
  depreciacionMensual?: number;
  depreciacionDiaria?: number;

  tasaPorUnidad?: number;
}

export interface DepreciationResult {
  input: DepreciationInput;
  config: DepreciationScheduleConfig;

  summary: DepreciationSummary;
  rows: DepreciationRow[];

  warnings: string[];
}

/* ---------- Validación ---------- */

export type ValidationIssueCode =
  | "COSTO_INVALIDO"
  | "VIDA_UTIL_INVALIDA"
  | "BASE_DIAS_INVALIDA"
  | "FECHA_INVALIDA"
  | "RESIDUAL_POLICY_INVALIDA"
  | "VIDA_TOTAL_UNIDADES_INVALIDA"
  | "PRODUCCION_INVALIDA"
  | "PRODUCCION_EXCEDE_VIDA_TOTAL";

export interface ValidationIssue {
  code: ValidationIssueCode;
  field?: string;
  message: string;
}
