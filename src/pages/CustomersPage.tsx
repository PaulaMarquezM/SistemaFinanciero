import { useState, useEffect } from 'react';
import { 
  getCustomers, 
  createCustomer, 
  updateCustomer, 
  deleteCustomer, 
  type Customer 
} from '../api/financialApi';
import { 
  User, 
  Mail, 
  Phone, 
  CreditCard, 
  Trash2, 
  Edit2, 
  UserPlus, 
  Users, 
  Search,
  Save,
  X
} from 'lucide-react';

// --- ESTILOS UNIFICADOS ---
const styles = {
  page: {
    background: "#f8fafc",
    borderRadius: 20,
    padding: 32,
    maxWidth: 1200,
    margin: "0 auto",
  } as React.CSSProperties,

  headerContainer: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    marginBottom: 24,
  } as React.CSSProperties,

  title: {
    fontWeight: 900,
    fontSize: 32,
    color: "#0f172a",
    margin: 0,
    letterSpacing: -0.5,
  } as React.CSSProperties,

  subtitle: {
    marginTop: 4,
    color: "#64748b",
    fontSize: 14,
    margin: 0,
  } as React.CSSProperties,

  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1.5fr", // Formulario izq, Lista der
    gap: 24,
    alignItems: "start",
  } as React.CSSProperties,

  card: {
    background: "white",
    borderRadius: 16,
    padding: 24,
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    border: "1px solid #e2e8f0",
  } as React.CSSProperties,

  cardTitle: {
    fontWeight: 800,
    color: "#0f172a",
    margin: "0 0 16px",
    fontSize: 18,
    borderBottom: "1px solid #f1f5f9",
    paddingBottom: 12,
    display: 'flex', 
    alignItems: 'center', 
    gap: 8
  } as React.CSSProperties,

  field: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    marginBottom: 16,
  } as React.CSSProperties,

  label: {
    fontSize: 13,
    color: "#334155",
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    gap: 6
  } as React.CSSProperties,

  input: {
    padding: "10px 12px",
    borderRadius: 8,
    border: "1px solid #cbd5e1",
    outline: "none",
    fontSize: 14,
    transition: "all 0.2s",
    width: "100%",
  } as React.CSSProperties,

  primaryBtn: {
    padding: "12px 20px",
    borderRadius: 8,
    border: "none",
    background: "#0f172a", // Azul corporativo
    color: "white",
    fontWeight: 700,
    cursor: "pointer",
    width: '100%',
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    gap: 8,
    boxShadow: "0 4px 6px rgba(15, 23, 42, 0.2)",
  } as React.CSSProperties,

  secondaryBtn: {
    padding: "12px 20px",
    borderRadius: 8,
    border: "1px solid #cbd5e1",
    background: "white", 
    color: "#475569",
    fontWeight: 700,
    cursor: "pointer",
    width: '100%',
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    gap: 8,
  } as React.CSSProperties,

  actionBtn: {
    padding: "6px",
    borderRadius: 6,
    border: "none",
    background: "transparent",
    cursor: "pointer",
    display: 'flex',
    alignItems: 'center',
    transition: 'background 0.2s'
  } as React.CSSProperties,

  emptyState: {
    textAlign: 'center',
    padding: '40px 20px',
    color: '#94a3b8',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 12
  } as React.CSSProperties,
};

