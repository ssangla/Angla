import { User, Expense, ExpenseShare, Balance, ContributionSettings } from '@/models/types';

/**
 * Calcule les taux de contribution basés sur les revenus
 * @param users Liste des utilisateurs avec leurs revenus
 * @returns ContributionSettings avec les taux calculés
 */
export const calculateContributionRates = (users: User[]): ContributionSettings => {
  const totalIncome = users.reduce((sum, user) => sum + user.income, 0);
  
  const updatedUsers = users.map(user => ({
    ...user,
    contributionRate: totalIncome > 0 ? (user.income / totalIncome) * 100 : 0
  }));

  return {
    users: updatedUsers,
    totalIncome,
    lastUpdated: new Date()
  };
};

/**
 * Calcule les parts de chaque utilisateur pour une dépense
 * @param expense Dépense à partager
 * @param users Liste des utilisateurs
 * @returns Array des parts calculées
 */
export const calculateExpenseShares = (
  expense: Omit<Expense, 'shares' | 'id' | 'createdAt' | 'updatedAt'>,
  users: User[]
): ExpenseShare[] => {
  const shares: ExpenseShare[] = [];
  
  users.forEach(user => {
    const shareAmount = expense.amount * (user.contributionRate / 100);
    shares.push({
      userId: user.id,
      amount: shareAmount,
      percentage: user.contributionRate
    });
  });

  return shares;
};

/**
 * Calcule le solde entre les utilisateurs
 * @param expenses Liste des dépenses
 * @param users Liste des utilisateurs
 * @returns Array des soldes par utilisateur
 */
export const calculateBalances = (expenses: Expense[], users: User[]): Balance[] => {
  const balances: Record<string, number> = {};
  
  // Initialiser les soldes à 0
  users.forEach(user => {
    balances[user.id] = 0;
  });

  // Calculer les soldes
  expenses.forEach(expense => {
    const paidByUser = users.find(u => u.id === expense.paidBy);
    if (!paidByUser) return;

    // Ajouter le montant payé par l'utilisateur
    balances[expense.paidBy] += expense.amount;

    // Soustraire les parts de chaque utilisateur
    expense.shares.forEach(share => {
      balances[share.userId] -= share.amount;
    });
  });

  // Convertir en format Balance
  return users.map(user => ({
    userId: user.id,
    userName: user.name,
    amount: Math.abs(balances[user.id]),
    isPositive: balances[user.id] > 0
  }));
};

/**
 * Formate un montant en euros
 * @param amount Montant à formater
 * @returns Montant formaté
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount);
};

/**
 * Calcule le total des dépenses par catégorie
 * @param expenses Liste des dépenses
 * @returns Record des totaux par catégorie
 */
export const calculateExpensesByCategory = (expenses: Expense[]) => {
  const totals: Record<string, number> = {};
  
  expenses.forEach(expense => {
    const category = expense.category;
    totals[category] = (totals[category] || 0) + expense.amount;
  });

  return totals;
};

/**
 * Exemple de calcul basé sur les revenus (selon Angla.xlsx)
 * Simon: 3000€, André: 1250€
 */
export const getExampleCalculation = () => {
  const users: User[] = [
    {
      id: '1',
      name: 'Simon',
      email: 'simon@example.com',
      income: 3000,
      contributionRate: 0
    },
    {
      id: '2',
      name: 'André',
      email: 'andre@example.com',
      income: 1250,
      contributionRate: 0
    }
  ];

  const settings = calculateContributionRates(users);
  const expense = {
    description: 'Courses Carrefour',
    amount: 150,
    category: 'courses' as any,
    date: new Date(),
    paidBy: '1', // Simon a payé
    sharedBy: ['1', '2']
  };

  const shares = calculateExpenseShares(expense, settings.users);
  
  return {
    users: settings.users,
    expense,
    shares,
    totalIncome: settings.totalIncome,
    simonShare: shares.find(s => s.userId === '1')?.amount || 0,
    andreShare: shares.find(s => s.userId === '2')?.amount || 0
  };
};