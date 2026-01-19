// src/lib/depreciacion/validators.ts

import type {
  DepreciationInput,
  DepreciationScheduleConfig,
  ValidationIssue,
  ResidualPolicy,
  DayCountBasis,
} from "./types";

/* -------------------- Helpers básicos -------------------- */

export function isFiniteNumber(n: unknown): n is number {
  return typeof n === "number" && Number.isFinite(n);
}

export function roundTo(value: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

export function clampMin(value: number, min: number): number {
  return value < min ? min : value;
}

/* -------------------- Residual policy -------------------- */

export function computeResidualValue(costo: number, policy: ResidualPolicy): number {
  if (policy.type === "PORCENTAJE_COSTO") {
    return costo * policy.rate;
  }
  return policy.amount;
}

export function validateResidualPolicy(policy: ResidualPolicy): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (policy.type === "PORCENTAJE_COSTO") {
    if (!isFiniteNumber(policy.rate) || policy.rate <= 0 || policy.rate >= 1) {
      issues.push({
        code: "RESIDUAL_POLICY_INVALIDA",
        field: "residualPolicy.rate",
        message: "La tasa de valor residual debe estar entre 0 y 1 (por ejemplo 0.10).",
      });
    }
  } else {
    if (!isFiniteNumber(policy.amount) || policy.amount < 0) {
      issues.push({
        code: "RESIDUAL_POLICY_INVALIDA",
        field: "residualPolicy.amount",
        message: "El valor residual fijo debe ser un número mayor o igual a 0.",
      });
    }
  }

  return issues;
}

/* -------------------- Validación común -------------------- */

export function validateBaseDias(baseDias: DayCountBasis): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  if (baseDias !== 360 && baseDias !== 365) {
    issues.push({
      code: "BASE_DIAS_INVALIDA",
      field: "baseDias",
      message: "La base de días debe ser 360 o 365.",
    });
  }
  return issues;
}

export function validateFechaISO(fecha?: string): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  if (!fecha) return issues;

  // Validación básica ISO "YYYY-MM-DD"
  const isoRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!isoRegex.test(fecha)) {
    issues.push({
      code: "FECHA_INVALIDA",
      field: "fechaAdquisicion",
      message: "La fecha debe tener formato YYYY-MM-DD.",
    });
    return issues;
  }

  const d = new Date(fecha + "T00:00:00");
  if (Number.isNaN(d.getTime())) {
    issues.push({
      code: "FECHA_INVALIDA",
      field: "fechaAdquisicion",
      message: "La fecha de adquisición no es válida.",
    });
  }
  return issues;
}

/* -------------------- Validación por método -------------------- */

export function validateDepreciationInput(
  input: DepreciationInput,
  config: DepreciationScheduleConfig
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  // Costo
  if (!isFiniteNumber(input.costo) || input.costo <= 0) {
    issues.push({
      code: "COSTO_INVALIDO",
      field: "costo",
      message: "El costo debe ser un número mayor que 0.",
    });
  }

  // Base de días
  issues.push(...validateBaseDias(input.baseDias));

  // Política residual
  issues.push(...validateResidualPolicy(input.residualPolicy));

  // Fecha (si existe)
  issues.push(...validateFechaISO(input.fechaAdquisicion));

  // Config de redondeo (si viene)
  if (config.redondeo) {
    const { decimales } = config.redondeo;
    if (!isFiniteNumber(decimales) || decimales < 0 || decimales > 6) {
      issues.push({
        code: "PRODUCCION_INVALIDA",
        field: "redondeo.decimales",
        message: "Los decimales de redondeo deben estar entre 0 y 6.",
      });
    }
  }

  // Validación específica por método
  if (input.metodo === "LINEA_RECTA") {
    if (!isFiniteNumber(input.vidaUtilAnios) || input.vidaUtilAnios <= 0) {
      issues.push({
        code: "VIDA_UTIL_INVALIDA",
        field: "vidaUtilAnios",
        message: "La vida útil (años) debe ser un número mayor que 0.",
      });
    }
  }

  if (input.metodo === "UNIDADES_PRODUCIDAS") {
    if (!isFiniteNumber(input.vidaTotalUnidades) || input.vidaTotalUnidades <= 0) {
      issues.push({
        code: "VIDA_TOTAL_UNIDADES_INVALIDA",
        field: "vidaTotalUnidades",
        message: "La vida total en unidades debe ser un número mayor que 0.",
      });
    }

    if (!Array.isArray(input.produccion) || input.produccion.length === 0) {
      issues.push({
        code: "PRODUCCION_INVALIDA",
        field: "produccion",
        message: "Debe ingresar al menos un periodo de producción.",
      });
    } else {
      let total = 0;
      for (let i = 0; i < input.produccion.length; i++) {
        const p = input.produccion[i];
        if (!isFiniteNumber(p.periodo) || p.periodo <= 0) {
          issues.push({
            code: "PRODUCCION_INVALIDA",
            field: `produccion[${i}].periodo`,
            message: "El periodo debe ser un número mayor que 0.",
          });
        }
        if (!isFiniteNumber(p.unidades) || p.unidades < 0) {
          issues.push({
            code: "PRODUCCION_INVALIDA",
            field: `produccion[${i}].unidades`,
            message: "Las unidades deben ser un número mayor o igual a 0.",
          });
        }
        if (isFiniteNumber(p.unidades)) total += p.unidades;
      }

      if (
        isFiniteNumber(input.vidaTotalUnidades) &&
        total > input.vidaTotalUnidades
      ) {
        issues.push({
          code: "PRODUCCION_EXCEDE_VIDA_TOTAL",
          field: "produccion",
          message: "La suma de unidades producidas excede la vida total estimada del activo.",
        });
      }
    }
  }

  // Validación residual vs costo (cuando ambos son válidos)
  if (isFiniteNumber(input.costo) && input.costo > 0) {
    const residual = computeResidualValue(input.costo, input.residualPolicy);
    if (residual >= input.costo) {
      issues.push({
        code: "RESIDUAL_POLICY_INVALIDA",
        field: "residualPolicy",
        message: "El valor residual calculado no puede ser mayor o igual al costo.",
      });
    }
  }

  return issues;
}

/* -------------------- Derivados normalizados -------------------- */

export function getDerivedValues(input: DepreciationInput): {
  valorResidual: number;
  baseDepreciable: number;
} {
  const valorResidual = computeResidualValue(input.costo, input.residualPolicy);
  const baseDepreciable = input.costo - valorResidual;
  return { valorResidual, baseDepreciable };
}
