-- Make email nullable in profiles table since phone auth doesn't provide email
ALTER TABLE public.profiles ALTER COLUMN email DROP NOT NULL;

-- Update the trigger function to handle phone signups
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert profile with email OR phone, whichever is available
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    new.id, 
    COALESCE(new.email, new.phone), 
    new.raw_user_meta_data->>'full_name'
  );
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, 'user');
  
  INSERT INTO public.credits_tracking (user_id, daily_credits, credits_remaining)
  VALUES (new.id, 4, 4);
  
  RETURN new;
END;
$$;