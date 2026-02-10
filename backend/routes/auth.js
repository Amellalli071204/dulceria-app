const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// REGISTRO
router.post('/register', async (req, res) => {
    try {
        const { nombre, email, password, telefono } = req.body;

        // 1. Verificar si ya existe
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ msg: 'El usuario ya existe' });

        // 2. Encriptar contraseña
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 3. Crear usuario
        user = new User({
            nombre,
            email,
            telefono,
            password: hashedPassword,
            isAdmin: false // Por defecto nadie es admin
        });

        await user.save();
        res.json({ msg: 'Usuario registrado exitosamente' });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error en el servidor');
    }
});

// LOGIN
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Buscar usuario
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ msg: 'Credenciales inválidas' });

        // 2. Comparar contraseñas
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: 'Credenciales inválidas' });

        // 3. Crear Token (La "llave" de acceso)
        const payload = { user: { id: user.id, isAdmin: user.isAdmin } };
        
        // Firma del token (usamos una palabra secreta simple por ahora)
        jwt.sign(payload, 'secreto_super_seguro', { expiresIn: '1h' }, (err, token) => {
            if (err) throw err;
            res.json({ token, isAdmin: user.isAdmin }); // Devolvemos si es admin para el frontend
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error en el servidor');
    }
});

module.exports = router;