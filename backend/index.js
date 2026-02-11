require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Inicializar la aplicación
const app = express();

// --- MIDDLEWARES ---
// Borra cualquier línea de "const cors" que esté aquí adentro
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://humorous-nourishment-production.up.railway.app',
    'https://humorous-nourishment-production.up.railway.app/'
  ],
  credentials: true
}));

app.use(express.json());

// Permite que el servidor entienda los datos en formato JSON
app.use(express.json());

// --- CONEXIÓN A BASE DE DATOS ---
const mongoUri = process.env.MONGO_URI;

if (!mongoUri) {
    console.error("🔴 Error: La variable MONGO_URI no está definida en el archivo .env");
    process.exit(1);
}

mongoose.connect(mongoUri)
    .then(() => console.log("🟢 Conectado a MongoDB"))
    .catch((err) => console.error("🔴 Error conectando a MongoDB:", err));

// --- RUTAS DE LA API ---
// 1. Usuarios (Login y Registro)
app.use('/api/auth', require('./routes/auth'));

// 2. Productos (Catálogo y Administración)
app.use('/api/products', require('./routes/products'));

// 3. Pedidos (Mercado Pago y Efectivo)
app.use('/api/orders', require('./routes/orders'));

// --- RUTA DE PRUEBA (Para verificar que el servidor vive) ---
app.get('/', (req, res) => {
    res.send('¡Servidor de Dulcería funcionando correctamente! 🍬');
});

// --- INICIAR SERVIDOR ---
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});