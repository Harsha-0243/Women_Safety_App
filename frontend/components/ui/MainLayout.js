import React from "react";
import { View, TouchableOpacity, StyleSheet, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const MainLayout = ({ children, navigation }) => {
  return (
    <View style={{ flex: 1 }}>

      {/* Screen Content */}
      <View style={{ flex: 1 }}>
        {React.cloneElement(children, { navigation })}
      </View>

      {/* Bottom Navigation Bar */}
      <View style={styles.navBar}>

        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate("Home")}>
          <Ionicons name="home" size={26} color="#007AFF" />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate("Community")}>
          <Ionicons name="chatbubbles" size={26} color="#007AFF" />
          <Text style={styles.navText}>Chat</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate("Guardian")}>
          <Ionicons name="people" size={26} color="#007AFF" />
          <Text style={styles.navText}>People</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate("Help")}>
          <Ionicons name="help-circle" size={26} color="#007AFF" />
          <Text style={styles.navText}>Help</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate("Settings")}>
          <Ionicons name="settings" size={26} color="#007AFF" />
          <Text style={styles.navText}>Settings</Text>
        </TouchableOpacity>

      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  navBar: {
    height: 70,
    flexDirection: "row",
    backgroundColor: "#fff",
    elevation: 10,
    justifyContent: "space-around",
    alignItems: "center",
    borderTopWidth: 1,
    borderColor: "#eee",
  },
  navItem: {
    alignItems: "center",
  },
  navText: {
    fontSize: 12,
    color: "#007AFF",
    marginTop: 4,
  },
});

export default MainLayout;
