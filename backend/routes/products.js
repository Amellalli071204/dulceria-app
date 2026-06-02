const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// OBTENER TODOS LOS PRODUCTOS
router.get('/', async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (err) {
        res.status(500).json({ msg: 'Error al obtener productos' });
    }
});

// AGREGAR PRODUCTO
router.post('/', async (req, res) => {
    const { nombre, descripcion, precio, imagen, existencias } = req.body;
    try {
        const newProduct = new Product({ nombre, descripcion, precio, imagen, existencias: existencias || 0 });
        const product = await newProduct.save();
        res.json(product);
    } catch (err) {
        res.status(500).send('Error al guardar producto');
    }
});

// EDITAR PRODUCTO ← NUEVO
router.put('/:id', async (req, res) => {
    const { nombre, descripcion, precio, imagen, existencias } = req.body;
    try {
        const updated = await Product.findByIdAndUpdate(
            req.params.id,
            { nombre, descripcion, precio, imagen, existencias },
            { new: true }
        );
        if (!updated) return res.status(404).json({ msg: 'Producto no encontrado' });
        res.json(updated);
    } catch (err) {
        res.status(500).send('Error al editar producto');
    }
});

// ELIMINAR PRODUCTO
router.delete('/:id', async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Producto eliminado' });
    } catch (err) {
        res.status(500).send('Error al eliminar');
    }
});

module.exports = router;