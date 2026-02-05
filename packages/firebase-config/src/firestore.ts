import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  QueryConstraint,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from './config';
import type {
  User,
  Couple,
  Expense,
  ExpenseShare,
  Settlement,
  FinancialGoal,
  ExpenseCategory,
  ExpenseStatus,
} from '@angla/shared';
import { generateInviteCode, calculateExpenseShares } from '@angla/shared';

// ============================================================
// FIRESTORE SERVICE — All database operations
// ============================================================

// --- HELPER: Convert Firestore Timestamp to Date ---
const toDate = (ts: Timestamp | Date | undefined): Date => {
  if (!ts) return new Date();
  if (ts instanceof Timestamp) return ts.toDate();
  return ts;
};

// ============================================================
// USER OPERATIONS
// ============================================================

export const getUserProfile = async (uid: string): Promise<User | null> => {
  const snap = await getDoc(doc(db, 'users', uid));
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    id: snap.id,
    email: data.email,
    name: data.name,
    income: data.income || 0,
    contributionRate: data.contributionRate || 50,
    coupleId: data.coupleId || null,
    avatar: data.avatar,
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
  };
};

export const updateUserProfile = async (
  uid: string,
  updates: Partial<Pick<User, 'name' | 'income' | 'avatar'>>
): Promise<void> => {
  await updateDoc(doc(db, 'users', uid), {
    ...updates,
    updatedAt: serverTimestamp(),
  });
};

export const updateUserIncome = async (
  uid: string,
  income: number
): Promise<void> => {
  await updateDoc(doc(db, 'users', uid), {
    income,
    updatedAt: serverTimestamp(),
  });
};

// ============================================================
// COUPLE OPERATIONS
// ============================================================

/**
 * Create a new couple and generate an invite code.
 * The creator is automatically added as the first partner.
 */
export const createCouple = async (
  userId: string
): Promise<{ coupleId: string; inviteCode: string }> => {
  const inviteCode = generateInviteCode();

  // Create couple document
  const coupleRef = await addDoc(collection(db, 'couples'), {
    createdBy: userId,
    inviteCode,
    partnerIds: [userId],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  // Add creator as partner
  await addDoc(collection(db, 'couples', coupleRef.id, 'partners'), {
    userId,
    joinedAt: serverTimestamp(),
  });

  // Store invite code for lookup
  await addDoc(collection(db, 'inviteCodes'), {
    code: inviteCode,
    coupleId: coupleRef.id,
    createdBy: userId,
    used: false,
    createdAt: serverTimestamp(),
  });

  // Update user's coupleId
  await updateDoc(doc(db, 'users', userId), {
    coupleId: coupleRef.id,
    updatedAt: serverTimestamp(),
  });

  return { coupleId: coupleRef.id, inviteCode };
};

/**
 * Join an existing couple using an invite code.
 */
export const joinCouple = async (
  userId: string,
  inviteCode: string
): Promise<{ coupleId: string; partnerName: string }> => {
  // Look up invite code
  const codeQuery = query(
    collection(db, 'inviteCodes'),
    where('code', '==', inviteCode.toUpperCase()),
    where('used', '==', false)
  );
  const codeSnap = await getDocs(codeQuery);

  if (codeSnap.empty) {
    throw new Error('Code invalide ou deja utilise');
  }

  const codeDoc = codeSnap.docs[0];
  const codeData = codeDoc.data();
  const coupleId = codeData.coupleId;

  // Get couple to find partner
  const coupleSnap = await getDoc(doc(db, 'couples', coupleId));
  if (!coupleSnap.exists()) {
    throw new Error('Couple introuvable');
  }

  const coupleData = coupleSnap.data();
  if (coupleData.partnerIds && coupleData.partnerIds.length >= 2) {
    throw new Error('Ce couple a deja deux partenaires');
  }

  // Add user as partner
  await addDoc(collection(db, 'couples', coupleId, 'partners'), {
    userId,
    joinedAt: serverTimestamp(),
  });

  // Update couple's partner list
  const updatedPartnerIds = [...(coupleData.partnerIds || []), userId];
  await updateDoc(doc(db, 'couples', coupleId), {
    partnerIds: updatedPartnerIds,
    updatedAt: serverTimestamp(),
  });

  // Mark invite code as used
  await updateDoc(codeDoc.ref, { used: true, usedBy: userId });

  // Update user's coupleId
  await updateDoc(doc(db, 'users', userId), {
    coupleId,
    updatedAt: serverTimestamp(),
  });

  // Get partner's name
  const creatorProfile = await getUserProfile(codeData.createdBy);
  const partnerName = creatorProfile?.name || 'Partenaire';

  return { coupleId, partnerName };
};

/**
 * Get couple data with partner profiles
 */
export const getCoupleWithPartners = async (
  coupleId: string
): Promise<{ couple: Couple; partners: User[] }> => {
  const coupleSnap = await getDoc(doc(db, 'couples', coupleId));
  if (!coupleSnap.exists()) {
    throw new Error('Couple introuvable');
  }

  const data = coupleSnap.data();
  const couple: Couple = {
    id: coupleSnap.id,
    inviteCode: data.inviteCode,
    createdBy: data.createdBy,
    partnerIds: data.partnerIds || [],
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
  };

  const partners: User[] = [];
  for (const partnerId of couple.partnerIds) {
    const profile = await getUserProfile(partnerId);
    if (profile) partners.push(profile);
  }

  return { couple, partners };
};

// ============================================================
// EXPENSE OPERATIONS
// ============================================================

/**
 * Add a new expense to a couple's collection
 */
export const addExpense = async (
  coupleId: string,
  data: {
    description: string;
    amount: number;
    category: ExpenseCategory;
    paidBy: string;
    sharedBy: string[];
    shares: ExpenseShare[];
  }
): Promise<string> => {
  const expenseRef = await addDoc(
    collection(db, 'couples', coupleId, 'expenses'),
    {
      ...data,
      status: 'pending',
      date: serverTimestamp(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }
  );
  return expenseRef.id;
};

/**
 * Get all expenses for a couple (one-time fetch)
 */
export const getExpenses = async (
  coupleId: string,
  constraints: QueryConstraint[] = []
): Promise<Expense[]> => {
  const q = query(
    collection(db, 'couples', coupleId, 'expenses'),
    orderBy('createdAt', 'desc'),
    ...constraints
  );
  const snap = await getDocs(q);

  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      coupleId,
      description: data.description,
      amount: data.amount,
      category: data.category as ExpenseCategory,
      date: toDate(data.date),
      paidBy: data.paidBy,
      sharedBy: data.sharedBy || [],
      shares: data.shares || [],
      status: data.status as ExpenseStatus,
      receiptUrl: data.receiptUrl,
      createdAt: toDate(data.createdAt),
      updatedAt: toDate(data.updatedAt),
    };
  });
};

