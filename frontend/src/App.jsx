import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Catalog from './pages/Catalogo';
import Cart from './pages/Cart';
import Admin from './pages/Admin';
import MisPedidos from './pages/MisPedidos';
import Footer from './components/Footer';
import ResetPassword from './pages/ResetPassword';

function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <div style={{ fontFamily: 'Arial, sans-serif', minHeight: '100vh', background: '#fff' }}>
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/catalogo" element={<Catalog />} />
            <Route path="/carrito" element={<Cart />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/mis-pedidos" element={<MisPedidos />} />
            <Route path="/reset-password" element={<ResetPassword />} />
          </Routes>
        </div>
        <Footer /> 
      </BrowserRouter>
    </CartProvider>
  );
}

export default App;