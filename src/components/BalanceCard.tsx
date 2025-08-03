import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Balance } from '@/models/types';
import { colors, gradients } from '@/utils/colors';
import { formatCurrency } from '@/utils/calculations';

interface BalanceCardProps {
  balances: Balance[];
}

const BalanceCard: React.FC<BalanceCardProps> = ({ balances }) => {
  const totalBalance = balances.reduce((sum, balance) => {
    return sum + (balance.isPositive ? balance.amount : -balance.amount);
  }, 0);

  const isAligned = Math.abs(totalBalance) < 0.01;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={isAligned ? gradients.success : gradients.primary}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.content}>
          <Text style={styles.title}>Solde Actuel</Text>
          
          {isAligned ? (
            <View style={styles.alignedContainer}>
              <Text style={styles.alignedText}>Solde aligné</Text>
              <Text style={styles.alignedAmount}>0 €</Text>
            </View>
          ) : (
            <View style={styles.balanceContainer}>
              {balances.map((balance) => (
                <View key={balance.userId} style={styles.balanceRow}>
                  <Text style={styles.userName}>{balance.userName}</Text>
                  <Text style={[
                    styles.balanceAmount,
                    { color: balance.isPositive ? colors.balance.positive : colors.balance.negative }
                  ]}>
                    {balance.isPositive ? '+' : '-'} {formatCurrency(balance.amount)}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  gradient: {
    padding: 20,
  },
  content: {
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.inverse,
    marginBottom: 12,
  },
  alignedContainer: {
    alignItems: 'center',
  },
  alignedText: {
    fontSize: 16,
    color: colors.text.inverse,
    marginBottom: 4,
  },
  alignedAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.inverse,
  },
  balanceContainer: {
    width: '100%',
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  userName: {
    fontSize: 16,
    color: colors.text.inverse,
    fontWeight: '500',
  },
  balanceAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default BalanceCard;