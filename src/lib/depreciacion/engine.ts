// src/lib/depreciacion/engine.ts

import type {
  DepreciationInput,
  DepreciationResult,
  DepreciationScheduleConfig,
  DepreciationSummary,
  DepreciationRow,
} from "./types";

import { validateDepreciationInput, getDerivedValues, roundTo } from "./validators";

import { buildStraightLineSchedule } from "./methods/straightLine";
import { buildUnitsOfProductionSchedule } from "./methods/unitsOfProduction";

/**
 * Orquestador del módulo de Depreciación.
 * - Valida entrada
 * - Calcula derivados (residual, base depreciable)
 * - Ejecuta el método correspondiente
 * - Normaliza salida (summary + rows + warnings)
 *
 * Reglas del proyecto:
 * - Base de días por defecto: 360 (convención financiera)
 * - Valor residual: se obtiene desde residualPolicy (por defecto 10% del costo)
 */
export function runDepreciation(
  input: DepreciationInput,
  config: DepreciationScheduleConfig
): DepreciationResult {
  // 1) Validación
  const issues = validateDepreciationInput(input, config);
  if (issues.length > 0) {
    return {
      input,
      config,
      summary: {
        costo: input.costo,
        valorResidual: 0,
        baseDepreciable: 0,
        totalDepreciado: 0,
        valorEnLibrosFinal: input.costo,
      },
      rows: [],
      warnings: issues.map((i) => i.message),
    };
  }

  // 2) Derivados (residual y base depreciable)
  const { valorResidual, baseDepreciable } = getDerivedValues(input);

  // 3) Config de redondeo
  const redondeo = config.redondeo ?? { decimales: 2, ajustarUltimoPeriodo: true };
  const dec = redondeo.decimales;

  // 4) Ejecutar método
  let rows: DepreciationRow[] = [];
  let warnings: string[] = [];

  if (input.metodo === "LINEA_RECTA") {
    const result = buildStraightLineSchedule(input, config, valorResidual);
    rows = result.rows;
    warnings = warnings.concat(result.warnings);
  } else if (input.metodo === "UNIDADES_PRODUCIDAS") {
    const result = buildUnitsOfProductionSchedule(input, config, valorResidual);
    rows = result.rows;
    warnings = warnings.concat(result.warnings);
  } else {
    warnings.push("Método de depreciación no soportado.");
  }

  // 5) Totales y cierre
  const totalDepreciadoRaw = rows.reduce((acc, r) => acc + r.depreciacionPeriodo, 0);
  const totalDepreciado = roundTo(totalDepreciadoRaw, dec);

  const valorEnLibrosFinal =
    rows.length > 0
      ? roundTo(rows[rows.length - 1].valorEnLibrosFin, dec)
      : roundTo(input.costo, dec);

  // 6) Métricas del método (para evaluación académica)
  const summary: DepreciationSummary = {
    costo: roundTo(input.costo, dec),
    valorResidual: roundTo(valorResidual, dec),
    baseDepreciable: roundTo(baseDepreciable, dec),
    totalDepreciado,
    valorEnLibrosFinal,
  };

  // Línea recta: métricas derivadas (anual/mensual/diaria)
  if (input.metodo === "LINEA_RECTA") {
    const vidaAnios = input.vidaUtilAnios;
    const depAnual = baseDepreciable / vidaAnios;
    const depMensual = depAnual / 12;
    const depDiaria = depAnual / input.baseDias; // base 360 en tu caso

    summary.depreciacionAnual = roundTo(depAnual, dec);
    summary.depreciacionMensual = roundTo(depMensual, dec);
    summary.depreciacionDiaria = roundTo(depDiaria, dec);
  }

  // Unidades producidas: tasa por unidad
  if (input.metodo === "UNIDADES_PRODUCIDAS") {
    const tasa = baseDepreciable / input.vidaTotalUnidades;
    summary.tasaPorUnidad = roundTo(tasa, dec);
  }

  return { input, config, summary, rows, warnings };
}
