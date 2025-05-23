-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table for linking caregivers to patients
CREATE TABLE public.caregiver_patient_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    caregiver_user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE RESTRICT,
    patient_user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE RESTRICT,
    relationship_type TEXT, -- e.g., 'Family Member', 'Professional Caregiver', 'Guardian'
    status TEXT DEFAULT 'pending', -- e.g., 'pending', 'active', 'inactive', 'revoked'
    permissions JSONB, -- e.g., {"can_view_medications": true, "can_edit_care_plan": false}
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_caregiver_patient_link UNIQUE (caregiver_user_id, patient_user_id)
);

-- Function to automatically update 'updated_at' timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update 'updated_at' on link changes
CREATE TRIGGER caregiver_patient_links_updated_at_trigger
BEFORE UPDATE ON public.caregiver_patient_links
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- RLS Policies for caregiver_patient_links
ALTER TABLE public.caregiver_patient_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view links they are part of"
ON public.caregiver_patient_links FOR SELECT
USING (auth.uid() = caregiver_user_id OR auth.uid() = patient_user_id);

CREATE POLICY "Caregivers can create links for themselves"
ON public.caregiver_patient_links FOR INSERT
WITH CHECK (auth.uid() = caregiver_user_id);

CREATE POLICY "Users can update links they are part of"
ON public.caregiver_patient_links FOR UPDATE
USING (auth.uid() = caregiver_user_id OR auth.uid() = patient_user_id)
WITH CHECK (auth.uid() = caregiver_user_id OR auth.uid() = patient_user_id);

-- Indexes for faster lookups
CREATE INDEX idx_cpl_caregiver_id ON public.caregiver_patient_links(caregiver_user_id);
CREATE INDEX idx_cpl_patient_id ON public.caregiver_patient_links(patient_user_id);
