-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Function to automatically update 'updated_at' timestamp (if not already created by other scripts)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Table for Games
CREATE TABLE public.games (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  game_type TEXT NOT NULL, -- Renamed from 'type'
  difficulty_levels JSONB NOT NULL,
  avg_duration_seconds INTEGER NOT NULL,
  instructions TEXT NOT NULL,
  thumbnail_url TEXT, -- Standardized to _url
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER games_updated_at_trigger
BEFORE UPDATE ON public.games
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Games are publicly viewable"
ON public.games FOR SELECT USING (true);
-- Add policies for admin/system roles to manage games if needed

-- Table for Game Scores
CREATE TABLE public.game_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
    game_id UUID NOT NULL REFERENCES public.games(id) ON DELETE RESTRICT,
    score INTEGER NOT NULL,
    duration_seconds INTEGER NOT NULL, -- Standardized name
    difficulty_level TEXT NOT NULL, -- Renamed from 'difficulty'
    errors INTEGER DEFAULT 0,
    metadata JSONB, -- Removed DEFAULT '{}' for consistency, can be added if needed
    played_at TIMESTAMPTZ DEFAULT NOW(), -- Renamed from created_at for clarity
    -- Removed game_name and game_type, as they can be joined from games table
    CONSTRAINT valid_difficulty_level CHECK (difficulty_level IN ('easy', 'medium', 'hard')), -- Example, adjust if needed
    CONSTRAINT positive_score CHECK (score >= 0),
    CONSTRAINT positive_duration CHECK (duration_seconds >= 0),
    CONSTRAINT positive_errors CHECK (errors >= 0)
);

ALTER TABLE public.game_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own game scores"
ON public.game_scores FOR ALL
USING (auth.uid() = patient_user_id);
-- Add policy for caregivers to view patient scores if needed, based on caregiver_patient_links

-- Indexes
CREATE INDEX idx_games_game_type ON public.games(game_type);
CREATE INDEX idx_game_scores_patient_id ON public.game_scores(patient_user_id);
CREATE INDEX idx_game_scores_game_id ON public.game_scores(game_id);
CREATE INDEX idx_game_scores_played_at ON public.game_scores(played_at);
