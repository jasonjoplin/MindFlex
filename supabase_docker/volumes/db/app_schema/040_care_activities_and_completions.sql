-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Function to automatically update 'updated_at' timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Table for Care Activities
CREATE TABLE public.care_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
    assigned_by_user_id UUID REFERENCES public.profiles(user_id) ON DELETE SET NULL, -- User who assigned it (e.g., caregiver)
    name TEXT NOT NULL,
    activity_type TEXT, -- e.g., 'Physical', 'Cognitive', 'Social', 'Medication Reminder'
    description TEXT,
    schedule_details JSONB, -- e.g., {"type": "daily", "time": "10:00"} or {"type": "weekly", "days": ["Mon", "Wed", "Fri"]}
    duration_minutes INTEGER CHECK (duration_minutes IS NULL OR duration_minutes > 0),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER care_activities_updated_at_trigger
BEFORE UPDATE ON public.care_activities
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.care_activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage activities for their patients or themselves"
ON public.care_activities FOR ALL
USING (auth.uid() = patient_user_id OR auth.uid() = assigned_by_user_id);
-- Add more specific caregiver policies based on caregiver_patient_links

-- Table for Activity Completions
CREATE TABLE public.activity_completions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    activity_id UUID NOT NULL REFERENCES public.care_activities(id) ON DELETE CASCADE,
    patient_user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE, -- Denormalized for easier RLS and queries
    completed_at TIMESTAMPTZ DEFAULT NOW(),
    notes TEXT,
    outcome_rating INTEGER CHECK (outcome_rating IS NULL OR (outcome_rating >= 1 AND outcome_rating <= 5)) -- e.g., 1-5 scale
);

ALTER TABLE public.activity_completions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage completions for their activities"
ON public.activity_completions FOR ALL
USING (auth.uid() = patient_user_id);
-- Add policy for caregivers if needed

-- Indexes
CREATE INDEX idx_care_activities_patient_id ON public.care_activities(patient_user_id);
CREATE INDEX idx_activity_completions_activity_id ON public.activity_completions(activity_id);
CREATE INDEX idx_activity_completions_patient_id ON public.activity_completions(patient_user_id);
