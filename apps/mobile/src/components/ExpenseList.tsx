import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Expense, User, ExpenseCategory } from '@/models/types';
import { colors } from '@/utils/colors';
import { formatCurrency } from '@/utils/calculations';

interface ExpenseListProps {
  expenses: Expense[];
  users: User[];
  onExpensePress?: (expense: Expense) => void;
  onSettlePress?: (expenseId: string) => void;
}

const ExpenseList: React.FC<ExpenseListProps> = ({
  expenses,
  users,
  onExpensePress,
  onSettlePress,
}) => {
  const getCategoryColor = (category: ExpenseCategory) => {
    return colors.categories[category] || colors.categories.autres;
  };

  const getCategoryLabel = (category: ExpenseCategory) => {
    const labels: Record<ExpenseCategory, string> = {
      [ExpenseCategory.COURSES]: 'Courses',
      [ExpenseCategory.RESTAURANT]: 'Restaurant',
      [ExpenseCategory.LOGEMENT]: 'Logement',
      [ExpenseCategory.TRANSPORT]: 'Transport',
      [ExpenseCategory.LOISIRS]: 'Loisirs',
      [ExpenseCategory.SANTE]: 'Santé',
      [ExpenseCategory.AUTRES]: 'Autres',
    };
    return labels[category];
  };

  const getUserName = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user?.name || 'Inconnu';
  };

  const renderExpenseItem = ({ item }: { item: Expense }) => {
    const paidByUser = getUserName(item.paidBy);
    const categoryColor = getCategoryColor(item.category);
    const categoryLabel = getCategoryLabel(item.category);

    return (
      <TouchableOpacity
        style={styles.expenseItem}
        onPress={() => onExpensePress?.(item)}
      >
        <View style={styles.expenseHeader}>
          <View style={styles.expenseInfo}>
            <Text style={styles.expenseDescription}>{item.description}</Text>
            <Text style={styles.expenseDate}>
              {format(item.date, 'dd MMM yyyy', { locale: fr })}
            </Text>
          </View>
          <Text style={styles.expenseAmount}>
            {formatCurrency(item.amount)}
          </Text>
        </View>

        <View style={styles.expenseDetails}>
          <View style={styles.categoryContainer}>
            <View
              style={[
                styles.categoryBadge,
                { backgroundColor: categoryColor }
              ]}
            >
              <Text style={styles.categoryText}>{categoryLabel}</Text>
            </View>
          </View>

          <View style={styles.paymentInfo}>
            <Text style={styles.paidByText}>
              Payé par <Text style={styles.userName}>{paidByUser}</Text>
            </Text>
          </View>

          <View style={styles.sharesContainer}>
            {item.shares.map((share) => (
              <Text key={share.userId} style={styles.shareText}>
                {getUserName(share.userId)}: {formatCurrency(share.amount)}
              </Text>
            ))}
          </View>

          {item.status === 'pending' && onSettlePress && (
            <TouchableOpacity
              style={styles.settleButton}
              onPress={() => onSettlePress(item.id)}
            >
              <Text style={styles.settleButtonText}>Marquer comme réglé</Text>
            </TouchableOpacity>
          )}

          {item.status === 'settled' && (
            <View style={styles.settledBadge}>
              <Text style={styles.settledText}>Réglé</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <FlatList
      data={expenses}
      renderItem={renderExpenseItem}
      keyExtractor={(item) => item.id}
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.contentContainer}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  expenseItem: {
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  expenseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  expenseInfo: {
    flex: 1,
  },
  expenseDescription: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 4,
  },
  expenseDate: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  expenseAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  expenseDetails: {
    borderTopWidth: 1,
    borderTopColor: colors.secondary.soft,
    paddingTop: 12,
  },
  categoryContainer: {
    marginBottom: 8,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text.inverse,
  },
  paymentInfo: {
    marginBottom: 8,
  },
  paidByText: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  userName: {
    fontWeight: '600',
    color: colors.text.primary,
  },
  sharesContainer: {
    marginBottom: 8,
  },
  shareText: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 2,
  },
  settleButton: {
    backgroundColor: colors.button.success,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  settleButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text.inverse,
  },
  settledBadge: {
    backgroundColor: colors.status.success,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  settledText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text.inverse,
  },
});

export default ExpenseList;