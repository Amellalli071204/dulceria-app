const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// OBTENER TODOS LOS PRODUCTOS (Para el catálogo)
router.get('/', async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (err) {
        res.status(500).json({ msg: 'Error al obtener productos' });
    }
});

// AGREGAR PRODUCTO (Para el Admin)
router.post('/', async (req, res) => {
    const { nombre, descripcion, precio, imagen } = req.body;
    try {
        const newProduct = new Product({ nombre, descripcion, precio, imagen });
        const product = await newProduct.save();
        res.json(product);
    } catch (err) {
        res.status(500).send('Error al guardar producto');
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