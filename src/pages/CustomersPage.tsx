import { useState, useEffect } from 'react';
import { 
  getCustomers, 
  createCustomer, 
  updateCustomer, 
  deleteCustomer, 
  type Customer 
} from '../api/financialApi';

const CustomersPage = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null); // Para saber si editamos

  // Estado del formulario (Agregué document_number)
  const initialFormState = {
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    document_number: '' // <--- IMPORTANTE para el backend
  };
  const [formData, setFormData] = useState<Customer>(initialFormState);

  // Cargar clientes
  const loadCustomers = async () => {
    try {
      const data = await getCustomers();
      setCustomers(data);
    } catch (error) {
      console.error("Error cargando clientes", error);
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

  // Cargar datos en el formulario para editar
  const handleEdit = (customer: Customer) => {
    setFormData(customer);
    setEditingId(customer.id || null);
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Subir al formulario
  };

  // Cancelar edición
  const handleCancelEdit = () => {
    setFormData(initialFormState);
    setEditingId(null);
  };

  // Eliminar cliente
  const handleDelete = async (id: number) => {
    if (!confirm("¿Estás seguro de eliminar este cliente?")) return;
    try {
      await deleteCustomer(id);
      loadCustomers();
    } catch (error) {
      alert("Error al eliminar cliente");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.first_name || !formData.last_name || !formData.email || !formData.document_number) {
      alert("Por favor completa nombre, apellido, email y cédula.");
      return;
    }

    setLoading(true);
    try {
      if (editingId) {
        // MODO EDICIÓN
        await updateCustomer(editingId, formData);
        alert("¡Cliente actualizado correctamente!");
      } else {
        // MODO CREACIÓN
        await createCustomer(formData);
        alert("¡Cliente creado exitosamente!");
      }
      
      handleCancelEdit(); // Limpiar todo
      loadCustomers();    // Recargar tabla
    } catch (error) {
      console.error(error);
      alert("Error al guardar cliente. Revisa si el email o cédula ya existen.");
    } finally {
      setLoading(false);
    }
  };

  // Estilos
  const inputStyle = { padding: 10, borderRadius: 5, border: '1px solid #ccc' };
  const thStyle = { padding: 12, borderBottom: '2px solid #276E90', textAlign: 'left' as const };

  return (
    <div style={{ padding: 20, maxWidth: 1000, margin: "0 auto" }}>
      <h1 style={{ color: '#0A3143', marginBottom: 20 }}>Gestión de Clientes</h1>

      {/* --- FORMULARIO --- */}
      <div style={{ 
        background: 'white', padding: 20, borderRadius: 10, 
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)', marginBottom: 30,
        border: '1px solid #e0e0e0',
        borderLeft: editingId ? '5px solid #f59e0b' : '5px solid #0A3143' // Color cambia si editas
      }}>
        <h3 style={{ margin: '0 0 15px 0', color: editingId ? '#d97706' : '#276E90' }}>
          {editingId ? 'Editar Cliente' : 'Registrar Nuevo Cliente'}
        </h3>
        
        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15 }}>
          
          <input name="first_name" placeholder="Nombre" value={formData.first_name} onChange={handleInputChange} style={inputStyle} />
          <input name="last_name" placeholder="Apellido" value={formData.last_name} onChange={handleInputChange} style={inputStyle} />
          <input name="document_number" placeholder="Cédula / DNI" value={formData.document_number} onChange={handleInputChange} style={inputStyle} />
          <input name="email" type="email" placeholder="Correo Electrónico" value={formData.email} onChange={handleInputChange} style={inputStyle} />
          <input name="phone" placeholder="Teléfono (Opcional)" value={formData.phone || ''} onChange={handleInputChange} style={inputStyle} />

          <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 10 }}>
            <button 
              type="submit" 
              disabled={loading}
              style={{ 
                flex: 1, padding: 12, background: editingId ? '#f59e0b' : '#0A3143', 
                color: 'white', border: 'none', borderRadius: 5, fontWeight: 'bold', cursor: 'pointer' 
              }}
            >
              {loading ? "Guardando..." : (editingId ? "Actualizar Cliente" : "Crear Cliente")}
            </button>
            
            {editingId && (
              <button 
                type="button" 
                onClick={handleCancelEdit}
                style={{ 
                  padding: '12px 20px', background: '#9ca3af', color: 'white', 
                  border: 'none', borderRadius: 5, fontWeight: 'bold', cursor: 'pointer' 
                }}
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      {/* --- TABLA --- */}
      <h3 style={{ color: '#0A3143' }}>Lista de Clientes</h3>
      <div style={{ overflowX: 'auto', background: 'white', borderRadius: 8, boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f0f9ff', color: '#0A3143' }}>
              <th style={thStyle}>Nombre</th>
              <th style={thStyle}>Cédula</th>
              <th style={thStyle}>Email</th>
              <th style={thStyle}>Teléfono</th>
              <th style={thStyle}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: 10, fontWeight: 600 }}>{c.first_name} {c.last_name}</td>
                <td style={{ padding: 10 }}>{c.document_number}</td>
                <td style={{ padding: 10, color: '#666' }}>{c.email}</td>
                <td style={{ padding: 10, color: '#666' }}>{c.phone || '-'}</td>
                <td style={{ padding: 10 }}>
                  <button 
                    onClick={() => handleEdit(c)}
                    style={{ marginRight: 8, color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    Editar
                  </button>
                  <button 
                    onClick={() => c.id && handleDelete(c.id)}
                    style={{ color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
            {customers.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: 20, textAlign: 'center', color: '#888' }}>
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