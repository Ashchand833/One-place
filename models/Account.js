const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true },
  dateCreated: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Account", accountSchema);
