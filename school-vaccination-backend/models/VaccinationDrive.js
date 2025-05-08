const mongoose = require('mongoose');

const driveSchema = new mongoose.Schema({
    vaccineName: { type: String, required: true },
    date: { type: Date, required: true },
    availableDoses: { type: Number, required: true },
    applicableClasses: [String],
    isExpired: { type: Boolean, default: false }
});

module.exports = mongoose.model('VaccinationDrive', driveSchema);
