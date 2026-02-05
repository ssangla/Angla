import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import BalanceCard from '@/components/BalanceCard';
import { colors, gradients } from '@/utils/colors';
import { formatCurrency } from '@/utils/calculations';
import ExpenseService from '@/services/ExpenseService';
import { Balance, User } from '@/models/types';

interface HomeScreenProps {
  navigation: any;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [balances, setBalances] = useState<Balance[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [monthlyStats, setMonthlyStats] = useState<any>(null);
  const [isFirstLaunch, setIsFirstLaunch] = useState(true);

  useEffect(() => {
    // Initialiser avec les données d'exemple
    ExpenseService.initializeWithSampleData();
    
    // Charger les données
    loadData();
    
    // Simuler un premier lancement
    setTimeout(() => {
      setIsFirstLaunch(false);
    }, 2000);
  }, []);

  const loadData = () => {
    const currentUsers = ExpenseService.getUsers();
    const currentBalances = ExpenseService.getCurrentBalances();
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    const stats = ExpenseService.getMonthlyStats(currentMonth, currentYear);

    setUsers(currentUsers);
    setBalances(currentBalances);
    setMonthlyStats(stats);
  };

  const handleAddExpense = () => {
    navigation.navigate('AddExpense');
  };

  const handleViewHistory = () => {
    navigation.navigate('History');
  };

  const handleSettleBalance = () => {
    Alert.alert(
      'Régler le solde',
      'Voulez-vous marquer toutes les dépenses comme réglées ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Régler',
          onPress: () => {
            const expenses = ExpenseService.getAllExpenses();
            expenses.forEach(expense => {
              if (expense.status === 'pending') {
                ExpenseService.settleExpense(expense.id);
              }
            });
            loadData();
            Alert.alert('Succès', 'Toutes les dépenses ont été marquées comme réglées');
          }
        }
      ]
    );
  };

  if (isFirstLaunch) {
    return (
      <View style={styles.welcomeContainer}>
        <LinearGradient
          colors={gradients.primary}
          style={styles.welcomeGradient}
        >
          <Text style={styles.welcomeTitle}>Expanse</Text>
          <Text style={styles.welcomeSubtitle}>ready!</Text>
        </LinearGradient>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Expanse</Text>
        <Text style={styles.subtitle}>Gestion des dépenses</Text>
      </View>

      <BalanceCard balances={balances} />

      <View style={styles.statsContainer}>
        <Text style={styles.sectionTitle}>Ce mois</Text>
        {monthlyStats && (
          <View style={styles.statsCard}>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Total dépenses</Text>
              <Text style={styles.statValue}>
                {formatCurrency(monthlyStats.totalAmount)}
              </Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Nombre de dépenses</Text>
              <Text style={styles.statValue}>{monthlyStats.expenseCount}</Text>
            </View>
          </View>
        )}
      </View>

      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleAddExpense}
        >
          <LinearGradient
            colors={gradients.primary}
            style={styles.actionGradient}
          >
            <Text style={styles.actionButtonText}>Ajouter une dépense</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={handleViewHistory}
        >
          <Text style={styles.secondaryButtonText}>Voir l'historique</Text>
        </TouchableOpacity>

        {balances.some(b => b.amount > 0) && (
          <TouchableOpacity
            style={styles.settleButton}
            onPress={handleSettleBalance}
          >
            <LinearGradient
              colors={gradients.success}
              style={styles.settleGradient}
            >
              <Text style={styles.settleButtonText}>Régler le solde</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  welcomeContainer: {
    flex: 1,
  },
  welcomeGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeTitle: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.text.inverse,
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.text.inverse,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: colors.text.secondary,
  },
  statsContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 12,
  },
  statsCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 16,
    color: colors.text.secondary,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  actionsContainer: {
    padding: 16,
  },
  actionButton: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  actionGradient: {
    padding: 16,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.inverse,
  },
  secondaryButton: {
    backgroundColor: colors.background.secondary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.secondary.light,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  settleButton: {
    marginTop: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  settleGradient: {
    padding: 16,
    alignItems: 'center',
  },
  settleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.inverse,
  },
});

export default HomeScreen;