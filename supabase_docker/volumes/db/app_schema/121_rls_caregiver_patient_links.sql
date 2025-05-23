ALTER TABLE public.caregiver_patient_links ENABLE ROW LEVEL SECURITY;

-- Users can select links where they are either the caregiver or the patient
CREATE POLICY "CaregiverPatientLinks_SELECT_own_or_linked" ON public.caregiver_patient_links
  FOR SELECT USING (auth.uid() = caregiver_user_id OR auth.uid() = patient_user_id);

-- Caregivers can insert links for themselves
CREATE POLICY "CaregiverPatientLinks_INSERT_caregiver" ON public.caregiver_patient_links
  FOR INSERT WITH CHECK (public.is_user_role(auth.uid(), 'caregiver') AND auth.uid() = caregiver_user_id);

-- Caregivers/Patients can update links they are part of (e.g., status, permissions by caregiver)
CREATE POLICY "CaregiverPatientLinks_UPDATE_own_or_linked" ON public.caregiver_patient_links
  FOR UPDATE USING (auth.uid() = caregiver_user_id OR auth.uid() = patient_user_id)
  WITH CHECK (auth.uid() = caregiver_user_id OR auth.uid() = patient_user_id); 
  -- Further checks might be needed for who can update what (e.g. only caregiver updates permissions)
  -- For example, a patient might only be allowed to update the status to 'inactive' for their side of the link.
  -- A caregiver might be allowed to update 'permissions' or 'status'.
  -- Example for more granular update (caregiver can update permissions):
  /*
  CREATE POLICY "CaregiverPatientLinks_UPDATE_caregiver_permissions" ON public.caregiver_patient_links
    FOR UPDATE USING (public.is_user_role(auth.uid(), 'caregiver') AND auth.uid() = caregiver_user_id)
    WITH CHECK (public.is_user_role(auth.uid(), 'caregiver') AND auth.uid() = caregiver_user_id AND (NEW.permissions IS DISTINCT FROM OLD.permissions));
  */

-- Users can delete links they are part of (careful with this one - soft delete or status change often preferred)
CREATE POLICY "CaregiverPatientLinks_DELETE_own_or_linked" ON public.caregiver_patient_links
  FOR DELETE USING (auth.uid() = caregiver_user_id OR auth.uid() = patient_user_id);

-- Admins can manage all links (using the helper function)
CREATE POLICY "CaregiverPatientLinks_ADMIN_all_access" ON public.caregiver_patient_links
  FOR ALL USING (public.is_user_role(auth.uid(), 'admin'));
