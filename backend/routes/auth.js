const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

// ─── HELPER: Transporter de Gmail ─────────────────────────────────────────
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// ─── HELPER: Generar token temporal ───────────────────────────────────────
// Guardamos tokens en memoria { token: { userId, expires } }
const resetTokens = {};

// --- RUTA DE REGISTRO ---
router.post('/register', async (req, res) => {
    const { nombre, email, password, telefono } = req.body;
    try {
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ msg: 'El usuario ya existe' });

        user = new User({
            nombre,
            email,
            password,
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

        if (user.password !== password) {
            return res.status(400).json({ msg: 'Credenciales inválidas' });
        }

        const token = jwt.sign({ id: user._id }, 'secreto', { expiresIn: '1h' });

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

// --- SOLICITAR RECUPERACIÓN DE CONTRASEÑA ---
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            // Por seguridad siempre respondemos lo mismo
            return res.json({ msg: 'Si ese correo existe, recibirás un email en breve.' });
        }

        // Generar token único de 32 bytes
        const token = crypto.randomBytes(32).toString('hex');
        const expires = Date.now() + 1000 * 60 * 30; // 30 minutos
        resetTokens[token] = { userId: user._id.toString(), expires };

        const resetUrl = `${process.env.FRONTEND_URL || 'https://humorous-nourishment-production.up.railway.app'}/reset-password?token=${token}`;

        await transporter.sendMail({
            from: `"Dulce Mundo 🍭" <${process.env.EMAIL_USER}>`,
            to: user.email,
            subject: '¿Olvidaste tu contraseña? 🍬',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 30px; border-radius: 15px; border: 2px solid #FCE4EC;">
                    <h2 style="color: #E91E63; text-align: center;">Dulce Mundo 🍭</h2>
                    <p>Hola <b>${user.nombre}</b>,</p>
                    <p>Recibimos una solicitud para restablecer tu contraseña. Haz clic en el botón para continuar:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${resetUrl}" style="background: #E91E63; color: white; padding: 14px 30px; border-radius: 25px; text-decoration: none; font-weight: bold; font-size: 1rem;">
                            Restablecer contraseña
                        </a>
                    </div>
                    <p style="color: #999; font-size: 0.85rem;">Este enlace expira en <b>30 minutos</b>. Si no solicitaste esto, ignora este correo.</p>
                    <hr style="border-color: #FCE4EC;" />
                    <p style="color: #ccc; font-size: 0.75rem; text-align: center;">© 2026 Dulce Mundo - UMB Atenco</p>
                </div>
            `
        });

        res.json({ msg: 'Si ese correo existe, recibirás un email en breve.' });
    } catch (err) {
        console.error('Error forgot-password:', err);
        res.status(500).json({ msg: 'Error al enviar el correo' });
    }
});

// --- RESTABLECER CONTRASEÑA ---
router.post('/reset-password', async (req, res) => {
    const { token, newPassword } = req.body;
    try {
        const data = resetTokens[token];

        if (!data) return res.status(400).json({ msg: 'Token inválido o ya usado' });
        if (Date.now() > data.expires) {
            delete resetTokens[token];
            return res.status(400).json({ msg: 'El enlace ha expirado. Solicita uno nuevo.' });
        }

        await User.findByIdAndUpdate(data.userId, { password: newPassword });

        // Eliminar token para que no se reutilice
        delete resetTokens[token];

        res.json({ msg: '¡Contraseña actualizada con éxito!' });
    } catch (err) {
        console.error('Error reset-password:', err);
        res.status(500).json({ msg: 'Error al restablecer la contraseña' });
    }
});

module.exports = router;