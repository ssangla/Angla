import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
} from 'react-native';
import ExpenseForm from '@/components/ExpenseForm';
import ExpenseService from '@/services/ExpenseService';
import { User } from '@/models/types';
import { colors } from '@/utils/colors';

interface AddExpenseScreenProps {
  navigation: any;
}

const AddExpenseScreen: React.FC<AddExpenseScreenProps> = ({ navigation }) => {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const currentUsers = ExpenseService.getUsers();
    setUsers(currentUsers);
  }, []);

  const handleSubmit = (expenseData: any) => {
    try {
      const newExpense = ExpenseService.addExpense(expenseData);
      Alert.alert(
        'Succès',
        'Dépense ajoutée avec succès !',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } catch (error) {
      Alert.alert('Erreur', 'Impossible d\'ajouter la dépense');
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <ExpenseForm
        users={users}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
});

export default AddExpenseScreen;