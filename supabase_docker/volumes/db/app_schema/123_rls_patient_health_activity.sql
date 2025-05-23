-- RLS for public.appointments
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Appointments_Patient_manage_own" ON public.appointments
  FOR ALL USING (public.is_user_role(auth.uid(), 'patient') AND auth.uid() = patient_user_id)
  WITH CHECK (public.is_user_role(auth.uid(), 'patient') AND auth.uid() = patient_user_id);

CREATE POLICY "Appointments_Caregiver_manage_linked_patients" ON public.appointments
  FOR ALL USING (
    public.is_user_role(auth.uid(), 'caregiver') AND
    (auth.uid() = scheduled_by_user_id OR public.is_active_caregiver_for_patient(auth.uid(), patient_user_id))
  )
  WITH CHECK (
    public.is_user_role(auth.uid(), 'caregiver') AND
    (auth.uid() = scheduled_by_user_id OR public.is_active_caregiver_for_patient(auth.uid(), patient_user_id))
  );

CREATE POLICY "Appointments_ADMIN_all_access" ON public.appointments
  FOR ALL USING (public.is_user_role(auth.uid(), 'admin'));

-- RLS for public.patient_notes
ALTER TABLE public.patient_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "PatientNotes_Patient_manage_own_or_authored" ON public.patient_notes
  FOR ALL USING (public.is_user_role(auth.uid(), 'patient') AND (auth.uid() = patient_user_id OR auth.uid() = author_user_id))
  WITH CHECK (public.is_user_role(auth.uid(), 'patient') AND (auth.uid() = patient_user_id OR auth.uid() = author_user_id));

CREATE POLICY "PatientNotes_Caregiver_manage_linked_patients_or_authored" ON public.patient_notes
  FOR ALL USING (
    public.is_user_role(auth.uid(), 'caregiver') AND
    (auth.uid() = author_user_id OR public.is_active_caregiver_for_patient(auth.uid(), patient_user_id))
  )
  WITH CHECK (
    public.is_user_role(auth.uid(), 'caregiver') AND
    (auth.uid() = author_user_id OR public.is_active_caregiver_for_patient(auth.uid(), patient_user_id))
  );

CREATE POLICY "PatientNotes_ADMIN_all_access" ON public.patient_notes
  FOR ALL USING (public.is_user_role(auth.uid(), 'admin'));

-- RLS for public.mood_entries
ALTER TABLE public.mood_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "MoodEntries_Patient_manage_own_or_logged" ON public.mood_entries
  FOR ALL USING (public.is_user_role(auth.uid(), 'patient') AND (auth.uid() = patient_user_id OR auth.uid() = logged_by_user_id))
  WITH CHECK (public.is_user_role(auth.uid(), 'patient') AND (auth.uid() = patient_user_id OR auth.uid() = logged_by_user_id));

CREATE POLICY "MoodEntries_Caregiver_manage_linked_patients_or_logged" ON public.mood_entries
  FOR ALL USING (
    public.is_user_role(auth.uid(), 'caregiver') AND
    (auth.uid() = logged_by_user_id OR public.is_active_caregiver_for_patient(auth.uid(), patient_user_id))
  )
  WITH CHECK (
    public.is_user_role(auth.uid(), 'caregiver') AND
    (auth.uid() = logged_by_user_id OR public.is_active_caregiver_for_patient(auth.uid(), patient_user_id))
  );

CREATE POLICY "MoodEntries_ADMIN_all_access" ON public.mood_entries
  FOR ALL USING (public.is_user_role(auth.uid(), 'admin'));

-- RLS for public.daily_logs
ALTER TABLE public.daily_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "DailyLogs_Patient_manage_own" ON public.daily_logs
  FOR ALL USING (public.is_user_role(auth.uid(), 'patient') AND auth.uid() = patient_user_id)
  WITH CHECK (public.is_user_role(auth.uid(), 'patient') AND auth.uid() = patient_user_id);

CREATE POLICY "DailyLogs_Caregiver_manage_linked_patients" ON public.daily_logs
  FOR ALL USING (
    public.is_user_role(auth.uid(), 'caregiver') AND
    public.is_active_caregiver_for_patient(auth.uid(), patient_user_id)
  )
  WITH CHECK (
    public.is_user_role(auth.uid(), 'caregiver') AND
    public.is_active_caregiver_for_patient(auth.uid(), patient_user_id)
  );

CREATE POLICY "DailyLogs_ADMIN_all_access" ON public.daily_logs
  FOR ALL USING (public.is_user_role(auth.uid(), 'admin'));

-- RLS for public.care_activities
ALTER TABLE public.care_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "CareActivities_Patient_manage_own_or_assigned" ON public.care_activities
  FOR ALL USING (public.is_user_role(auth.uid(), 'patient') AND (auth.uid() = patient_user_id OR auth.uid() = assigned_by_user_id))
  WITH CHECK (public.is_user_role(auth.uid(), 'patient') AND (auth.uid() = patient_user_id OR auth.uid() = assigned_by_user_id));

CREATE POLICY "CareActivities_Caregiver_manage_linked_patients_or_assigned" ON public.care_activities
  FOR ALL USING (
    public.is_user_role(auth.uid(), 'caregiver') AND
    (auth.uid() = assigned_by_user_id OR public.is_active_caregiver_for_patient(auth.uid(), patient_user_id))
  )
  WITH CHECK (
    public.is_user_role(auth.uid(), 'caregiver') AND
    (auth.uid() = assigned_by_user_id OR public.is_active_caregiver_for_patient(auth.uid(), patient_user_id))
  );

CREATE POLICY "CareActivities_ADMIN_all_access" ON public.care_activities
  FOR ALL USING (public.is_user_role(auth.uid(), 'admin'));

-- RLS for public.activity_completions
ALTER TABLE public.activity_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ActivityCompletions_Patient_manage_own" ON public.activity_completions
  FOR ALL USING (public.is_user_role(auth.uid(), 'patient') AND auth.uid() = patient_user_id)
  WITH CHECK (public.is_user_role(auth.uid(), 'patient') AND auth.uid() = patient_user_id);

CREATE POLICY "ActivityCompletions_Caregiver_manage_linked_patients" ON public.activity_completions
  FOR ALL USING (
    public.is_user_role(auth.uid(), 'caregiver') AND
    public.is_active_caregiver_for_patient(auth.uid(), patient_user_id)
  )
  WITH CHECK (
    public.is_user_role(auth.uid(), 'caregiver') AND
    public.is_active_caregiver_for_patient(auth.uid(), patient_user_id)
  );

CREATE POLICY "ActivityCompletions_ADMIN_all_access" ON public.activity_completions
  FOR ALL USING (public.is_user_role(auth.uid(), 'admin'));
