// src/components/depreciacion/DepreciacionExplanation.tsx

type MetodoUI = "LINEA_RECTA" | "UNIDADES_PRODUCIDAS";

export default function DepreciacionExplanation(props: { metodoUI: MetodoUI; baseDias: number }) {
  const { metodoUI, baseDias } = props;

  return (
    <section style={{ ...cardStyle, marginTop: 16 }}>
      <h3>Explicación académica (resumen)</h3>

      {metodoUI === "LINEA_RECTA" ? (
        <>
          <p style={pStyle}>
            En <b>línea recta</b>, la depreciación distribuye la base depreciable en partes iguales a lo largo de la vida útil.
          </p>
          <ul style={ulStyle}>
            <li>Valor residual = 10% del costo.</li>
            <li>Base depreciable = costo − valor residual.</li>
            <li>Depreciación anual = base depreciable / vida útil (años).</li>
            <li>Depreciación mensual = depreciación anual / 12.</li>
            <li>Depreciación diaria (base {baseDias}) = depreciación anual / {baseDias}.</li>
            <li>Valor en libros = costo − depreciación acumulada (sin bajar del residual).</li>
          </ul>
        </>
      ) : (
        <>
          <p style={pStyle}>
            En <b>unidades producidas</b>, la depreciación depende del uso real del activo: a más unidades producidas, mayor depreciación.
          </p>
          <ul style={ulStyle}>
            <li>Valor residual = 10% del costo.</li>
            <li>Base depreciable = costo − valor residual.</li>
            <li>Tasa por unidad = base depreciable / vida total estimada (unidades).</li>
            <li>Depreciación del periodo = unidades del periodo × tasa por unidad.</li>
            <li>El valor en libros no debe bajar del valor residual.</li>
          </ul>
        </>
      )}
    </section>
  );
}

const cardStyle: React.CSSProperties = {
  border: "1px solid #ddd",
  borderRadius: 10,
  padding: 16,
};

const pStyle: React.CSSProperties = {
  marginTop: 6,
  marginBottom: 10,
  opacity: 0.9,
};

const ulStyle: React.CSSProperties = {
  marginTop: 8,
};
