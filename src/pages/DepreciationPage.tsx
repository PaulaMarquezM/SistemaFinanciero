import { useState, useEffect } from 'react';
import { 
  getAssets, 
  createAsset, 
  deleteAsset, 
  getAssetDepreciation, 
  type Asset, 
  type AssetDepreciationRow 
} from '../api/financialApi';
import { Trash2, PlusCircle, Calculator, X, FileSpreadsheet, Copy, Printer } from 'lucide-react';

const DepreciacionPage = () => {
  // --- ESTADOS ---
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<AssetDepreciationRow[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

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
  }, []);

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
    csvContent += `Activo: ${selectedAsset.name}\n`;
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

  // --- MÉTRICAS ---
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

  // --- ESTILOS GENERALES ---
  const cardStyle = { background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' };
  const labelStyle = { display: 'block', marginBottom: 6, fontWeight: 600, color: '#374151', fontSize: '0.9rem' };
  const inputStyle = { padding: '10px 12px', borderRadius: 8, border: '1px solid #d1d5db', width: '100%', fontSize: '0.95rem' };
  const metricCardStyle = { background: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0' };
  const actionButtonStyle = { 
    display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', borderRadius: '6px', 
    border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500, color: '#334155'
  };

  // --- ESTILOS DE TABLA ---
  const tableHeaderStyle = {
    background: '#f1f5f9',
    color: '#1e293b',
    fontWeight: '700',
    padding: '12px',
    textAlign: 'left' as const,
    borderBottom: '2px solid #e2e8f0',
    fontSize: '0.8rem',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em'
  };

  const tableCellStyle = {
    padding: '10px 12px',
    borderBottom: '1px solid #e2e8f0',
    color: '#334155',
    fontSize: '0.9rem'
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* HEADER */}
      <div className="no-print" style={{ marginBottom: '30px' }}>
        <h1 style={{ color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.8rem' }}>
          <Calculator className="text-blue-600" size={32} /> Gestión de Activos Fijos
        </h1>
        <p style={{ color: '#64748b', marginTop: '5px' }}>Registro y depreciación automática bajo normativa SRI</p>
      </div>

      <div className="no-print" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px' }}>
        
        {/* --- FORMULARIO --- */}
        <div style={cardStyle}>
          <h3 style={{ color: '#334155', marginTop: 0, borderBottom: '1px solid #e2e8f0', paddingBottom: '10px', marginBottom: '20px' }}>
            Nuevo Activo
          </h3>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={labelStyle}>Nombre del Activo</label>
              <input name="name" placeholder="Ej: Camioneta Ford" value={form.name} onChange={handleInputChange} style={inputStyle} required />
            </div>
            <div>
              <label style={labelStyle}>Tipo de Activo (Tabla SRI)</label>
              <select name="category" value={form.category} onChange={handleCategoryChange} style={inputStyle}>
                {Object.keys(SRI_CATEGORIES).map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div>
                <label style={labelStyle}>Costo ($)</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 10, top: 10, color: '#9ca3af' }}>$</span>
                  <input name="cost" type="number" style={{...inputStyle, paddingLeft: 25}} placeholder="0.00" value={form.cost} onChange={handleInputChange} required min="1" />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Vida Útil (Años)</label>
                <input name="useful_life_years" type="number" value={form.useful_life_years} onChange={handleInputChange} style={{...inputStyle, background: '#f1f5f9'}} readOnly />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div>
                <label style={labelStyle}>Valor Residual (%)</label>
                <input name="residual_rate" type="number" step="0.01" value={form.residual_rate} onChange={handleInputChange} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Fecha Compra</label>
                <input name="acquisition_date" type="date" value={form.acquisition_date} onChange={handleInputChange} style={inputStyle} />
              </div>
            </div>
            <button type="submit" disabled={loading} style={{ marginTop: '10px', padding: '14px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', fontSize: '1rem', boxShadow: '0 4px 6px rgba(37, 99, 235, 0.2)' }}>
              {loading ? "Procesando..." : <><PlusCircle size={20} /> Guardar y Calcular</>}
            </button>
          </form>
        </div>

        {/* --- LISTADO --- */}
        <div style={cardStyle}>
          <h3 style={{ color: '#334155', marginTop: 0, marginBottom: '20px' }}>Mis Activos Registrados</h3>
          {assets.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px', color: '#9ca3af', border: '2px dashed #e2e8f0', borderRadius: '12px' }}>
              <Calculator size={48} style={{ marginBottom: 10, opacity: 0.5 }} />
              <p>No tienes activos registrados aún.</p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px' }}>
              <thead>
                <tr style={{ color: '#64748b', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  <th style={{ textAlign: 'left', padding: '0 10px' }}>Activo</th>
                  <th style={{ textAlign: 'left', padding: '0 10px' }}>Categoría</th>
                  <th style={{ textAlign: 'right', padding: '0 10px' }}>Costo</th>
                  <th style={{ textAlign: 'center', padding: '0 10px' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {assets.map((asset) => (
                  <tr key={asset.id} style={{ background: '#f8fafc', transition: 'all 0.2s' }}>
                    <td style={{ padding: '16px 12px', fontWeight: '600', color: '#1e293b', borderTopLeftRadius: 8, borderBottomLeftRadius: 8 }}>{asset.name}</td>
                    <td style={{ padding: '16px 12px', color: '#475569', fontSize: '0.9rem' }}>{asset.category}</td>
                    <td style={{ padding: '16px 12px', textAlign: 'right', fontWeight: 'bold', color: '#059669' }}>${asset.cost.toLocaleString()}</td>
                    <td style={{ padding: '16px 12px', textAlign: 'center', borderTopRightRadius: 8, borderBottomRightRadius: 8 }}>
                      <button onClick={() => handleViewSchedule(asset)} style={{ background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', marginRight: '8px', fontSize: '0.85rem', fontWeight: 500 }}>Ver Tabla</button>
                      <button onClick={() => asset.id && handleDelete(asset.id)} style={{ background: 'white', color: '#ef4444', border: '1px solid #fecaca', padding: '6px', borderRadius: '6px', cursor: 'pointer' }}><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* --- MODAL DETALLADO --- */}
      {showModal && metrics && (
        <div 
          className="modal-overlay" 
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(15, 23, 42, 0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000,
            backdropFilter: 'blur(4px)'
          }}
        >
          {/* ID clave para impresión */}
          <div id="printable-section" style={{ background: 'white', padding: '30px', borderRadius: '16px', width: '90%', maxWidth: '900px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            
            <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '25px' }}>
              <div>
                <h2 style={{ margin: 0, color: '#1e293b', fontSize: '1.5rem' }}>{selectedAsset?.name}</h2>
                <p style={{ margin: '5px 0 0 0', color: '#64748b' }}>Método: Línea Recta | Vida Útil: {selectedAsset?.useful_life_years} años</p>
              </div>
              <button onClick={() => setShowModal(false)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: 36, height: 36, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>

            {/* ENCABEZADO SOLO PARA IMPRESIÓN */}
            <div className="print-only-header" style={{ display: 'none', marginBottom: '20px', borderBottom: '2px solid #000', paddingBottom: '10px' }}>
              <h2 style={{ fontSize: '24px', margin: 0 }}>Tabla de Depreciación</h2>
              <p style={{ fontSize: '14px', margin: 0 }}>Activo: <strong>{selectedAsset?.name}</strong> | Costo: ${metrics.costo.toLocaleString()}</p>
            </div>

            {/* TARJETAS (NO PRINT) */}
            <div className="no-print" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '30px' }}>
              <div style={metricCardStyle}>
                <span style={{color: '#64748b', fontSize: '0.85rem'}}>Costo Original</span>
                <div style={{fontSize: '1.4rem', fontWeight: 'bold', color: '#1e293b'}}>${metrics.costo.toLocaleString()}</div>
              </div>
              <div style={metricCardStyle}>
                <span style={{color: '#64748b', fontSize: '0.85rem'}}>Valor Residual (10%)</span>
                <div style={{fontSize: '1.4rem', fontWeight: 'bold', color: '#1e293b'}}>${metrics.residual.toLocaleString()}</div>
              </div>
              <div style={{...metricCardStyle, background: '#f0fdf4', borderColor: '#bbf7d0'}}>
                <span style={{color: '#166534', fontSize: '0.85rem', fontWeight: 600}}>Depreciación Anual</span>
                <div style={{fontSize: '1.4rem', fontWeight: 'bold', color: '#15803d'}}>${metrics.depAnual.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
              </div>
              <div style={{...metricCardStyle, background: '#eff6ff', borderColor: '#bfdbfe'}}>
                <span style={{color: '#1e40af', fontSize: '0.85rem', fontWeight: 600}}>Depreciación Mensual</span>
                <div style={{fontSize: '1.4rem', fontWeight: 'bold', color: '#1d4ed8'}}>${metrics.depMensual.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
              </div>
            </div>

            {/* BOTONES (NO PRINT) */}
            <div className="no-print" style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              <button onClick={downloadCSV} style={actionButtonStyle}>
                <FileSpreadsheet size={16} /> Exportar CSV
              </button>
              <button onClick={copyToClipboard} style={actionButtonStyle}>
                <Copy size={16} /> Copiar Tabla
              </button>
              <button onClick={printPDF} style={actionButtonStyle}>
                <Printer size={16} /> Imprimir / PDF
              </button>
            </div>

            <h4 className="no-print" style={{marginBottom: 15, color: '#334155'}}>Tabla de Amortización del Activo</h4>
            
            {/* TABLA PRINCIPAL */}
            <div className="table-container" style={{ border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    <th style={{ ...tableHeaderStyle, textAlign: 'center' }}>Periodo</th>
                    <th style={{ ...tableHeaderStyle, textAlign: 'center' }}>Fecha</th>
                    <th style={{ ...tableHeaderStyle, textAlign: 'right' }}>Depreciación</th>
                    <th style={{ ...tableHeaderStyle, textAlign: 'right' }}>Acumulada</th>
                    <th style={{ ...tableHeaderStyle, textAlign: 'right' }}>Valor en Libros</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedSchedule.map((row, index) => (
                    <tr key={row.period_number} style={{ background: index % 2 === 0 ? 'white' : '#fcfcfc', borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ ...tableCellStyle, textAlign: 'center' }}>{row.period_number}</td>
                      <td style={{ ...tableCellStyle, textAlign: 'center' }}>{row.period_date}</td>
                      <td style={{ ...tableCellStyle, textAlign: 'right' }}>${row.depreciation_amount.toFixed(2)}</td>
                      <td style={{ ...tableCellStyle, textAlign: 'right' }}>${row.accumulated_depreciation.toFixed(2)}</td>
                      <td style={{ ...tableCellStyle, textAlign: 'right', fontWeight: 'bold', color: '#0f172a' }}>${row.book_value.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --- ESTILOS DE IMPRESIÓN CORREGIDOS --- */}
      <style>{`
        @media print {
          /* 1. Ocultar todo lo normal */
          body * {
            visibility: hidden;
          }

          /* 2. EL TRUCO: Resetear el Overlay para que no sea fixed */
          .modal-overlay {
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            height: auto !important;
            z-index: 9999 !important;
            overflow: visible !important;
            display: block !important;
            background: white !important;
          }

          /* 3. Hacer visible el contenido del modal */
          #printable-section, #printable-section * {
            visibility: visible !important;
          }

          /* 4. Resetear el contenedor de la tabla para que fluya */
          #printable-section {
            position: static !important;
            width: 100% !important;
            max-width: 100% !important;
            height: auto !important;
            max-height: none !important;
            overflow: visible !important;
            padding: 20px !important;
            margin: 0 !important;
            box-shadow: none !important;
          }

          .table-container {
            border: none !important;
            overflow: visible !important;
          }

          /* 5. Utilidades */
          .no-print {
            display: none !important;
          }
          .print-only-header {
            display: block !important;
          }
        }
      `}</style>
    </div>
  );
};

export default DepreciacionPage;