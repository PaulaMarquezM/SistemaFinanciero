// src/lib/depreciacion/methods/unitsOfProduction.ts

import type {
  UnitsOfProductionInput,
  DepreciationScheduleConfig,
  DepreciationRow,
} from "../types";

import { roundTo } from "../validators";

/**
 * Unidades producidas:
 * - Tasa por unidad = (Costo - Residual) / Vida total (unidades)
 * - Depreciación del periodo = unidadesPeriodo * tasaUnidad
 * - Se protege el residual: el valor en libros no puede bajar del valor residual.
 */
export function buildUnitsOfProductionSchedule(
  input: UnitsOfProductionInput,
  config: DepreciationScheduleConfig,
  valorResidual: number
): { rows: DepreciationRow[]; warnings: string[] } {
  const warnings: string[] = [];

  const dec = config.redondeo?.decimales ?? 2;
  const ajustarUltimo = config.redondeo?.ajustarUltimoPeriodo ?? true;

  const costo = input.costo;
  const baseDepreciable = costo - valorResidual;

  const vidaUnidades = input.vidaTotalUnidades;

  const tasaPorUnidad = baseDepreciable / vidaUnidades;

  let valorInicio = costo;
  let depreciacionAcum = 0;

  const rows: DepreciationRow[] = [];

  for (let i = 0; i < input.produccion.length; i++) {
    const p = input.produccion[i];

    // Depreciación teórica
    let dep = p.unidades * tasaPorUnidad;

    // Protegemos residual (no bajar valor en libros por debajo del residual)
    const valorFinTeorico = valorInicio - dep;
    if (valorFinTeorico < valorResidual) {
      dep = valorInicio - valorResidual;

      if (ajustarUltimo) {
        warnings.push(
          `Ajuste aplicado en el periodo ${p.periodo} para no bajar del valor residual.`
        );
      }
    }

    depreciacionAcum += dep;
    const valorFin = valorInicio - dep;

    rows.push({
      periodo: p.periodo,
      etiquetaPeriodo: `Periodo ${p.periodo}`,
      valorEnLibrosInicio: valorInicio,
      depreciacionPeriodo: dep,
      depreciacionAcumulada: depreciacionAcum,
      valorEnLibrosFin: valorFin,
      unidades: p.unidades,
      tasaPorUnidad,
    });

    valorInicio = valorFin;

    // Si ya llegamos a residual, el resto de periodos no deberían depreciar
    if (roundTo(valorInicio, dec) <= roundTo(valorResidual, dec)) {
      // Si quedan periodos con unidades, avisamos
      const remaining = input.produccion.slice(i + 1).some((x) => x.unidades > 0);
      if (remaining) {
        warnings.push(
          "El activo llegó al valor residual antes de terminar los periodos. Los periodos restantes no depreciarán."
        );
      }
      break;
    }
  }

  // Redondeo final consistente
  for (let i = 0; i < rows.length; i++) {
    rows[i].valorEnLibrosInicio = roundTo(rows[i].valorEnLibrosInicio, dec);
    rows[i].depreciacionPeriodo = roundTo(rows[i].depreciacionPeriodo, dec);
    rows[i].depreciacionAcumulada = roundTo(rows[i].depreciacionAcumulada, dec);
    rows[i].valorEnLibrosFin = roundTo(rows[i].valorEnLibrosFin, dec);
    rows[i].tasaPorUnidad = roundTo(rows[i].tasaPorUnidad ?? 0, dec);
  }

  // Garantía residual
  if (rows.length > 0) {
    const last = rows[rows.length - 1];
    if (last.valorEnLibrosFin < roundTo(valorResidual, dec)) {
      last.valorEnLibrosFin = roundTo(valorResidual, dec);
    }
  }

  return { rows, warnings };
}
