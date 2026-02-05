// ============================================================
// ANGLA SHARED TYPES
// Core data models used across mobile and web apps
// ============================================================

export interface User {
  id: string;
  email: string;
  name: string;
  income: number;
  contributionRate: number;
  coupleId: string | null;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Couple {
  id: string;
  inviteCode: string;
  createdBy: string;
  partnerIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Expense {
  id: string;
  coupleId: string;
  description: string;
  amount: number;
  category: ExpenseCategory;
  date: Date;
  paidBy: string;
  sharedBy: string[];
  shares: ExpenseShare[];
  status: ExpenseStatus;
  receiptUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExpenseShare {
  userId: string;
  amount: number;
  percentage: number;
}

export interface Settlement {
  id: string;
  coupleId: string;
  fromUser: string;
  toUser: string;
  amount: number;
  status: SettlementStatus;
  settledAt?: Date;
  createdAt: Date;
}

export interface FinancialGoal {
  id: string;
  coupleId: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: Date;
  status: GoalStatus;
  createdAt: Date;
  updatedAt: Date;
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

// ============================================================
// ENUMS
// ============================================================

export enum ExpenseCategory {
  LOGEMENT = 'logement',
  COURSES = 'courses',
  RESTAURANT = 'restaurant',
  TRANSPORT = 'transport',
  LOISIRS = 'loisirs',
  SANTE = 'sante',
  AUTRES = 'autres',
}

export enum ExpenseStatus {
  PENDING = 'pending',
  SETTLED = 'settled',
}

export enum SettlementStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export enum GoalStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

// ============================================================
// AUTH TYPES
// ============================================================

export interface AuthState {
  user: AuthUser | null;
  profile: User | null;
  couple: Couple | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
}

export type AuthProvider = 'email' | 'google' | 'apple';

// ============================================================
// CATEGORY METADATA
// ============================================================

export const CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  [ExpenseCategory.LOGEMENT]: 'Logement',
  [ExpenseCategory.COURSES]: 'Courses',
  [ExpenseCategory.RESTAURANT]: 'Restaurant',
  [ExpenseCategory.TRANSPORT]: 'Transport',
  [ExpenseCategory.LOISIRS]: 'Loisirs',
  [ExpenseCategory.SANTE]: 'Sante',
  [ExpenseCategory.AUTRES]: 'Autres',
};

export const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  [ExpenseCategory.LOGEMENT]: '#ff6b6b',
  [ExpenseCategory.COURSES]: '#4ecdc4',
  [ExpenseCategory.RESTAURANT]: '#45b7d1',
  [ExpenseCategory.TRANSPORT]: '#96ceb4',
  [ExpenseCategory.LOISIRS]: '#feca57',
  [ExpenseCategory.SANTE]: '#ff9ff3',
  [ExpenseCategory.AUTRES]: '#a8e6cf',
};
