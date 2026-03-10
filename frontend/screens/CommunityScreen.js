import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

export default function CommunityScreen() {
  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.contentContainer}
    >
      <Text style={styles.title}>Community</Text>

      <View style={styles.card}>
        <Text style={styles.cardText}>
          Connect with other women, share experiences, and support each other.
          Community features coming soon!
        </Text>
      </View>
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
    marginBottom: 20,
    color: '#333',
  },
  card: { 
    backgroundColor: '#fff', 
    padding: 18, 
    borderRadius: 12,
    elevation: 3,
  },
  cardText: { 
    fontSize: 16, 
    color: '#444', 
    lineHeight: 22 
  },
});