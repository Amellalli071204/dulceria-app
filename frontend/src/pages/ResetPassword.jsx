import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';

const apiUrl = import.meta.env.VITE_API_URL;

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const [newPassword, setNewPassword] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmar) {
      return Swal.fire({
        icon: 'error',
        title: 'Las contraseñas no coinciden',
        confirmButtonColor: '#E91E63'
      });
    }

    if (newPassword.length < 6) {
      return Swal.fire({
        icon: 'warning',
        title: 'Contraseña muy corta',
        text: 'Debe tener al menos 6 caracteres.',
        confirmButtonColor: '#E91E63'
      });
    }

    try {
      await axios.post(`${apiUrl}/api/auth/reset-password`, { token, newPassword });
      Swal.fire({
        icon: 'success',
        title: '¡Contraseña actualizada! 🍭',
        text: 'Ya puedes iniciar sesión con tu nueva contraseña.',
        confirmButtonColor: '#E91E63'
      }).then(() => navigate('/login'));
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Enlace inválido o expirado',
        text: error.response?.data?.msg || 'Solicita un nuevo enlace de recuperación.',
        confirmButtonColor: '#E91E63'
      });
    }
  };

  if (!token) return (
    <div style={{ textAlign: 'center', marginTop: '100px' }}>
      <h2 style={{ color: '#E91E63' }}>Enlace inválido 😥</h2>
      <button onClick={() => navigate('/login')} style={btnStyle}>Volver al login</button>
    </div>
  );

  return (
    <div style={cardStyle}>
      <h2 style={titleStyle}>Nueva contraseña 🔐</h2>
      <p style={{ textAlign: 'center', color: '#999', fontSize: '0.9rem', marginBottom: '20px' }}>
        Escribe tu nueva contraseña. Debe tener al menos 6 caracteres.
      </p>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <input
          type="password"
          placeholder="Nueva contraseña"
          value={newPassword}
          onChange={e => setNewPassword(e.target.value)}
          required
          style={inputStyle}
        />
        <input
          type="password"
          placeholder="Confirmar contraseña"
          value={confirmar}
          onChange={e => setConfirmar(e.target.value)}
          required
          style={inputStyle}
        />
        <button type="submit" style={btnStyle}>Guardar nueva contraseña</button>
      </form>
    </div>
  );
}

const cardStyle = { maxWidth: '400px', margin: '80px auto', padding: '2rem', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', borderRadius: '15px', backgroundColor: '#fff' };
const titleStyle = { textAlign: 'center', color: '#E91E63', marginBottom: '1rem' };
const inputStyle = { padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem', outlineColor: '#E91E63' };
const btnStyle = { padding: '12px', background: '#E91E63', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '1.1rem', fontWeight: 'bold' };