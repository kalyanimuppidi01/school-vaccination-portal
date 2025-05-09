const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');

router.post('/', studentController.addStudent);
router.get('/', studentController.getStudents);
router.put('/:id', studentController.updateStudent);
router.post('/vaccinate', studentController.markVaccinated);

module.exports = router;
