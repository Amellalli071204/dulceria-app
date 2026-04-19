require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// 1. Configuración de CORS total
app.use(cors());
app.use(express.json());

// 2. Conexión a Base de Datos
const mongoUri = process.env.MONGO_URI;
mongoose.connect(mongoUri)
    .then(() => console.log("🟢 Base de datos conectada"))
    .catch((err) => console.error("🔴 Error DB:", err));

// 3. LAS RUTAS DE LA API (IMPORTANTE: Deben ir antes que cualquier otra cosa)
// Agregamos un log para ver si la petición entra aquí
app.use('/api/orders', (req, res, next) => {
    console.log(`Petición recibida en API Orders: ${req.method} ${req.url}`);
    next();
}, require('./routes/orders'));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/users', require('./routes/users'));

// 4. Ruta de prueba directa (Sin /api) para ver si el server responde
app.get('/test-stats', async (req, res) => {
    try {
        const Order = require('./models/Order');
        const orders = await Order.find().lean();
        res.json({ mensaje: "Conexión directa exitosa", total: orders.length });
    } catch (e) {
        res.json({ error: e.message });
    }
});

// 5. Ruta base
app.get('/', (req, res) => {
    res.json({ status: "ok", message: "Servidor de Dulce Mundo activo 🍭" });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`🚀 Puerto: ${PORT}`));