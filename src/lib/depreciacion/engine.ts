// src/lib/depreciacion/engine.ts

import type {
  DepreciationInput,
  DepreciationResult,
  DepreciationScheduleConfig,
  DepreciationSummary,
  DepreciationRow,
} from "./types";

import { validateDepreciationInput, getDerivedValues, roundTo } from "./validators";

// En el siguiente paso los implementamos:
import { buildStraightLineSchedule } from "./methods/straightLine";
import { buildUnitsOfProductionSchedule } from "./methods/unitsOfProduction";

export function runDepreciation(
  input: DepreciationInput,
  config: DepreciationScheduleConfig
): DepreciationResult {
  const issues = validateDepreciationInput(input, config);
  if (issues.length > 0) {
    // En vez de lanzar error, devolvemos resultado vacío y warnings con issues
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

  const { valorResidual, baseDepreciable } = getDerivedValues(input);

  const redondeo = config.redondeo ?? { decimales: 2, ajustarUltimoPeriodo: true };
  const dec = redondeo.decimales;

  let rows: DepreciationRow[] = [];
  let warnings: string[] = [];

  if (input.metodo === "LINEA_RECTA") {
    const result = buildStraightLineSchedule(input, config, valorResidual);
    rows = result.rows;
    warnings = warnings.concat(result.warnings);
  }

  if (input.metodo === "UNIDADES_PRODUCIDAS") {
    const result = buildUnitsOfProductionSchedule(input, config, valorResidual);
    rows = result.rows;
    warnings = warnings.concat(result.warnings);
  }

  // Totales y resumen estandarizados
  const totalDepreciadoRaw = rows.reduce((acc, r) => acc + r.depreciacionPeriodo, 0);
  const totalDepreciado = roundTo(totalDepreciadoRaw, dec);

  const valorEnLibrosFinal = rows.length > 0
    ? roundTo(rows[rows.length - 1].valorEnLibrosFin, dec)
    : roundTo(input.costo, dec);

  const summary: DepreciationSummary = {
    costo: roundTo(input.costo, dec),
    valorResidual: roundTo(valorResidual, dec),
    baseDepreciable: roundTo(baseDepreciable, dec),
    totalDepreciado,
    valorEnLibrosFinal,
  };

  return { input, config, summary, rows, warnings };
}
