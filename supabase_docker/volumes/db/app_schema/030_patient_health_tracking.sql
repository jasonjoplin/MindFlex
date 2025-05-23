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

-- Table for Medications
CREATE TABLE public.medications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    dosage TEXT,
    frequency TEXT,
    times_of_day JSONB, -- e.g., ["08:00", "18:00"] or {"morning": true, "evening": true}
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER medications_updated_at_trigger
BEFORE UPDATE ON public.medications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.medications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own medications"
ON public.medications FOR ALL
USING (auth.uid() = patient_user_id);
-- Add policy for caregivers if needed, e.g., based on caregiver_patient_links table

-- Table for Appointments
CREATE TABLE public.appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
    scheduled_by_user_id UUID REFERENCES public.profiles(user_id) ON DELETE SET NULL, -- User who scheduled it
    title TEXT NOT NULL,
    description TEXT,
    appointment_datetime TIMESTAMPTZ NOT NULL,
    location TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER appointments_updated_at_trigger
BEFORE UPDATE ON public.appointments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own appointments"
ON public.appointments FOR ALL
USING (auth.uid() = patient_user_id OR auth.uid() = scheduled_by_user_id);
-- Add policy for caregivers if needed

-- Table for Patient Notes
CREATE TABLE public.patient_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
    author_user_id UUID REFERENCES public.profiles(user_id) ON DELETE SET NULL, -- User who wrote the note
    content TEXT NOT NULL,
    ai_insights TEXT,
    note_type TEXT, -- e.g., 'General', 'Observation', 'Incident'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER patient_notes_updated_at_trigger
BEFORE UPDATE ON public.patient_notes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.patient_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage notes for their patients or themselves"
ON public.patient_notes FOR ALL
USING (auth.uid() = patient_user_id OR auth.uid() = author_user_id);
-- Add more specific caregiver policies based on caregiver_patient_links

-- Table for Mood Entries
CREATE TABLE public.mood_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
    mood_rating TEXT NOT NULL, -- Could be numeric (1-5) or text ('happy', 'sad')
    entry_timestamp TIMESTAMPTZ DEFAULT NOW(),
    notes TEXT,
    symptoms JSONB, -- e.g., ["headache", "fatigue"]
    contributing_factors JSONB, -- e.g., ["poor sleep", "stressful event"]
    logged_by_user_id UUID REFERENCES public.profiles(user_id) ON DELETE SET NULL -- Who logged this (patient or caregiver)
);

ALTER TABLE public.mood_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage mood entries for themselves or their patients"
ON public.mood_entries FOR ALL
USING (auth.uid() = patient_user_id OR auth.uid() = logged_by_user_id);
-- Add more specific caregiver policies based on caregiver_patient_links

-- Table for Daily Logs
CREATE TABLE public.daily_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
    log_date DATE NOT NULL,
    mood_rating TEXT, -- Consistent with mood_entries.mood_rating
    sleep_quality_rating TEXT, -- e.g., 'Poor', 'Fair', 'Good', 'Excellent' or 1-5
    sleep_hours NUMERIC(4,2) CHECK (sleep_hours >= 0 AND sleep_hours <= 24),
    medication_taken_as_prescribed BOOLEAN,
    physical_activity_level TEXT, -- e.g., 'Low', 'Moderate', 'High'
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_patient_log_date UNIQUE (patient_user_id, log_date)
);

CREATE TRIGGER daily_logs_updated_at_trigger
BEFORE UPDATE ON public.daily_logs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.daily_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own daily logs"
ON public.daily_logs FOR ALL
USING (auth.uid() = patient_user_id);
-- Add policy for caregivers if needed

-- Indexes
CREATE INDEX idx_medications_patient_id ON public.medications(patient_user_id);
CREATE INDEX idx_appointments_patient_id ON public.appointments(patient_user_id);
CREATE INDEX idx_appointments_datetime ON public.appointments(appointment_datetime);
CREATE INDEX idx_patient_notes_patient_id ON public.patient_notes(patient_user_id);
CREATE INDEX idx_mood_entries_patient_id ON public.mood_entries(patient_user_id);
CREATE INDEX idx_mood_entries_timestamp ON public.mood_entries(entry_timestamp);
CREATE INDEX idx_daily_logs_patient_id_log_date ON public.daily_logs(patient_user_id, log_date);
