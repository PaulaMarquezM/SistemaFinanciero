import { useState } from 'react';
import { getAmortizationSchedule, type ScheduleRow } from '../api/financialApi';

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '14px',
  border: '1px solid #CFCFCF',
  borderRadius: '6px',
  fontSize: '14px',
  background: 'transparent',
  color: '#0A3143'
};

const selectStyle: React.CSSProperties = {
  ...inputStyle,
  background: 'white',
  cursor: 'pointer'
};

const thStyle: React.CSSProperties = {
  padding: '12px',
  textAlign: 'center'
};

const tdStyle: React.CSSProperties = {
  padding: '10px',
  textAlign: 'center',
  color: '#0A3143'
};

const formatMoney = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

const AmortizationPage = () => {
  const [loanAmount, setLoanAmount] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [term, setTerm] = useState('');

  const [termType, setTermType] = useState<'months' | 'years'>('years'); // Por defecto Años
  const [rateType, setRateType] = useState<'annual' | 'monthly'>('annual'); // Por defecto Anual

  const [method, setMethod] = useState<'frances' | 'aleman'>('frances');
  const [schedule, setSchedule] = useState<ScheduleRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const calculateAmortization = async () => {
    const principal = parseFloat(loanAmount);
    const rateInput = parseFloat(interestRate);
    const termInput = parseInt(term);

    if (!principal || isNaN(rateInput) || !termInput) {
      alert('Por favor complete todos los campos correctamente');
      return;
    }

    const finalPeriods = termType === 'years' ? termInput * 12 : termInput;

    const finalAnnualRate = rateType === 'monthly' ? rateInput * 12 : rateInput;

    setIsLoading(true);

    try {
      const data = await getAmortizationSchedule({
        principal,
        annual_rate: finalAnnualRate,
        periods: finalPeriods,
        method
      });

      setSchedule(data);
    } catch (error) {
      console.error("Failed to fetch schedule:", error);
      alert("Error al conectar con el servidor.");
    } finally {
      setIsLoading(false);
    }
  };

  const totalPayment = schedule.reduce((acc, row) => acc + Number(row.payment), 0);
  const totalInterest = schedule.reduce((acc, row) => acc + Number(row.interest), 0);
  const totalPrincipal = schedule.reduce((acc, row) => acc + Number(row.principal), 0);

  return (
    <div
      style={{
        padding: '24px',
        background: '#EFEFEF',
        minHeight: '100vh',
        fontFamily: 'Arial, sans-serif'
      }}
    >
      <h2 style={{ color: '#0A3143', fontSize: '28px', fontWeight: 'bold', marginBottom: '24px' }}>
        Tabla de Amortización
      </h2>

      <div style={{ display: 'grid', gap: '20px', maxWidth: '600px', marginBottom: '30px' }}>

        {/* Monto */}
        <div>
          <label style={{display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#0A3143'}}>
            Monto del Préstamo ($)
          </label>
          <input
            type="number"
            placeholder="Ej: 225000"
            value={loanAmount}
            onChange={(e) => setLoanAmount(e.target.value)}
            style={inputStyle}
          />
        </div>

        {/* Tasa de Interés con Selector */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '10px' }}>
          <div>
            <label style={{display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#0A3143'}}>
              Tasa de Interés (%)
            </label>
            <input
              type="number"
              placeholder={rateType === 'annual' ? "Ej: 28" : "Ej: 2"}
              value={interestRate}
              onChange={(e) => setInterestRate(e.target.value)}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={{display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#0A3143'}}>
              Tipo de Tasa
            </label>
            <select
              value={rateType}
              onChange={(e) => setRateType(e.target.value as 'annual' | 'monthly')}
              style={selectStyle}
            >
              <option value="annual">Anual</option>
              <option value="monthly">Mensual</option>
            </select>
          </div>
        </div>

        {/* Plazo con Selector */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '10px' }}>
          <div>
            <label style={{display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#0A3143'}}>
              Plazo
            </label>
            <input
              type="number"
              placeholder={termType === 'years' ? "Ej: 5" : "Ej: 60"}
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={{display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#0A3143'}}>
              Unidad de Tiempo
            </label>
            <select
              value={termType}
              onChange={(e) => setTermType(e.target.value as 'years' | 'months')}
              style={selectStyle}
            >
              <option value="years">Años</option>
              <option value="months">Meses</option>
            </select>
          </div>
        </div>
      </div>

      {/* Selector de Método */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '30px' }}>
        <button
          onClick={() => setMethod('frances')}
          style={{
            padding: '10px 32px',
            border: 'none',
            background: method === 'frances' ? '#276E90' : '#D9D9D9',
            color: method === 'frances' ? 'white' : '#0A3143',
            borderRadius: '20px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Francés (Cuota Fija)
        </button>

        <button
          onClick={() => setMethod('aleman')}
          style={{
            padding: '10px 32px',
            border: 'none',
            background: method === 'aleman' ? '#276E90' : '#D9D9D9',
            color: method === 'aleman' ? 'white' : '#0A3143',
            borderRadius: '20px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Alemán (Amort. Fija)
        </button>
      </div>

      <div style={{ marginBottom: '40px' }}>
        <button
          onClick={calculateAmortization}
          disabled={isLoading}
          style={{
            padding: '14px 48px',
            background: isLoading ? '#6c8b99' : '#0A3143',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: isLoading ? 'wait' : 'pointer',
            fontSize: '16px',
            fontWeight: 'bold'
          }}
        >
          {isLoading ? 'Calculando...' : 'Generar Tabla'}
        </button>
      </div>

      {/* Tabla de Resultados */}
    {schedule.length > 0 && (
      <div style={{ overflowX: 'auto', background: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
          <thead>
            <tr style={{ background: '#276E90', color: 'white' }}>
              <th style={thStyle}>N°</th>
              <th style={thStyle}>Cuota</th>
              <th style={thStyle}>Interés</th>
              <th style={thStyle}>Capital</th>
              <th style={thStyle}>Saldo Restante</th>
            </tr>
          </thead>
          <tbody>
            {schedule.map((row, index) => (
              <tr
                key={index}
                style={{
                  background: index % 2 === 0 ? '#F8F9FA' : 'white',
                  borderBottom: '1px solid #eee'
                }}
              >
                 <td style={tdStyle}>{row.period}</td>
                <td style={tdStyle}>${formatMoney(Number(row.payment))}</td>
                  <td style={tdStyle}>${formatMoney(Number(row.interest))}</td>
                  <td style={tdStyle}>${formatMoney(Number(row.principal))}</td>
                  <td style={tdStyle}>${formatMoney(Number(row.balance))}</td>
              </tr>
            ))}
          </tbody>
          {/* SECCIÓN DE TOTALES UPDATED */}
          <tfoot>
            <tr style={{ background: '#276E90', color: 'white', fontWeight: 'bold' }}>
              <td style={{ ...tdStyle, color: 'white' }}>Total</td>
              <td style={{ ...tdStyle, color: 'white' }}>${formatMoney(totalPayment)}</td>
              <td style={{ ...tdStyle, color: 'white' }}>${formatMoney(totalInterest)}</td>
              <td style={{ ...tdStyle, color: 'white' }}>${formatMoney(totalPrincipal)}</td>
              <td style={{ ...tdStyle, color: 'white' }}>-</td>
            </tr>
          </tfoot>
        </table>
      </div>
    )}
  </div>
);
};

export default AmortizationPage;