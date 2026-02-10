const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  descripcion: { type: String },
  precio: { type: Number, required: true },
  imagen: { type: String }, 
  existencias: { type: Number, default: 0 }
});

module.exports = mongoose.model('Product', ProductSchema);