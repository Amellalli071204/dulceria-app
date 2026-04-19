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
        if (res.data && Array.isArray(res.data)) {
          setData(res.data);
        }
      } catch (err) {
        console.error("Error trayendo estadísticas:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return (
    <div style={{ height: '350px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#BA68C8', fontFamily: 'Fredoka One' }}>Preparando tus dulces datos... 🍭</p>
    </div>
  );

  return (
    <div style={chartContainerStyle}>
      <h3 style={{ color: '#4A148C', textAlign: 'center', marginBottom: '20px', fontFamily: "'Fredoka One', cursive" }}>
        Top 5 Dulces Más Vendidos 🍭
      </h3>
      
      <div style={{ width: '100%', height: '350px' }}>
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} style={{ fontSize: '12px', fontWeight: 'bold' }} />
              <YAxis axisLine={false} tickLine={false} style={{ fontSize: '12px' }} />
              <Tooltip 
                contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}
                cursor={{ fill: 'rgba(240, 98, 146, 0.1)' }}
              />
              <Bar dataKey="ventas" radius={[10, 10, 0, 0]} barSize={45}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p style={{ color: '#999' }}>Aún no hay pedidos registrados para mostrar gráficas 📊</p>
          </div>
        )}
      </div>
    </div>
  );
}

const chartContainerStyle = {
  background: 'white',
  padding: '25px',
  borderRadius: '20px',
  boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
  marginTop: '20px',
  border: '1px solid #fce4ec'
};