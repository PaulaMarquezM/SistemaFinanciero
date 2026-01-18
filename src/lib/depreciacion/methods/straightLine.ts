// src/lib/depreciacion/methods/straightLine.ts

import type {
  StraightLineInput,
  DepreciationScheduleConfig,
  DepreciationRow,
} from "../types";

import { roundTo } from "../validators";

/**
 * Nota académica:
 * - Depreciación (línea recta) reparte la base depreciable en cuotas iguales.
 * - "DIARIA" usa baseDias=360 como convención financiera. La tabla NO lista cada día:
 *   se agrega por periodos (años/meses) y se informa días aplicados cuando hay prorrateo.
 */
export function buildStraightLineSchedule(
  input: StraightLineInput,
  config: DepreciationScheduleConfig,
  valorResidual: number
): { rows: DepreciationRow[]; warnings: string[] } {
  const warnings: string[] = [];

  const dec = config.redondeo?.decimales ?? 2;
  const ajustarUltimo = config.redondeo?.ajustarUltimoPeriodo ?? true;

  const costo = input.costo;
  const baseDepreciable = costo - valorResidual;

  // Vida útil (años) — se espera que sea entera en la mayoría de clases,
  // pero lo manejamos con robustez:
  const vidaAnios = input.vidaUtilAnios;
  if (!Number.isInteger(vidaAnios)) {
    warnings.push(
      "La vida útil no es un entero. Se calcularán periodos usando aproximación a meses/días según la periodicidad."
    );
  }

  const periodicidad = config.periodicidad;
  const prorr = config.prorrateo?.habilitado ?? false;
  const prorrMode = config.prorrateo?.modo ?? "MES_COMPLETO";

  // Helpers internos
  const rows: DepreciationRow[] = [];

  const pushRow = (row: Omit<DepreciationRow, "depreciacionAcumulada">) => {
    const prevAcc = rows.length ? rows[rows.length - 1].depreciacionAcumulada : 0;
    const newAcc = prevAcc + row.depreciacionPeriodo;

    rows.push({
      ...row,
      depreciacionAcumulada: newAcc,
    });
  };

  // -------------------- ANUAL --------------------
  if (periodicidad === "ANUAL") {
    const n = Math.max(1, Math.round(vidaAnios));
    if (n !== vidaAnios) {
      warnings.push(`Vida útil ajustada a ${n} periodos anuales para la tabla.`);
    }

    const depAnual = baseDepreciable / n;

    let valorInicio = costo;

    for (let i = 1; i <= n; i++) {
      const dep = depAnual;
      const valorFin = valorInicio - dep;

      pushRow({
        periodo: i,
        etiquetaPeriodo: input.anioInicio ? String(input.anioInicio + (i - 1)) : `Año ${i}`,
        valorEnLibrosInicio: valorInicio,
        depreciacionPeriodo: dep,
        valorEnLibrosFin: valorFin,
      });

      valorInicio = valorFin;
    }

    applyRoundingAndResidualFloor(rows, valorResidual, dec, ajustarUltimo, warnings);
    return { rows, warnings };
  }

  // -------------------- MENSUAL --------------------
  if (periodicidad === "MENSUAL") {
    // Total meses = vidaAnios * 12 (redondeo al entero más cercano)
    const totalMeses = Math.max(1, Math.round(vidaAnios * 12));
    if (totalMeses !== vidaAnios * 12) {
      warnings.push(`Vida útil ajustada a ${totalMeses} periodos mensuales para la tabla.`);
    }

    const depMensual = baseDepreciable / totalMeses;

    let valorInicio = costo;

    // Prorrateo con fecha (si habilitado)
    // - MES_COMPLETO: cuenta meses desde el mes de adquisición inclusive.
    // - PRORRATEO_DIAS: aplica fracción del primer mes (30/360 => 30 días por mes).
    let startMonthFraction = 1;

    const fecha = input.fechaAdquisicion;

    if (prorr && fecha) {
    const { day } = parseISODate(fecha);

    if (prorrMode === "MES_COMPLETO") {
        // Mes completo desde el mes de adquisición inclusive
        startMonthFraction = 1;
    } else {
        // PRORRATEO_DIAS bajo 30/360: cada mes se trata de 30 días
        const day30 = Math.min(Math.max(day, 1), 30);
        const daysUsed = 30 - day30 + 1;
        startMonthFraction = daysUsed / 30;
    }
    }


    // Construimos periodos "mensuales" numerados 1..totalMeses
    // Nota: si se usa calendario real, la UI puede etiquetar con año/mes,
    // pero en lógica no es obligatorio.
    for (let i = 1; i <= totalMeses; i++) {
      let factor = 1;

      // Solo aplicamos fracción al primer periodo si prorrateo está activo
      if (prorr && input.fechaAdquisicion && i === 1) {
        factor = startMonthFraction;
      }

      const dep = depMensual * factor;
      const valorFin = valorInicio - dep;

      pushRow({
        periodo: i,
        etiquetaPeriodo: `Mes ${i}`,
        valorEnLibrosInicio: valorInicio,
        depreciacionPeriodo: dep,
        valorEnLibrosFin: valorFin,
        mesesAplicados: prorr && input.fechaAdquisicion && i === 1 ? factor : 1,
      });

      valorInicio = valorFin;
    }

    applyRoundingAndResidualFloor(rows, valorResidual, dec, ajustarUltimo, warnings);
    return { rows, warnings };
  }

  // -------------------- DIARIA (base 360) --------------------
  if (periodicidad === "DIARIA") {
    // DIARIA se maneja como tasa por día (base 360) y se agrega en filas
    // por "años" (bloques de 360 días), para mantener tabla legible.

    const baseDias = input.baseDias; // 360 según tu profe
    const totalDias = Math.max(1, Math.round(vidaAnios * baseDias));

    if (totalDias !== vidaAnios * baseDias) {
      warnings.push(`Vida útil ajustada a ${totalDias} días para la tabla (base ${baseDias}).`);
    }

    const depDiaria = baseDepreciable / totalDias;

    let valorInicio = costo;
    let diasRestantes = totalDias;
    let periodo = 1;

    // Si hay prorrateo con fecha, calculamos días aplicados del primer "año" (360)
    // bajo convención 30/360:
    let diasPrimerBloque = Math.min(360, diasRestantes);

    if (prorr && input.fechaAdquisicion) {
      const { month, day } = parseISODate(input.fechaAdquisicion);

      // Día del año bajo 30/360: (mes-1)*30 + min(día,30)
      const day30 = Math.min(Math.max(day, 1), 30);
      const dayOfYear360 = (month - 1) * 30 + day30;

      // Días desde la adquisición hasta fin del año financiero (360), inclusive
      const daysRemainingYear = 360 - dayOfYear360 + 1;

      diasPrimerBloque = clampInt(daysRemainingYear, 1, 360);
      diasPrimerBloque = Math.min(diasPrimerBloque, diasRestantes);
    }

    // Primer bloque
    {
      const dep = depDiaria * diasPrimerBloque;
      const valorFin = valorInicio - dep;

      pushRow({
        periodo,
        etiquetaPeriodo: input.anioInicio
          ? String(input.anioInicio)
          : `Periodo ${periodo} (bloque 360 días)`,
        valorEnLibrosInicio: valorInicio,
        depreciacionPeriodo: dep,
        valorEnLibrosFin: valorFin,
        diasAplicados: diasPrimerBloque,
      });

      valorInicio = valorFin;
      diasRestantes -= diasPrimerBloque;
      periodo++;
    }

    // Bloques completos siguientes
    while (diasRestantes > 0) {
      const diasBloque = Math.min(360, diasRestantes);
      const dep = depDiaria * diasBloque;
      const valorFin = valorInicio - dep;

      pushRow({
        periodo,
        etiquetaPeriodo: input.anioInicio
          ? String(input.anioInicio + (periodo - 1))
          : `Periodo ${periodo} (bloque 360 días)`,
        valorEnLibrosInicio: valorInicio,
        depreciacionPeriodo: dep,
        valorEnLibrosFin: valorFin,
        diasAplicados: diasBloque,
      });

      valorInicio = valorFin;
      diasRestantes -= diasBloque;
      periodo++;
    }

    applyRoundingAndResidualFloor(rows, valorResidual, dec, ajustarUltimo, warnings);
    return { rows, warnings };
  }

  warnings.push("Periodicidad no soportada para línea recta.");
  return { rows: [], warnings };
}

