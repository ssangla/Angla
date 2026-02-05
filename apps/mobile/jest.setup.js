// Mock pour React Native
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

// Mock pour expo-linear-gradient
jest.mock('expo-linear-gradient', () => {
  const { View } = require('react-native');
  return {
    LinearGradient: View,
  };
});

// Mock pour @react-native-picker/picker
jest.mock('@react-native-picker/picker', () => {
  const { View } = require('react-native');
  return {
    Picker: View,
  };
});

// Mock pour date-fns
jest.mock('date-fns', () => ({
  format: jest.fn((date) => '15 jan 2024'),
}));

// Mock pour expo-secure-store
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

// Configuration globale pour les tests
global.console = {
  ...console,
  // Uncomment to ignore a specific log level
  // log: jest.fn(),
  // debug: jest.fn(),
  // info: jest.fn(),
  // warn: jest.fn(),
  // error: jest.fn(),
};