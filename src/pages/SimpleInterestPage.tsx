import InterestForm from "../components/SimpleInterestForm";

export default function SimpleInterestPage() {
  return (
    /* Ya no necesitamos el <div> con estilos ni el <h1> 
       porque InterestForm ya trae su propio contenedor, 
       fondo y título con logo.
    */
    <InterestForm />
  );
}

