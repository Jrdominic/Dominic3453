import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Credits {
  credits_remaining: number;
  daily_credits: number;
  is_pro: boolean;
  last_reset_date: string;
}

export const useCredits = () => {
  const [credits, setCredits] = useState<Credits | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchCredits = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('credits_tracking')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      // Check if we need to reset credits (new day)
      const lastReset = new Date(data.last_reset_date);
      const today = new Date();
      
      if (lastReset.toDateString() !== today.toDateString()) {
        // Reset credits for new day
        const { data: updatedData, error: updateError } = await supabase
          .from('credits_tracking')
          .update({
            credits_remaining: data.daily_credits,
            last_reset_date: today.toISOString().split('T')[0]
          })
          .eq('user_id', user.id)
          .select()
          .single();

        if (updateError) throw updateError;
        setCredits(updatedData);
      } else {
        setCredits(data);
      }
    } catch (error) {
      console.error('Error fetching credits:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCredits();
  }, [user]);

  const deductCredit = async () => {
    if (!user || !credits) return false;

    if (credits.credits_remaining <= 0) {
      return false;
    }

    try {
      const { error } = await supabase
        .from('credits_tracking')
        .update({
          credits_remaining: credits.credits_remaining - 1
        })
        .eq('user_id', user.id);

      if (error) throw error;

      await fetchCredits();
      return true;
    } catch (error) {
      console.error('Error deducting credit:', error);
      return false;
    }
  };

  return { credits, loading, fetchCredits, deductCredit };
};
