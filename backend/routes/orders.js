const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product'); // IMPORTANTE: Importamos el modelo de Producto
const { MercadoPagoConfig, Preference } = require('mercadopago');

// CONFIGURACIÓN MERCADO PAGO
const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });

// 1. CREAR PREFERENCIA (Para botón de Mercado Pago)
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
        console.error(error);
        res.status(500).json({ error: 'Error al crear preferencia' });
    }
});

// 2. GUARDAR PEDIDO Y DESCONTAR STOCK (Efectivo / One Push)
router.post('/', async (req, res) => {
    try {
        const { items, total, metodo, estado } = req.body;

        // A. Guardamos el pedido primero
        const newOrder = new Order(req.body);
        const savedOrder = await newOrder.save();

        // B. DESCUENTO DE STOCK: Recorremos los productos del pedido
        // Usamos un for...of para asegurar que cada actualización termine antes de seguir
        for (const item of items) {
            await Product.findByIdAndUpdate(
                item._id, // Asegúrate que desde el front envíes el _id de MongoDB
                { $inc: { existencias: -Number(item.cantidad) } } // Restamos la cantidad
            );
        }

        res.json({ message: "Pedido guardado e inventario actualizado", order: savedOrder });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al guardar pedido y actualizar stock' });
    }
});

// 3. OBTENER PEDIDOS (Para el Admin)
router.get('/', async (req, res) => {
    try {
        const orders = await Order.find().sort({ fecha: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener pedidos' });
    }
});

// 4. NUEVA RUTA: MODIFICAR ESTADO DEL PEDIDO (Admin)
router.patch('/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { nuevoEstado } = req.body; // El front enviará { "nuevoEstado": "Pagado" }

        const updatedOrder = await Order.findByIdAndUpdate(
            id,
            { estado: nuevoEstado },
            { new: true }
        );

        if (!updatedOrder) return res.status(404).json({ error: "Pedido no encontrado" });
        
        res.json(updatedOrder);
    } catch (err) {
        res.status(500).json({ error: 'Error al actualizar el estado del pedido' });
    }
});

module.exports = router;