import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'CITIZEN' | 'DRIVER' | 'COORDINATOR' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  assignedUnit?: string;
  department?: string;
  badgeNumber?: string;
  avatar?: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  switchRoleForDemo: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY_TOKEN = 'resqnet_auth_token';
const STORAGE_KEY_USER = 'resqnet_auth_user';

// Mock baseline profiles for quick testing/demo
export const DEMO_PROFILES: Record<UserRole, User> = {
  CITIZEN: {
    id: 'USR-CITIZEN-01',
    name: 'Citizen Guest',
    email: 'citizen@resqnet.org',
    role: 'CITIZEN',
    department: 'Civilian Emergency Network'
  },
  DRIVER: {
    id: 'DRV-101',
    name: 'Officer Raman (EMT)',
    email: 'driver.als101@resqnet.gov',
    role: 'DRIVER',
    assignedUnit: 'ALS-101',
    badgeNumber: 'CAD-DRV-849',
    department: 'EMS Rapid Response • Kovilpatti Sector'
  },
  COORDINATOR: {
    id: 'COORD-402',
    name: 'Lead Dispatcher Meera',
    email: 'meera.cad@resqnet.gov',
    role: 'COORDINATOR',
    badgeNumber: 'CAD-DSP-402',
    department: 'Central Regional Dispatch'
  },
  ADMIN: {
    id: 'ADM-ROOT-01',
    name: 'Commander S. Nathan',
    email: 'admin.root@resqnet.gov',
    role: 'ADMIN',
    badgeNumber: 'ROOT-990',
    department: 'Command & Cybersecurity Operations'
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Hydrate from localStorage on initial load
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem(STORAGE_KEY_TOKEN);
      const storedUser = localStorage.getItem(STORAGE_KEY_USER);

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (err) {
      console.warn('Failed to hydrate authentication session:', err);
      localStorage.removeItem(STORAGE_KEY_TOKEN);
      localStorage.removeItem(STORAGE_KEY_USER);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    try {
      localStorage.setItem(STORAGE_KEY_TOKEN, newToken);
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(newUser));
    } catch (err) {
      console.error('Failed to persist auth credentials:', err);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    try {
      localStorage.removeItem(STORAGE_KEY_TOKEN);
      localStorage.removeItem(STORAGE_KEY_USER);
    } catch (err) {
      console.error('Failed to clear auth session:', err);
    }
  };

  const switchRoleForDemo = (role: UserRole) => {
    const demoUser = DEMO_PROFILES[role];
    const mockToken = `jwt-demo-${role.toLowerCase()}-${Date.now()}`;
    login(mockToken, demoUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        logout,
        switchRoleForDemo
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
