import {
  calculateContributionRates,
  calculateExpenseShares,
  calculateBalances,
  formatCurrency,
  getExampleCalculation
} from '../calculations';
import { User, ExpenseCategory } from '@/models/types';

describe('Calculations', () => {
  describe('calculateContributionRates', () => {
    it('should calculate correct contribution rates based on income', () => {
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

      const result = calculateContributionRates(users);

      expect(result.totalIncome).toBe(4250);
      expect(result.users[0].contributionRate).toBeCloseTo(70.59, 1);
      expect(result.users[1].contributionRate).toBeCloseTo(29.41, 1);
    });

    it('should handle zero total income', () => {
      const users: User[] = [
        {
          id: '1',
          name: 'Simon',
          email: 'simon@example.com',
          income: 0,
          contributionRate: 0
        },
        {
          id: '2',
          name: 'André',
          email: 'andre@example.com',
          income: 0,
          contributionRate: 0
        }
      ];

      const result = calculateContributionRates(users);

      expect(result.totalIncome).toBe(0);
      expect(result.users[0].contributionRate).toBe(0);
      expect(result.users[1].contributionRate).toBe(0);
    });
  });

  describe('calculateExpenseShares', () => {
    it('should calculate correct expense shares', () => {
      const users: User[] = [
        {
          id: '1',
          name: 'Simon',
          email: 'simon@example.com',
          income: 3000,
          contributionRate: 70.59
        },
        {
          id: '2',
          name: 'André',
          email: 'andre@example.com',
          income: 1250,
          contributionRate: 29.41
        }
      ];

      const expense = {
        description: 'Courses Carrefour',
        amount: 150,
        category: ExpenseCategory.COURSES,
        date: new Date(),
        paidBy: '1',
        sharedBy: ['1', '2']
      };

      const shares = calculateExpenseShares(expense, users);

      expect(shares).toHaveLength(2);
      expect(shares[0].amount).toBeCloseTo(105.89, 1);
      expect(shares[1].amount).toBeCloseTo(44.11, 1);
    });
  });

  describe('calculateBalances', () => {
    it('should calculate correct balances', () => {
      const users: User[] = [
        {
          id: '1',
          name: 'Simon',
          email: 'simon@example.com',
          income: 3000,
          contributionRate: 70.59
        },
        {
          id: '2',
          name: 'André',
          email: 'andre@example.com',
          income: 1250,
          contributionRate: 29.41
        }
      ];

      const expenses = [
        {
          id: '1',
          description: 'Courses',
          amount: 150,
          category: ExpenseCategory.COURSES,
          date: new Date(),
          paidBy: '1',
          sharedBy: ['1', '2'],
          shares: [
            { userId: '1', amount: 105.89, percentage: 70.59 },
            { userId: '2', amount: 44.11, percentage: 29.41 }
          ],
          status: 'pending' as any,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      const balances = calculateBalances(expenses, users);

      expect(balances).toHaveLength(2);
      expect(balances[0].amount).toBeCloseTo(44.11, 1);
      expect(balances[0].isPositive).toBe(true);
      expect(balances[1].amount).toBeCloseTo(44.11, 1);
      expect(balances[1].isPositive).toBe(false);
    });
  });

  describe('formatCurrency', () => {
    it('should format currency correctly', () => {
      expect(formatCurrency(1234.56)).toBe('1 234,56 €');
      expect(formatCurrency(0)).toBe('0,00 €');
      expect(formatCurrency(100)).toBe('100,00 €');
    });
  });

  describe('getExampleCalculation', () => {
    it('should return example calculation with correct values', () => {
      const result = getExampleCalculation();

      expect(result.users).toHaveLength(2);
      expect(result.totalIncome).toBe(4250);
      expect(result.simonShare).toBeCloseTo(105.98, 1);
      expect(result.andreShare).toBeCloseTo(44.02, 1);
    });
  });
});