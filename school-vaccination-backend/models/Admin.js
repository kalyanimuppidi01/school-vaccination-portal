const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  username: String,
  password: String  // store plaintext or hashed if simulating login
});

module.exports = mongoose.model('Admin', adminSchema);
