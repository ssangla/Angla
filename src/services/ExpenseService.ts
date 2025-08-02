import { Expense, User, ExpenseCategory, ExpenseStatus } from '@/models/types';
import { calculateExpenseShares, calculateBalances } from '@/utils/calculations';

class ExpenseService {
  private expenses: Expense[] = [];
  private users: User[] = [];

  /**
   * Initialise le service avec des données d'exemple
   */
  initializeWithSampleData() {
    // Utilisateurs d'exemple
    this.users = [
      {
        id: '1',
        name: 'Simon',
        email: 'simon@example.com',
        income: 3000,
        contributionRate: 70.65
      },
      {
        id: '2',
        name: 'André',
        email: 'andre@example.com',
        income: 1250,
        contributionRate: 29.35
      }
    ];

    // Dépenses d'exemple
    this.expenses = [
      {
        id: '1',
        description: 'Courses Carrefour',
        amount: 150,
        category: ExpenseCategory.COURSES,
        date: new Date('2024-01-15'),
        paidBy: '1',
        sharedBy: ['1', '2'],
        shares: [
          { userId: '1', amount: 105.98, percentage: 70.65 },
          { userId: '2', amount: 44.02, percentage: 29.35 }
        ],
        status: ExpenseStatus.PENDING,
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15')
      },
      {
        id: '2',
        description: 'Restaurant Le Petit Bistrot',
        amount: 85,
        category: ExpenseCategory.RESTAURANT,
        date: new Date('2024-01-14'),
        paidBy: '2',
        sharedBy: ['1', '2'],
        shares: [
          { userId: '1', amount: 60.05, percentage: 70.65 },
          { userId: '2', amount: 24.95, percentage: 29.35 }
        ],
        status: ExpenseStatus.PENDING,
        createdAt: new Date('2024-01-14'),
        updatedAt: new Date('2024-01-14')
      }
    ];
  }

  /**
   * Récupère toutes les dépenses
   */
  getAllExpenses(): Expense[] {
    return this.expenses;
  }

  /**
   * Récupère les utilisateurs
   */
  getUsers(): User[] {
    return this.users;
  }

  /**
   * Ajoute une nouvelle dépense
   */
  addExpense(expenseData: Omit<Expense, 'id' | 'shares' | 'createdAt' | 'updatedAt'>): Expense {
    const shares = calculateExpenseShares(expenseData, this.users);
    
    const newExpense: Expense = {
      ...expenseData,
      id: Date.now().toString(),
      shares,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.expenses.push(newExpense);
    return newExpense;
  }

  /**
   * Met à jour une dépense
   */
  updateExpense(id: string, updates: Partial<Expense>): Expense | null {
    const index = this.expenses.findIndex(expense => expense.id === id);
    if (index === -1) return null;

    this.expenses[index] = {
      ...this.expenses[index],
      ...updates,
      updatedAt: new Date()
    };

    return this.expenses[index];
  }

  /**
   * Supprime une dépense
   */
  deleteExpense(id: string): boolean {
    const index = this.expenses.findIndex(expense => expense.id === id);
    if (index === -1) return false;

    this.expenses.splice(index, 1);
    return true;
  }

  /**
   * Filtre les dépenses par catégorie
   */
  getExpensesByCategory(category: ExpenseCategory): Expense[] {
    return this.expenses.filter(expense => expense.category === category);
  }

  /**
   * Filtre les dépenses par utilisateur
   */
  getExpensesByUser(userId: string): Expense[] {
    return this.expenses.filter(expense => 
      expense.paidBy === userId || expense.sharedBy.includes(userId)
    );
  }

  /**
   * Filtre les dépenses par période
   */
  getExpensesByDateRange(startDate: Date, endDate: Date): Expense[] {
    return this.expenses.filter(expense => 
      expense.date >= startDate && expense.date <= endDate
    );
  }

  /**
   * Calcule les soldes actuels
   */
  getCurrentBalances() {
    return calculateBalances(this.expenses, this.users);
  }

  /**
   * Marque une dépense comme réglée
   */
  settleExpense(id: string): boolean {
    const expense = this.updateExpense(id, { status: ExpenseStatus.SETTLED });
    return expense !== null;
  }

  /**
   * Récupère les statistiques du mois
   */
  getMonthlyStats(month: number, year: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    
    const monthlyExpenses = this.getExpensesByDateRange(startDate, endDate);
    const totalAmount = monthlyExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    const byCategory = monthlyExpenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalAmount,
      byCategory,
      expenseCount: monthlyExpenses.length
    };
  }
}

export default new ExpenseService();