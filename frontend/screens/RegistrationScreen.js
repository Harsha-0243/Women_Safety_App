import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import CustomInput from '../components/CustomInput';
import { verifyAadhaar, verifyOTP, registerUser } from '../services/api';

const RegistrationScreen = ({ navigation }) => {
  // Step 1 info
  const [name, setName] = useState('');
  const [gender, setGender] = useState('Male');
  const [dob, setDob] = useState('');
  const [email, setEmail] = useState('');
  const [aadhaarNumber, setAadhaarNumber] = useState('');

  // Step 2
  const [otp, setOtp] = useState('');
  const [isAadhaarVerified, setIsAadhaarVerified] = useState(false);
  const [mobileNumber, setMobileNumber] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);

  // Step 3
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);

  const handleVerifyAadhaar = async () => {
    console.log('🔍 Verify Aadhaar clicked');
    
    if (!aadhaarNumber || aadhaarNumber.length !== 12) {
      alert('Please enter a valid 12-digit Aadhaar number');
      return;
    }

    setLoading(true);
    try {
      console.log('📤 Sending Aadhaar verification request:', aadhaarNumber);
      const response = await verifyAadhaar(aadhaarNumber);
      console.log('📥 Aadhaar verification response:', response);

      if (response.success) {
        setShowOtpInput(true);
        alert(`OTP sent to ${response.mobileNumber}`);
      }
    } catch (error) {
      console.error('❌ Aadhaar verification error:', error);
      alert(error.message || 'Aadhaar not found');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    console.log('🔐 Verify OTP clicked');
    
    if (!otp || otp.length !== 6) {
      alert('Enter valid 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      console.log('📤 Sending OTP verification request');
      const response = await verifyOTP(aadhaarNumber, otp);
      console.log('📥 OTP verification response:', response);

      if (response.success) {
        setIsAadhaarVerified(true);
        setMobileNumber(response.mobileNumber);
        alert('Aadhaar verified successfully!');
      }
    } catch (error) {
      console.error('❌ OTP verification error:', error);
      alert(error.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    console.log('📝 Register button clicked');
    
    // Validation
    if (!name || !gender || !dob || !email || !username || !password || !confirmPassword) {
      alert('Please fill in all fields');
      return;
    }

    if (!email.endsWith('@gmail.com')) {
      alert('Email must end with @gmail.com');
      return;
    }

    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dob)) {
      alert('Date must be in YYYY-MM-DD format (e.g., 1990-01-01)');
      return;
    }

    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }

    if (!isAadhaarVerified) {
      alert('Please verify your Aadhaar first');
      return;
    }

    setLoading(true);
    try {
      const userData = {
        name,
        gender,
        dob,
        email,
        aadhaarNumber,
        username,
        password,
      };

      console.log('📤 Sending registration data:', userData);
      const response = await registerUser(userData);
      console.log('📥 Registration response:', response);

      if (response.success) {
        alert('Registration successful! Please login.');
        
        setTimeout(() => {
          navigation.replace('Login');
        }, 100);
      } else {
        alert(response.message || 'Registration failed');
      }
    } catch (error) {
      console.error('❌ Registration error:', error);
      alert(error.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Register with your Aadhaar</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.sectionTitle}>Personal Information</Text>

          <CustomInput
            label="Full Name"
            value={name}
            onChangeText={setName}
            placeholder="Enter your full name"
          />

          <View style={styles.pickerContainer}>
            <Text style={styles.label}>Gender</Text>
            <View style={styles.pickerWrapper}>
              <Picker 
                selectedValue={gender} 
                onValueChange={setGender} 
                style={styles.picker}
              >
                <Picker.Item label="Male" value="Male" />
                <Picker.Item label="Female" value="Female" />
                <Picker.Item label="Other" value="Other" />
              </Picker>
            </View>
          </View>

          <CustomInput
            label="Date of Birth"
            value={dob}
            onChangeText={setDob}
            placeholder="YYYY-MM-DD (e.g., 1990-01-01)"
          />

          <CustomInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="yourname@gmail.com"
            keyboardType="email-address"
          />

          <Text style={styles.sectionTitle}>Aadhaar Verification</Text>

          <CustomInput
            label="Aadhaar Number"
            value={aadhaarNumber}
            onChangeText={setAadhaarNumber}
            placeholder="Enter 12-digit Aadhaar number"
            keyboardType="number-pad"
            maxLength={12}
            editable={!isAadhaarVerified}
          />

          {!showOtpInput && !isAadhaarVerified && (
            <TouchableOpacity 
              style={[styles.verifyButton, loading && styles.buttonDisabled]} 
              onPress={handleVerifyAadhaar}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.verifyButtonText}>Verify Aadhaar</Text>
              )}
            </TouchableOpacity>
          )}

          {showOtpInput && !isAadhaarVerified && (
            <>
              <View style={styles.otpInfoBox}>
                <Ionicons name="information-circle" size={20} color="#007AFF" />
                <Text style={styles.otpInfoText}>
                  Check your backend terminal for the OTP
                </Text>
              </View>

              <CustomInput
                label="Enter OTP"
                value={otp}
                onChangeText={setOtp}
                placeholder="Enter 6-digit OTP"
                keyboardType="number-pad"
                maxLength={6}
              />

              <TouchableOpacity 
                style={[styles.verifyButton, loading && styles.buttonDisabled]} 
                onPress={handleVerifyOTP}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.verifyButtonText}>Verify OTP</Text>
                )}
              </TouchableOpacity>
            </>
          )}

          {isAadhaarVerified && (
            <View style={styles.verifiedContainer}>
              <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
              <Text style={styles.verifiedText}>Aadhaar Verified ✓</Text>
            </View>
          )}

          {isAadhaarVerified && (
            <>
              <Text style={styles.sectionTitle}>Account Credentials</Text>

              <CustomInput
                label="Username"
                value={username}
                onChangeText={setUsername}
                placeholder="Choose a username"
              />

              <CustomInput
                label="Password"
                value={password}
                onChangeText={setPassword}
                placeholder="Create a password (min 6 characters)"
                secureTextEntry
              />

              <CustomInput
                label="Confirm Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Re-enter your password"
                secureTextEntry
              />

              <TouchableOpacity 
                style={[styles.submitButton, loading && styles.buttonDisabled]} 
                onPress={handleRegister}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.submitButtonText}>Register</Text>
                )}
              </TouchableOpacity>
            </>
          )}

          <TouchableOpacity 
            style={styles.backToLogin} 
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backToLoginText}>
              Already have an account? Login
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f5f5f5' 
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginTop: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  subtitle: { 
    fontSize: 16, 
    color: '#666' 
  },
  form: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 20,
    marginBottom: 16,
  },
  pickerContainer: { 
    marginBottom: 16 
  },
  label: { 
    fontSize: 14, 
    fontWeight: '600', 
    marginBottom: 8, 
    color: '#333' 
  },
  pickerWrapper: { 
    borderWidth: 1, 
    borderColor: '#ddd', 
    borderRadius: 8, 
    backgroundColor: '#fff' 
  },
  picker: { 
    height: 50 
  },
  otpInfoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
    marginBottom: 10,
  },
  otpInfoText: {
    fontSize: 14,
    color: '#007AFF',
    marginLeft: 8,
    flex: 1,
  },
  verifyButton: {
    backgroundColor: '#FF9800',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  verifyButtonText: { 
    color: '#fff', 
    fontSize: 16, 
    fontWeight: '600' 
  },
  verifiedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  verifiedText: { 
    fontSize: 16, 
    color: '#4CAF50', 
    fontWeight: '600', 
    marginLeft: 10 
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: { 
    color: '#fff', 
    fontSize: 16, 
    fontWeight: '600' 
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
    opacity: 0.6,
  },
  backToLogin: { 
    marginTop: 20, 
    alignItems: 'center' 
  },
  backToLoginText: { 
    fontSize: 14, 
    color: '#007AFF' 
  },
});

export default RegistrationScreen;