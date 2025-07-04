const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  order_id: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
  productName: { type: String, required: true },
  amount: { type: Number, required: true },
  itemPrice: { type: Number, required: true },
  totalPrice: { type: Number, required: true } // amount * itemPrice
});

module.exports = mongoose.model("Product", productSchema);
