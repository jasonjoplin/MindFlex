-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table for user roles
CREATE TABLE public.roles (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL
);

-- Table for user profiles, linking to auth.users and public.roles
CREATE TABLE public.profiles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role_id INTEGER NOT NULL REFERENCES public.roles(id) ON DELETE RESTRICT,
    username TEXT UNIQUE, -- Recommended to be populated, potentially via trigger or application logic
    full_name TEXT,
    avatar_url TEXT,
    -- Patient-specific fields
    patient_data JSONB, -- e.g., date_of_birth, medical_conditions, emergency_contact
    -- Caregiver-specific fields
    caregiver_data JSONB, -- e.g., specialization, years_of_experience
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Function to automatically update 'updated_at' timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update 'updated_at' on profile changes
CREATE TRIGGER profiles_updated_at_trigger
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- RLS Policies for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Seed initial roles
INSERT INTO public.roles (name) VALUES ('admin'), ('caregiver'), ('patient'), ('system');

-- Example of how to handle username population (simplified - real trigger might be more complex)
-- This is a placeholder comment; actual trigger logic for username might depend on auth provider specifics
-- and how user metadata is exposed. For now, assuming username is handled by application or manually.
/*
CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (user_id, username, role_id)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'user_name', NEW.email),
        (SELECT id FROM public.roles WHERE name = 'patient') -- Default role, adjust as needed
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user_profile();
*/

-- Index on role_id for faster role-based queries
CREATE INDEX idx_profiles_role_id ON public.profiles(role_id);
