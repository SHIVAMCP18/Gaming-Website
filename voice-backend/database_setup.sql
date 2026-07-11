-- Zentry Gaming Multiverse Database Setup Script
-- Copy and run this script in the SQL Editor of your Supabase Dashboard

-- 1. Create a profiles table linked to Supabase authentication users
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    username TEXT UNIQUE,
    full_name TEXT,
    xp INTEGER DEFAULT 0,
    completed_quests INTEGER[] DEFAULT '{}'::INTEGER[],
    inventory JSONB DEFAULT '[]'::JSONB,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Enable Row Level Security (RLS) to protect the records
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Create policies for data access
-- Allow anyone to view profiles (needed for public leaderboards)
CREATE POLICY "Allow public read access" ON public.profiles
    FOR SELECT USING (true);

-- Allow users to only update their own profile stats (XP, quests, inventory, etc.)
CREATE POLICY "Allow users to update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Allow users to insert their own profile (in case manual creation is needed)
CREATE POLICY "Allow users to insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- 4. Create trigger function to automatically provision a profile row when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, username, full_name, xp, completed_quests, inventory)
    VALUES (
        new.id,
        COALESCE(
            new.raw_user_meta_data->>'username', 
            'Agent_' || substring(new.id::text from 1 for 6)
        ),
        COALESCE(
            new.raw_user_meta_data->>'full_name', 
            'Celestial Agent'
        ),
        0,
        '{}'::INTEGER[],
        '[]'::JSONB
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Attach trigger to auth.users table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
