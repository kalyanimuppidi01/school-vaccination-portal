const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const { registerForDrive } = require("../controllers/studentController");

router.post("/upload", upload.single("file"), studentController.bulkImport);
router.post('/', studentController.addStudent);
router.get('/', studentController.getStudents);
router.put('/:id', studentController.updateStudent);
router.post('/vaccinate', studentController.markVaccinated);
router.get("/vaccine-summary", studentController.getVaccineSummary);
router.post("/register", studentController.registerForDrive);

module.exports = router;
