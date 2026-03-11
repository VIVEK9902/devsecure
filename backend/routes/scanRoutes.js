const express = require('express');
const { scanWebsite, downloadReport } = require('../controllers/scanController');

const router = express.Router();

router.post('/scan', scanWebsite);
router.post('/report', downloadReport);

module.exports = router;