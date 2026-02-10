import { useState, useEffect, useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  AreaChart,
  Area
} from 'recharts';
import { 
  TrendingUp, 
  Calendar, 
  DollarSign, 
  PieChart as PieIcon, 
  Activity 
} from 'lucide-react';

// 1. IMPORTAMOS LA API REAL
import { getCredits } from '../api/financialApi';

// --- ESTILOS ---
const styles = {
  page: { background: "#f8fafc", borderRadius: 20, padding: 32, maxWidth: 1200, margin: "0 auto" },
  headerContainer: { display: "flex", alignItems: "center", gap: 16, marginBottom: 32 },
  title: { fontWeight: 900, fontSize: 32, color: "#0f172a", margin: 0, letterSpacing: -0.5 },
  subtitle: { marginTop: 4, color: "#64748b", fontSize: 14, margin: 0 },
  card: { background: "white", borderRadius: 16, padding: 24, boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)", border: "1px solid #e2e8f0", marginBottom: 24 },
  chartTitle: { fontSize: 16, fontWeight: 700, color: "#0f172a", marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 },
  kpiGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 32 },
  kpiCard: { background: 'white', padding: 20, borderRadius: 12, border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 16, boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }
};

// Interfaz interna para los gráficos
interface CreditData {
  id: number;
  amount: number;
  date: string; // YYYY-MM-DD
  status: string;
}

