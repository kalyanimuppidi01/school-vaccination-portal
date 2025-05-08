const express = require('express');
const router = express.Router();
const Student = require('../models/Student');

/// Add a new student
router.post('/', async (req, res) => {
    try {
        const { name, class: studentClass, studentID } = req.body;

        // Validation
        if (!name || !studentClass || !studentID) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }

        // Check for duplicate studentID
        const existing = await Student.findOne({ studentID });
        if (existing) {
            return res.status(409).json({ message: 'Student with this ID already exists' });
        }

        const newStudent = new Student({
            name,
            class: studentClass,
            studentID,
            vaccinationRecords: []
        });

        await newStudent.save();
        res.status(201).json({ message: 'Student added successfully', student: newStudent });
    } catch (error) {
        console.error('Error adding student:', error);
        res.status(500).json({ message: 'Server error' });
    }
});


// Get all students
router.get('/', async (req, res) => {
    try {
        const students = await Student.find();
        res.status(200).json(students);
    } catch (error) {
        console.error('Error fetching students:', error);
        res.status(500).json({ message: 'Server error' });
    }
});


module.exports = router;
