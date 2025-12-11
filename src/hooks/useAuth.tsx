import { useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  full_name?: string;
  password: string; // plain text for demo only – **never** use in production
  credits?: number;
}

interface AuthState {
  user: Omit<User, 'password' | 'credits'> | null;
  token: string | null;
  isLoading: boolean;
}

/* ---------- helpers for localStorage ---------- */
const USERS_KEY = 'cortex_users';
const TOKEN_KEY = 'cortex_token';
const USER_KEY = 'cortex_user';

function getStoredUsers(): User[] {
  const raw = localStorage.getItem(USERS_KEY);
  return raw ? JSON.parse(raw) : [];
}

function setStoredUsers(users: User[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function generateToken() {
  return `token-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
}

/* ---------- main hook ---------- */
export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: true,
  });

  /* ----- load persisted session on mount ----- */
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    const userRaw = localStorage.getItem(USER_KEY);
    if (token && userRaw) {
      setAuthState({
        user: JSON.parse(userRaw),
        token,
        isLoading: false,
      });
    } else {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }

    /* Listen for changes made from other components (e.g., sign‑up dialog) */
    const onStorage = (e: StorageEvent) => {
      if (e.key === TOKEN_KEY || e.key === USER_KEY) {
        const newToken = localStorage.getItem(TOKEN_KEY);
        const newUserRaw = localStorage.getItem(USER_KEY);
        setAuthState({
          user: newUserRaw ? JSON.parse(newUserRaw) : null,
          token: newToken,
          isLoading: false,
        });
      }
    };

    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  /* ----- sign‑up ----- */
  const signUp = async (email: string, password: string) => {
    const users = getStoredUsers();

    // simple duplicate‑email check
    if (users.some(u => u.email === email)) {
      return { user: null, error: new Error('User with this email already exists.') };
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      email,
      full_name: email.split('@')[0],
      password,
      credits: 4, // start with 4 credits (mirrors original backend)
    };
    users.push(newUser);
    setStoredUsers(users);

    const token = generateToken();
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify({
      id: newUser.id,
      email: newUser.email,
      full_name: newUser.full_name,
    }));

    // Update this hook's state (also triggers the storage listener above)
    setAuthState({ user: { id: newUser.id, email: newUser.email, full_name: newUser.full_name }, token, isLoading: false });
    return { user: { id: newUser.id, email: newUser.email, full_name: newUser.full_name }, error: null };
  };

  /* ----- sign‑in ----- */
  const signIn = async (email: string, password: string) => {
    const users = getStoredUsers();
    const found = users.find(u => u.email === email && u.password === password);
    if (!found) {
      return { user: null, error: new Error('Invalid credentials.') };
    }

    const token = generateToken();
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify({
      id: found.id,
      email: found.email,
      full_name: found.full_name,
    }));

    setAuthState({
      user: { id: found.id, email: found.email, full_name: found.full_name },
      token,
      isLoading: false,
    });
    return { user: { id: found.id, email: found.email, full_name: found.full_name }, error: null };
  };

  /* ----- delete account ----- */
  const deleteAccount = async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      return { success: false, error: new Error('No active session.') };
    }

    const users = getStoredUsers();
    const idx = users.findIndex(u => u.id === authState.user?.id);
    if (idx === -1) {
      return { success: false, error: new Error('User not found.') };
    }

    users.splice(idx, 1);
    setStoredUsers(users);

    // clear stored session
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setAuthState({ user: null, token: null, isLoading: false });

    return { success: true, error: null };
  };

  return { ...authState, signIn, signUp, deleteAccount };
};