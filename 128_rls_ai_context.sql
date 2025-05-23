-- RLS for public.ai_context_entries
ALTER TABLE public.ai_context_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "AIContext_Patient_manage_own" ON public.ai_context_entries
  FOR ALL USING (public.is_user_role(auth.uid(), 'patient') AND auth.uid() = user_id)
  WITH CHECK (public.is_user_role(auth.uid(), 'patient') AND auth.uid() = user_id);

CREATE POLICY "AIContext_Caregiver_manage_own_or_linked_patients" ON public.ai_context_entries
  FOR ALL USING (
    public.is_user_role(auth.uid(), 'caregiver') AND
    (auth.uid() = user_id OR public.is_active_caregiver_for_patient(auth.uid(), related_patient_user_id))
  )
  WITH CHECK (
    public.is_user_role(auth.uid(), 'caregiver') AND
    (auth.uid() = user_id OR public.is_active_caregiver_for_patient(auth.uid(), related_patient_user_id))
  );

CREATE POLICY "AIContext_ADMIN_all_access" ON public.ai_context_entries
  FOR ALL USING (public.is_user_role(auth.uid(), 'admin'));
