const Student = require('../models/Student');
const Drive = require('../models/Drive');

exports.getDashboardData = async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments();
    const vaccinatedStudents = await Student.countDocuments({ "vaccinated.0": { $exists: true } });

    const percentVaccinated = totalStudents > 0
      ? ((vaccinatedStudents / totalStudents) * 100).toFixed(2)
      : "0.00";

    const now = new Date();
    const next30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const upcomingDrives = await Drive.find({
      date: { $gte: now, $lte: next30Days }
    }).sort('date');

    res.json({
      totalStudents,
      vaccinatedStudents,
      percentVaccinated,
      upcomingDrives
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
