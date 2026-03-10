const db = require('../config/db');
const jwt = require('jsonwebtoken');

// ============================================
// REGISTER NEW USER
// ============================================
const register = async (req, res) => {
  try {
    const { 
      name, 
      gender, 
      dob, 
      email, 
      aadhaarNumber, 
      username, 
      password 
    } = req.body;

    console.log('📥 Registration request received:', {
      name, gender, dob, email, aadhaarNumber, username
    });

    // Validate all required fields
    if (!name || !gender || !dob || !email || !aadhaarNumber || !username || !password) {
      console.log('❌ Missing fields');
      return res.status(400).json({ 
        success: false, 
        message: 'All fields are required' 
      });
    }

    // Validate email format
    if (!email.endsWith('@gmail.com')) {
      console.log('❌ Invalid email format');
      return res.status(400).json({ 
        success: false, 
        message: 'Email must be a valid Gmail address (@gmail.com)' 
      });
    }

    // Validate password length
    if (password.length < 6) {
      console.log('❌ Password too short');
      return res.status(400).json({ 
        success: false, 
        message: 'Password must be at least 6 characters long' 
      });
    }

    // Check if Aadhaar was verified
    console.log('🔍 Checking OTP verification for Aadhaar:', aadhaarNumber);
    const [otpRows] = await db.query(
      'SELECT * FROM otp_verifications WHERE aadhaar_number = ? AND verified = TRUE ORDER BY created_at DESC LIMIT 1',
      [aadhaarNumber]
    );

    console.log('📊 OTP verification records found:', otpRows.length);
    
    if (otpRows.length === 0) {
      console.log('❌ No verified OTP found for this Aadhaar');
      return res.status(400).json({ 
        success: false, 
        message: 'Please verify your Aadhaar number first' 
      });
    }

    const mobileNumber = otpRows[0].mobile_number;
    console.log('📱 Mobile number from OTP:', mobileNumber);

    // Check if user already exists
    console.log('🔍 Checking for existing user...');
    const [existingUsers] = await db.query(
      'SELECT * FROM users WHERE email = ? OR username = ? OR mobile_number = ?',
      [email, username, mobileNumber]
    );

    if (existingUsers.length > 0) {
      console.log('❌ User already exists');
      return res.status(400).json({ 
        success: false, 
        message: 'User with this email, username, or mobile number already exists' 
      });
    }

    // Insert user into database (NO PASSWORD HASHING - store plain text)
    console.log('💾 Inserting user into database...');
    await db.query(
      'INSERT INTO users (name, gender, dob, email, username, mobile_number, password_hash, aadhaar_number) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [name, gender, dob, email, username, mobileNumber, password, aadhaarNumber]
    );

    console.log('✅ User registered successfully!');
    return res.status(201).json({ 
      success: true, 
      message: 'Registration successful! Please login.' 
    });

  } catch (error) {
    console.error('❌ Registration error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error during registration',
      error: error.message
    });
  }
};

// ============================================
// LOGIN USER (USERNAME + PASSWORD)
// ============================================
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    console.log('🔐 Login attempt for username:', username);

    // Validate inputs
    if (!username || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Username and password are required' 
      });
    }

    // Find user by username
    const [users] = await db.query(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );

    if (users.length === 0) {
      console.log('❌ User not found');
      return res.status(404).json({ 
        success: false, 
        message: 'User does not exist. Please register.' 
      });
    }

    const user = users[0];
    console.log('✅ User found:', user.username);

    // Verify password (plain text comparison - NO HASHING)
    if (password !== user.password_hash) {
      console.log('❌ Invalid password');
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid password' 
      });
    }

    console.log('✅ Password verified');

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        username: user.username,
        mobileNumber: user.mobile_number
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log('✅ Login successful for:', user.username);

    return res.status(200).json({ 
      success: true, 
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        mobileNumber: user.mobile_number
      }
    });

  } catch (error) {
    console.error('❌ Login error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error during login'
    });
  }
};

module.exports = {
  register,
  login
};