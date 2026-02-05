import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
} from 'react-native';
import ExpenseList from '@/components/ExpenseList';
import ExpenseService from '@/services/ExpenseService';
import { Expense, User } from '@/models/types';
import { colors } from '@/utils/colors';

interface HistoryScreenProps {
  navigation: any;
}

const HistoryScreen: React.FC<HistoryScreenProps> = ({ navigation }) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const currentExpenses = ExpenseService.getAllExpenses();
    const currentUsers = ExpenseService.getUsers();
    setExpenses(currentExpenses);
    setUsers(currentUsers);
  };

  const handleExpensePress = (expense: Expense) => {
    Alert.alert(
      'Détails de la dépense',
      `${expense.description}\nMontant: ${expense.amount}€\nCatégorie: ${expense.category}`,
      [{ text: 'OK' }]
    );
  };

  const handleSettlePress = (expenseId: string) => {
    Alert.alert(
      'Marquer comme réglé',
      'Voulez-vous marquer cette dépense comme réglée ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Régler',
          onPress: () => {
            ExpenseService.settleExpense(expenseId);
            loadData();
            Alert.alert('Succès', 'Dépense marquée comme réglée');
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Historique</Text>
        <Text style={styles.subtitle}>
          {expenses.length} dépense{expenses.length > 1 ? 's' : ''}
        </Text>
      </View>

      <ExpenseList
        expenses={expenses}
        users={users}
        onExpensePress={handleExpensePress}
        onSettlePress={handleSettlePress}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: colors.text.secondary,
  },
});

export default HistoryScreen;