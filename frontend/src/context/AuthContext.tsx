import React, { useCallback, useEffect, useState } from 'react';
import { getCurrentAccount, logoutAccount } from '../api/resqnetApi.js';
import AuthContext, { type User } from './auth-context';

function parseUser(value: unknown): User | null {
  if (value === null) return null;
  if (typeof value !== 'object'
      || !('id' in value) || typeof value.id !== 'string'
      || !('name' in value) || typeof value.name !== 'string'
      || !('email' in value) || typeof value.email !== 'string'
      || !('role' in value) || (value.role !== 'ADMIN' && value.role !== 'USER')) {
    throw new Error('The backend returned an invalid session response.');
  }
  return { id: value.id, name: value.name, email: value.email, role: value.role };
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState('');

  const refreshSession = useCallback(async () => {
    setLoading(true);
    setAuthError('');
    try {
      setUser(parseUser(await getCurrentAccount()));
    } catch (requestError) {
      setUser(null);
      setAuthError(requestError instanceof Error
        ? requestError.message
        : 'Unable to verify the current session.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshSession();
  }, [refreshSession]);

  const login = (newUser: User) => {
    setUser(newUser);
    setAuthError('');
  };

  const logout = async () => {
    await logoutAccount();
    setUser(null);
    setAuthError('');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'ADMIN',
        loading,
        authError,
        login,
        logout,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
