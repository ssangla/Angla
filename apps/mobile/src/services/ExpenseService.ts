/**
 * ExpenseService — Firestore-backed expense management
 *
 * Replaces the original in-memory service with real-time
 * Firestore operations. Falls back to local data for offline/dev use.
 */
import type { Expense, User, ExpenseCategory, ExpenseStatus } from '@angla/shared';
import {
  calculateExpenseShares,
  calculateBalances,
  calculateContributionRates,
} from '@angla/shared';
import {
  addExpense as firestoreAddExpense,
  getExpenses as firestoreGetExpenses,
  updateExpense as firestoreUpdateExpense,
  deleteExpense as firestoreDeleteExpense,
  settleExpense as firestoreSettleExpense,
  onExpensesChange,
  getCoupleWithPartners,
} from '@angla/firebase-config';

class ExpenseService {
  private expenses: Expense[] = [];
  private users: User[] = [];
  private coupleId: string | null = null;
  private unsubscribe: (() => void) | null = null;

  /**
   * Initialize with Firestore couple data and start real-time sync
   */
  async initializeWithCouple(coupleId: string): Promise<void> {
    this.coupleId = coupleId;

    // Load couple partners
    const { partners } = await getCoupleWithPartners(coupleId);
    const settings = calculateContributionRates(partners);
    this.users = settings.users;

    // Start real-time expense listener
    this.unsubscribe = onExpensesChange(coupleId, (expenses) => {
      this.expenses = expenses;
    });

    // Initial load
    this.expenses = await firestoreGetExpenses(coupleId);
  }

  /**
   * Fallback: Initialize with sample data for development/offline use
   */
  initializeWithSampleData() {
    this.users = [
      {
        id: '1',
        name: 'Simon',
        email: 'simon@example.com',
        income: 3000,
        contributionRate: 70.65,
        coupleId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '2',
        name: 'Andre',
        email: 'andre@example.com',
        income: 1250,
        contributionRate: 29.35,
        coupleId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    this.expenses = [
      {
        id: '1',
        coupleId: 'sample',
        description: 'Courses Carrefour',
        amount: 150,
        category: 'courses' as ExpenseCategory,
        date: new Date('2024-01-15'),
        paidBy: '1',
        sharedBy: ['1', '2'],
        shares: [
          { userId: '1', amount: 105.98, percentage: 70.65 },
          { userId: '2', amount: 44.02, percentage: 29.35 },
        ],
        status: 'pending' as ExpenseStatus,
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15'),
      },
      {
        id: '2',
        coupleId: 'sample',
        description: 'Restaurant Le Petit Bistrot',
        amount: 85,
        category: 'restaurant' as ExpenseCategory,
        date: new Date('2024-01-14'),
        paidBy: '2',
        sharedBy: ['1', '2'],
        shares: [
          { userId: '1', amount: 60.05, percentage: 70.65 },
          { userId: '2', amount: 24.95, percentage: 29.35 },
        ],
        status: 'pending' as ExpenseStatus,
        createdAt: new Date('2024-01-14'),
        updatedAt: new Date('2024-01-14'),
      },
    ];
  }

  /**
   * Clean up real-time listener
   */
  destroy() {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
  }

  getAllExpenses(): Expense[] {
    return this.expenses;
  }

  getUsers(): User[] {
    return this.users;
  }

  async addExpense(
    expenseData: Omit<Expense, 'id' | 'coupleId' | 'shares' | 'createdAt' | 'updatedAt'>
  ): Promise<Expense> {
    const shares = calculateExpenseShares(expenseData, this.users);

    if (this.coupleId) {
      const id = await firestoreAddExpense(this.coupleId, {
        description: expenseData.description,
        amount: expenseData.amount,
        category: expenseData.category,
        paidBy: expenseData.paidBy,
        sharedBy: expenseData.sharedBy,
        shares,
      });

      return {
        ...expenseData,
        id,
        coupleId: this.coupleId,
        shares,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }

    // Fallback: local only
    const newExpense: Expense = {
      ...expenseData,
      id: Date.now().toString(),
      coupleId: 'local',
      shares,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.expenses.push(newExpense);
    return newExpense;
  }

  async updateExpense(id: string, updates: Partial<Expense>): Promise<Expense | null> {
    if (this.coupleId) {
      await firestoreUpdateExpense(this.coupleId, id, updates);
    }

    const index = this.expenses.findIndex((e) => e.id === id);
    if (index === -1) return null;
    this.expenses[index] = { ...this.expenses[index], ...updates, updatedAt: new Date() };
    return this.expenses[index];
  }

  async deleteExpense(id: string): Promise<boolean> {
    if (this.coupleId) {
      await firestoreDeleteExpense(this.coupleId, id);
    }

    const index = this.expenses.findIndex((e) => e.id === id);
    if (index === -1) return false;
    this.expenses.splice(index, 1);
    return true;
  }

  getExpensesByCategory(category: ExpenseCategory): Expense[] {
    return this.expenses.filter((e) => e.category === category);
  }

  getExpensesByUser(userId: string): Expense[] {
    return this.expenses.filter(
      (e) => e.paidBy === userId || e.sharedBy.includes(userId)
    );
  }

  getExpensesByDateRange(startDate: Date, endDate: Date): Expense[] {
    return this.expenses.filter(
      (e) => e.date >= startDate && e.date <= endDate
    );
  }

  getCurrentBalances() {
    return calculateBalances(this.expenses, this.users);
  }

  async settleExpense(id: string): Promise<boolean> {
    if (this.coupleId) {
      await firestoreSettleExpense(this.coupleId, id);
      return true;
    }

    const expense = await this.updateExpense(id, {
      status: 'settled' as ExpenseStatus,
    });
    return expense !== null;
  }

  getMonthlyStats(month: number, year: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const monthlyExpenses = this.getExpensesByDateRange(startDate, endDate);
    const totalAmount = monthlyExpenses.reduce((sum, e) => sum + e.amount, 0);

    const byCategory = monthlyExpenses.reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalAmount,
      byCategory,
      expenseCount: monthlyExpenses.length,
    };
  }
}

export default new ExpenseService();