const DashboardPage = () => {
  const [credits, setCredits] = useState<CreditData[]>([]);
  const [loading, setLoading] = useState(true);

  // --- 1. CARGA DE DATOS REALES ---
  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await getCredits();
        
        // TRANSFORMACIÓN DE DATOS (BD -> GRÁFICOS)
        // Mapeamos los campos de tu BD (principal, start_date) a lo que usa el gráfico
        const mappedData: CreditData[] = response.map((c: any) => ({
            id: c.id,
            amount: c.principal, // 'principal' es el monto en tu BD
            // Aseguramos formato fecha corta
            date: c.start_date ? String(c.start_date).split('T')[0] : new Date().toISOString().split('T')[0],
            status: c.status
        }));

        setCredits(mappedData);
      } catch (error) {
        console.error("Error cargando dashboard:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // --- 2. PROCESAMIENTO DE DATOS ---

  // GRÁFICO 1: Créditos Otorgados por Mes
  const monthlyData = useMemo(() => {
    const grouped: Record<string, number> = {};
    credits.forEach(c => {
        // Extraer mes (YYYY-MM)
        const month = c.date.substring(0, 7); 
        grouped[month] = (grouped[month] || 0) + c.amount;
    });
    
    // Convertir a array y ordenar
    return Object.keys(grouped).sort().map(key => ({
        name: key, 
        Monto: grouped[key]
    }));
  }, [credits]);

  // GRÁFICO 2: Crecimiento de Cartera (Acumulado)
  const growthData = useMemo(() => {
    let accumulator = 0;
    const sortedCredits = [...credits].sort((a, b) => a.date.localeCompare(b.date));
    
    const groupedByDate: Record<string, number> = {};
    sortedCredits.forEach(c => {
        groupedByDate[c.date] = (groupedByDate[c.date] || 0) + c.amount;
    });

    return Object.keys(groupedByDate).map(date => {
        accumulator += groupedByDate[date];
        return {
            date,
            Cartera: accumulator
        };
    });
  }, [credits]);

  // GRÁFICO 3: Comparación (Promedio vs Real)
  const comparisonData = useMemo(() => {
     const totalAmount = monthlyData.reduce((acc, curr) => acc + curr.Monto, 0);
     const average = monthlyData.length > 0 ? totalAmount / monthlyData.length : 0;

     return monthlyData.map(m => ({
         name: m.name,
         Promedio: average, 
         Real: m.Monto
     }));
  }, [monthlyData]);

  // KPI TOTALES
  const totalPlaced = credits.reduce((acc, curr) => acc + curr.amount, 0);
  const activeCount = credits.filter(c => c.status === 'active').length;
  
  const growthRate = useMemo(() => {
      if (monthlyData.length < 2) return 0;
      const lastMonth = monthlyData[monthlyData.length - 1].Monto;
      const prevMonth = monthlyData[monthlyData.length - 2].Monto;
      return prevMonth === 0 ? 100 : ((lastMonth - prevMonth) / prevMonth) * 100;
  }, [monthlyData]);

  // Función formateadora segura para los ejes
  const formatYAxis = (val: any) => {
      if (typeof val === 'number') return `$${(val/1000).toFixed(1)}k`;
      return val;
  };

  if (loading) return (
    <div style={{...styles.page, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh'}}>
        <div style={{color: '#64748b', fontSize: 18}}>Cargando datos financieros...</div>
    </div>
  );

  return (
    <div style={styles.page}>
      
      {/* HEADER */}
      <div style={styles.headerContainer}>
         <img 
            src="/logo.png" 
            alt="Logo Sistema" 
            style={{ width: 54, height: 54, objectFit: 'contain' }}
            onError={(e) => (e.target as HTMLImageElement).src = '/LOGOSF.png'}
         />
         <div>
            <h1 style={styles.title}>Tablero Financiero</h1>
            <p style={styles.subtitle}>Análisis en tiempo real de la cartera de créditos</p>
         </div>
      </div>

      {/* KPI CARDS */}
      <div style={styles.kpiGrid}>
          <div style={styles.kpiCard}>
              <div style={{background: '#eff6ff', padding: 12, borderRadius: '50%', color: '#2563eb'}}>
                  <DollarSign size={24} />
              </div>
              <div>
                  <div style={{color: '#64748b', fontSize: 13, fontWeight: 600}}>Colocación Total</div>
                  <div style={{color: '#0f172a', fontSize: 24, fontWeight: 800}}>${totalPlaced.toLocaleString()}</div>
              </div>
          </div>
          <div style={styles.kpiCard}>
              <div style={{background: '#f0fdf4', padding: 12, borderRadius: '50%', color: '#16a34a'}}>
                  <Activity size={24} />
              </div>
              <div>
                  <div style={{color: '#64748b', fontSize: 13, fontWeight: 600}}>Créditos Activos</div>
                  <div style={{color: '#0f172a', fontSize: 24, fontWeight: 800}}>{activeCount}</div>
              </div>
          </div>
          <div style={styles.kpiCard}>
              <div style={{background: '#fff7ed', padding: 12, borderRadius: '50%', color: '#ea580c'}}>
                  <TrendingUp size={24} />
              </div>
              <div>
                  <div style={{color: '#64748b', fontSize: 13, fontWeight: 600}}>Tendencia Mes</div>
                  <div style={{color: growthRate >= 0 ? '#16a34a' : '#ea580c', fontSize: 24, fontWeight: 800}}>
                    {growthRate > 0 ? '+' : ''}{growthRate.toFixed(1)}%
                  </div>
              </div>
          </div>
      </div>

      {/* --- GRÁFICOS --- */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 24, marginBottom: 24 }}>
          
          {/* GRÁFICO 1: BARRAS MENSUALES */}
          <div style={styles.card}>
              <div style={styles.chartTitle}><Calendar size={18} className="text-blue-600"/> Créditos Otorgados por Mes</div>
              <div style={{ height: 300, width: '100%' }}>
                  {monthlyData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={monthlyData} margin={{top: 10, right: 30, left: 0, bottom: 0}}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} tickFormatter={formatYAxis} />
                            {/* AQUÍ ESTABA EL ERROR: Cambiamos 'number' por 'any' para evitar conflicto de tipos */}
                            <Tooltip 
                                contentStyle={{borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} 
                                formatter={(value: any) => [`$${Number(value).toLocaleString()}`, 'Monto Colocado']}
                            />
                            <Bar dataKey="Monto" fill="#0A3143" radius={[4, 4, 0, 0]} barSize={40} />
                        </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div style={{height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8'}}>
                        No hay datos de créditos registrados aún.
                    </div>
                  )}
              </div>
          </div>

          {/* GRÁFICO 2: CRECIMIENTO CARTERA (ÁREA) */}
          <div style={styles.card}>
              <div style={styles.chartTitle}><TrendingUp size={18} className="text-green-600"/> Crecimiento de Cartera</div>
              <div style={{ height: 300, width: '100%' }}>
                  {growthData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={growthData} margin={{top: 10, right: 10, left: -20, bottom: 0}}>
                            <defs>
                                <linearGradient id="colorCartera" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0"/>
                            <XAxis dataKey="date" hide />
                            <YAxis tickFormatter={formatYAxis} axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11}} />
                            <Tooltip 
                                contentStyle={{borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}
                                formatter={(value: any) => [`$${Number(value).toLocaleString()}`, 'Cartera Acumulada']}
                                labelFormatter={(label) => `Fecha: ${label}`}
                            />
                            <Area type="monotone" dataKey="Cartera" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorCartera)" />
                        </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div style={{height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8'}}>
                        Sin datos.
                    </div>
                  )}
              </div>
          </div>
      </div>

      {/* --- FILA 2 DE GRÁFICOS --- */}
      <div style={styles.card}>
          <div style={styles.chartTitle}><PieIcon size={18} className="text-purple-600"/> Comparación de Montos por Período</div>
          <p style={styles.subtitle}>Comparativa entre el monto real colocado vs promedio histórico mensual</p>
          <div style={{ height: 350, width: '100%', marginTop: 20 }}>
              {comparisonData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={comparisonData} margin={{top: 20, right: 30, left: 20, bottom: 5}}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} tickFormatter={formatYAxis}/>
                        <Tooltip contentStyle={{borderRadius: 8}} formatter={(val: any) => `$${Number(val).toLocaleString()}`} />
                        <Legend iconType="circle" />
                        <Bar dataKey="Real" fill="#0A3143" name="Monto Real" radius={[0, 4, 4, 0]} />
                        <Bar dataKey="Promedio" fill="#94a3b8" name="Promedio Histórico" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
              ) : (
                <div style={{height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8'}}>
                    Sin datos suficientes para comparar.
                </div>
              )}
          </div>
      </div>

    </div>
  );
};

export default DashboardPage;