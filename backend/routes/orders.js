const express = require('express');
const router = express.Router();
const Order = require('../models/Order'); // Asegúrate que el archivo se llame Order.js
const Product = require('../models/Product'); // Asegúrate que el archivo se llame Product.js
const { MercadoPagoConfig, Preference } = require('mercadopago');

const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });

// 1. CREAR PREFERENCIA MERCADO PAGO
router.post('/create_preference', async (req, res) => {
    try {
        const body = {
            items: req.body.items.map(item => ({
                title: item.nombre,
                quantity: Number(item.cantidad),
                unit_price: Number(item.precio),
                currency_id: 'MXN',
            })),
            back_urls: {
                success: "https://humorous-nourishment-production.up.railway.app/success",
                failure: "https://humorous-nourishment-production.up.railway.app/failure",
                pending: "https://humorous-nourishment-production.up.railway.app/pending"
            },
            auto_return: "approved",
        };
        const preference = new Preference(client);
        const result = await preference.create({ body });
        res.json({ id: result.id });
    } catch (error) {
        res.status(500).json({ error: 'Error MP' });
    }
});

// 2. GUARDAR PEDIDO Y DESCONTAR STOCK
router.post('/', async (req, res) => {
    try {
        const { productos } = req.body;
        const newOrder = new Order(req.body);
        const savedOrder = await newOrder.save();

        if (productos && Array.isArray(productos)) {
            for (const item of productos) {
                if (item.productoId) {
                    await Product.findByIdAndUpdate(
                        item.productoId,
                        { $inc: { existencias: -Number(item.cantidad) } }
                    );
                }
            }
        }
        res.status(201).json(savedOrder);
    } catch (err) {
        res.status(500).json({ error: 'Error al guardar pedido' });
    }
});

// 3. OBTENER PEDIDOS
router.get('/', async (req, res) => {
    try {
        const orders = await Order.find().sort({ fecha: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener' });
    }
});

// 4. ACTUALIZAR ESTADO
router.patch('/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { nuevoEstado } = req.body;
        const updatedOrder = await Order.findByIdAndUpdate(
            id,
            { estado: nuevoEstado },
            { new: true }
        );
        res.json(updatedOrder);
    } catch (err) {
        res.status(500).json({ error: 'Error al actualizar estado' });
    }
});

module.exports = router;