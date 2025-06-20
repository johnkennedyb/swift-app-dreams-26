
-- Create enum for transaction types
CREATE TYPE transaction_type AS ENUM ('credit', 'debit', 'transfer');

-- Create enum for transaction status
CREATE TYPE transaction_status AS ENUM ('pending', 'completed', 'failed', 'cancelled');

-- Create enum for project status
CREATE TYPE project_status AS ENUM ('active', 'completed', 'cancelled');

-- Create user profiles table
CREATE TABLE public.profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE,
  first_name text NOT NULL,
  last_name text NOT NULL,
  phone text,
  address text,
  date_of_birth date,
  avatar_url text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  PRIMARY KEY (id)
);

-- Create wallets table for user balances
CREATE TABLE public.wallets (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  balance decimal(15,2) DEFAULT 0.00 NOT NULL,
  currency text DEFAULT 'NGN' NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, currency)
);

-- Create projects table
CREATE TABLE public.projects (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  admin_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  funding_goal decimal(15,2) NOT NULL,
  current_funding decimal(15,2) DEFAULT 0.00 NOT NULL,
  status project_status DEFAULT 'active' NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create project members table
CREATE TABLE public.project_members (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  joined_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(project_id, user_id)
);

-- Create transactions table
CREATE TABLE public.transactions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  type transaction_type NOT NULL,
  amount decimal(15,2) NOT NULL,
  description text,
  reference text UNIQUE,
  status transaction_status DEFAULT 'pending' NOT NULL,
  project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL,
  recipient_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  paystack_reference text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create support requests table
CREATE TABLE public.support_requests (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  requester_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  amount_needed decimal(15,2) NOT NULL,
  media_url text,
  status text DEFAULT 'active' NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create support comments table
CREATE TABLE public.support_comments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  support_request_id uuid REFERENCES public.support_requests(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  comment text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data ->> 'first_name', 'User'),
    COALESCE(new.raw_user_meta_data ->> 'last_name', '')
  );
  
  -- Create default wallet
  INSERT INTO public.wallets (user_id, balance, currency)
  VALUES (new.id, 0.00, 'NGN');
  
  RETURN new;
END;
$$;

-- Trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for wallets
CREATE POLICY "Users can view own wallet" ON public.wallets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own wallet" ON public.wallets
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for projects
CREATE POLICY "Anyone can view projects" ON public.projects
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can create projects" ON public.projects
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = admin_id);

CREATE POLICY "Project admins can update projects" ON public.projects
  FOR UPDATE USING (auth.uid() = admin_id);

-- RLS Policies for project members
CREATE POLICY "Anyone can view project members" ON public.project_members
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can join projects" ON public.project_members
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- RLS Policies for transactions
CREATE POLICY "Users can view own transactions" ON public.transactions
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() = recipient_id);

CREATE POLICY "Users can create transactions" ON public.transactions
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- RLS Policies for support requests
CREATE POLICY "Anyone can view support requests" ON public.support_requests
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can create support requests" ON public.support_requests
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = requester_id);

-- RLS Policies for support comments
CREATE POLICY "Anyone can view support comments" ON public.support_comments
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can create support comments" ON public.support_comments
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
