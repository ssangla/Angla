import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from '@/screens/HomeScreen';
import AddExpenseScreen from '@/screens/AddExpenseScreen';
import HistoryScreen from '@/screens/HistoryScreen';
import ScanInvoiceScreen from '@/screens/ScanInvoiceScreen';
import ValidateInvoiceScreen from '@/screens/ValidateInvoiceScreen';
import InvoiceListScreen from '@/screens/InvoiceListScreen';
import InvoiceAnalyticsScreen from '@/screens/InvoiceAnalyticsScreen';
import { colors } from '@/utils/colors';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const stackScreenOptions = {
  headerStyle: {
    backgroundColor: colors.primary.main,
  },
  headerTintColor: colors.text.inverse,
  headerTitleStyle: {
    fontWeight: 'bold' as const,
  },
};

const HomeStack = () => (
  <Stack.Navigator screenOptions={stackScreenOptions}>
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

const HistoryStack = () => (
  <Stack.Navigator screenOptions={stackScreenOptions}>
    <Stack.Screen
      name="History"
      component={HistoryScreen}
      options={{ headerShown: false }}
    />
  </Stack.Navigator>
);

const InvoiceStack = () => (
  <Stack.Navigator screenOptions={stackScreenOptions}>
    <Stack.Screen
      name="InvoiceList"
      component={InvoiceListScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="ScanInvoice"
      component={ScanInvoiceScreen}
      options={{ title: 'Scanner une facture' }}
    />
    <Stack.Screen
      name="ValidateInvoice"
      component={ValidateInvoiceScreen}
      options={{ title: 'Validation facture' }}
    />
  </Stack.Navigator>
);

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: keyof typeof Ionicons.glyphMap;

            if (route.name === 'HomeTab') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'ScanTab') {
              iconName = focused ? 'scan-circle' : 'scan-circle-outline';
            } else if (route.name === 'InvoicesTab') {
              iconName = focused ? 'document-text' : 'document-text-outline';
            } else if (route.name === 'AnalyticsTab') {
              iconName = focused ? 'bar-chart' : 'bar-chart-outline';
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
          component={HomeStack}
          options={{ title: 'Accueil' }}
        />
        <Tab.Screen
          name="ScanTab"
          component={ScanInvoiceScreen}
          options={{ title: 'Scanner' }}
        />
        <Tab.Screen
          name="InvoicesTab"
          component={InvoiceStack}
          options={{ title: 'Factures' }}
        />
        <Tab.Screen
          name="AnalyticsTab"
          component={InvoiceAnalyticsScreen}
          options={{ title: 'Analytique' }}
        />
        <Tab.Screen
          name="HistoryTab"
          component={HistoryStack}
          options={{ title: 'Historique' }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
