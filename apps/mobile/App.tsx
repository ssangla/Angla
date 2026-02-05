import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

import { AuthProvider, useAuth } from './src/contexts/AuthContext';

// Auth screens
import LoginScreen from './src/screens/auth/LoginScreen';
import SignupScreen from './src/screens/auth/SignupScreen';
import ForgotPasswordScreen from './src/screens/auth/ForgotPasswordScreen';
import CoupleSetupScreen from './src/screens/auth/CoupleSetupScreen';

// Main screens
import HomeScreen from '@/screens/HomeScreen';
import AddExpenseScreen from '@/screens/AddExpenseScreen';
import HistoryScreen from '@/screens/HistoryScreen';
import { colors } from '@/utils/colors';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();
const AuthStack = createStackNavigator();

// ============================================================
// AUTH NAVIGATOR — Login / Signup / Forgot Password
// ============================================================
const AuthNavigator = () => (
  <AuthStack.Navigator
    screenOptions={{
      headerShown: false,
      cardStyle: { backgroundColor: colors.background.primary },
    }}
  >
    <AuthStack.Screen name="Login" component={LoginScreen} />
    <AuthStack.Screen name="Signup" component={SignupScreen} />
    <AuthStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
  </AuthStack.Navigator>
);

// ============================================================
// MAIN APP NAVIGATOR — Home / Add / History (tabs)
// ============================================================
const HomeStackNav = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: colors.primary.main },
      headerTintColor: colors.text.inverse,
      headerTitleStyle: { fontWeight: 'bold' },
    }}
  >
    <Stack.Screen
      name="Home"
      component={HomeScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="AddExpense"
      component={AddExpenseScreen}
      options={{ title: 'Nouvelle Depense' }}
    />
  </Stack.Navigator>
);

const HistoryStackNav = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: colors.primary.main },
      headerTintColor: colors.text.inverse,
      headerTitleStyle: { fontWeight: 'bold' },
    }}
  >
    <Stack.Screen
      name="History"
      component={HistoryScreen}
      options={{ headerShown: false }}
    />
  </Stack.Navigator>
);

const MainNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName: keyof typeof Ionicons.glyphMap;

        if (route.name === 'HomeTab') {
          iconName = focused ? 'home' : 'home-outline';
        } else if (route.name === 'AddTab') {
          iconName = focused ? 'add-circle' : 'add-circle-outline';
        } else if (route.name === 'HistoryTab') {
          iconName = focused ? 'list' : 'list-outline';
        } else {
          iconName = 'help-outline';
        }

        return <Ionicons name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: colors.primary.main,
      tabBarInactiveTintColor: colors.text.secondary,
      tabBarStyle: {
        backgroundColor: colors.background.secondary,
        borderTopColor: colors.secondary.soft,
        paddingBottom: 5,
        paddingTop: 5,
        height: 60,
      },
      headerShown: false,
    })}
  >
    <Tab.Screen
      name="HomeTab"
      component={HomeStackNav}
      options={{ title: 'Accueil' }}
    />
    <Tab.Screen
      name="AddTab"
      component={AddExpenseScreen}
      options={{ title: 'Ajouter' }}
    />
    <Tab.Screen
      name="HistoryTab"
      component={HistoryStackNav}
      options={{ title: 'Historique' }}
    />
  </Tab.Navigator>
);

// ============================================================
// ROOT NAVIGATOR — Handles auth state routing
// ============================================================
const RootNavigator = () => {
  const { isAuthenticated, isLoading, profile, couple } = useAuth();

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary.main} />
      </View>
    );
  }

  // Not logged in -> show auth screens
  if (!isAuthenticated) {
    return <AuthNavigator />;
  }

  // Logged in but no couple or no income set -> show setup
  if (!couple || !profile?.income) {
    return <CoupleSetupScreen />;
  }

  // Fully set up -> show main app
  return <MainNavigator />;
};

// ============================================================
// APP ENTRY POINT
// ============================================================
export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <StatusBar style="light" />
        <RootNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.primary,
  },
});
