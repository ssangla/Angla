import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { AuthUser, User, Couple } from '@angla/shared';
import {
  onAuthChange,
  signUpWithEmail,
  signInWithEmail,
  signInWithGoogle,
  signOut as firebaseSignOut,
  resetPassword,
  getUserProfile,
  createCouple,
  joinCouple,
  getCoupleWithPartners,
  updateUserIncome,
} from '@angla/firebase-config';

interface AuthContextType {
  // State
  user: AuthUser | null;
  profile: User | null;
  couple: Couple | null;
  partners: User[];
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  loginWithGoogle: (idToken: string) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  clearError: () => void;

  // Couple actions
  createNewCouple: () => Promise<string>;
  joinExistingCouple: (inviteCode: string) => Promise<string>;
  setIncome: (income: number) => Promise<void>;

  // Refresh
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<User | null>(null);
  const [couple, setCouple] = useState<Couple | null>(null);
  const [partners, setPartners] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load user profile and couple data
  const loadUserData = useCallback(async (authUser: AuthUser) => {
    try {
      const userProfile = await getUserProfile(authUser.uid);
      setProfile(userProfile);

      if (userProfile?.coupleId) {
        const coupleData = await getCoupleWithPartners(userProfile.coupleId);
        setCouple(coupleData.couple);
        setPartners(coupleData.partners);
      } else {
        setCouple(null);
        setPartners([]);
      }
    } catch (err) {
      console.error('Error loading user data:', err);
    }
  }, []);

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthChange(async (authUser) => {
      setUser(authUser);

      if (authUser) {
        await loadUserData(authUser);
      } else {
        setProfile(null);
        setCouple(null);
        setPartners([]);
      }

      setIsLoading(false);
    });

    return unsubscribe;
  }, [loadUserData]);

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      setIsLoading(true);
      await signInWithEmail(email, password);
    } catch (err: any) {
      const message =
        err.code === 'auth/invalid-credential'
          ? 'Email ou mot de passe incorrect'
          : err.code === 'auth/too-many-requests'
          ? 'Trop de tentatives. Reessayez plus tard.'
          : 'Erreur de connexion';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    try {
      setError(null);
      setIsLoading(true);
      await signUpWithEmail(email, password, name);
    } catch (err: any) {
      const message =
        err.code === 'auth/email-already-in-use'
          ? 'Cet email est deja utilise'
          : err.code === 'auth/weak-password'
          ? 'Mot de passe trop faible (min. 6 caracteres)'
          : 'Erreur lors de l\'inscription';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async (idToken: string) => {
    try {
      setError(null);
      setIsLoading(true);
      await signInWithGoogle(idToken);
    } catch (err: any) {
      setError('Erreur de connexion Google');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await firebaseSignOut();
      setUser(null);
      setProfile(null);
      setCouple(null);
      setPartners([]);
    } catch (err: any) {
      setError('Erreur lors de la deconnexion');
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      setError(null);
      await resetPassword(email);
    } catch (err: any) {
      setError('Erreur lors de l\'envoi du mail');
      throw err;
    }
  };

  const createNewCouple = async (): Promise<string> => {
    if (!user) throw new Error('Non authentifie');
    try {
      const { inviteCode } = await createCouple(user.uid);
      await loadUserData(user);
      return inviteCode;
    } catch (err: any) {
      setError('Erreur lors de la creation du couple');
      throw err;
    }
  };

  const joinExistingCouple = async (inviteCode: string): Promise<string> => {
    if (!user) throw new Error('Non authentifie');
    try {
      const { partnerName } = await joinCouple(user.uid, inviteCode);
      await loadUserData(user);
      return partnerName;
    } catch (err: any) {
      setError(err.message || 'Code invalide');
      throw err;
    }
  };

  const setIncome = async (income: number) => {
    if (!user) throw new Error('Non authentifie');
    try {
      await updateUserIncome(user.uid, income);
      await loadUserData(user);
    } catch (err: any) {
      setError('Erreur lors de la mise a jour du revenu');
      throw err;
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await loadUserData(user);
    }
  };

  const clearError = () => setError(null);

  const value: AuthContextType = {
    user,
    profile,
    couple,
    partners,
    isLoading,
    isAuthenticated: !!user,
    error,
    login,
    signup,
    loginWithGoogle,
    logout,
    forgotPassword,
    clearError,
    createNewCouple,
    joinExistingCouple,
    setIncome,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
