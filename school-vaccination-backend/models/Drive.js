const mongoose = require('mongoose');

const driveSchema = new mongoose.Schema({
  vaccineName: { type: String, required: true },
  date: { type: Date, required: true },
  availableDoses: { type: Number, required: true },
  applicableClasses: [String]  // E.g. ["5", "6", "7"]
}, { timestamps: true });

module.exports = mongoose.model('Drive', driveSchema);