const CustomersPage = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const initialFormState = {
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    document_number: ''
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
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEdit = (customer: Customer) => {
    setFormData(customer);
    setEditingId(customer.id || null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setFormData(initialFormState);
    setEditingId(null);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Estás seguro de eliminar este cliente permanentemente?")) return;
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
        await updateCustomer(editingId, formData);
        alert("¡Cliente actualizado correctamente!");
      } else {
        await createCustomer(formData);
        alert("¡Cliente creado exitosamente!");
      }
      handleCancelEdit();
      loadCustomers();
    } catch (error) {
      console.error(error);
      alert("Error al guardar. Verifica si el email o cédula ya existen.");
    } finally {
      setLoading(false);
    }
  };

  // Filtrado de clientes
  const filteredCustomers = customers.filter(c => 
    c.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.document_number || "").includes(searchTerm)
  );

  return (
    <div style={styles.page}>
      
      {/* HEADER VISUAL */}
      <div style={styles.headerContainer}>
         {/* AQUI ESTÁ LA CORRECCIÓN: LOGO COMO IMAGEN */}
         <img 
            src="/logo.png" 
            alt="Logo Sistema Financiero" 
            style={{ width: 48, height: 48, objectFit: 'contain' }}
            onError={(e) => { (e.target as HTMLImageElement).src = '/LOGOSF.png'; }}
         />
         <div>
            <h1 style={styles.title}>Gestión de Clientes</h1>
            <p style={styles.subtitle}>Administración de base de datos de socios</p>
         </div>
      </div>

      <div style={styles.grid}>
        
        {/* --- TARJETA 1: FORMULARIO (IZQUIERDA) --- */}
        <div style={styles.card}>
          <div style={styles.cardTitle}>
            {editingId ? <Edit2 size={20} className="text-amber-500" /> : <UserPlus size={20} className="text-blue-600" />} 
            {editingId ? 'Editar Cliente' : 'Nuevo Cliente'}
          </div>
          
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={styles.field}>
                    <label style={styles.label}>Nombre</label>
                    <input name="first_name" placeholder="Ej: Juan" value={formData.first_name} onChange={handleInputChange} style={styles.input} />
                </div>
                <div style={styles.field}>
                    <label style={styles.label}>Apellido</label>
                    <input name="last_name" placeholder="Ej: Pérez" value={formData.last_name} onChange={handleInputChange} style={styles.input} />
                </div>
            </div>

            <div style={styles.field}>
              <label style={styles.label}><CreditCard size={16}/> Cédula / DNI</label>
              <input name="document_number" placeholder="Ej: 1312345678" value={formData.document_number} onChange={handleInputChange} style={styles.input} />
            </div>

            <div style={styles.field}>
              <label style={styles.label}><Mail size={16}/> Correo Electrónico</label>
              <input name="email" type="email" placeholder="juan@ejemplo.com" value={formData.email} onChange={handleInputChange} style={styles.input} />
            </div>

            <div style={styles.field}>
              <label style={styles.label}><Phone size={16}/> Teléfono (Opcional)</label>
              <input name="phone" placeholder="Ej: 0991234567" value={formData.phone || ''} onChange={handleInputChange} style={styles.input} />
            </div>

            <div style={{display: 'flex', gap: 10, marginTop: 10}}>
                <button type="submit" disabled={loading} style={{
                    ...styles.primaryBtn, 
                    background: editingId ? '#f59e0b' : '#0f172a', 
                    opacity: loading ? 0.7 : 1
                }}>
                  {loading ? "Procesando..." : <><Save size={18} /> {editingId ? "Actualizar" : "Guardar"}</>}
                </button>
                
                {editingId && (
                    <button type="button" onClick={handleCancelEdit} style={styles.secondaryBtn}>
                        <X size={18} /> Cancelar
                    </button>
                )}
            </div>
          </form>
        </div>

        {/* --- TARJETA 2: LISTADO (DERECHA) --- */}
        <div style={styles.card}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, borderBottom: '1px solid #f1f5f9', paddingBottom: 12}}>
             <div style={styles.cardTitle}><Users size={20} className="text-blue-600" /> Directorio</div>
             
             {/* Buscador */}
             <div style={{position: 'relative', width: '200px'}}>
                <Search size={16} style={{position: 'absolute', left: 10, top: 10, color: '#94a3b8'}} />
                <input 
                    placeholder="Buscar..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{...styles.input, paddingLeft: 32, paddingRight: 10, borderRadius: 20, fontSize: 13}} 
                />
             </div>
          </div>
          
          {customers.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={{background: '#f1f5f9', padding: 20, borderRadius: '50%'}}>
                <Users size={40} strokeWidth={1.5} />
              </div>
              <p>No tienes clientes registrados.</p>
              <small>Usa el formulario para agregar el primero.</small>
            </div>
          ) : (
            <div style={{ overflowX: 'auto', maxHeight: '500px', overflowY: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{position: 'sticky', top: 0, background: 'white', zIndex: 1}}>
                    <tr style={{ borderBottom: '2px solid #f1f5f9' }}>
                    <th style={{ textAlign: 'left', padding: '12px', fontSize: 12, color: '#64748b', textTransform: 'uppercase' }}>Cliente</th>
                    <th style={{ textAlign: 'left', padding: '12px', fontSize: 12, color: '#64748b', textTransform: 'uppercase' }}>Contacto</th>
                    <th style={{ textAlign: 'right', padding: '12px', fontSize: 12, color: '#64748b', textTransform: 'uppercase' }}>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredCustomers.length > 0 ? filteredCustomers.map((c) => (
                    <tr key={c.id} style={{ borderBottom: '1px solid #f8fafc', transition: 'background 0.2s' }}>
                        <td style={{ padding: '12px', verticalAlign: 'middle' }}>
                            <div style={{fontWeight: 700, color: '#1e293b', fontSize: 14}}>{c.first_name} {c.last_name}</div>
                            <div style={{fontSize: 12, color: '#64748b', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2}}>
                                <CreditCard size={12}/> {c.document_number}
                            </div>
                        </td>
                        <td style={{ padding: '12px', verticalAlign: 'middle' }}>
                            <div style={{fontSize: 13, color: '#334155'}}>{c.email}</div>
                            {c.phone && <div style={{fontSize: 12, color: '#94a3b8'}}>{c.phone}</div>}
                        </td>
                        <td style={{ padding: '12px', textAlign: 'right' }}>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 4 }}>
                                <button 
                                    onClick={() => handleEdit(c)} 
                                    style={{...styles.actionBtn, color: '#2563eb', background: '#eff6ff'}}
                                    title="Editar"
                                >
                                    <Edit2 size={16} />
                                </button>
                                <button 
                                    onClick={() => c.id && handleDelete(c.id)} 
                                    style={{...styles.actionBtn, color: '#ef4444', background: '#fef2f2'}}
                                    title="Eliminar"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </td>
                    </tr>
                    )) : (
                        <tr><td colSpan={3} style={{padding: 20, textAlign: 'center', color: '#94a3b8'}}>No se encontraron resultados</td></tr>
                    )}
                </tbody>
                </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomersPage;