import { useState, useEffect } from 'react';
import { getCustomers, createCustomer, type Customer } from '../api/financialApi';

const CustomersPage = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);

  // Estado del formulario
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: ''
  });

  // Cargar clientes al inicio
  const loadCustomers = async () => {
    try {
      const data = await getCustomers();
      setCustomers(data);
    } catch (error) {
      console.error("Error cargando clientes");
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.first_name || !formData.last_name || !formData.email) {
      alert("Por favor completa nombre, apellido y email.");
      return;
    }

    setLoading(true);
    try {
      await createCustomer(formData);
      alert("¡Cliente creado exitosamente!");
      setFormData({ first_name: '', last_name: '', email: '', phone: '' }); // Limpiar form
      loadCustomers(); // Recargar la tabla
    } catch (error) {
      console.error(error);
      alert("Error al crear cliente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20, maxWidth: 1000, margin: "0 auto" }}>
      <h1 style={{ color: '#0A3143', marginBottom: 20 }}>Gestión de Clientes</h1>

      {/* --- FORMULARIO DE CREACIÓN --- */}
      <div style={{ 
        background: 'white', padding: 20, borderRadius: 10, 
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)', marginBottom: 30,
        border: '1px solid #e0e0e0'
      }}>
        <h3 style={{ margin: '0 0 15px 0', color: '#276E90' }}>Registrar Nuevo Cliente</h3>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15 }}>
          
          <input
            name="first_name"
            placeholder="Nombre"
            value={formData.first_name}
            onChange={handleInputChange}
            style={{ padding: 10, borderRadius: 5, border: '1px solid #ccc' }}
          />
          <input
            name="last_name"
            placeholder="Apellido"
            value={formData.last_name}
            onChange={handleInputChange}
            style={{ padding: 10, borderRadius: 5, border: '1px solid #ccc' }}
          />
          <input
            name="email"
            type="email"
            placeholder="Correo Electrónico"
            value={formData.email}
            onChange={handleInputChange}
            style={{ padding: 10, borderRadius: 5, border: '1px solid #ccc' }}
          />
          <input
            name="phone"
            placeholder="Teléfono (Opcional)"
            value={formData.phone}
            onChange={handleInputChange}
            style={{ padding: 10, borderRadius: 5, border: '1px solid #ccc' }}
          />

          <button 
            type="submit" 
            disabled={loading}
            style={{ 
              gridColumn: '1 / -1',
              padding: 12,
              background: '#0A3143',
              color: 'white',
              border: 'none',
              borderRadius: 5,
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? "Guardando..." : "Crear Cliente"}
          </button>
        </form>
      </div>

      {/* --- TABLA DE CLIENTES --- */}
      <h3 style={{ color: '#0A3143' }}>Lista de Clientes</h3>
      <div style={{ overflowX: 'auto', background: 'white', borderRadius: 8, boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f0f9ff', color: '#0A3143', textAlign: 'left' }}>
              <th style={{ padding: 12, borderBottom: '2px solid #276E90' }}>ID</th>
              <th style={{ padding: 12, borderBottom: '2px solid #276E90' }}>Nombre</th>
              <th style={{ padding: 12, borderBottom: '2px solid #276E90' }}>Email</th>
              <th style={{ padding: 12, borderBottom: '2px solid #276E90' }}>Teléfono</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: 10 }}>{c.id}</td>
                <td style={{ padding: 10, fontWeight: 600 }}>{c.first_name} {c.last_name}</td>
                <td style={{ padding: 10, color: '#666' }}>{c.email}</td>
                <td style={{ padding: 10, color: '#666' }}>{c.phone || '-'}</td>
              </tr>
            ))}
            {customers.length === 0 && (
              <tr>
                <td colSpan={4} style={{ padding: 20, textAlign: 'center', color: '#888' }}>
                  No hay clientes registrados aún.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CustomersPage;