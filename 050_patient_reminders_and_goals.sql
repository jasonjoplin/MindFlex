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

-- Table for Patient Reminders
CREATE TABLE public.patient_reminders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    reminder_time TIME,
    days_of_week JSONB, -- e.g., ["Mon", "Wed", "Fri"] or [1, 3, 5]
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER patient_reminders_updated_at_trigger
BEFORE UPDATE ON public.patient_reminders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.patient_reminders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own reminders"
ON public.patient_reminders FOR ALL
USING (auth.uid() = patient_user_id);
-- Add policy for caregivers if needed

-- Table for Patient Goals
CREATE TABLE public.patient_goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT, -- e.g., 'Cognitive', 'Physical', 'Social', 'Medication Adherence'
    target_value NUMERIC,
    current_value NUMERIC,
    unit TEXT, -- e.g., 'minutes', 'steps', '%'
    start_date DATE,
    target_date DATE,
    status TEXT DEFAULT 'active', -- e.g., 'active', 'completed', 'paused', 'cancelled'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER patient_goals_updated_at_trigger
BEFORE UPDATE ON public.patient_goals
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.patient_goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own goals"
ON public.patient_goals FOR ALL
USING (auth.uid() = patient_user_id);
-- Add policy for caregivers if needed

-- Indexes
CREATE INDEX idx_patient_reminders_patient_id ON public.patient_reminders(patient_user_id);
CREATE INDEX idx_patient_goals_patient_id ON public.patient_goals(patient_user_id);
CREATE INDEX idx_patient_goals_status ON public.patient_goals(status);
CREATE INDEX idx_patient_goals_category ON public.patient_goals(category);
