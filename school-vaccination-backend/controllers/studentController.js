const Student = require('../models/Student');
const Drive = require('../models/Drive');
const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");

exports.bulkImport = async (req, res) => {
  const filePath = req.file?.path;
  if (!filePath) return res.status(400).json({ error: "CSV file required" });

  const students = [];

  fs.createReadStream(filePath)
    .pipe(csv())
    .on("data", (row) => {
      if (row.studentId && row.name && row.class) {
        students.push({
          studentId: row.studentId.trim(),
          name: row.name.trim(),
          class: row.class.trim(),
        });
      }
    })
    .on("end", async () => {
      try {
        await Student.insertMany(students, { ordered: false });
        fs.unlinkSync(filePath); // delete temp file
        res.json({ message: "Students imported successfully", count: students.length });
      } catch (err) {
        fs.unlinkSync(filePath);
        res.status(500).json({ error: "Import failed", details: err.message });
      }
    })
    .on("error", (err) => {
      fs.unlinkSync(filePath);
      res.status(500).json({ error: "CSV read error", details: err.message });
    });
};


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

    if (name) filter.name = new RegExp(name, "i");
    if (studentClass) filter.class = studentClass;
    if (id) filter.studentId = id;
    if (vaccinated) {
      filter["vaccinated.0"] =
        vaccinated === "true" ? { $exists: true } : { $exists: false };
    }

    const students = await Student.find(filter);

    // Add registeredDrives field for frontend
    const enriched = students.map(s => ({
      ...s.toObject(),
      registeredDrives: (s.registered || []).map(r => r.driveId)
    }));

    res.json(enriched);
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

    // Check if student's class is in drive's applicableClasses
if (!drive.applicableClasses.includes(student.class)) {
  return res.status(400).json({ error: `This drive is not applicable to class ${student.class}` });
}


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

exports.getVaccineSummary = async (req, res) => {
  try {
    const students = await Student.find();

    const summary = {};

    for (const student of students) {
      const vaccinatedNames = student.vaccinated.map(v => v.vaccineName);

      vaccinatedNames.forEach(name => {
        if (!summary[name]) summary[name] = { vaccinated: 0, unvaccinated: 0 };
        summary[name].vaccinated += 1;
      });
    }

    // Count unvaccinated students for each vaccine
    for (const name in summary) {
      const total = await Student.countDocuments({
        "vaccinated.vaccineName": { $ne: name }
      });
      summary[name].unvaccinated = total;
    }

    // Convert to array format
    const result = Object.keys(summary).map(vaccineName => ({
      vaccineName,
      vaccinatedCount: summary[vaccineName].vaccinated,
      unvaccinatedCount: summary[vaccineName].unvaccinated,
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.registerForDrive = async (req, res) => {
  try {
    const { studentId, driveId } = req.body;
    const student = await Student.findOne({ studentId });
    if (!student) return res.status(404).json({ error: "Student not found" });

    const alreadyRegistered = student.registered?.some(r => r.driveId.toString() === driveId);
    if (alreadyRegistered) return res.status(400).json({ error: "Already registered for this drive" });

    student.registered = student.registered || [];
    student.registered.push({ driveId, date: new Date() });

    await student.save();
    res.json({
      message: "Student registered successfully",
      student: {
        ...student.toObject(),
        registeredDrives: student.registered.map(r => r.driveId)
      }
    });
    
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



