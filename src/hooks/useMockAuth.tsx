import { useState, useEffect } from 'react';

interface MockUser {
  id: string;
  email: string;
  full_name?: string;
  user_metadata?: {
    full_name?: string;
  };
}

interface MockAuthState {
  user: MockUser | null;
  session: { access_token: string } | null; // Mock session
  isLoading: boolean;
}

export const useMockAuth = () => {
  const [authState, setAuthState] = useState<MockAuthState>({
    user: null,
    session: null,
    isLoading: true,
  });

  useEffect(() => {
    const storedUser = localStorage.getItem('mockUser');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setAuthState({
        user,
        session: { access_token: 'mock-token' },
        isLoading: false,
      });
    } else {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const signIn = (email: string, password: string) => {
    // In a real app, you'd validate credentials against a backend.
    // Here, we just simulate a successful login.
    const mockUser: MockUser = {
      id: 'mock-user-id-' + email,
      email: email,
      user_metadata: {
        full_name: email.split('@')[0],
      },
    };
    localStorage.setItem('mockUser', JSON.stringify(mockUser));
    setAuthState({
      user: mockUser,
      session: { access_token: 'mock-token' },
      isLoading: false,
    });
    return { user: mockUser, error: null };
  };

  const signUp = (email: string, password: string) => {
    // In a real app, you'd create a new user.
    // Here, we just simulate a successful signup and immediate login.
    const mockUser: MockUser = {
      id: 'mock-user-id-' + email,
      email: email,
      user_metadata: {
        full_name: email.split('@')[0],
      },
    };
    localStorage.setItem('mockUser', JSON.stringify(mockUser));
    setAuthState({
      user: mockUser,
      session: { access_token: 'mock-token' },
      isLoading: false,
    });
    return { user: mockUser, error: null };
  };

  const signOut = () => {
    localStorage.removeItem('mockUser');
    setAuthState({
      user: null,
      session: null,
      isLoading: false,
    });
  };

  return { ...authState, signIn, signUp, signOut };
};