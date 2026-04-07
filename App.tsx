import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet, View } from 'react-native';

// Import navigation and context
import AuthNavigator from './src/navigation/AuthNavigator';
import MainNavigator from './src/navigation/MainNavigator';
import { AppProvider, useApp } from './src/context/AppContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import LoadingScreen from './src/screens/LoadingScreen';

// Main App Component
function AppContent() {
  const { state, checkAuthStatus } = useApp();
  const { isDark, colors } = useTheme();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const initialize = async () => {
      try {
        await checkAuthStatus();
      } catch (error) {
        console.error('Error during app initialization:', error);
      } finally {
        setIsInitializing(false);
      }
    };

    initialize();
  }, []);

  // Show loading screen during initialization
  if (isInitializing) {
    return <LoadingScreen />;
  }

  // Choose navigation based on auth status
  return (
    <GestureHandlerRootView style={[styles.container, { backgroundColor: colors.background }]}>
      <NavigationContainer>
        <StatusBar style={isDark ? "light" : "dark"} />
        {state.isAuthenticated ? <MainNavigator /> : <AuthNavigator />}
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}

// Root App Component with Context Provider
export default function App() {
  return (
    <ThemeProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});