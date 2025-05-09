const Student = require('../models/Student');
const Drive = require('../models/Drive');

// Add new student
exports.addStudent = async (req, res) => {
  try {
    const student = await Student.create(req.body);
    res.status(201).json(student);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all or search
exports.getStudents = async (req, res) => {
  try {
    const { name, class: studentClass, id, vaccinated } = req.query;
    let filter = {};

    if (name) filter.name = new RegExp(name, 'i');
    if (studentClass) filter.class = studentClass;
    if (id) filter.studentId = id;
    if (vaccinated) filter['vaccinated.0'] = vaccinated === 'true' ? { $exists: true } : { $exists: false };

    const students = await Student.find(filter);
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update student details
exports.updateStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(student);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Mark as vaccinated
exports.markVaccinated = async (req, res) => {
  try {
    const { studentId, driveId } = req.body;
    const drive = await Drive.findById(driveId);
    if (!drive) return res.status(404).json({ error: 'Drive not found' });

    const student = await Student.findOne({ studentId });
    if (!student) return res.status(404).json({ error: 'Student not found' });

    const alreadyVaccinated = student.vaccinated.find(v => v.vaccineId.toString() === driveId);
    if (alreadyVaccinated) return res.status(400).json({ error: 'Student already vaccinated for this drive' });

    student.vaccinated.push({
      vaccineId: drive._id,
      vaccineName: drive.vaccineName,
      date: new Date()
    });

    await student.save();
    res.json(student);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
