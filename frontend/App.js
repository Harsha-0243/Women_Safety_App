import 'react-native-url-polyfill/auto';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { registerRootComponent } from 'expo';
import AppNavigator from './navigation/AppNavigator';

function App() {
  return (
    <NavigationContainer>
      <AppNavigator />
    </NavigationContainer>
  );
}

export default registerRootComponent(App);