const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    class: { type: String, required: true },
    studentID: { type: String, required: true, unique: true },
    vaccinationRecords: [
        {
            vaccineName: String,
            date: Date,
        }
    ]
});

module.exports = mongoose.model('Student', studentSchema);
