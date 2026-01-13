import { useState } from 'react';

interface ScheduleRow {
  period: number;
  payment: number;
  interest: number;
  principal: number;
  balance: number;
}

const AmortizationPage = () => {
  const [loanAmount, setLoanAmount] = useState<string>('');
  const [interestRate, setInterestRate] = useState<string>('');
  const [term, setTerm] = useState<string>('');
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
      // Método Francés (cuota fija)
      const monthlyRate = rate / 12;
      const monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, periods)) / (Math.pow(1 + monthlyRate, periods) - 1);
      
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
      // Método Alemán (amortización constante)
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
    <div style={{ padding: '20px', background: '#EFEFEF', minHeight: '100vh' }}>
      <h2 style={{ marginBottom: '30px', color: '#0A3143', fontSize: '32px', fontWeight: 'bold' }}>
        Amortización
      </h2>
      
      <div style={{ background: 'white', borderRadius: '8px', padding: '30px', marginBottom: '30px' }}>
        <div style={{ display: 'grid', gap: '20px', maxWidth: '500px' }}>
          <div>
            <input
              type="number"
              placeholder="Monto del Préstamo"
              value={loanAmount}
              onChange={(e) => setLoanAmount(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #CECECD',
                borderRadius: '4px',
                fontSize: '14px',
                color: '#0A3143'
              }}
            />
          </div>
          
          <div>
            <input
              type="number"
              placeholder="Tasa de Interés"
              value={interestRate}
              onChange={(e) => setInterestRate(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            />
          </div>
          
          <div>
            <input
              type="number"
              placeholder="Plazo"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            />
          </div>
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: '8px', padding: '30px', marginBottom: '30px' }}>
        <h3 style={{ 
          textAlign: 'center', 
          fontSize: '24px', 
          fontWeight: 'bold', 
          marginBottom: '20px',
          color: '#333'
        }}>
          Método
        </h3>
        
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: '10px',
          marginBottom: '30px'
        }}>
          <button
            onClick={() => setMethod('frances')}
            style={{
              padding: '10px 30px',
              border: method === 'frances' ? '2px solid #276E90' : '1px solid #CECECD',
              background: method === 'frances' ? '#276E90' : 'white',
              color: method === 'frances' ? 'white' : '#0A3143',
              borderRadius: '20px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: method === 'frances' ? 'bold' : 'normal'
            }}
          >
            Francés
          </button>
          <button
            onClick={() => setMethod('aleman')}
            style={{
              padding: '10px 30px',
              border: method === 'aleman' ? '2px solid #276E90' : '1px solid #CECECD',
              background: method === 'aleman' ? '#276E90' : 'white',
              color: method === 'aleman' ? 'white' : '#0A3143',
              borderRadius: '20px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: method === 'aleman' ? 'bold' : 'normal'
            }}
          >
            Alemán
          </button>
        </div>

        <div style={{ textAlign: 'center' }}>
          <button
            onClick={calculateAmortization}
            style={{
              padding: '12px 40px',
              background: '#0A3143',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold'
            }}
          >
            Calcular
          </button>
        </div>
      </div>

      {schedule.length > 0 && (
        <div style={{ background: 'white', borderRadius: '8px', padding: '20px', overflowX: 'auto' }}>
          <table style={{ 
            width: '100%', 
            borderCollapse: 'collapse',
            fontSize: '14px'
          }}>
            <thead>
              <tr style={{ background: '#276E90', color: 'white' }}>
                <th style={{ padding: '12px', border: '1px solid #CECECD' }}>N° Cuota</th>
                <th style={{ padding: '12px', border: '1px solid #CECECD' }}>Cuota Fija</th>
                <th style={{ padding: '12px', border: '1px solid #CECECD' }}>Interés Pagado</th>
                <th style={{ padding: '12px', border: '1px solid #CECECD' }}>Capital Amortizado</th>
                <th style={{ padding: '12px', border: '1px solid #CECECD' }}>Saldo Pendiente</th>
              </tr>
            </thead>
            <tbody>
              {schedule.map((row, index) => (
                <tr 
                  key={index}
                  style={{ 
                    background: index % 2 === 0 ? '#EFEFEF' : 'white'
                  }}
                >
                  <td style={{ padding: '10px', border: '1px solid #CECECD', textAlign: 'center', color: '#0A3143' }}>
                    {row.period}
                  </td>
                  <td style={{ padding: '10px', border: '1px solid #CECECD', textAlign: 'center', color: '#0A3143' }}>
                    {row.payment.toFixed(2)}
                  </td>
                  <td style={{ padding: '10px', border: '1px solid #CECECD', textAlign: 'center', color: '#0A3143' }}>
                    {row.interest.toFixed(2)}
                  </td>
                  <td style={{ padding: '10px', border: '1px solid #CECECD', textAlign: 'center', color: '#0A3143' }}>
                    {row.principal.toFixed(2)}
                  </td>
                  <td style={{ padding: '10px', border: '1px solid #CECECD', textAlign: 'center', color: '#0A3143' }}>
                    {row.balance.toFixed(2)}
                  </td>
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