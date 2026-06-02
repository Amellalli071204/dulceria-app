import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const apiUrl = import.meta.env.VITE_API_URL;

export default function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [isForgot, setIsForgot] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nombre: '', email: '', password: '', telefono: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = isRegister ? `${apiUrl}/api/auth/register` : `${apiUrl}/api/auth/login`;

    try {
      const res = await axios.post(url, formData);

      if (!isRegister) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('isAdmin', res.data.user.isAdmin);
        localStorage.setItem('userName', res.data.user.nombre);
        localStorage.setItem('userPhone', res.data.user.telefono);

        Swal.fire({
          icon: 'success',
          title: `¡Bienvenido/a, ${res.data.user.nombre}! 🍬`,
          text: 'Ya puedes empezar a endulzar tu día.',
          confirmButtonColor: '#E91E63',
          timer: 2500
        });
        navigate('/catalogo');
      } else {
        Swal.fire({
          icon: 'success',
          title: '¡Registro exitoso! 🎉',
          text: 'Ahora, por favor, introduce tus datos para entrar.',
          confirmButtonColor: '#E91E63'
        });
        setIsRegister(false);
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: error.response?.data?.msg || 'Datos incorrectos. Revisa tu correo o contraseña.',
        footer: !isRegister ? '<p>¿Aún no tienes cuenta? Dale clic a <b>Regístrate aquí</b> abajo.</p>' : '',
        confirmButtonColor: '#E91E63'
      });
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${apiUrl}/api/auth/forgot-password`, { email: formData.email });
      Swal.fire({
        icon: 'success',
        title: '¡Correo enviado! 📧',
        text: 'Si ese correo existe, recibirás un enlace para restablecer tu contraseña en breve.',
        confirmButtonColor: '#E91E63'
      });
      setIsForgot(false);
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo enviar el correo. Intenta de nuevo.',
        confirmButtonColor: '#E91E63'
      });
    }
  };

  // ─── VISTA: Olvidé mi contraseña ──────────────────────────────────────────
  if (isForgot) return (
    <div style={cardStyle}>
      <h2 style={titleStyle}>¿Olvidaste tu contraseña? 🍬</h2>
      <p style={{ textAlign: 'center', color: '#999', fontSize: '0.9rem', marginBottom: '20px' }}>
        Escribe tu correo y te enviaremos un enlace para restablecerla.
      </p>
      <form onSubmit={handleForgotPassword} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <input
          type="email"
          name="email"
          placeholder="correo@ejemplo.com"
          onChange={handleChange}
          required
          style={inputStyle}
        />
        <button type="submit" style={buttonStyle}>Enviar enlace 📧</button>
      </form>
      <div style={switchStyle}>
        <button onClick={() => setIsForgot(false)} style={linkButtonStyle}>
          ← Volver al inicio de sesión
        </button>
      </div>
    </div>
  );

  // ─── VISTA: Login / Registro ──────────────────────────────────────────────
  return (
    <div style={cardStyle}>
      <h2 style={titleStyle}>
        {isRegister ? 'Crea tu Cuenta 🍭' : '¡Hola de nuevo! 🍬'}
      </h2>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {isRegister && (
          <>
            <input name="nombre" placeholder="Nombre (Ej: Carlos Ruiz)" onChange={handleChange} required style={inputStyle} />
            <input name="telefono" placeholder="Teléfono (10 dígitos)" onChange={handleChange} required style={inputStyle} />
          </>
        )}
        <input type="email" name="email" placeholder="correo@ejemplo.com" onChange={handleChange} required style={inputStyle} />
        <input type="password" name="password" placeholder="Tu contraseña" onChange={handleChange} required style={inputStyle} />
        <button type="submit" style={buttonStyle}>
          {isRegister ? 'Registrarme ahora' : 'Iniciar sesión'}
        </button>
      </form>

      {/* Botón olvidé contraseña — solo en login */}
      {!isRegister && (
        <div style={{ textAlign: 'center', marginTop: '12px' }}>
          <button onClick={() => setIsForgot(true)} style={forgotButtonStyle}>
            ¿Olvidaste tu contraseña?
          </button>
        </div>
      )}

      <div style={switchStyle}>
        <p style={{ color: '#666', fontSize: '0.9rem' }}>
          {isRegister ? '¿Ya eres parte de Dulce Mundo?' : '¿Es tu primera vez aquí?'}
        </p>
        <button
          onClick={() => setIsRegister(!isRegister)}
          style={linkButtonStyle}
        >
          {isRegister ? 'Inicia Sesión' : 'Regístrate aquí'}
        </button>
      </div>
    </div>
  );
}

const cardStyle = {
  maxWidth: '400px', margin: '80px auto', padding: '2rem',
  boxShadow: '0 8px 24px rgba(0,0,0,0.12)', borderRadius: '15px', backgroundColor: '#fff'
};
const titleStyle = { textAlign: 'center', color: '#E91E63', marginBottom: '1.5rem' };
const inputStyle = { padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem', outlineColor: '#E91E63' };
const buttonStyle = { padding: '12px', background: '#E91E63', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '1.1rem', fontWeight: 'bold', boxShadow: '0 4px 6px rgba(233,30,99,0.2)' };
const forgotButtonStyle = { background: 'none', border: 'none', color: '#9C27B0', cursor: 'pointer', fontSize: '0.9rem', textDecoration: 'underline' };
const switchStyle = { textAlign: 'center', marginTop: '1.5rem', borderTop: '1px solid #eee', paddingTop: '1rem' };
const linkButtonStyle = { background: '#f8f9fa', border: '1px solid #E91E63', color: '#E91E63', padding: '8px 15px', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold', marginTop: '5px' };