require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// --- MIDDLEWARES ---
app.use(cors());
app.use(express.json());

// --- CONEXIÓN A BASE DE DATOS ---
const mongoUri = process.env.MONGO_URI;

if (!mongoUri) {
    console.error("🔴 Error: Falta MONGO_URI en variables de entorno");
    process.exit(1);
}

mongoose.connect(mongoUri)
    .then(() => console.log("🟢 Conectado a MongoDB"))
    .catch((err) => console.error("🔴 Error en MongoDB:", err));

// --- RUTAS DE LA API ---
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/users', require('./routes/users'));

// --- RUTA RAIZ (CORREGIDA PARA NODE v22) ---
// Cambiamos el '*' por '(.*)' que es como lo pide la nueva versión
app.get('/', (req, res) => {
    res.json({ message: "¡Backend de Dulce Mundo encendido! 🍭", status: "ok" });
});

// --- INICIAR SERVIDOR ---
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`🚀 Servidor listo en puerto ${PORT}`);
});