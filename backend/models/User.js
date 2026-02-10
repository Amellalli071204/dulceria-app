const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  telefono: { type: String, required: true }, // Pedido en los requisitos
  isAdmin: { type: Boolean, default: false } // Para saber si puede entrar al panel de admin
});

module.exports = mongoose.model('User', UserSchema);