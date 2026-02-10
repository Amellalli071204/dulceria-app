import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [isRegister, setIsRegister] = useState(false); // ¿Está registrándose?
  const navigate = useNavigate();

  // Estado del formulario
  const [formData, setFormData] = useState({
    nombre: '', email: '', password: '', telefono: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // URL de tu Backend (asegúrate que el backend esté corriendo en el puerto 3001)
    const url = isRegister 
      ? 'http://localhost:3001/api/auth/register' 
      : 'http://localhost:3001/api/auth/login';

    try {
      const res = await axios.post(url, formData);
      
      if (!isRegister) {
        // Si es Login, guardamos el token y redirigimos
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('isAdmin', res.data.isAdmin);
        alert('¡Bienvenido!');
        navigate('/catalogo');
      } else {
        // Si es Registro, avisamos y cambiamos a Login
        alert('Registro exitoso. Ahora inicia sesión.');
        setIsRegister(false);
      }
    } catch (error) {
      alert(error.response?.data?.msg || 'Error en el servidor');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '2rem', boxShadow: '0 0 10px rgba(0,0,0,0.1)', borderRadius: '10px' }}>
      <h2 style={{ textAlign: 'center', color: '#ff4757' }}>
        {isRegister ? 'Crear Cuenta 🍬' : 'Iniciar Sesión 🍭'}
      </h2>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        
        {isRegister && (
          <>
            <input name="nombre" placeholder="Nombre completo" onChange={handleChange} required style={inputStyle} />
            <input name="telefono" placeholder="Teléfono" onChange={handleChange} required style={inputStyle} />
          </>
        )}
        
        <input type="email" name="email" placeholder="Correo electrónico" onChange={handleChange} required style={inputStyle} />
        <input type="password" name="password" placeholder="Contraseña" onChange={handleChange} required style={inputStyle} />
        
        <button type="submit" style={buttonStyle}>
          {isRegister ? 'Registrarse' : 'Entrar'}
        </button>
      </form>

      <p style={{ textAlign: 'center', marginTop: '1rem' }}>
        {isRegister ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}
        <button 
          onClick={() => setIsRegister(!isRegister)} 
          style={{ background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', textDecoration: 'underline' }}
        >
           {isRegister ? ' Inicia Sesión' : ' Regístrate aquí'}
        </button>
      </p>
    </div>
  );
}

// Estilos simples
const inputStyle = { padding: '10px', borderRadius: '5px', border: '1px solid #ddd' };
const buttonStyle = { padding: '10px', background: '#ff4757', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '1rem' };