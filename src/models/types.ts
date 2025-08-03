export interface User {
  id: string;
  name: string;
  email: string;
  income: number;
  contributionRate: number;
  avatar?: string;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: ExpenseCategory;
  date: Date;
  paidBy: string; // User ID
  sharedBy: string[]; // User IDs
  shares: ExpenseShare[];
  status: ExpenseStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExpenseShare {
  userId: string;
  amount: number;
  percentage: number;
}

export enum ExpenseCategory {
  LOGEMENT = 'logement',
  COURSES = 'courses',
  RESTAURANT = 'restaurant',
  TRANSPORT = 'transport',
  LOISIRS = 'loisirs',
  SANTE = 'sante',
  AUTRES = 'autres'
}

export enum ExpenseStatus {
  PENDING = 'pending',
  SETTLED = 'settled'
}

export interface Balance {
  userId: string;
  userName: string;
  amount: number;
  isPositive: boolean;
}

export interface ContributionSettings {
  users: User[];
  totalIncome: number;
  lastUpdated: Date;
}

export interface MonthlyReport {
  month: string;
  totalExpenses: number;
  expensesByCategory: Record<ExpenseCategory, number>;
  expensesByUser: Record<string, number>;
  balance: Balance[];
}

export interface ChartData {
  labels: string[];
  data: number[];
  colors: string[];
}