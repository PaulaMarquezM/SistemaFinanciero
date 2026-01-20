import InterestForm from "../components/SimpleInterestForm";

export default function InterestPage() {
  return (
    <div
      style={{
        background: "#f8fafc",
        borderRadius: "18px",
        padding: "32px",
        maxWidth: "1100px",
        margin: "0 auto",
      }}
    >
      <h1 style={{ fontSize: "32px", fontWeight: 800, marginBottom: "24px" }}>
        Cálculo de Interés Simple y Compuesto
      </h1>

      <InterestForm />
    </div>
  );
}
