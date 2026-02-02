import { useState } from "react";

type Row = {
  period: number;
  start: number;
  interest: number;
  end: number;
};

const th = {
  padding: "14px",
  fontWeight: 700,
  color: "#0f172a",
};

const td = {
  padding: "12px",
  color: "#334155",
};

export default function SimpleInterestForm() {
  const [capital, setCapital] = useState<number>(0);
  const [rate, setRate] = useState<number>(0);
  const [time, setTime] = useState<number>(0);
  const [type, setType] = useState<"simple" | "compound">("simple");

  const [rows, setRows] = useState<Row[]>([]);
  const [interestTotal, setInterestTotal] = useState(0);
  const [finalAmount, setFinalAmount] = useState(0);

  const calculate = () => {
    if (capital <= 0 || rate <= 0 || time <= 0) return;

    let data: Row[] = [];
    let current = capital;
    let totalInterest = 0;
    const r = rate / 100;

    for (let i = 1; i <= time; i++) {
      let interest =
        type === "simple" ? capital * r : current * r;

      let end = current + interest;

      data.push({
        period: i,
        start: current,
        interest,
        end,
      });

      current = end;
      totalInterest += interest;
    }

    setRows(data);
    setInterestTotal(totalInterest);
    setFinalAmount(current);
  };

  return (
    <div
      style={{
        background: "#f8fafc",
        borderRadius: "20px",
        padding: "32px",
      }}
    >
      {/* ===== ENTRADAS ===== */}
      <h2 style={{ fontWeight: 800, marginBottom: 20 }}>
        Cálculo de Interés Simple y Compuesto
      </h2>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div>
          <label>Capital ($)</label>
          <input
            type="number"
            value={capital || ""}
            onChange={(e) => setCapital(Number(e.target.value))}
            placeholder="Ej: 10000"
          />
        </div>

        <div>
          <label>Tasa anual (%)</label>
          <input
            type="number"
            value={rate || ""}
            onChange={(e) => setRate(Number(e.target.value))}
            placeholder="Ej: 12"
          />
        </div>

        <div>
          <label>Tiempo (años)</label>
          <input
            type="number"
            value={time || ""}
            onChange={(e) => setTime(Number(e.target.value))}
            placeholder="Ej: 3"
          />
        </div>

        <div>
          <label>Tipo de interés</label>
          <select
            value={type}
            onChange={(e) =>
              setType(e.target.value as "simple" | "compound")
            }
          >
            <option value="simple">Interés Simple</option>
            <option value="compound">Interés Compuesto</option>
          </select>
        </div>
      </div>

      <button
        onClick={calculate}
        style={{
          marginTop: 20,
          padding: "12px 28px",
          background: "#0f3d4c",
          color: "white",
          borderRadius: 12,
          fontWeight: 700,
        }}
      >
        Calcular
      </button>

      {/* ===== RESULTADOS ===== */}
      {rows.length > 0 && (
        <>
          <div
            style={{
              marginTop: 32,
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 16,
            }}
          >
            <div className="card">
              <strong>Capital</strong>
              <div>${capital.toFixed(2)}</div>
            </div>

            <div className="card">
              <strong>Interés generado</strong>
              <div>${interestTotal.toFixed(2)}</div>
            </div>

            <div className="card">
              <strong>Monto final</strong>
              <div>${finalAmount.toFixed(2)}</div>
            </div>
          </div>

          {/* ===== TABLA ===== */}
          <h2 style={{ fontWeight: 800, margin: "32px 0 16px" }}>
            Evolución del capital
          </h2>

          <div
            style={{
              background: "white",
              borderRadius: "16px",
              padding: "16px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                textAlign: "center",
              }}
            >
              <thead>
                <tr style={{ background: "#f1f5f9" }}>
                  <th style={th}>Periodo</th>
                  <th style={th}>Capital inicial</th>
                  <th style={th}>Interés</th>
                  <th style={th}>Capital final</th>
                </tr>
              </thead>

              <tbody>
                {rows.map((r) => (
                  <tr
                    key={r.period}
                    style={{ borderBottom: "1px solid #e5e7eb" }}
                  >
                    <td style={td}>{r.period}</td>
                    <td style={td}>${r.start.toFixed(2)}</td>
                    <td style={td}>${r.interest.toFixed(2)}</td>
                    <td style={{ ...td, fontWeight: 700 }}>
                      ${r.end.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
