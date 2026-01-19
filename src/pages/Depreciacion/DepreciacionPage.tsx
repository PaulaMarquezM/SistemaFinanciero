// src/pages/Depreciacion/DepreciacionPage.tsx

import { useMemo, useState } from "react";
import type { DepreciationInput, DepreciationResult, DepreciationScheduleConfig } from "../../lib/depreciacion/types";
import { runDepreciation } from "../../lib/depreciacion/engine";
import { DEFAULT_CONFIG, DEFAULT_RESIDUAL_POLICY } from "../../lib/depreciacion/defaults";

import DepreciacionForm from "../../components/depreciacion/DepreciacionForm";
import DepreciacionResults from "../../components/depreciacion/DepreciacionResults";
import DepreciacionExplanation from "../../components/depreciacion/DepreciacionExplanation";

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
  const [periodicidad, setPeriodicidad] = useState<DepreciationScheduleConfig["periodicidad"]>("ANUAL");
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
    return text
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line, idx) => {
        const parts = line.split(",").map((x) => x.trim());
        if (parts.length !== 2) throw new Error(`Línea ${idx + 1}: use formato periodo,unidades`);
        const p = Number(parts[0]);
        const u = Number(parts[1]);
        if (!Number.isFinite(p) || !Number.isFinite(u)) throw new Error(`Línea ${idx + 1}: valores inválidos`);
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
      return { ...base, metodo: "LINEA_RECTA", vidaUtilAnios };
    }

    let produccionParsed: { periodo: number; unidades: number }[] = [];
    try {
      produccionParsed = parseProduccion(produccionText);
    } catch {
      produccionParsed = [];
    }

    return { ...base, metodo: "UNIDADES_PRODUCIDAS", vidaTotalUnidades, produccion: produccionParsed };
  }, [metodo, costo, vidaUtilAnios, vidaTotalUnidades, produccionText, prorrateoHabilitado, fechaAdquisicion]);

  // -------------------- Ejecutar cálculo --------------------
  const result: DepreciationResult = useMemo(() => runDepreciation(input, config), [input, config]);

  // Derivados para UI (se recalculan desde result.summary)
  const valorResidualUI = result.summary.valorResidual;
  const baseDepreciableUI = result.summary.baseDepreciable;

  return (
    <div style={{ padding: 16, maxWidth: 1100, margin: "0 auto" }}>
      <h2>Depreciación</h2>

      <DepreciacionForm
        metodo={metodo}
        setMetodo={setMetodo}
        costo={costo}
        setCosto={setCosto}
        vidaUtilAnios={vidaUtilAnios}
        setVidaUtilAnios={setVidaUtilAnios}
        vidaTotalUnidades={vidaTotalUnidades}
        setVidaTotalUnidades={setVidaTotalUnidades}
        produccionText={produccionText}
        setProduccionText={setProduccionText}
        periodicidad={periodicidad}
        setPeriodicidad={setPeriodicidad}
        prorrateoHabilitado={prorrateoHabilitado}
        setProrrateoHabilitado={setProrrateoHabilitado}
        prorrateoModo={prorrateoModo}
        setProrrateoModo={setProrrateoModo}
        fechaAdquisicion={fechaAdquisicion}
        setFechaAdquisicion={setFechaAdquisicion}
        valorResidualUI={valorResidualUI}
        baseDepreciableUI={baseDepreciableUI}
      />

      <DepreciacionResults
        result={result}
        input={input}
        metodoUI={metodo}
        vidaTotalUnidades={vidaTotalUnidades}
      />

      <DepreciacionExplanation metodoUI={metodo} baseDias={input.baseDias} />
    </div>
  );
}
