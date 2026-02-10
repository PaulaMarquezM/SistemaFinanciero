import { useEffect, useState } from 'react';
import { getCredits, deleteCredit, type CreditResponse } from '../api/financialApi';

const CreditsPage = () => {
  const [credits, setCredits] = useState<CreditResponse[]>([]);
  const [loading, setLoading] = useState(true);

  // Cargar créditos al iniciar
  const loadCredits = async () => {
    try {
      const data = await getCredits();
      setCredits(data);
    } catch (error) {
      console.error("Error al cargar créditos", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCredits();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("¿Estás seguro de eliminar este crédito? Se borrarán todos sus pagos.")) return;
    try {
      await deleteCredit(id);
      // Recargar lista filtrando el eliminado
      setCredits(prev => prev.filter(c => c.id !== id));
    } catch (error) {
      alert("Error al eliminar el crédito");
    }
  };

  // Función para formatear moneda
  const money = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

  return (
    <div style={{ padding: 20, maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 style={{ color: '#0A3143', margin: 0 }}>Gestión de Créditos</h1>
        <button 
          onClick={loadCredits} // Botón simple para refrescar
          style={{ padding: '8px 16px', background: '#f0f9ff', border: '1px solid #276E90', color: '#276E90', borderRadius: 6, cursor: 'pointer' }}
        >
          Actualizar Lista
        </button>
      </div>

      {loading ? (
        <p>Cargando créditos...</p>
      ) : credits.length === 0 ? (
        <div style={{ padding: 40, textAlign: 'center', background: '#f9f9f9', borderRadius: 10 }}>
          <p>No hay créditos registrados.</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', borderRadius: 10 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white' }}>
            <thead>
              <tr style={{ background: '#0A3143', color: 'white', textAlign: 'left' }}>
                <th style={{ padding: 12 }}>ID</th>
                <th style={{ padding: 12 }}>Cliente</th>
                <th style={{ padding: 12 }}>Monto</th>
                <th style={{ padding: 12 }}>Tasa</th>
                <th style={{ padding: 12 }}>Plazo</th>
                <th style={{ padding: 12 }}>Método</th>
                <th style={{ padding: 12 }}>Estado</th>
                <th style={{ padding: 12, textAlign: 'center' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {credits.map((credit) => (
                <tr key={credit.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: 12 }}>#{credit.id}</td>
                  <td style={{ padding: 12, fontWeight: 'bold', color: '#276E90' }}>
                    {/* Si tu backend envía el objeto customer, úsalo. Si no, muestra el ID */}
                    {credit.customer ? `${credit.customer.first_name} ${credit.customer.last_name}` : `Cliente ID: ${credit.customer_id}`}
                  </td>
                  <td style={{ padding: 12 }}>{money(credit.principal)}</td>
                  <td style={{ padding: 12 }}>{credit.annual_rate}%</td>
                  <td style={{ padding: 12 }}>{credit.periods} meses</td>
                  <td style={{ padding: 12, textTransform: 'capitalize' }}>{credit.method}</td>
                  <td style={{ padding: 12 }}>
                    <span style={{
                      padding: '4px 8px', borderRadius: 12, fontSize: 12, fontWeight: 600,
                      background: credit.status === 'active' ? '#dcfce7' : '#fef2f2',
                      color: credit.status === 'active' ? '#166534' : '#991b1b'
                    }}>
                      {credit.status}
                    </span>
                  </td>
                  <td style={{ padding: 12, textAlign: 'center' }}>
                    <button
                      onClick={() => handleDelete(credit.id)}
                      style={{
                        padding: '6px 10px',
                        background: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: 6,
                        cursor: 'pointer',
                        fontSize: 12
                      }}
                    >
                      Eliminar
                    </button>
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

export default CreditsPage;