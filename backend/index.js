require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

const mongoUri = process.env.MONGO_URI;
mongoose.connect(mongoUri)
    .then(() => console.log("🟢 DB Conectada"))
    .catch((err) => console.error("🔴 Error DB:", err));

// IMPORTAMOS LAS RUTAS
const orderRoutes = require('./routes/orders');

// LAS RUTAS DE LA API CON UN PREFIJO DIFERENTE PARA QUE NO CHOQUEN
app.use('/api-v1/orders', orderRoutes);
app.use('/api-v1/auth', require('./routes/auth'));
app.use('/api-v1/products', require('./routes/products'));
app.use('/api-v1/users', require('./routes/users'));

// RUTA DE PRUEBA ABSOLUTA
app.get('/debug-stats', async (req, res) => {
    try {
        const Order = require('./models/Order');
        const orders = await Order.find().lean();
        res.json({ status: "ok", dataRecuperada: orders.length });
    } catch (e) {
        res.json({ error: e.message });
    }
});

app.get('/', (req, res) => {
    res.json({ message: "Backend vivo 🍭" });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`🚀 Corriendo en ${PORT}`));