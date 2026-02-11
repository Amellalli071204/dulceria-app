const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');

// --- RUTA PARA GUARDAR PEDIDO CON VALIDACIÓN DE SEGURIDAD ---
router.post('/', async (req, res) => {
    const { usuario, telefono, productos, total, metodoPago } = req.body;

    try {
        // 1. VALIDACIÓN DE SEGURIDAD: Verificar stock de todos los productos antes de cobrar
        for (const item of productos) {
            const productoBD = await Product.findById(item.productoId);
            
            if (!productoBD) {
                return res.status(404).json({ error: `El producto ${item.nombre} no existe.` });
            }

            if (productoBD.existencias < item.cantidad) {
                return res.status(400).json({ 
                    error: `Stock insuficiente para ${item.nombre}. Disponible: ${productoBD.existencias}` 
                });
            }
        }

        // 2. Si todo está bien, crear el pedido
        const newOrder = new Order({
            usuario,
            telefono,
            productos,
            total,
            metodoPago,
            fecha: new Date()
        });
        const savedOrder = await newOrder.save();

        // 3. DESCONTAR STOCK (Ahora es 100% seguro)
        for (const item of productos) {
            await Product.findByIdAndUpdate(
                item.productoId, 
                { $inc: { existencias: -item.cantidad } }
            );
        }

        res.json(savedOrder);
    } catch (err) {
        console.error("Error crítico en pedido:", err);
        res.status(500).json({ error: 'Error interno al procesar la orden.' });
    }
});