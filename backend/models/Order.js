const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  usuario: { type: String, required: true }, // Guardaremos el ID o Nombre del usuario
  productos: [
    {
      productoId: String,
      nombre: String,
      cantidad: Number,
      precio: Number
    }
  ],
  total: { type: Number, required: true },
  metodoPago: { type: String, enum: ['efectivo', 'mercadopago'], required: true },
  estado: { type: String, default: 'pendiente' }, // pendiente, pagado, entregado
  fecha: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', OrderSchema);