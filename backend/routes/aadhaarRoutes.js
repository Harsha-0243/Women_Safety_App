const express = require('express');
const router = express.Router();
const { verifyAadhaar, verifyOTP } = require('../controllers/aadhaarController');

router.post('/verify-aadhaar', verifyAadhaar);
router.post('/verify-otp', verifyOTP);

module.exports = router;