import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const styles = {
  page: {
    background: "#f8fafc",
    borderRadius: 20,
    padding: 28,
  } as React.CSSProperties,
  title: {
    fontWeight: 900,
    fontSize: 34,
    margin: "0 0 18px",
    color: "#0f172a",
    letterSpacing: -0.5,
  } as React.CSSProperties,
  subtitle: {
    marginTop: -6,
    marginBottom: 22,
    color: "#475569",
    fontSize: 14,
  } as React.CSSProperties,
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 18,
  } as React.CSSProperties,
  card: {
    background: "white",
    borderRadius: 16,
    padding: 18,
    boxShadow: "0 10px 20px rgba(2, 6, 23, 0.06)",
    border: "1px solid rgba(15, 23, 42, 0.08)",
  } as React.CSSProperties,
  cardTitle: {
    fontWeight: 800,
    color: "#0f172a",
    margin: "0 0 12px",
    fontSize: 16,
  } as React.CSSProperties,
  chartWrap: {
    width: "100%",
    height: 320,
  } as React.CSSProperties,
};

// ✅ Datos de ejemplo (después se conectan a backend o a un JSON real)
const creditosPorMes = [
  { mes: "Ene", creditos: 12 },
  { mes: "Feb", creditos: 18 },
  { mes: "Mar", creditos: 10 },
  { mes: "Abr", creditos: 22 },
  { mes: "May", creditos: 15 },
  { mes: "Jun", creditos: 26 },
];

const crecimientoCartera = [
  { mes: "Ene", cartera: 120000 },
  { mes: "Feb", cartera: 132000 },
  { mes: "Mar", cartera: 140000 },
  { mes: "Abr", cartera: 155000 },
  { mes: "May", cartera: 170000 },
  { mes: "Jun", cartera: 189000 },
];

const comparacionPorPeriodo = [
  { periodo: "P1", montoA: 25000, montoB: 18000 },
  { periodo: "P2", montoA: 32000, montoB: 21000 },
  { periodo: "P3", montoA: 28000, montoB: 24000 },
  { periodo: "P4", montoA: 39000, montoB: 26000 },
];

export default function Reportes() {
  return (
    <div style={styles.page}>
      <h1 style={styles.title}>Reportes Gráficos</h1>
      <div style={styles.subtitle}>
        Visualización de créditos y cartera (datos de ejemplo).
      </div>

      <div style={styles.grid}>
        {/* 1) Créditos otorgados por mes */}
        <div style={styles.card}>
          <div style={styles.cardTitle}>Créditos otorgados por mes</div>
          <div style={styles.chartWrap}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={creditosPorMes}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="creditos" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2) Crecimiento de cartera */}
        <div style={styles.card}>
          <div style={styles.cardTitle}>Crecimiento de cartera de créditos</div>
          <div style={styles.chartWrap}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={crecimientoCartera}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="cartera" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 3) Comparación de montos por período */}
        <div style={{ ...styles.card, gridColumn: "1 / -1" }}>
          <div style={styles.cardTitle}>Comparación de montos por período</div>
          <div style={styles.chartWrap}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparacionPorPeriodo}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="periodo" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="montoA" name="Monto A" />
                <Bar dataKey="montoB" name="Monto B" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
