import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2'; // Importamos SweetAlert2 para mejores alertas

export default function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nombre: '', email: '', password: '', telefono: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const apiUrl = import.meta.env.VITE_API_URL;
    const url = isRegister ? `${apiUrl}/api/auth/register` : `${apiUrl}/api/auth/login`;
    
    try {
      const res = await axios.post(url, formData);
      
      if (!isRegister) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('isAdmin', res.data.user.isAdmin);
        localStorage.setItem('userName', res.data.user.nombre);
        localStorage.setItem('userPhone', res.data.user.telefono);
        
        // Alerta de bienvenida profesional
        Swal.fire({
          icon: 'success',
          title: `¡Bienvenido/a, ${res.data.user.nombre}! 🍬`,
          text: 'Ya puedes empezar a endulzar tu día.',
          confirmButtonColor: '#ff4757',
          timer: 2500
        });
        navigate('/catalogo');
      } else {
        // Guía clara tras el registro
        Swal.fire({
          icon: 'success',
          title: '¡Registro exitoso! 🎉',
          text: 'Ahora, por favor, introduce tus datos para entrar.',
          confirmButtonColor: '#ff4757'
        });
        setIsRegister(false);
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: error.response?.data?.msg || 'Datos incorrectos. Revisa tu correo o contraseña.',
        footer: !isRegister ? '<p>¿Aún no tienes cuenta? Dale clic a <b>Regístrate aquí</b> abajo.</p>' : '',
        confirmButtonColor: '#ff4757'
      });
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '2rem', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', borderRadius: '15px', backgroundColor: '#fff' }}>
      <h2 style={{ textAlign: 'center', color: '#ff4757', marginBottom: '1.5rem' }}>
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

      <div style={{ textAlign: 'center', marginTop: '1.5rem', borderTop: '1px solid #eee', paddingTop: '1rem' }}>
        <p style={{ color: '#666', fontSize: '0.9rem' }}>
          {isRegister ? '¿Ya eres parte de Dulce Mundo?' : '¿Es tu primera vez aquí?'}
        </p>
        <button 
          onClick={() => setIsRegister(!isRegister)} 
          style={{ 
            background: '#f8f9fa', 
            border: '1px solid #ff4757', 
            color: '#ff4757', 
            padding: '8px 15px', 
            borderRadius: '20px', 
            cursor: 'pointer',
            fontWeight: 'bold',
            marginTop: '5px',
            transition: '0.3s'
          }}
          onMouseOver={(e) => e.target.style.background = '#fff0f2'}
          onMouseOut={(e) => e.target.style.background = '#f8f9fa'}
        >
           {isRegister ? 'Inicia Sesión' : 'Regístrate aquí'}
        </button>
      </div>
    </div>
  );
}

const inputStyle = { padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem', outlineColor: '#ff4757' };
const buttonStyle = { padding: '12px', background: '#ff4757', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '1.1rem', fontWeight: 'bold', boxShadow: '0 4px 6px rgba(255, 71, 87, 0.2)' };