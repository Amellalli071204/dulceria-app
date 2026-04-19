import { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const COLORS = ['#F06292', '#BA68C8', '#FF80AB', '#CE93D8', '#F48FB1'];

export default function VentasChart() {
  const [data, setData] = useState([]); // Iniciamos con array vacío 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get('https://humorous-nourishment-production.up.railway.app/api/orders/stats');
        
        // --- LA CORRECCIÓN CLAVE ---
        // Nos aseguramos de que siempre guardamos un array, incluso si la respuesta falla 
        if (Array.isArray(res.data)) {
          setData(res.data);
        } else {
          setData([]); 
        }
      } catch (err) {
        console.error("Error al traer estadísticas:", err);
        setData([]); // Evitamos que sea 'undefined' 
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <p style={{ textAlign: 'center', color: '#BA68C8' }}>Cargando estadísticas... 🍭</p>;

  // Si no hay datos, mostramos un mensaje en lugar de romper la app 
  if (!data || data.length === 0) {
    return <p style={{ textAlign: 'center', color: '#999' }}>Aún no hay ventas para mostrar 📊</p>;
  }

  return (
    <div style={chartContainerStyle}>
      <h3 style={{ color: '#4A148C', marginBottom: '20px', textAlign: 'center', fontFamily: "'Fredoka One', cursive" }}>
        Top 5 Dulces Más Vendidos 🍭
      </h3>
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} />
            <YAxis axisLine={false} tickLine={false} />
            <Tooltip 
              contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}
              cursor={{ fill: 'rgba(240, 98, 146, 0.1)' }}
            />
            <Bar dataKey="ventas" radius={[10, 10, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

const chartContainerStyle = {
  background: 'white',
  padding: '25px',
  borderRadius: '20px',
  boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
  marginTop: '20px'
};