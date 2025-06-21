
-- Add phone number column to profiles if it doesn't exist and make it unique for account numbers
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS account_number text UNIQUE;

-- Update existing profiles to use phone as account number if phone exists
UPDATE public.profiles 
SET account_number = phone 
WHERE phone IS NOT NULL AND account_number IS NULL;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_account_number ON public.profiles(account_number);

-- Add contacts table for storing user contacts
CREATE TABLE IF NOT EXISTS public.contacts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  phone text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on contacts table
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for contacts
CREATE POLICY "Users can view their own contacts" ON public.contacts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own contacts" ON public.contacts
  FOR ALL USING (auth.uid() = user_id);

-- Update the handle_new_user function to set account_number from phone
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, phone, account_number)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data ->> 'first_name', 'User'),
    COALESCE(new.raw_user_meta_data ->> 'last_name', ''),
    COALESCE(new.raw_user_meta_data ->> 'phone', new.phone),
    COALESCE(new.raw_user_meta_data ->> 'phone', new.phone)
  );
  
  -- Create default wallet
  INSERT INTO public.wallets (user_id, balance, currency)
  VALUES (new.id, 0.00, 'NGN');
  
  RETURN new;
END;
$$;
