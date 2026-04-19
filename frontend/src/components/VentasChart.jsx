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
        // USAMOS RUTA RELATIVA PARA EVITAR EL ERROR 404 DE DOMINIO
        const res = await axios.get('/api-dulceria/orders/stats');
        console.log("DULCES RECIBIDOS:", res.data);
        
        if (Array.isArray(res.data)) {
          setData(res.data);
        }
      } catch (err) {
        console.error("ERROR AL TRAER GRAFICA:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div style={{height:'350px', textAlign:'center', paddingTop:'100px'}}>Cargando dulces... 🍭</div>;

  return (
    <div style={{ background: 'white', padding: '25px', borderRadius: '20px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}>
      <h3 style={{ textAlign: 'center', color: '#4A148C', fontFamily: 'Fredoka One' }}>Ventas por Dulce 🍭</h3>
      <div style={{ width: '100%', height: '350px' }}>
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip cursor={{fill: 'transparent'}} />
              <Bar dataKey="ventas" radius={[10, 10, 0, 0]} barSize={40}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div style={{height:'100%', display:'flex', alignItems:'center', justifyContent:'center'}}>
             <p style={{ color: '#999' }}>Aún no hay pedidos para mostrar 📊</p>
          </div>
        )}
      </div>
    </div>
  );
}