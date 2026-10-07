import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api, getStoredToken } from '../services/api';
import { Profile, Subscription, Usage, User } from '../types';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  subscription: Subscription | null;
  usage: Usage | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (email: string, pass: string, name?: string) => Promise<void>;
  demoLogin: () => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  updateProfileState: (profile: Profile) => void;
  updateUsageState: (usage: Usage) => void;
  updateSubscriptionState: (sub: Subscription, usage: Usage) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [usage, setUsage] = useState<Usage | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchCurrentUser = useCallback(async () => {
    const token = getStoredToken();
    if (!token) {
      setUser(null);
      setProfile(null);
      setSubscription(null);
      setUsage(null);
      setIsLoading(false);
      return;
    }

    try {
      const data = await api.getMe();
      setUser(data.user);
      setProfile(data.profile);
      setSubscription(data.subscription);
      setUsage(data.usage);
    } catch (err) {
      console.warn('Session expired or invalid:', err);
      setUser(null);
      setProfile(null);
      setSubscription(null);
      setUsage(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const data = await api.login(email, pass);
      setUser(data.user);
      setProfile(data.profile);
      setSubscription(data.subscription);
      setUsage(data.usage);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, pass: string, name?: string) => {
    setIsLoading(true);
    try {
      const data = await api.register(email, pass, name);
      setUser(data.user);
      setProfile(data.profile);
      setSubscription(data.subscription);
      setUsage(data.usage);
    } finally {
      setIsLoading(false);
    }
  };

  const demoLogin = async () => {
    setIsLoading(true);
    try {
      const data = await api.demoLogin();
      setUser(data.user);
      setProfile(data.profile);
      setSubscription(data.subscription);
      setUsage(data.usage);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await api.logout();
      setUser(null);
      setProfile(null);
      setSubscription(null);
      setUsage(null);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshAuth = async () => {
    await fetchCurrentUser();
  };

  const updateProfileState = (newProfile: Profile) => {
    setProfile(newProfile);
  };

  const updateUsageState = (newUsage: Usage) => {
    setUsage(newUsage);
  };

  const updateSubscriptionState = (newSub: Subscription, newUsage: Usage) => {
    setSubscription(newSub);
    setUsage(newUsage);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        subscription,
        usage,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        demoLogin,
        logout,
        refreshAuth,
        updateProfileState,
        updateUsageState,
        updateSubscriptionState,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
