-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Function to automatically update 'updated_at' timestamp (if not already created)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Table for Sound Categories
CREATE TABLE public.sound_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    thumbnail_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER sound_categories_updated_at_trigger
BEFORE UPDATE ON public.sound_categories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.sound_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Sound categories are publicly viewable"
ON public.sound_categories FOR SELECT USING (true);
-- Add policies for admin/system roles if needed

-- Table for Sounds
CREATE TABLE public.sounds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID REFERENCES public.sound_categories(id) ON DELETE SET NULL, -- Keep sound even if category is deleted
    name TEXT NOT NULL,
    description TEXT,
    duration_seconds INTEGER NOT NULL CHECK (duration_seconds > 0),
    file_url TEXT NOT NULL,
    thumbnail_url TEXT,
    tags JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER sounds_updated_at_trigger
BEFORE UPDATE ON public.sounds
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.sounds ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Sounds are publicly viewable"
ON public.sounds FOR SELECT USING (true);
-- Add policies for admin/system roles if needed

-- Table for Sound Therapy Sessions (user interactions with sounds)
CREATE TABLE public.sound_therapy_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
    sound_id UUID NOT NULL REFERENCES public.sounds(id) ON DELETE RESTRICT, -- Ensure sound exists
    duration_listened_seconds INTEGER NOT NULL CHECK (duration_listened_seconds >= 0),
    mood_before TEXT,
    mood_after TEXT,
    notes TEXT,
    played_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.sound_therapy_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own sound therapy sessions"
ON public.sound_therapy_sessions FOR ALL
USING (auth.uid() = patient_user_id);
-- Add policy for caregivers if needed

-- Indexes
CREATE INDEX idx_sounds_category_id ON public.sounds(category_id);
CREATE INDEX idx_sound_therapy_sessions_patient_id ON public.sound_therapy_sessions(patient_user_id);
CREATE INDEX idx_sound_therapy_sessions_sound_id ON public.sound_therapy_sessions(sound_id);
CREATE INDEX idx_sound_therapy_sessions_played_at ON public.sound_therapy_sessions(played_at);
