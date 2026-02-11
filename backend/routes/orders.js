const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product'); // Necesitamos el modelo de Producto para restar stock
const { MercadoPagoConfig, Preference } = require('mercadopago');

const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });

// --- RUTA PARA GUARDAR PEDIDO Y DESCONTAR STOCK ---
router.post('/', async (req, res) => {
    const { usuario, telefono, productos, total, metodoPago } = req.body;

    try {
        // 1. Crear y guardar el pedido
        const newOrder = new Order({
            usuario,
            telefono,
            productos,
            total,
            metodoPago,
            fecha: new Date()
        });
        const savedOrder = await newOrder.save();

        // 2. LÓGICA DE DESCUENTO DE STOCK 📉
        // Recorremos los productos que vienen en el pedido
        for (const item of productos) {
            await Product.findByIdAndUpdate(
                item.productoId, 
                { $inc: { existencias: -item.cantidad } } // Resta la cantidad comprada
            );
        }

        res.json(savedOrder);
    } catch (err) {
        console.error("Error al procesar pedido:", err);
        res.status(500).json({ error: 'Error al guardar pedido y actualizar stock' });
    }
});

// ... el resto de tus rutas (create_preference y GET) se mantienen igual