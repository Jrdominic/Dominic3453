import { useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  full_name?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: true,
  });

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    if (storedUser && storedToken) {
      setAuthState({
        user: JSON.parse(storedUser),
        token: storedToken,
        isLoading: false,
      });
    } else {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (!response.ok) {
        return { user: null, error: new Error(data.error || 'Sign in failed.') };
      }

      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('token', data.token);
      setAuthState({
        user: data.user,
        token: data.token,
        isLoading: false,
      });
      return { user: data.user, error: null };
    } catch (error: any) {
      console.error('Sign in error:', error);
      return { user: null, error: error };
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (!response.ok) {
        return { user: null, error: new Error(data.error || 'Sign up failed.') };
      }

      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('token', data.token);
      setAuthState({
        user: data.user,
        token: data.token,
        isLoading: false,
      });
      return { user: data.user, error: null };
    } catch (error: any) {
      console.error('Sign up error:', error);
      return { user: null, error: error };
    }
  };

  const deleteAccount = async () => {
    try {
      const response = await fetch('/api/auth/delete-account', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authState.token}`,
        },
      });
      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: new Error(data.error || 'Account deletion failed.') };
      }

      localStorage.removeItem('user');
      localStorage.removeItem('token');
      setAuthState({
        user: null,
        token: null,
        isLoading: false,
      });
      return { success: true, error: null };
    } catch (error: any) {
      console.error('Delete account error:', error);
      return { success: false, error: error };
    }
  };

  // No signOut function as per user request

  return { ...authState, signIn, signUp, deleteAccount };
};