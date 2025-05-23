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

-- Table for Achievements
CREATE TABLE public.achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL,
    game_id UUID REFERENCES public.games(id) ON DELETE SET NULL, -- Achievement can be general or game-specific
    criteria JSONB NOT NULL, -- e.g., {"type": "score", "game_id": "some_uuid", "threshold": 1000} or {"type": "games_played", "count": 10}
    icon_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER achievements_updated_at_trigger
BEFORE UPDATE ON public.achievements
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Achievements are publicly viewable"
ON public.achievements FOR SELECT USING (true);
-- Add policies for admin/system roles to manage achievements if needed

-- Table for User Achievements (linking achievements to users)
CREATE TABLE public.user_achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
    achievement_id UUID NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
    unlocked_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_user_achievement UNIQUE (patient_user_id, achievement_id)
);

ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own unlocked achievements"
ON public.user_achievements FOR SELECT
USING (auth.uid() = patient_user_id);
-- Add policy for caregivers to view patient achievements if needed

-- Indexes
CREATE INDEX idx_achievements_game_id ON public.achievements(game_id);
CREATE INDEX idx_user_achievements_patient_id ON public.user_achievements(patient_user_id);
CREATE INDEX idx_user_achievements_achievement_id ON public.user_achievements(achievement_id);
