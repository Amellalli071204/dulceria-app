require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// CORS ABIERTO PARA PRUEBAS (Evita el bloqueo 404/CORS)
app.use(cors({ origin: '*' }));
app.use(express.json());

const mongoUri = process.env.MONGO_URI;
mongoose.connect(mongoUri)
    .then(() => console.log("🟢 MongoDB Conectado"))
    .catch((err) => console.error("🔴 Error DB:", err));

// IMPORTAMOS RUTAS
const orderRoutes = require('./routes/orders');

// USAMOS UN PREFIJO QUE NADIE MÁS TENGA
app.use('/api-dulceria/orders', orderRoutes);
app.use('/api-dulceria/auth', require('./routes/auth'));
app.use('/api-dulceria/products', require('./routes/products'));
app.use('/api-dulceria/users', require('./routes/users'));

// RUTA DE DEPURACIÓN PARA TI
app.get('/api-dulceria/debug', async (req, res) => {
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