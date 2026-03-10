import React, { useState } from "react";
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomInput from "../components/CustomInput";
import { loginUser } from "../services/api";

const LoginScreen = ({ navigation }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    // Validation
    if (!username || !password) {
      alert("All fields are required");
      return;
    }

    if (username.trim().length < 3) {
      alert("Username must be at least 3 characters");
      return;
    }

    try {
      setLoading(true);
      console.log('Attempting login with username:', username);
      
      const response = await loginUser(username, password);
      console.log('Login response:', response);

      if (response.success) {
        // Store token and user data in AsyncStorage
        await AsyncStorage.setItem('authToken', response.token);
        await AsyncStorage.setItem('user', JSON.stringify(response.user));
        
        console.log('✅ Token and user saved to AsyncStorage');
        console.log('Navigating to Home...');
        
        navigation.replace("Home", { 
          user: response.user,
          token: response.token
        });
      } else {
        alert(response.message || "Login failed");
      }
    } catch (err) {
      console.error('Login error:', err);
      alert(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Login to your account</Text>
        </View>

        <View style={styles.form}>
          <CustomInput 
            label="Username" 
            value={username} 
            onChangeText={setUsername}
            placeholder="Enter your username"
            autoCapitalize="none"
          />
          
          <CustomInput 
            label="Password" 
            value={password} 
            onChangeText={setPassword} 
            secureTextEntry
            placeholder="Enter your password"
          />

          <TouchableOpacity 
            style={[styles.button, loading && styles.buttonDisabled]} 
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnText}>Login</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate("Registration")}>
            <Text style={styles.link}>Don't have an account? Register</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 40,
  },
  title: { 
    fontSize: 32, 
    fontWeight: "bold", 
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
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
  button: { 
    backgroundColor: "#007AFF", 
    padding: 16, 
    borderRadius: 8, 
    marginTop: 20,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: "#ccc",
  },
  btnText: { 
    color: "#fff", 
    fontWeight: "600",
    fontSize: 16,
  },
  link: { 
    textAlign: "center", 
    marginTop: 20, 
    color: "#007AFF",
    fontSize: 14,
  },
});

export default LoginScreen;