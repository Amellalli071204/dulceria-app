require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Configuración de CORS y JSON
app.use(cors({ origin: '*' }));
app.use(express.json());

const mongoUri = process.env.MONGO_URI;
mongoose.connect(mongoUri)
    .then(() => console.log("🟢 MongoDB Conectado"))
    .catch((err) => console.error("🔴 Error DB:", err));

// IMPORTACIÓN Y USO DE RUTAS UNIFICADAS
app.use('/api/orders', require('./routes/orders'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/users', require('./routes/users'));

// Ruta de depuración actualizada
app.get('/api/debug', async (req, res) => {
    try {
        const Order = require('./models/Order');
        const count = await Order.countDocuments();
        res.json({ status: "ok", pedidosEnBase: count });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.get('/', (req, res) => {
    res.send("Backend de Dulce Mundo funcionando 🍭");
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`🚀 Server on port ${PORT}`));