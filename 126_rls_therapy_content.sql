-- RLS for public.sound_categories
ALTER TABLE public.sound_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "SoundCategories_SELECT_authenticated_users" ON public.sound_categories
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "SoundCategories_INSERT_admin_only" ON public.sound_categories
  FOR INSERT WITH CHECK (public.is_user_role(auth.uid(), 'admin'));

CREATE POLICY "SoundCategories_UPDATE_admin_only" ON public.sound_categories
  FOR UPDATE USING (public.is_user_role(auth.uid(), 'admin'))
  WITH CHECK (public.is_user_role(auth.uid(), 'admin'));

CREATE POLICY "SoundCategories_DELETE_admin_only" ON public.sound_categories
  FOR DELETE USING (public.is_user_role(auth.uid(), 'admin'));

-- RLS for public.sounds
ALTER TABLE public.sounds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sounds_SELECT_authenticated_users" ON public.sounds
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Sounds_INSERT_admin_only" ON public.sounds
  FOR INSERT WITH CHECK (public.is_user_role(auth.uid(), 'admin'));

CREATE POLICY "Sounds_UPDATE_admin_only" ON public.sounds
  FOR UPDATE USING (public.is_user_role(auth.uid(), 'admin'))
  WITH CHECK (public.is_user_role(auth.uid(), 'admin'));

CREATE POLICY "Sounds_DELETE_admin_only" ON public.sounds
  FOR DELETE USING (public.is_user_role(auth.uid(), 'admin'));

-- RLS for public.sound_therapy_sessions
ALTER TABLE public.sound_therapy_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "SoundTherapySessions_Patient_manage_own" ON public.sound_therapy_sessions
  FOR ALL USING (public.is_user_role(auth.uid(), 'patient') AND auth.uid() = patient_user_id)
  WITH CHECK (public.is_user_role(auth.uid(), 'patient') AND auth.uid() = patient_user_id);

CREATE POLICY "SoundTherapySessions_Caregiver_manage_linked_patients" ON public.sound_therapy_sessions
  FOR ALL USING (
    public.is_user_role(auth.uid(), 'caregiver') AND
    public.is_active_caregiver_for_patient(auth.uid(), patient_user_id)
  )
  WITH CHECK (
    public.is_user_role(auth.uid(), 'caregiver') AND
    public.is_active_caregiver_for_patient(auth.uid(), patient_user_id)
  );

CREATE POLICY "SoundTherapySessions_ADMIN_all_access" ON public.sound_therapy_sessions
  FOR ALL USING (public.is_user_role(auth.uid(), 'admin'));
