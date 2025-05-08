const express = require('express');
const router = express.Router();

// Dashboard metrics
router.get('/', (req, res) => {
    res.send('Dashboard metrics API working');
});

module.exports = router;
