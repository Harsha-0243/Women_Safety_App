import React from "react";
import { createStackNavigator } from "@react-navigation/stack";

import LoginScreen from "../screens/LoginScreen";
import RegistrationScreen from "../screens/RegistrationScreen";

import HomeScreen from "../screens/HomeScreen";
import CommunityScreen from "../screens/CommunityScreen";
import GuardianScreen from "../screens/GuardianScreen";
import HelpScreen from "../screens/HelpScreen";
import SettingsScreen from "../screens/SettingsScreen";

import MainLayout from "../components/ui/MainLayout";

const Stack = createStackNavigator();

const withLayout = (ScreenComponent) => {
  return (props) => (
    <MainLayout navigation={props.navigation}>
      <ScreenComponent {...props} />
    </MainLayout>
  );
};

export default function AppNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerStyle: { backgroundColor: "#007AFF" },
        headerTintColor: "#fff",
        headerTitleStyle: { fontWeight: "bold" },
      }}
    >
      {/* LOGIN */}
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ headerShown: false }}
      />

      {/* REGISTRATION */}
      <Stack.Screen
        name="Registration"
        component={RegistrationScreen}
        options={{ title: "Create Account" }}
      />

      {/* HOME (wrapped in MainLayout) */}
      <Stack.Screen
        name="Home"
        component={withLayout(HomeScreen)}
        options={{ headerShown: false }}
      />

      {/* COMMUNITY */}
      <Stack.Screen
        name="Community"
        component={withLayout(CommunityScreen)}
        options={{ headerShown: false }}
      />

      {/* GUARDIAN */}
      <Stack.Screen
        name="Guardian"
        component={withLayout(GuardianScreen)}
        options={{ headerShown: false }}
      />

      {/* HELP */}
      <Stack.Screen
        name="Help"
        component={withLayout(HelpScreen)}
        options={{ headerShown: false }}
      />

      {/* SETTINGS */}
      <Stack.Screen
        name="Settings"
        component={withLayout(SettingsScreen)}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
