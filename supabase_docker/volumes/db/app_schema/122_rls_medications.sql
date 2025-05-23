ALTER TABLE public.medications ENABLE ROW LEVEL SECURITY;

-- Patients can manage their own medications
CREATE POLICY "Medications_Patient_manage_own" ON public.medications
  FOR ALL USING (public.is_user_role(auth.uid(), 'patient') AND auth.uid() = patient_user_id)
  WITH CHECK (public.is_user_role(auth.uid(), 'patient') AND auth.uid() = patient_user_id);

-- Active caregivers can manage medications for their linked patients
-- (Using can_caregiver_perform_action would be better if we had granular permissions like 'can_edit_medications')
CREATE POLICY "Medications_Caregiver_manage_linked_patients" ON public.medications
  FOR ALL USING (
    public.is_user_role(auth.uid(), 'caregiver') AND
    public.is_active_caregiver_for_patient(auth.uid(), patient_user_id)
    -- AND public.can_caregiver_perform_action(auth.uid(), patient_user_id, 'manage_medications') -- Example for finer control
  )
  WITH CHECK (
    public.is_user_role(auth.uid(), 'caregiver') AND
    public.is_active_caregiver_for_patient(auth.uid(), patient_user_id)
    -- AND public.can_caregiver_perform_action(auth.uid(), patient_user_id, 'manage_medications')
  );

-- Admins can manage all medications (using the helper function)
CREATE POLICY "Medications_ADMIN_all_access" ON public.medications
  FOR ALL USING (public.is_user_role(auth.uid(), 'admin'));
