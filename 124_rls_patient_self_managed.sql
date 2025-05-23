-- RLS for public.patient_reminders
ALTER TABLE public.patient_reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "PatientReminders_Patient_manage_own" ON public.patient_reminders
  FOR ALL USING (public.is_user_role(auth.uid(), 'patient') AND auth.uid() = patient_user_id)
  WITH CHECK (public.is_user_role(auth.uid(), 'patient') AND auth.uid() = patient_user_id);

CREATE POLICY "PatientReminders_Caregiver_manage_linked_patients" ON public.patient_reminders
  FOR ALL USING (
    public.is_user_role(auth.uid(), 'caregiver') AND
    public.is_active_caregiver_for_patient(auth.uid(), patient_user_id)
  )
  WITH CHECK (
    public.is_user_role(auth.uid(), 'caregiver') AND
    public.is_active_caregiver_for_patient(auth.uid(), patient_user_id)
  );

CREATE POLICY "PatientReminders_ADMIN_all_access" ON public.patient_reminders
  FOR ALL USING (public.is_user_role(auth.uid(), 'admin'));

-- RLS for public.patient_goals
ALTER TABLE public.patient_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "PatientGoals_Patient_manage_own" ON public.patient_goals
  FOR ALL USING (public.is_user_role(auth.uid(), 'patient') AND auth.uid() = patient_user_id)
  WITH CHECK (public.is_user_role(auth.uid(), 'patient') AND auth.uid() = patient_user_id);

CREATE POLICY "PatientGoals_Caregiver_manage_linked_patients" ON public.patient_goals
  FOR ALL USING (
    public.is_user_role(auth.uid(), 'caregiver') AND
    public.is_active_caregiver_for_patient(auth.uid(), patient_user_id)
  )
  WITH CHECK (
    public.is_user_role(auth.uid(), 'caregiver') AND
    public.is_active_caregiver_for_patient(auth.uid(), patient_user_id)
  );

CREATE POLICY "PatientGoals_ADMIN_all_access" ON public.patient_goals
  FOR ALL USING (public.is_user_role(auth.uid(), 'admin'));
