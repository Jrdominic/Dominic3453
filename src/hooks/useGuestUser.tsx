import { useState, useEffect } from 'react';

const GUEST_USER_KEY = 'cortex_guest_user_name';
const FIRST_VISIT_KEY = 'cortex_first_visit';

export const useGuestUser = () => {
  const [userName, setUserNameState] = useState<string | null>(null);
  const [isFirstVisit, setIsFirstVisit] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedName = localStorage.getItem(GUEST_USER_KEY);
    const firstVisitFlag = localStorage.getItem(FIRST_VISIT_KEY);

    if (storedName) {
      setUserNameState(storedName);
      setIsFirstVisit(false);
    } else if (firstVisitFlag === null) { // If FIRST_VISIT_KEY doesn't exist, it's the very first visit
      setIsFirstVisit(true);
    } else { // Not first visit, but no name stored (e.g., cleared local storage manually)
      setIsFirstVisit(false);
    }
    setIsLoading(false);
  }, []);

  const setGuestUserName = (name: string) => {
    localStorage.setItem(GUEST_USER_KEY, name);
    localStorage.setItem(FIRST_VISIT_KEY, 'false'); // Mark as not first visit
    setUserNameState(name);
    setIsFirstVisit(false);
  };

  return { userName, setGuestUserName, isFirstVisit, isLoading };
};