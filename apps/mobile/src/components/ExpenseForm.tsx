import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { ExpenseCategory, User } from '@/models/types';
import { colors } from '@/utils/colors';
import { formatCurrency } from '@/utils/calculations';

interface ExpenseFormProps {
  users: User[];
  onSubmit: (expenseData: any) => void;
  onCancel: () => void;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({ users, onSubmit, onCancel }) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>(ExpenseCategory.COURSES);
  const [paidBy, setPaidBy] = useState(users[0]?.id || '');
  const [sharedBy, setSharedBy] = useState<string[]>(users.map(u => u.id));

  const handleSubmit = () => {
    if (!description.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir une description');
      return;
    }

    const amountValue = parseFloat(amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      Alert.alert('Erreur', 'Veuillez saisir un montant valide');
      return;
    }

    if (!paidBy) {
      Alert.alert('Erreur', 'Veuillez sélectionner qui a payé');
      return;
    }

    if (sharedBy.length === 0) {
      Alert.alert('Erreur', 'Veuillez sélectionner au moins un participant');
      return;
    }

    const expenseData = {
      description: description.trim(),
      amount: amountValue,
      category,
      date: new Date(),
      paidBy,
      sharedBy,
    };

    onSubmit(expenseData);
  };

  const toggleUser = (userId: string) => {
    if (sharedBy.includes(userId)) {
      setSharedBy(sharedBy.filter(id => id !== userId));
    } else {
      setSharedBy([...sharedBy, userId]);
    }
  };

  const categoryOptions = [
    { label: 'Courses', value: ExpenseCategory.COURSES },
    { label: 'Restaurant', value: ExpenseCategory.RESTAURANT },
    { label: 'Logement', value: ExpenseCategory.LOGEMENT },
    { label: 'Transport', value: ExpenseCategory.TRANSPORT },
    { label: 'Loisirs', value: ExpenseCategory.LOISIRS },
    { label: 'Santé', value: ExpenseCategory.SANTE },
    { label: 'Autres', value: ExpenseCategory.AUTRES },
  ];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Nouvelle Dépense</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={styles.input}
          value={description}
          onChangeText={setDescription}
          placeholder="Ex: Courses Carrefour"
          placeholderTextColor={colors.text.disabled}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Montant (€)</Text>
        <TextInput
          style={styles.input}
          value={amount}
          onChangeText={setAmount}
          placeholder="0.00"
          keyboardType="numeric"
          placeholderTextColor={colors.text.disabled}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Catégorie</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={category}
            onValueChange={(value) => setCategory(value)}
            style={styles.picker}
          >
            {categoryOptions.map((option) => (
              <Picker.Item
                key={option.value}
                label={option.label}
                value={option.value}
              />
            ))}
          </Picker>
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Qui a payé ?</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={paidBy}
            onValueChange={(value) => setPaidBy(value)}
            style={styles.picker}
          >
            {users.map((user) => (
              <Picker.Item
                key={user.id}
                label={user.name}
                value={user.id}
              />
            ))}
          </Picker>
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Partagé par</Text>
        {users.map((user) => (
          <TouchableOpacity
            key={user.id}
            style={[
              styles.userToggle,
              sharedBy.includes(user.id) && styles.userToggleActive
            ]}
            onPress={() => toggleUser(user.id)}
          >
            <Text style={[
              styles.userToggleText,
              sharedBy.includes(user.id) && styles.userToggleTextActive
            ]}>
              {user.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
          <Text style={styles.cancelButtonText}>Annuler</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Ajouter</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: colors.background.primary,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 24,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.secondary.light,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: colors.background.secondary,
    color: colors.text.primary,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: colors.secondary.light,
    borderRadius: 8,
    backgroundColor: colors.background.secondary,
  },
  picker: {
    height: 50,
  },
  userToggle: {
    padding: 12,
    borderWidth: 1,
    borderColor: colors.secondary.light,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: colors.background.secondary,
  },
  userToggleActive: {
    backgroundColor: colors.primary.main,
    borderColor: colors.primary.main,
  },
  userToggleText: {
    fontSize: 16,
    color: colors.text.primary,
    textAlign: 'center',
  },
  userToggleTextActive: {
    color: colors.text.inverse,
    fontWeight: '600',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.button.secondary,
    borderRadius: 8,
    marginRight: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.button.secondary,
  },
  submitButton: {
    flex: 1,
    padding: 16,
    backgroundColor: colors.button.primary,
    borderRadius: 8,
    marginLeft: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.inverse,
  },
});

export default ExpenseForm;