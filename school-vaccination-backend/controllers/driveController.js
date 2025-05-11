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
      const allDrives = await Drive.find().sort('date');
      const now = new Date();
  
      // Update expired status if needed
      for (const drive of allDrives) {
        if (!drive.isExpired && new Date(drive.date) < now) {
          drive.isExpired = true;
          await drive.save();
        }
      }
  
      const { show } = req.query;
  
      let filteredDrives = allDrives;
      if (show === 'upcoming') {
        filteredDrives = allDrives.filter(d => !d.isExpired);
      } else if (show === 'expired') {
        filteredDrives = allDrives.filter(d => d.isExpired);
      }
  
      res.json(filteredDrives);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
  
  

// Edit a drive (only if date is in the future and no conflicts)
exports.updateDrive = async (req, res) => {
    try {
      const drive = await Drive.findById(req.params.id);
      if (!drive) return res.status(404).json({ error: "Drive not found" });
  
      // 🚫 Disallow updates to past drives
      const now = new Date();
      if (new Date(drive.date) <= now) {
        return res.status(400).json({ error: "Cannot update an expired or current-day drive" });
      }
  
      // 🛑 Prevent scheduling conflicts
      if (req.body.date) {
        const newDate = new Date(req.body.date);
        const conflict = await Drive.findOne({ date: newDate, _id: { $ne: req.params.id } });
        if (conflict) {
          return res.status(400).json({ error: "Another drive already exists on this date" });
        }
      }
  
      const updatedDrive = await Drive.findByIdAndUpdate(req.params.id, req.body, { new: true });
      res.json(updatedDrive);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
  
exports.deleteDrive = async (req, res) => {
    try {
      await Drive.findByIdAndDelete(req.params.id);
      res.json({ message: "Drive deleted" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
  
