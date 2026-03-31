const express = require('express');
const router = express.Router();
const User = require('../models/User');

// 1. Obtener todos los usuarios (Para listarlos en tu tabla de Admin)
router.get('/', async (req, res) => {
    try {
        const usuarios = await User.find().select('-password'); // Traemos todo menos la contraseña por seguridad
        res.json(usuarios);
    } catch (error) {
        res.status(500).json({ msg: 'Error al obtener usuarios' });
    }
});

// 2. Cambiar el rol (Hacer Admin o quitar Admin)
router.put('/:id/role', async (req, res) => {
    try {
        const { isAdmin } = req.body;
        const usuarioActualizado = await User.findByIdAndUpdate(
            req.params.id,
            { isAdmin },
            { new: true }
        ).select('-password');

        if (!usuarioActualizado) return res.status(404).json({ msg: 'Usuario no encontrado' });
        
        res.json(usuarioActualizado);
    } catch (error) {
        res.status(500).json({ msg: 'Error al actualizar el rol' });
    }
});

module.exports = router;