const express = require('express');
const router = express.Router();
const User = require('../models/User'); // Asegúrate de que la ruta a tu modelo sea correcta
const jwt = require('jsonwebtoken');

// --- RUTA DE REGISTRO ---
router.post('/register', async (req, res) => {
  const { nombre, email, password, telefono } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: 'El usuario ya existe' });

    // Creamos el usuario con los campos nuevos
    user = new User({
      nombre,
      email,
      password, // Nota: Si usas bcrypt para encriptar, hazlo aquí
      telefono: telefono || "" 
    });

    await user.save();
    res.json({ msg: 'Usuario registrado con éxito' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error en el servidor al registrar');
  }
});

// --- RUTA DE LOGIN ---
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'Credenciales inválidas' });

    // Aquí deberías comparar la contraseña (usando bcrypt.compare si está encriptada)
    if (user.password !== password) {
      return res.status(400).json({ msg: 'Credenciales inválidas' });
    }

    const token = jwt.sign({ id: user._id }, 'secreto', { expiresIn: '1h' });

    // ENVIAMOS TODA LA INFO QUE EL FRONTEND NECESITA
    res.json({
      token,
      user: {
        nombre: user.nombre,
        email: user.email,
        telefono: user.telefono,
        isAdmin: user.isAdmin
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error en el servidor al iniciar sesión');
  }
});

module.exports = router;