import { useState, useEffect } from 'react';
// Supabase imports are no longer needed for client-side user state management in this hook

interface LocalUser {
  name: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<LocalUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedName = localStorage.getItem('cortex_user_name');
    if (storedName) {
      setUser({ name: storedName });
    }
    setIsLoading(false);
  }, []);

  const signInLocal = (name: string) => {
    localStorage.setItem('cortex_user_name', name);
    setUser({ name });
  };

  const signOut = () => {
    localStorage.removeItem('cortex_user_name');
    setUser(null);
  };

  // session will always be null as we are not using Supabase sessions for client-side auth
  return { user, session: null, isLoading, signInLocal, signOut };
};