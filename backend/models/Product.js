const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  descripcion: { type: String },
  precio: { type: Number, required: true },
  imagen: { type: String } // Aquí guardaremos la URL de la imagen
});

module.exports = mongoose.model('Product', ProductSchema);