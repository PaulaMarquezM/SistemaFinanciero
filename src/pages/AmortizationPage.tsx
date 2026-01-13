import { useState } from 'react';

interface ScheduleRow {
  period: number;
  payment: number;
  interest: number;
  principal: number;
  balance: number;
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '14px',
  border: '1px solid #CFCFCF',
  borderRadius: '6px',
  fontSize: '14px',
  background: 'transparent',
  color: '#0A3143'
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

const AmortizationPage = () => {
  const [loanAmount, setLoanAmount] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [term, setTerm] = useState('');
  const [method, setMethod] = useState<'frances' | 'aleman'>('frances');
  const [schedule, setSchedule] = useState<ScheduleRow[]>([]);

  const calculateAmortization = () => {
    const principal = parseFloat(loanAmount);
    const rate = parseFloat(interestRate) / 100;
    const periods = parseInt(term);

    if (!principal || !rate || !periods) {
      alert('Por favor complete todos los campos');
      return;
    }

    const newSchedule: ScheduleRow[] = [];

    if (method === 'frances') {
      const monthlyRate = rate / 12;
      const monthlyPayment =
        principal *
        (monthlyRate * Math.pow(1 + monthlyRate, periods)) /
        (Math.pow(1 + monthlyRate, periods) - 1);

      let balance = principal;

      for (let i = 1; i <= periods; i++) {
        const interestPayment = balance * monthlyRate;
        const principalPayment = monthlyPayment - interestPayment;
        balance -= principalPayment;

        newSchedule.push({
          period: i,
          payment: monthlyPayment,
          interest: interestPayment,
          principal: principalPayment,
          balance: Math.max(0, balance)
        });
      }
    } else {
      const principalPayment = principal / periods;
      const monthlyRate = rate / 12;
      let balance = principal;

      for (let i = 1; i <= periods; i++) {
        const interestPayment = balance * monthlyRate;
        const totalPayment = principalPayment + interestPayment;
        balance -= principalPayment;

        newSchedule.push({
          period: i,
          payment: totalPayment,
          interest: interestPayment,
          principal: principalPayment,
          balance: Math.max(0, balance)
        });
      }
    }

    setSchedule(newSchedule);
  };

  return (
    <div
      style={{
        padding: '24px',
        background: '#EFEFEF',
        minHeight: '100vh'
      }}
    >
      <h2
        style={{
          marginBottom: '24px',
          color: '#0A3143',
          fontSize: '32px',
          fontWeight: 'bold'
        }}
      >
        Amortización
      </h2>

      {/* Inputs */}
      <div
        style={{
          display: 'grid',
          gap: '16px',
          maxWidth: '500px',
          marginBottom: '40px'
        }}
      >
        <input
          type="number"
          placeholder="Monto del Préstamo"
          value={loanAmount}
          onChange={(e) => setLoanAmount(e.target.value)}
          style={inputStyle}
        />

        <input
          type="number"
          placeholder="Tasa de Interés (%)"
          value={interestRate}
          onChange={(e) => setInterestRate(e.target.value)}
          style={inputStyle}
        />

        <input
          type="number"
          placeholder="Plazo"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          style={inputStyle}
        />
      </div>

      {/* Método */}
      <h3
        style={{
          textAlign: 'center',
          fontSize: '22px',
          fontWeight: 'bold',
          marginBottom: '16px',
          color: '#0A3143'
        }}
      >
        Método
      </h3>

      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '12px',
          marginBottom: '32px'
        }}
      >
        <button
          onClick={() => setMethod('frances')}
          style={{
            padding: '10px 32px',
            border: 'none',
            background: method === 'frances' ? '#276E90' : '#D9D9D9',
            color: method === 'frances' ? 'white' : '#0A3143',
            borderRadius: '20px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold'
          }}
        >
          Francés
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
            fontSize: '14px',
            fontWeight: 'bold'
          }}
        >
          Alemán
        </button>
      </div>

      {/* Calcular */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <button
          onClick={calculateAmortization}
          style={{
            padding: '14px 48px',
            background: '#0A3143',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold'
          }}
        >
          Calcular
        </button>
      </div>

      {/* Tabla */}
      {schedule.length > 0 && (
        <div style={{ overflowX: 'auto' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '14px'
            }}
          >
            <thead>
              <tr style={{ background: '#276E90', color: 'white' }}>
                <th style={thStyle}>N° Cuota</th>
                <th style={thStyle}>Cuota</th>
                <th style={thStyle}>Interés</th>
                <th style={thStyle}>Capital</th>
                <th style={thStyle}>Saldo</th>
              </tr>
            </thead>
            <tbody>
              {schedule.map((row, index) => (
                <tr
                  key={index}
                  style={{
                    background:
                      index % 2 === 0 ? '#F5F5F5' : 'transparent'
                  }}
                >
                  <td style={tdStyle}>{row.period}</td>
                  <td style={tdStyle}>{row.payment.toFixed(2)}</td>
                  <td style={tdStyle}>{row.interest.toFixed(2)}</td>
                  <td style={tdStyle}>{row.principal.toFixed(2)}</td>
                  <td style={tdStyle}>{row.balance.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AmortizationPage;
