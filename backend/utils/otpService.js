// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP (Mock - logs to console)
const sendOTP = async (mobileNumber, otp) => {
  // In production, integrate with SMS API like:
  // - Twilio: https://www.twilio.com/
  // - Fast2SMS: https://www.fast2sms.com/
  // - MSG91: https://msg91.com/
  
  console.log('\n=================================');
  console.log(`📱 Sending OTP to: ${mobileNumber}`);
  console.log(`🔐 OTP: ${otp}`);
  console.log('=================================\n');
  
  return true; // Simulate successful send
};

// Calculate OTP expiry time
const getOTPExpiryTime = () => {
  const minutes = parseInt(process.env.OTP_EXPIRY_MINUTES) || 5;
  const expiryTime = new Date();
  expiryTime.setMinutes(expiryTime.getMinutes() + minutes);
  return expiryTime;
};

module.exports = {
  generateOTP,
  sendOTP,
  getOTPExpiryTime
};