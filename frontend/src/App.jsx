import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Catalog from './pages/Catalogo';
import Cart from './pages/Cart';
import Admin from './pages/Admin';

function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <div style={{ fontFamily: 'Arial, sans-serif', minHeight: '100vh', background: '#fff' }}>
          <Navbar />
          
          <Routes>
            {/* Pantalla principal redirige al Login */}
            <Route path="/" element={<Navigate to="/login" />} />
            
            <Route path="/login" element={<Login />} />
            <Route path="/catalogo" element={<Catalog />} />
            <Route path="/carrito" element={<Cart />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
          
        </div>
      </BrowserRouter>
    </CartProvider>
  );
}

export default App;