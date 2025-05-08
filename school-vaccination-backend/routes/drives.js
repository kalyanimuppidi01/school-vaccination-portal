const express = require('express');
const router = express.Router();
const VaccinationDrive = require('../models/VaccinationDrive');

// Add a new drive
router.post('/', (req, res) => {
    res.send('Add vaccination drive API working');
});

// Get all drives
router.get('/', (req, res) => {
    res.send('Get all vaccination drives API working');
});

module.exports = router;
