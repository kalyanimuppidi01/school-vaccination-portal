const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  studentId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  class: { type: String, required: true },
  vaccinated: [{
    vaccineId: { type: mongoose.Schema.Types.ObjectId, ref: 'Drive' },
    vaccineName: String,
    date: Date
  }],
  registered: [{
    driveId: { type: mongoose.Schema.Types.ObjectId, ref: 'Drive' },
    date: Date
  }],
  registeredDrives: [{ type: mongoose.Schema.Types.ObjectId, ref: "Drive" }],

  
}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);
