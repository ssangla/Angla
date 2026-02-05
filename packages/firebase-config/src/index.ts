// Firebase initialization
export { firebaseApp, auth, db, firebaseConfig } from './config';

// Authentication
export {
  signUpWithEmail,
  signInWithEmail,
  signInWithGoogle,
  signOut,
  resetPassword,
  onAuthChange,
  getCurrentUser,
} from './auth';

// Firestore operations
export {
  // User
  getUserProfile,
  updateUserProfile,
  updateUserIncome,
  // Couple
  createCouple,
  joinCouple,
  getCoupleWithPartners,
  // Expenses
  addExpense,
  getExpenses,
  onExpensesChange,
  updateExpense,
  deleteExpense,
  settleExpense,
  // Settlements
  createSettlement,
  getSettlements,
  // Goals
  createGoal,
  updateGoalProgress,
  getGoals,
} from './firestore';