/* -------------------- Utilidades internas -------------------- */

function parseISODate(iso: string): { year: number; month: number; day: number } {
  // iso: YYYY-MM-DD
  const [y, m, d] = iso.split("-").map((x) => Number(x));
  return { year: y, month: m, day: d };
}

function clampInt(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, Math.trunc(n)));
}

/**
 * Redondea y garantiza que el valor en libros final no baje del residual.
 * Si ajustarUltimoPeriodo=true, ajusta la última depreciación para cerrar exacto al residual.
 */
function applyRoundingAndResidualFloor(
  rows: DepreciationRow[],
  valorResidual: number,
  dec: number,
  ajustarUltimoPeriodo: boolean,
  warnings: string[]
) {
  if (rows.length === 0) return;

  // 1) Redondeo fila por fila (preliminar)
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];

    r.valorEnLibrosInicio = roundTo(r.valorEnLibrosInicio, dec);
    r.depreciacionPeriodo = roundTo(r.depreciacionPeriodo, dec);
    r.depreciacionAcumulada = roundTo(r.depreciacionAcumulada, dec);
    r.valorEnLibrosFin = roundTo(r.valorEnLibrosFin, dec);
  }

  // 2) Ajuste final para cerrar en residual (si aplica)
  const last = rows[rows.length - 1];
  const fin = last.valorEnLibrosFin;

  if (fin < roundTo(valorResidual, dec)) {
    if (!ajustarUltimoPeriodo) {
      warnings.push("El valor en libros final cayó por debajo del residual (sin ajuste).");
      // Clampeo defensivo
      last.valorEnLibrosFin = roundTo(valorResidual, dec);
      return;
    }

    // Ajustamos la depreciación del último periodo para que el fin sea residual
    const delta = roundTo(valorResidual, dec) - fin; // positivo
    last.depreciacionPeriodo = roundTo(last.depreciacionPeriodo - delta, dec);
    last.valorEnLibrosFin = roundTo(valorResidual, dec);

    // Recalcular acumuladas desde el último (y consistencia)
    for (let i = 0; i < rows.length; i++) {
      rows[i].depreciacionAcumulada =
        i === 0
          ? roundTo(rows[i].depreciacionPeriodo, dec)
          : roundTo(rows[i - 1].depreciacionAcumulada + rows[i].depreciacionPeriodo, dec);
    }

    warnings.push("Se aplicó ajuste por redondeo para cerrar exactamente en el valor residual.");
  }

  // 3) Protección adicional: ningún valor en libros fin debe ser < residual por acumulación
  for (let i = 0; i < rows.length; i++) {
    if (rows[i].valorEnLibrosFin < roundTo(valorResidual, dec)) {
      rows[i].valorEnLibrosFin = roundTo(valorResidual, dec);
    }
  }
}
