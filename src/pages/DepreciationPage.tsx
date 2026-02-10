import { useState, useEffect } from 'react';
import { 
  getAssets, 
  createAsset, 
  deleteAsset, 
  getAssetDepreciation, 
  // IMPORTAMOS GETCUSTOMERS
  getCustomers,
  type Customer,
  type Asset, 
  type AssetDepreciationRow 
} from '../api/financialApi';
import { Trash2, PlusCircle, Calculator, X, FileSpreadsheet, Copy, Printer, Search, User } from 'lucide-react';

const styles = {
  page: { background: "#f8fafc", borderRadius: 20, padding: 32, maxWidth: 1200, margin: "0 auto" } as React.CSSProperties,
  headerContainer: { display: "flex", alignItems: "center", gap: 16, marginBottom: 24 } as React.CSSProperties,
  title: { fontWeight: 900, fontSize: 32, color: "#0f172a", margin: 0, letterSpacing: -0.5 } as React.CSSProperties,
  subtitle: { marginTop: 4, color: "#64748b", fontSize: 14, margin: 0 } as React.CSSProperties,
  grid: { display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: 24, alignItems: "start" } as React.CSSProperties,
  card: { background: "white", borderRadius: 16, padding: 24, boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)", border: "1px solid #e2e8f0" } as React.CSSProperties,
  cardTitle: { fontWeight: 800, color: "#0f172a", margin: "0 0 16px", fontSize: 18, borderBottom: "1px solid #f1f5f9", paddingBottom: 12, display: 'flex', alignItems: 'center', gap: 8 } as React.CSSProperties,
  field: { display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 } as React.CSSProperties,
  label: { fontSize: 13, color: "#334155", fontWeight: 700 } as React.CSSProperties,
  input: { padding: "10px 12px", borderRadius: 8, border: "1px solid #cbd5e1", outline: "none", fontSize: 14, width: "100%" } as React.CSSProperties,
  select: { padding: "10px 12px", borderRadius: 8, border: "1px solid #cbd5e1", outline: "none", fontSize: 14, background: "white", width: "100%" } as React.CSSProperties,
  primaryBtn: { padding: "12px 20px", borderRadius: 8, border: "none", background: "#0f172a", color: "white", fontWeight: 700, cursor: "pointer", width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8 } as React.CSSProperties,
  actionBtn: { padding: "6px 12px", borderRadius: 6, border: "1px solid #e2e8f0", background: "white", color: "#334155", fontSize: 12, fontWeight: 600, cursor: "pointer", display: 'flex', alignItems: 'center', gap: 6 } as React.CSSProperties,
  emptyState: { textAlign: 'center', padding: '40px 20px', color: '#94a3b8', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 } as React.CSSProperties,
  metricCard: { background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' } as React.CSSProperties,
};

const DepreciacionPage = () => {
  // --- ESTADOS ---
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<AssetDepreciationRow[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

  // ESTADOS PARA CLIENTE
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  const [selectedCustomerName, setSelectedCustomerName] = useState<string>("Administrador");

  // Categorías SRI
  const SRI_CATEGORIES = {
    "Inmuebles (excepto terrenos)": 20,
    "Instalaciones, maquinarias, equipos y muebles": 10,
    "Vehículos, equipos de transporte y caminero móvil": 5,
    "Equipos de cómputo y software": 3,
    "Otros": 5
  };

  const [form, setForm] = useState<Asset>({
    name: '',
    category: 'Equipos de cómputo y software',
    cost: 0,
    residual_rate: 0.10, 
    useful_life_years: 3,
    acquisition_date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    loadAssets();
    // Cargamos clientes al inicio
    getCustomers().then(setCustomers).catch(console.error);
  }, []);

  // Actualizar nombre de cliente seleccionado para el reporte
  useEffect(() => {
    if (selectedCustomerId) {
      const c = customers.find(x => String(x.id) === String(selectedCustomerId));
      if (c) {
        // @ts-ignore
        setSelectedCustomerName(c.full_name || `${c.first_name} ${c.last_name}`);
      }
    } else {
        setSelectedCustomerName("Administrador");
    }
  }, [selectedCustomerId, customers]);

  const loadAssets = async () => {
    try {
      const data = await getAssets();
      setAssets(data);
    } catch (error) {
      console.error("Error cargando activos", error);
    }
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const cat = e.target.value;
    // @ts-ignore
    const years = SRI_CATEGORIES[cat] || 5;
    setForm({ ...form, category: cat, useful_life_years: years });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.type === 'number' ? parseFloat(e.target.value) : e.target.value;
    setForm({ ...form, [e.target.name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || form.cost <= 0) return alert("Completa los datos correctamente.");

    setLoading(true);
    try {
      await createAsset(form);
      alert("¡Activo registrado correctamente!");
      loadAssets();
      setForm({ ...form, name: '', cost: 0 }); 
    } catch (error) {
      console.error(error);
      alert("Error al conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if(!confirm("¿Eliminar este activo permanentemente?")) return;
    try {
      await deleteAsset(id);
      loadAssets();
    } catch (error) {
      alert("Error al eliminar.");
    }
  };

  const handleViewSchedule = async (asset: Asset) => {
    if (!asset.id) return;
    try {
      const data = await getAssetDepreciation(asset.id);
      // @ts-ignore
      const schedule = data.schedule || data; 
      setSelectedSchedule(Array.isArray(schedule) ? schedule : []);
      setSelectedAsset(asset);
      setShowModal(true);
    } catch (error) {
      alert("Error cargando la tabla.");
    }
  };

  // --- FUNCIONES DE EXPORTACIÓN ---
  const downloadCSV = () => {
    if (!selectedSchedule.length || !selectedAsset) return;
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += `Cooperativa - Sistema Financiero\n`;
    csvContent += `Reporte de Depreciacion\n`;
    csvContent += `Activo: ${selectedAsset.name},Costo: ${selectedAsset.cost},Cliente: ${selectedCustomerName}\n\n`;
    csvContent += "Periodo,Fecha,Depreciacion Mensual,Depreciacion Acumulada,Valor en Libros\n";
    selectedSchedule.forEach(row => {
      csvContent += `${row.period_number},${row.period_date},${row.depreciation_amount},${row.accumulated_depreciation},${row.book_value}\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `depreciacion_${selectedAsset.name.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyToClipboard = () => {
    if (!selectedSchedule.length) return;
    let text = "Periodo\tFecha\tDepreciacion\tAcumulada\tValor Libros\n";
    selectedSchedule.forEach(row => {
      text += `${row.period_number}\t${row.period_date}\t${row.depreciation_amount}\t${row.accumulated_depreciation}\t${row.book_value}\n`;
    });
    navigator.clipboard.writeText(text);
    alert("¡Tabla copiada al portapapeles!");
  };

  const printPDF = () => {
    window.print();
  };

  const getMetrics = () => {
    if (!selectedAsset || selectedSchedule.length === 0) return null;
    const costo = selectedAsset.cost;
    const residual = costo * selectedAsset.residual_rate;
    const depreciable = costo - residual;
    const depAnual = depreciable / selectedAsset.useful_life_years;
    const depMensual = depAnual / 12;
    return { costo, residual, depreciable, depAnual, depMensual };
  };
  
  const metrics = getMetrics();

  return (
    <div style={styles.page}>
      
      {/* HEADER VISUAL */}
      <div className="no-print" style={styles.headerContainer}>
         <img 
            src="/logo.png" 
            alt="Logo Sistema Financiero" 
            style={{ width: 48, height: 48, objectFit: 'contain' }}
            onError={(e) => (e.target as HTMLImageElement).src = '/LOGOSF.png'}
         />
         <div>
            <h1 style={styles.title}>Gestión de Activos Fijos</h1>
            <p style={styles.subtitle}>Registro, control y depreciación bajo normativa SRI</p>
         </div>
      </div>

      <div className="no-print" style={styles.grid}>
        
        {/* --- TARJETA 1: FORMULARIO --- */}
        <div style={styles.card}>
          <div style={styles.cardTitle}>
            <PlusCircle size={20} className="text-blue-600" /> Nuevo Activo
          </div>
          
          <form onSubmit={handleSubmit}>
            {/* SELECTOR DE CLIENTE */}
            <div style={{background: '#f0f9ff', padding: 10, borderRadius: 8, border: '1px solid #bae6fd', marginBottom: 12}}>
                <label style={{...styles.label, color: '#0369a1', marginBottom: 6}}>
                    <User size={16}/> Asignar a Cliente (Para Reporte)
                </label>
                <select 
                    value={selectedCustomerId} 
                    onChange={(e) => setSelectedCustomerId(e.target.value)} 
                    style={styles.select}
                >
                    <option value="">-- Uso Interno / Administrador --</option>
                    {customers.map(c => (
                        <option key={c.id} value={c.id}>
                            {/* @ts-ignore */}
                            {(c as any).full_name || `${c.first_name} ${c.last_name}`}
                        </option>
                    ))}
                </select>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Nombre del Activo</label>
              <input name="name" placeholder="Ej: Camioneta Ford" value={form.name} onChange={handleInputChange} style={styles.input} required />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Tipo de Activo (Tabla SRI)</label>
              <select name="category" value={form.category} onChange={handleCategoryChange} style={styles.select}>
                {Object.keys(SRI_CATEGORIES).map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={styles.field}>
                <label style={styles.label}>Costo ($)</label>
                <input name="cost" type="number" placeholder="0.00" value={form.cost} onChange={handleInputChange} style={styles.input} required min="1" />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Vida Útil (Años)</label>
                <input name="useful_life_years" type="number" value={form.useful_life_years} onChange={handleInputChange} style={{...styles.input, background: '#f1f5f9', cursor: 'not-allowed'}} readOnly />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={styles.field}>
                <label style={styles.label}>Valor Residual (0.10)</label>
                <input name="residual_rate" type="number" step="0.01" value={form.residual_rate} onChange={handleInputChange} style={styles.input} />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Fecha Compra</label>
                <input name="acquisition_date" type="date" value={form.acquisition_date} onChange={handleInputChange} style={styles.input} />
              </div>
            </div>

            <button type="submit" disabled={loading} style={{...styles.primaryBtn, marginTop: 10, opacity: loading ? 0.7 : 1}}>
              {loading ? "Procesando..." : <>Guardar y Calcular <Calculator size={18} /></>}
            </button>
          </form>
        </div>

        {/* --- TARJETA 2: LISTADO --- */}
        <div style={styles.card}>
          <div style={styles.cardTitle}>
            <Search size={20} className="text-blue-600" /> Mis Activos Registrados
          </div>
          
          {assets.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={{background: '#f1f5f9', padding: 20, borderRadius: '50%'}}>
                <Calculator size={40} strokeWidth={1.5} />
              </div>
              <p>No tienes activos registrados aún.</p>
              <small>Usa el formulario de la izquierda para agregar uno.</small>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ borderBottom: '2px solid #f1f5f9' }}>
                    <th style={{ textAlign: 'left', padding: '12px', fontSize: 13, color: '#64748b' }}>ACTIVO</th>
                    <th style={{ textAlign: 'left', padding: '12px', fontSize: 13, color: '#64748b' }}>CATEGORÍA</th>
                    <th style={{ textAlign: 'right', padding: '12px', fontSize: 13, color: '#64748b' }}>COSTO</th>
                    <th style={{ textAlign: 'center', padding: '12px', fontSize: 13, color: '#64748b' }}>ACCIONES</th>
                    </tr>
                </thead>
                <tbody>
                    {assets.map((asset) => (
                    <tr key={asset.id} style={{ borderBottom: '1px solid #f8fafc', transition: 'background 0.2s' }}>
                        <td style={{ padding: '14px 12px', fontWeight: 600, color: '#1e293b' }}>{asset.name}</td>
                        <td style={{ padding: '14px 12px', fontSize: 13, color: '#64748b' }}>
                            {asset.category.length > 20 ? asset.category.substring(0, 20) + '...' : asset.category}
                        </td>
                        <td style={{ padding: '14px 12px', textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>
                        ${asset.cost.toLocaleString()}
                        </td>
                        <td style={{ padding: '14px 12px' }}>
                            <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
                                <button onClick={() => handleViewSchedule(asset)} style={styles.actionBtn}>
                                    Ver Tabla
                                </button>
                                <button 
                                    onClick={() => asset.id && handleDelete(asset.id)} 
                                    style={{...styles.actionBtn, borderColor: '#fecaca', color: '#ef4444'}}
                                    title="Eliminar"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </td>
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>
          )}
        </div>
      </div>

      {/* --- MODAL DETALLADO --- */}
      {showModal && metrics && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <div id="printable-section" style={{ background: 'white', padding: '32px', borderRadius: '16px', width: '90%', maxWidth: '900px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            
            <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '25px' }}>
              <div>
                  <h2 style={{ margin: 0, color: '#1e293b', fontSize: '1.5rem', fontWeight: 800 }}>{selectedAsset?.name}</h2>
                  <p style={{ margin: '5px 0 0 0', color: '#64748b' }}>Método: Línea Recta | Vida Útil: {selectedAsset?.useful_life_years} años</p>
              </div>
              <button onClick={() => setShowModal(false)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: 36, height: 36, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                  <X size={20} />
              </button>
            </div>

            {/* ENCABEZADO IMPRESIÓN */}
            <div className="print-only-header" style={{ display: 'none', marginBottom: '30px', fontFamily: 'Arial, sans-serif' }}>
              <div style={{ display: 'flex', alignItems: 'center', borderBottom: '2px solid #e2e8f0', paddingBottom: '20px', marginBottom: '20px' }}>
                <div style={{ marginRight: 20 }}>
                    <img 
                      src="/logo.png" 
                      alt="Logo Cooperativa" 
                      style={{ width: 80, height: 'auto', objectFit: 'contain' }}
                      onError={(e) => (e.target as HTMLImageElement).src = '/LOGOSF.png'} 
                    />
                </div>
                <div>
                  <h2 style={{ margin: 0, color: '#0f172a', fontSize: '22px' }}>Cooperativa — Sistema Financiero</h2>
                  <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '14px' }}>Reporte generado automáticamente</p>
                </div>
              </div>

              <h1 style={{ fontSize: '24px', color: '#1e293b', marginBottom: '20px' }}>Tabla de Depreciación de Activo Fijo</h1>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', fontSize: '14px', color: '#334155', marginBottom: '30px' }}>
                <div><strong>Activo:</strong> {selectedAsset?.name}</div>
                <div><strong>Fecha Emisión:</strong> {new Date().toLocaleDateString()}</div>
                <div><strong>Costo Original:</strong> ${metrics.costo.toLocaleString()}</div>
                <div><strong>Valor Residual:</strong> ${metrics.residual.toLocaleString()}</div>
                <div><strong>Vida Útil:</strong> {selectedAsset?.useful_life_years} años</div>
                <div><strong>Cliente:</strong> {selectedCustomerName}</div>
              </div>
            </div>

            {/* MÉTRICAS (NO PRINT) */}
            <div className="no-print" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '30px' }}>
              <div style={styles.metricCard}>
                  <span style={{color: '#64748b', fontSize: '0.85rem', fontWeight: 600}}>Costo Original</span>
                  <div style={{fontSize: '1.4rem', fontWeight: 'bold', color: '#1e293b'}}>${metrics.costo.toLocaleString()}</div>
              </div>
              <div style={styles.metricCard}>
                  <span style={{color: '#64748b', fontSize: '0.85rem', fontWeight: 600}}>Valor Residual</span>
                  <div style={{fontSize: '1.4rem', fontWeight: 'bold', color: '#1e293b'}}>${metrics.residual.toLocaleString()}</div>
              </div>
              <div style={{...styles.metricCard, background: '#f0fdf4', borderColor: '#bbf7d0'}}>
                  <span style={{color: '#166534', fontSize: '0.85rem', fontWeight: 600}}>Depreciación Anual</span>
                  <div style={{fontSize: '1.4rem', fontWeight: 'bold', color: '#15803d'}}>${metrics.depAnual.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
              </div>
              <div style={{...styles.metricCard, background: '#eff6ff', borderColor: '#bfdbfe'}}>
                  <span style={{color: '#1e40af', fontSize: '0.85rem', fontWeight: 600}}>Depreciación Mensual</span>
                  <div style={{fontSize: '1.4rem', fontWeight: 'bold', color: '#1d4ed8'}}>${metrics.depMensual.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
              </div>
            </div>

            <div className="no-print" style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              <button onClick={downloadCSV} style={styles.actionBtn}><FileSpreadsheet size={16} /> Exportar CSV</button>
              <button onClick={copyToClipboard} style={styles.actionBtn}><Copy size={16} /> Copiar Tabla</button>
              <button onClick={printPDF} style={styles.actionBtn}><Printer size={16} /> Imprimir / PDF</button>
            </div>

            <h4 className="no-print" style={{marginBottom: 15, color: '#334155', fontWeight: 800}}>Tabla de Amortización del Activo</h4>
            
            <div className="table-container" style={{ border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ background: '#0A3143', color: 'white' }}> 
                    <th style={{ padding: '14px', textAlign: 'center', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '0.5px' }}>Periodo</th>
                    <th style={{ padding: '14px', textAlign: 'center', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '0.5px' }}>Fecha</th>
                    <th style={{ padding: '14px', textAlign: 'right', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '0.5px' }}>Depreciación</th>
                    <th style={{ padding: '14px', textAlign: 'right', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '0.5px' }}>Acumulada</th>
                    <th style={{ padding: '14px', textAlign: 'right', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '0.5px' }}>Valor en Libros</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedSchedule.map((row, index) => (
                    <tr key={row.period_number} style={{ background: index % 2 === 0 ? 'white' : '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px', textAlign: 'center', color: '#64748b' }}>{row.period_number}</td>
                      <td style={{ padding: '12px', textAlign: 'center', color: '#64748b' }}>{row.period_date}</td>
                      <td style={{ padding: '12px', textAlign: 'right', color: '#334155' }}>${row.depreciation_amount.toFixed(2)}</td>
                      <td style={{ padding: '12px', textAlign: 'right', color: '#334155' }}>${row.accumulated_depreciation.toFixed(2)}</td>
                      <td style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold', color: '#0A3143' }}>${row.book_value.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

             <div className="print-only-header" style={{ display: 'none', marginTop: '40px', borderTop: '1px solid #e2e8f0', paddingTop: '20px', textAlign: 'center', color: '#64748b', fontSize: '12px' }}>
              <p>Documento generado por el Sistema Financiero - Uso Interno</p>
            </div>
            
          </div>
        </div>
      )}

      <style>{`
        @media print {
          body * { visibility: hidden; }
          .modal-overlay { position: absolute !important; top: 0 !important; left: 0 !important; width: 100% !important; height: auto !important; z-index: 9999 !important; overflow: visible !important; display: block !important; background: white !important; }
          #printable-section, #printable-section * { visibility: visible !important; }
          #printable-section { position: static !important; width: 100% !important; max-width: 100% !important; height: auto !important; max-height: none !important; overflow: visible !important; padding: 20px !important; margin: 0 !important; box-shadow: none !important; }
          .table-container { border: none !important; overflow: visible !important; }
          thead tr { background: #0A3143 !important; color: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .no-print { display: none !important; }
          .print-only-header { display: block !important; }
        }
      `}</style>
    </div>
  );
};

export default DepreciacionPage;