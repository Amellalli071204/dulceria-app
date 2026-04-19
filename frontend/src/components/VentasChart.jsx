import { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const COLORS = ['#F06292', '#BA68C8', '#FF80AB', '#CE93D8', '#F48FB1'];

export default function VentasChart() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  // DECLARAMOS LA URL AQUÍ ADENTRO PARA QUE NO HAYA PIERDE
  const API_ENDPOINT = "https://humorous-nourishment-production.up.railway.app/api-v1/orders/stats";

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get(`${API_ENDPOINT}?cache=${Date.now()}`);
        console.log("DATOS LLEGANDO:", res.data);
        
        if (Array.isArray(res.data)) {
          setData(res.data);
        }
      } catch (err) {
        console.error("ERROR EN PETICIÓN:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div style={{height:'350px', textAlign:'center'}}>Cargando...</div>;

  return (
    <div style={{ background: 'white', padding: '25px', borderRadius: '20px', marginTop: '20px' }}>
      <h3 style={{ textAlign: 'center', color: '#4A148C', fontFamily: 'Fredoka One' }}>Top 5 Dulces 🍭</h3>
      <div style={{ width: '100%', height: '350px' }}>
        {data.length > 0 ? (
          <ResponsiveContainer>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="ventas" radius={[10, 10, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p style={{ textAlign: 'center', color: '#999', marginTop: '100px' }}>No hay ventas que mostrar todavía 📊</p>
        )}
      </div>
    </div>
  );
}