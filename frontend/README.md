# Frontend - Women Safety App (React Native + Expo)

This is the mobile frontend for the Women Safety App with Aadhaar-based registration.

## 📁 Project Structure

```
frontend/
├── components/
│   ├── ui/
│   │   └── MainLayout.js     # Bottom navigation layout
│   └── CustomInput.js        # Reusable input component
├── navigation/
│   └── AppNavigator.js       # Stack navigation setup
├── screens/
│   ├── LoginScreen.js
│   ├── RegistrationScreen.js
│   ├── HomeScreen.js
│   ├── CommunityScreen.js
│   ├── GuardianScreen.js
│   ├── HelpScreen.js
│   └── SettingsScreen.js
├── services/
│   └── api.js                # API service (axios)
├── assets/
│   └── images/               # App icons and images
├── .gitignore
├── App.js                    # Main app entry
├── app.json                  # Expo configuration
├── babel.config.js
└── package.json
```

## 🚀 Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Expo CLI: `npm install -g expo-cli`
- Expo Go app on your mobile device (download from App Store or Play Store)

### Step 1: Install Dependencies

```bash
cd frontend
npm install
```

### Step 2: Configure API Base URL

**⚠️ CRITICAL: Update the IP address in `services/api.js`**

Open `services/api.js` and update line 10:

```javascript
const YOUR_COMPUTER_IP = '192.168.1.100'; // 👈 UPDATE THIS!
```

**How to find your computer's IP:**
- **Windows**: Open Command Prompt → `ipconfig` → Look for IPv4 Address
- **Mac/Linux**: Open Terminal → `ifconfig` or `ip addr` → Look for inet address
- Example: `192.168.1.100`, `172.16.13.12`, etc.

**⚠️ Make sure your phone and computer are on the SAME WiFi network!**

### Step 3: Start the Development Server

```bash
npm start
```

or

```bash
npx expo start
```

This will open Expo DevTools in your browser.

### Step 4: Run on Your Device

#### Option A: Using Expo Go App (Recommended for Development)

1. **Install Expo Go:**
   - iOS: Download from App Store
   - Android: Download from Play Store

2. **Scan QR Code:**
   - **iOS**: Open Camera app → Scan QR code from terminal
   - **Android**: Open Expo Go app → Tap "Scan QR Code"

3. **Wait for the app to load** (may take 1-2 minutes first time)

#### Option B: Using Android Emulator

```bash
npm run android
```

#### Option C: Using iOS Simulator (Mac only)

```bash
npm run ios
```

## 📱 App Features

### Authentication Flow
1. **Login Screen** → Initial screen with mobile number and password
2. **Registration Screen** → Multi-step registration with Aadhaar verification
   - Personal Information
   - Aadhaar Verification (OTP)
   - Account Credentials

### Main App Screens
- **Home** - Emergency contacts, safety features
- **Community** - Connect with others (Coming soon)
- **Guardian** - Trusted contacts (Coming soon)
- **Help** - Safety resources (Coming soon)
- **Settings** - Profile and app settings

## 🧪 Testing

### Test Account
Use the sample Aadhaar numbers from backend:

| Aadhaar Number | Mobile Number | Test Password |
|----------------|---------------|---------------|
| 123456789012   | 9876543210    | test123       |

### Registration Test Flow

1. **Go to Registration Screen**
2. **Fill Personal Info:**
   - Name: John Doe
   - Gender: Male
   - DOB: 1990-01-01
   - Email: john@gmail.com

3. **Verify Aadhaar:**
   - Aadhaar: 123456789012
   - Click "Verify Aadhaar"
   - Check backend console for OTP
   - Enter OTP (e.g., 123456)
   - Click "Verify OTP"

4. **Complete Registration:**
   - Username: johndoe
   - Password: test123
   - Confirm Password: test123
   - Click "Register"

5. **Login:**
   - Mobile: 9876543210
   - Password: test123

## 🔧 Troubleshooting

### Issue: Cannot connect to backend
**Symptoms:** Network error, timeout, or "Check if backend is running"

**Solutions:**
1. ✅ Verify backend is running (`npm run dev` in backend folder)
2. ✅ Confirm IP address in `services/api.js` matches your computer's IP
3. ✅ Ensure phone and computer are on the SAME WiFi network
4. ✅ Check backend terminal shows: `Network: http://YOUR_IP:3000`
5. ✅ Try accessing `http://YOUR_IP:3000` in phone's browser
6. ✅ Disable VPN if using one

### Issue: QR code not scanning
**Solution:**
- Ensure good lighting
- Try scanning from different angles
- Manually enter the URL shown in terminal

### Issue: App crashes on startup
**Solution:**
```bash
# Clear cache and restart
npx expo start -c
```

### Issue: Stuck on splash screen
**Solution:**
- Wait 2-3 minutes (first load is slow)
- Check for errors in terminal
- Restart Expo server

### Issue: Keyboard covers input fields
**Solution:** Already handled with `KeyboardAvoidingView` and `KeyboardAwareScrollView`

## 📝 Development Notes

### Expo Go Limitations
- No custom native modules
- Limited push notification features
- Cannot test production builds

### Building Standalone Apps

For production builds:

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Build for Android
eas build --platform android

# Build for iOS
eas build --platform ios
```

## 🎨 Customization

### Colors
Main colors used in the app:
- Primary: `#007AFF` (Blue)
- Success: `#4CAF50` (Green)
- Warning: `#FF9800` (Orange)
- Danger: `#FF4D4D` (Red)
- Background: `#F7F7F7` (Light Gray)

### Fonts
Using default React Native fonts. To add custom fonts:
1. Add font files to `assets/fonts/`
2. Load in `App.js` using `expo-font`

## 🔐 Security Notes

- Never hardcode API keys or secrets
- Use environment variables for sensitive data
- Implement proper authentication token storage
- Add request/response encryption for production

## 📱 Supported Platforms

- ✅ Android 5.0+
- ✅ iOS 13.0+
- ⚠️ Web (limited features)

## 🆘 Getting Help

If you encounter issues:
1. Check backend console for errors
2. Check Expo console for frontend errors
3. Verify network connectivity
4. Ensure all dependencies are installed
5. Try clearing cache: `npx expo start -c`

## 📚 Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Navigation](https://reactnavigation.org/)
- [React Native Documentation](https://reactnative.dev/)