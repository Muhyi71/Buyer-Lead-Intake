-- Create enums for the buyers system
CREATE TYPE public.city_type AS ENUM ('Chandigarh', 'Mohali', 'Zirakpur', 'Panchkula', 'Other');
CREATE TYPE public.property_type AS ENUM ('Apartment', 'Villa', 'Plot', 'Office', 'Retail');
CREATE TYPE public.bhk_type AS ENUM ('1', '2', '3', '4', 'Studio');
CREATE TYPE public.purpose_type AS ENUM ('Buy', 'Rent');
CREATE TYPE public.timeline_type AS ENUM ('0-3m', '3-6m', '>6m', 'Exploring');
CREATE TYPE public.source_type AS ENUM ('Website', 'Referral', 'Walk-in', 'Call', 'Other');
CREATE TYPE public.status_type AS ENUM ('New', 'Qualified', 'Contacted', 'Visited', 'Negotiation', 'Converted', 'Dropped');

-- Create profiles table for user information
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Create buyers table
CREATE TABLE public.buyers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL CHECK (char_length(full_name) >= 2 AND char_length(full_name) <= 80),
  email TEXT,
  phone TEXT NOT NULL CHECK (phone ~ '^[0-9]{10,15}$'),
  city city_type NOT NULL,
  property_type property_type NOT NULL,
  bhk bhk_type,
  purpose purpose_type NOT NULL,
  budget_min INTEGER CHECK (budget_min > 0),
  budget_max INTEGER CHECK (budget_max > 0),
  timeline timeline_type NOT NULL,
  source source_type NOT NULL,
  status status_type NOT NULL DEFAULT 'New',
  notes TEXT CHECK (char_length(notes) <= 1000),
  tags TEXT[] DEFAULT '{}',
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Budget validation: budget_max must be >= budget_min when both are present
  CONSTRAINT budget_validation CHECK (
    (budget_min IS NULL OR budget_max IS NULL) OR (budget_max >= budget_min)
  ),
  
  -- BHK validation: required for Apartment and Villa
  CONSTRAINT bhk_validation CHECK (
    (property_type NOT IN ('Apartment', 'Villa')) OR (bhk IS NOT NULL)
  )
);

-- Enable RLS on buyers
ALTER TABLE public.buyers ENABLE ROW LEVEL SECURITY;

-- Create policies for buyers - anyone can read, only owner can modify
CREATE POLICY "Anyone can view all buyers" ON public.buyers
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can insert their own buyers" ON public.buyers
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own buyers" ON public.buyers
  FOR UPDATE TO authenticated USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own buyers" ON public.buyers
  FOR DELETE TO authenticated USING (auth.uid() = owner_id);

-- Create buyer_history table for change tracking
CREATE TABLE public.buyer_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  buyer_id UUID NOT NULL REFERENCES public.buyers(id) ON DELETE CASCADE,
  changed_by UUID NOT NULL REFERENCES auth.users(id),
  changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  diff JSONB NOT NULL
);

-- Enable RLS on buyer_history
ALTER TABLE public.buyer_history ENABLE ROW LEVEL SECURITY;

-- Create policies for buyer_history - anyone can view, system can insert
CREATE POLICY "Anyone can view buyer history" ON public.buyer_history
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert history" ON public.buyer_history
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = changed_by);

-- Create indexes for better performance
CREATE INDEX idx_buyers_owner_id ON public.buyers(owner_id);
CREATE INDEX idx_buyers_city ON public.buyers(city);
CREATE INDEX idx_buyers_property_type ON public.buyers(property_type);
CREATE INDEX idx_buyers_status ON public.buyers(status);
CREATE INDEX idx_buyers_timeline ON public.buyers(timeline);
CREATE INDEX idx_buyers_updated_at ON public.buyers(updated_at DESC);
CREATE INDEX idx_buyers_full_name ON public.buyers(full_name);
CREATE INDEX idx_buyers_phone ON public.buyers(phone);
CREATE INDEX idx_buyers_email ON public.buyers(email);
CREATE INDEX idx_buyer_history_buyer_id ON public.buyer_history(buyer_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at for buyers
CREATE TRIGGER update_buyers_updated_at
  BEFORE UPDATE ON public.buyers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger to automatically update updated_at for profiles
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();