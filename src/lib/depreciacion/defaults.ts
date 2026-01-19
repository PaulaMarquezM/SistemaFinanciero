// src/lib/depreciacion/defaults.ts

import type { DepreciationScheduleConfig, ResidualPolicy } from "./types";

export const DEFAULT_RESIDUAL_POLICY: ResidualPolicy = {
  type: "PORCENTAJE_COSTO",
  rate: 0.10,
};

export const DEFAULT_CONFIG: DepreciationScheduleConfig = {
  periodicidad: "ANUAL",
  prorrateo: {
    habilitado: false,
    modo: "MES_COMPLETO",
  },
  redondeo: {
    decimales: 2,
    ajustarUltimoPeriodo: true,
  },
};
