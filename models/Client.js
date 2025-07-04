const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  client: { type: String, required: true }, // client name
  clientDetails: { type: String },
  phone: { type: String },
  country: { type: String },
  street: { type: String },
  city: { type: String },
  postalCode: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Client", clientSchema);
