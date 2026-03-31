import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import Home from './pages/Home'; // <-- 1. IMPORTAMOS LA BIENVENIDA
import Login from './pages/Login';
import Catalog from './pages/Catalogo';
import Cart from './pages/Cart';
import Admin from './pages/Admin';
import Footer from './components/Footer';

function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <div style={{ fontFamily: 'Arial, sans-serif', minHeight: '100vh', background: '#fff' }}>
          <Navbar />
          
          <Routes>
            {/* 2. LA RUTA RAÍZ AHORA ES LA BIENVENIDA */}
            <Route path="/" element={<Home />} />
            
            <Route path="/login" element={<Login />} />
            <Route path="/catalogo" element={<Catalog />} />
            <Route path="/carrito" element={<Cart />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
          
        </div>
        <Footer /> 
      </BrowserRouter>
    </CartProvider>
  );
}

export default App;