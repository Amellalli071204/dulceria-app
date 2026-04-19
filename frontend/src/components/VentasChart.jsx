import { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const COLORS = ['#F06292', '#BA68C8', '#FF80AB', '#CE93D8', '#F48FB1'];

export default function VentasChart() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get('https://humorous-nourishment-production.up.railway.app/api/orders/stats');
        // Nos aseguramos de que sea un array
        setData(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Error al traer estadísticas:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <p style={{ textAlign: 'center', color: '#BA68C8' }}>Cargando estadísticas... 🍭</p>;

  return (
    <div style={chartContainerStyle}>
      <h3 style={{ color: '#4A148C', marginBottom: '20px', textAlign: 'center', fontFamily: "'Fredoka One', cursive" }}>
        Top 5 Dulces Más Vendidos 🍭
      </h3>
      {/* CAMBIO CLAVE: Le damos una altura fija al contenedor 
        porque ResponsiveContainer a veces no detecta el alto automático.
      */}
      <div style={{ width: '100%', height: '350px', minHeight: '350px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
            <Tooltip 
              contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}
              cursor={{ fill: 'rgba(240, 98, 146, 0.1)' }}
            />
            <Bar dataKey="ventas" radius={[10, 10, 0, 0]} barSize={40}>
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