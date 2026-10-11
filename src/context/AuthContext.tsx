import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Store } from '../types';
import { authApi, getAuthToken, removeAuthToken } from '../lib/api';

interface AuthContextType {
  user: User | null;
  store: Store | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: {
    fullName: string;
    storeName: string;
    email: string;
    phone: string;
    password: string;
    passwordConfirmation: string;
    termsAccepted: boolean;
    privacyAccepted: boolean;
  }) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateStoreLocally: (store: Store) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = async () => {
    const token = getAuthToken();
    if (!token) {
      setUser(null);
      setStore(null);
      setLoading(false);
      return;
    }

    try {
      const data = await authApi.getMe();
      if (data.success) {
        setUser(data.user);
        setStore(data.store);
      } else {
        removeAuthToken();
        setUser(null);
        setStore(null);
      }
    } catch {
      removeAuthToken();
      setUser(null);
      setStore(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshProfile();
  }, []);

  const login = async (email: string, password: string) => {
    const data = await authApi.login({ email, password });
    setUser(data.user);
    setStore(data.store);
  };

  const register = async (payload: {
    fullName: string;
    storeName: string;
    email: string;
    phone: string;
    password: string;
    passwordConfirmation: string;
    termsAccepted: boolean;
    privacyAccepted: boolean;
  }) => {
    const data = await authApi.register(payload);
    setUser(data.user);
    setStore(data.store);
  };

  const logout = async () => {
    await authApi.logout();
    setUser(null);
    setStore(null);
  };

  const updateStoreLocally = (newStore: Store) => {
    setStore(newStore);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        store,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshProfile,
        updateStoreLocally,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
