const Drive = require('../models/Drive');

// Create a new vaccination drive
exports.createDrive = async (req, res) => {
  try {
    const { vaccineName, date, availableDoses, applicableClasses } = req.body;

    const driveDate = new Date(date);
    const now = new Date();
    const daysAhead = (driveDate - now) / (1000 * 60 * 60 * 24);
    if (daysAhead < 15) {
      return res.status(400).json({ error: 'Drives must be scheduled at least 15 days in advance.' });
    }

    const overlappingDrive = await Drive.findOne({ date: driveDate });
    if (overlappingDrive) {
      return res.status(400).json({ error: 'A drive is already scheduled on this date.' });
    }

    const newDrive = await Drive.create({ vaccineName, date: driveDate, availableDoses, applicableClasses });
    res.status(201).json(newDrive);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all upcoming drives (or all)
exports.getDrives = async (req, res) => {
  try {
    const now = new Date();
    const upcoming = await Drive.find({ date: { $gte: now } }).sort('date');
    res.json(upcoming);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Edit a drive (only if date is in the future)
exports.updateDrive = async (req, res) => {
  try {
    const drive = await Drive.findById(req.params.id);
    if (!drive) return res.status(404).json({ error: 'Drive not found' });

    const driveDate = new Date(drive.date);
    const now = new Date();
    if (driveDate < now) {
      return res.status(400).json({ error: 'Cannot edit past drives.' });
    }

    const updatedDrive = await Drive.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedDrive);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