/**
 * Real-time listener for expenses — updates UI automatically
 */
export const onExpensesChange = (
  coupleId: string,
  callback: (expenses: Expense[]) => void
): Unsubscribe => {
  const q = query(
    collection(db, 'couples', coupleId, 'expenses'),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(q, (snap) => {
    const expenses = snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        coupleId,
        description: data.description,
        amount: data.amount,
        category: data.category as ExpenseCategory,
        date: toDate(data.date),
        paidBy: data.paidBy,
        sharedBy: data.sharedBy || [],
        shares: data.shares || [],
        status: data.status as ExpenseStatus,
        receiptUrl: data.receiptUrl,
        createdAt: toDate(data.createdAt),
        updatedAt: toDate(data.updatedAt),
      };
    });
    callback(expenses);
  });
};

/**
 * Update an expense
 */
export const updateExpense = async (
  coupleId: string,
  expenseId: string,
  updates: Partial<Expense>
): Promise<void> => {
  const { id, coupleId: _, createdAt, ...updateData } = updates as any;
  await updateDoc(doc(db, 'couples', coupleId, 'expenses', expenseId), {
    ...updateData,
    updatedAt: serverTimestamp(),
  });
};

/**
 * Delete an expense
 */
export const deleteExpense = async (
  coupleId: string,
  expenseId: string
): Promise<void> => {
  await deleteDoc(doc(db, 'couples', coupleId, 'expenses', expenseId));
};

/**
 * Mark an expense as settled
 */
export const settleExpense = async (
  coupleId: string,
  expenseId: string
): Promise<void> => {
  await updateDoc(doc(db, 'couples', coupleId, 'expenses', expenseId), {
    status: 'settled',
    updatedAt: serverTimestamp(),
  });
};

// ============================================================
// SETTLEMENT OPERATIONS
// ============================================================

export const createSettlement = async (
  coupleId: string,
  data: { fromUser: string; toUser: string; amount: number }
): Promise<string> => {
  const ref = await addDoc(
    collection(db, 'couples', coupleId, 'settlements'),
    {
      ...data,
      status: 'completed',
      settledAt: serverTimestamp(),
      createdAt: serverTimestamp(),
    }
  );
  return ref.id;
};

export const getSettlements = async (
  coupleId: string
): Promise<Settlement[]> => {
  const q = query(
    collection(db, 'couples', coupleId, 'settlements'),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);

  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      coupleId,
      fromUser: data.fromUser,
      toUser: data.toUser,
      amount: data.amount,
      status: data.status,
      settledAt: toDate(data.settledAt),
      createdAt: toDate(data.createdAt),
    };
  });
};

// ============================================================
// FINANCIAL GOALS OPERATIONS
// ============================================================

export const createGoal = async (
  coupleId: string,
  data: { name: string; targetAmount: number; deadline?: Date }
): Promise<string> => {
  const ref = await addDoc(collection(db, 'couples', coupleId, 'goals'), {
    ...data,
    currentAmount: 0,
    status: 'active',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
};

export const updateGoalProgress = async (
  coupleId: string,
  goalId: string,
  amount: number
): Promise<void> => {
  await updateDoc(doc(db, 'couples', coupleId, 'goals', goalId), {
    currentAmount: amount,
    updatedAt: serverTimestamp(),
  });
};

export const getGoals = async (
  coupleId: string
): Promise<FinancialGoal[]> => {
  const q = query(
    collection(db, 'couples', coupleId, 'goals'),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);

  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      coupleId,
      name: data.name,
      targetAmount: data.targetAmount,
      currentAmount: data.currentAmount || 0,
      deadline: data.deadline ? toDate(data.deadline) : undefined,
      status: data.status,
      createdAt: toDate(data.createdAt),
      updatedAt: toDate(data.updatedAt),
    };
  });
};
