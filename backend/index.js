require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path'); // Lo necesitamos para los archivos estáticos

const app = express();

// --- MIDDLEWARES ---
// Ajustamos CORS para que sea más permisivo con tu propio dominio de producción
app.use(cors({
  origin: '*', // En desarrollo y pruebas en Railway, esto evita bloqueos
  credentials: true
}));

app.use(express.json());

// --- CONEXIÓN A BASE DE DATOS ---
const mongoUri = process.env.MONGO_URI;

if (!mongoUri) {
    console.error("🔴 Error: La variable MONGO_URI no está definida");
    process.exit(1);
}

mongoose.connect(mongoUri)
    .then(() => console.log("🟢 Conectado a MongoDB"))
    .catch((err) => console.error("🔴 Error conectando a MongoDB:", err));

// --- RUTAS DE LA API (IMPORTANTE: Van antes que el frontend) ---
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/users', require('./routes/users'));

// --- RUTA DE PRUEBA API ---
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'API de Dulcería operando 🍭' });
});

// --- SERVIR FRONTEND (Si tienes el build en la misma carpeta) ---
// Si tu frontend está en la misma app de Railway, esto es vital:
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'client/build')));
    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
    });
} else {
    // Ruta base para desarrollo
    app.get('/', (req, res) => {
        res.send('🚀 Backend de Dulce Mundo listo para recibir datos.');
    });
}

// --- INICIAR SERVIDOR ---
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});