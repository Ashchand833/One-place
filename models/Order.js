const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  client_id: { type: mongoose.Schema.Types.ObjectId, ref: "Client", required: true },
  date: { type: Date, default: Date.now },
  price: { type: Number, required: true },
  status: { type: String },
  worker: { type: String }
});

module.exports = mongoose.model("Order", orderSchema);
