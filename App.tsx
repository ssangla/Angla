import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from '@/screens/HomeScreen';
import AddExpenseScreen from '@/screens/AddExpenseScreen';
import HistoryScreen from '@/screens/HistoryScreen';
import { colors } from '@/utils/colors';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const HomeStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: {
        backgroundColor: colors.primary.main,
      },
      headerTintColor: colors.text.inverse,
      headerTitleStyle: {
        fontWeight: 'bold',
      },
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
      options={{ title: 'Nouvelle Dépense' }}
    />
  </Stack.Navigator>
);

const HistoryStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: {
        backgroundColor: colors.primary.main,
      },
      headerTintColor: colors.text.inverse,
      headerTitleStyle: {
        fontWeight: 'bold',
      },
    }}
  >
    <Stack.Screen
      name="History"
      component={HistoryScreen}
      options={{ headerShown: false }}
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
          component={HomeStack}
          options={{ title: 'Accueil' }}
        />
        <Tab.Screen
          name="AddTab"
          component={AddExpenseScreen}
          options={{ title: 'Ajouter' }}
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