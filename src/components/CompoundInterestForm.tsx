import { useState } from "react";
import { financialApi } from "../api/financialApi";

export const CompoundInterestForm = () => {
  const [capital, setCapital] = useState(0);
  const [rate, setRate] = useState(0);
  const [time, setTime] = useState(0);
  const [result, setResult] = useState<number | null>(null);

  const calculate = async () => {
    const response = await financialApi.post("/interest/compound", {
      capital,
      rate,
      time,
    });

    setResult(response.data.amount);
  };

  return (
    <div>
      <h2>Interés Compuesto</h2>

      <input
        type="number"
        placeholder="Capital"
        onChange={(e) => setCapital(Number(e.target.value))}
      />

      <input
        type="number"
        placeholder="Tasa (ej: 0.1)"
        onChange={(e) => setRate(Number(e.target.value))}
      />

      <input
        type="number"
        placeholder="Tiempo"
        onChange={(e) => setTime(Number(e.target.value))}
      />

      <button onClick={calculate}>Calcular</button>

      {result !== null && <p>Monto final: ${result}</p>}
    </div>
  );
};
