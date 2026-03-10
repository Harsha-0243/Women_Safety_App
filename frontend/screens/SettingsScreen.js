import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  ActivityIndicator,
  TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  getMyGuardians, 
  sendGuardianRequest, 
  removeGuardian 
} from '../services/api';

export default function SettingsScreen({ navigation, route }) {
  const [guardians, setGuardians] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [guardianUsername, setGuardianUsername] = useState('');
  const [token, setToken] = useState('');
  const [user, setUser] = useState(null);

  useEffect(() => {
    initializeScreen();
  }, []);

  const initializeScreen = async () => {
    try {
      const authToken = await AsyncStorage.getItem('authToken');
      const userData = await AsyncStorage.getItem('user');
      
      if (authToken) {
        setToken(authToken);
        if (userData) {
          setUser(JSON.parse(userData));
        }
        await loadMyGuardians(authToken);
      } else if (route?.params?.token) {
        setToken(route.params.token);
        if (route?.params?.user) {
          setUser(route.params.user);
        }
        await loadMyGuardians(route.params.token);
      }
    } catch (error) {
      console.error('Error initializing settings:', error);
    }
  };

  const loadMyGuardians = async (authToken) => {
    try {
      setLoading(true);
      const response = await getMyGuardians(authToken);
      if (response.success) {
        setGuardians(response.guardians);
      }
    } catch (error) {
      console.error('Error loading guardians:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddGuardian = async () => {
    if (!guardianUsername.trim()) {
      Alert.alert('Error', 'Please enter a username');
      return;
    }

    try {
      setLoading(true);
      const response = await sendGuardianRequest(guardianUsername, token);
      
      if (response.success) {
        Alert.alert('Success', 'Guardian request sent successfully!');
        setShowAddModal(false);
        setGuardianUsername('');
        await loadMyGuardians(token);
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to send request');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveGuardian = (guardian) => {
    Alert.alert(
      'Remove Guardian',
      `Remove ${guardian.name} as your guardian?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await removeGuardian(guardian.id, token);
              Alert.alert('Success', 'Guardian removed');
              await loadMyGuardians(token);
            } catch (error) {
              Alert.alert('Error', 'Failed to remove guardian');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout', 
      'Are you sure you want to logout?', 
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('authToken');
              await AsyncStorage.removeItem('user');
              navigation.replace('Login');
            } catch (error) {
              console.error('Error during logout:', error);
              navigation.replace('Login');
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.contentContainer}
    >
      <Text style={styles.title}>Settings</Text>

      {user && (
        <View style={styles.userInfoCard}>
          <Ionicons name="person-circle" size={60} color="#007AFF" />
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.userUsername}>@{user.username}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
          </View>
        </View>
      )}

      {/* MY GUARDIANS SECTION */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>My Guardians</Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => setShowAddModal(true)}
          >
            <Ionicons name="add-circle" size={24} color="#007AFF" />
            <Text style={styles.addButtonText}>Add</Text>
          </TouchableOpacity>
        </View>

        {loading && guardians.length === 0 ? (
          <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 20 }} />
        ) : guardians.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="shield-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>No guardians added yet</Text>
            <Text style={styles.emptySubtext}>
              Add guardians who can receive your emergency alerts
            </Text>
          </View>
        ) : (
          guardians.map((guardian) => (
            <View key={guardian.id} style={styles.guardianCard}>
              <View style={styles.guardianInfo}>
                <Ionicons name="person-circle" size={40} color="#007AFF" />
                <View style={styles.guardianDetails}>
                  <Text style={styles.guardianName}>{guardian.name}</Text>
                  <Text style={styles.guardianUsername}>@{guardian.username}</Text>
                </View>
              </View>
              <TouchableOpacity 
                onPress={() => handleRemoveGuardian(guardian)}
                style={styles.removeButton}
              >
                <Ionicons name="trash-outline" size={20} color="#d32f2f" />
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>

      {/* OTHER SETTINGS */}
      <View style={styles.card}>
        <TouchableOpacity style={styles.settingItem}>
          <Ionicons name="person-circle-outline" size={24} color="#555" />
          <Text style={styles.settingText}>Profile</Text>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem}>
          <Ionicons name="lock-closed-outline" size={24} color="#555" />
          <Text style={styles.settingText}>Change Password</Text>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem}>
          <Ionicons name="shield-checkmark-outline" size={24} color="#555" />
          <Text style={styles.settingText}>Privacy & Security</Text>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem}>
          <Ionicons name="notifications-outline" size={24} color="#555" />
          <Text style={styles.settingText}>Notifications</Text>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.settingItem, styles.logoutItem]} 
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={24} color="#d32f2f" />
          <Text style={[styles.settingText, styles.logoutText]}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* ADD GUARDIAN MODAL */}
      <Modal
        visible={showAddModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Guardian</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Ionicons name="close" size={28} color="#333" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalDescription}>
              Enter the username of the person you want to add as your guardian.
              They will receive a request to accept.
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Enter username"
              value={guardianUsername}
              onChangeText={setGuardianUsername}
              autoCapitalize="none"
            />

            <TouchableOpacity 
              style={[styles.submitButton, loading && styles.buttonDisabled]}
              onPress={handleAddGuardian}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>Send Request</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F7F7F7' 
  },
  contentContainer: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 100,
  },
  title: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    color: '#000',
    marginBottom: 20,
  },
  
  userInfoCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 3,
    alignItems: 'center',
  },
  userInfo: {
    marginLeft: 15,
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  userUsername: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#999',
    marginTop: 2,
  },
  
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  addButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  
  emptyState: {
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 5,
    textAlign: 'center',
  },
  
  guardianCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    elevation: 2,
  },
  guardianInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  guardianDetails: {
    marginLeft: 12,
  },
  guardianName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  guardianUsername: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  removeButton: {
    padding: 8,
  },
  
  card: {
    backgroundColor: '#fff',
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 3,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  settingText: { 
    fontSize: 16, 
    marginLeft: 12, 
    color: '#333',
    flex: 1,
  },
  logoutItem: {
    borderBottomWidth: 0,
  },
  logoutText: { 
    color: '#d32f2f', 
    fontWeight: 'bold' 
  },
  
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 25,
    width: '90%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  modalDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    lineHeight: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  submitButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
});