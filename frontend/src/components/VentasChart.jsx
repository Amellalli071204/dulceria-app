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
        // Conexión directa a tu API en Railway
        const res = await axios.get('https://humorous-nourishment-production.up.railway.app/api/orders/stats');
        setData(res.data);
      } catch (err) {
        console.error("Error al traer estadísticas:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div style={chartContainerStyle}>
        <p style={{ color: '#BA68C8', textAlign: 'center' }}>Cargando dulces datos... 🍭</p>
      </div>
    );
  }

  return (
    <div style={chartContainerStyle}>
      <h3 style={{ 
        color: '#4A148C', 
        marginBottom: '20px', 
        fontFamily: "'Fredoka One', cursive",
        textAlign: 'center' 
      }}>
        Top 5 Dulces Más Vendidos 🍭
      </h3>
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              style={{ fontSize: '12px', fontWeight: 'bold' }} 
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              style={{ fontSize: '12px' }} 
            />
            <Tooltip 
              contentStyle={{ 
                borderRadius: '15px', 
                border: 'none', 
                boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                fontFamily: 'sans-serif'
              }}
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