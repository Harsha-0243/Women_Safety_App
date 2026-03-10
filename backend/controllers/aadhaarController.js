const db = require('../config/db');
const { generateOTP, sendOTP, getOTPExpiryTime } = require('../utils/otpService');

// Verify Aadhaar and send OTP
const verifyAadhaar = async (req, res) => {
  try {
    const { aadhaarNumber } = req.body;

    // Validate Aadhaar number format
    if (!aadhaarNumber || aadhaarNumber.length !== 12 || !/^\d{12}$/.test(aadhaarNumber)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid Aadhaar number format. Must be 12 digits.' 
      });
    }

    // Check if Aadhaar exists in sample dataset
    const [rows] = await db.query(
      'SELECT mobile_number FROM sample_aadhaar_data WHERE aadhaar_number = ?',
      [aadhaarNumber]
    );

    if (rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Aadhaar number not found in our records.' 
      });
    }

    const mobileNumber = rows[0].mobile_number;

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = getOTPExpiryTime();

    // Delete any existing OTP for this Aadhaar
    await db.query(
      'DELETE FROM otp_verifications WHERE aadhaar_number = ?',
      [aadhaarNumber]
    );

    // Store new OTP
    await db.query(
      'INSERT INTO otp_verifications (aadhaar_number, mobile_number, otp, expires_at) VALUES (?, ?, ?, ?)',
      [aadhaarNumber, mobileNumber, otp, expiresAt]
    );

    // Send OTP
    await sendOTP(mobileNumber, otp);

    return res.status(200).json({ 
      success: true, 
      message: 'OTP sent successfully',
      mobileNumber: `******${mobileNumber.slice(-4)}` // Masked number
    });

  } catch (error) {
    console.error('Aadhaar verification error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error during Aadhaar verification' 
    });
  }
};

// Verify OTP
const verifyOTP = async (req, res) => {
  try {
    const { aadhaarNumber, otp } = req.body;

    // Validate inputs
    if (!aadhaarNumber || !otp) {
      return res.status(400).json({ 
        success: false, 
        message: 'Aadhaar number and OTP are required' 
      });
    }

    // Fetch OTP record
    const [rows] = await db.query(
      'SELECT * FROM otp_verifications WHERE aadhaar_number = ? AND verified = FALSE ORDER BY created_at DESC LIMIT 1',
      [aadhaarNumber]
    );

    if (rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'No OTP found. Please request a new OTP.' 
      });
    }

    const otpRecord = rows[0];

    // Check if OTP expired
    if (new Date() > new Date(otpRecord.expires_at)) {
      return res.status(400).json({ 
        success: false, 
        message: 'OTP has expired. Please request a new OTP.' 
      });
    }

    // Verify OTP
    if (otpRecord.otp !== otp) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid OTP. Please try again.' 
      });
    }

    // Mark OTP as verified
    await db.query(
      'UPDATE otp_verifications SET verified = TRUE WHERE id = ?',
      [otpRecord.id]
    );

    return res.status(200).json({ 
      success: true, 
      message: 'Aadhaar verified successfully',
      mobileNumber: otpRecord.mobile_number
    });

  } catch (error) {
    console.error('OTP verification error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error during OTP verification' 
    });
  }
};

module.exports = {
  verifyAadhaar,
  verifyOTP
};