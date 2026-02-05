import {
  User,
  Expense,
  ExpenseShare,
  Balance,
  ContributionSettings,
} from './types';

/**
 * Calculate contribution rates based on income proportions.
 * This is the CORE MOAT — no competitor has income-proportional splitting.
 */
export const calculateContributionRates = (
  users: User[]
): ContributionSettings => {
  const totalIncome = users.reduce((sum, user) => sum + user.income, 0);

  const updatedUsers = users.map((user) => ({
    ...user,
    contributionRate:
      totalIncome > 0 ? (user.income / totalIncome) * 100 : 0,
  }));

  return {
    users: updatedUsers,
    totalIncome,
    lastUpdated: new Date(),
  };
};

/**
 * Calculate each user's share of an expense based on contribution rates.
 */
export const calculateExpenseShares = (
  expense: Pick<Expense, 'amount' | 'sharedBy'>,
  users: User[]
): ExpenseShare[] => {
  const participants = users.filter((u) => expense.sharedBy.includes(u.id));
  const totalRate = participants.reduce(
    (sum, u) => sum + u.contributionRate,
    0
  );

  return participants.map((user) => {
    const normalizedRate =
      totalRate > 0 ? (user.contributionRate / totalRate) * 100 : 0;
    return {
      userId: user.id,
      amount: expense.amount * (normalizedRate / 100),
      percentage: normalizedRate,
    };
  });
};

/**
 * Calculate running balances between couple partners.
 * Positive = creditor (owed money), Negative = debtor (owes money).
 */
export const calculateBalances = (
  expenses: Expense[],
  users: User[]
): Balance[] => {
  const balances: Record<string, number> = {};

  users.forEach((user) => {
    balances[user.id] = 0;
  });

  expenses
    .filter((e) => e.status === 'pending')
    .forEach((expense) => {
      balances[expense.paidBy] += expense.amount;
      expense.shares.forEach((share) => {
        balances[share.userId] -= share.amount;
      });
    });

  return users.map((user) => ({
    userId: user.id,
    userName: user.name,
    amount: Math.abs(balances[user.id] || 0),
    isPositive: (balances[user.id] || 0) > 0,
  }));
};

/**
 * Format amount as EUR currency string.
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
};

/**
 * Calculate totals grouped by category.
 */
export const calculateExpensesByCategory = (
  expenses: Expense[]
): Record<string, number> => {
  const totals: Record<string, number> = {};
  expenses.forEach((expense) => {
    totals[expense.category] = (totals[expense.category] || 0) + expense.amount;
  });
  return totals;
};

/**
 * Generate a random 6-character invite code for couple pairing.
 */
export const generateInviteCode = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};
