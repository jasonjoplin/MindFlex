ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile
CREATE POLICY "Profiles_SELECT_own" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

-- Users can update their own profile
CREATE POLICY "Profiles_UPDATE_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Caregivers can view profiles of their linked patients
CREATE POLICY "Profiles_SELECT_caregivers_linked_patients" ON public.profiles
  FOR SELECT USING (
    public.is_user_role(auth.uid(), 'caregiver') AND
    public.is_active_caregiver_for_patient(auth.uid(), user_id)
  );

-- Patients can view profiles of their linked caregivers (basic read)
CREATE POLICY "Profiles_SELECT_patients_linked_caregivers" ON public.profiles
  FOR SELECT USING (
    public.is_user_role(auth.uid(), 'patient') AND
    EXISTS (
        SELECT 1 FROM public.caregiver_patient_links cpl
        WHERE cpl.patient_user_id = auth.uid()
          AND cpl.caregiver_user_id = user_id -- Here user_id is the caregiver's user_id from profiles table
          AND cpl.status = 'active'
    )
  );

-- Admins can view all profiles (using the helper function)
CREATE POLICY "Profiles_SELECT_admin_all_access" ON public.profiles
  FOR SELECT USING (public.is_user_role(auth.uid(), 'admin'));

-- Admins can update all profiles (using the helper function)
CREATE POLICY "Profiles_UPDATE_admin_all_access" ON public.profiles
  FOR UPDATE USING (public.is_user_role(auth.uid(), 'admin'))
  WITH CHECK (public.is_user_role(auth.uid(), 'admin'));

-- Note: The prompt mentioned "It's often better to grant bypassrls to admin role directly".
-- For now, explicit policies are created as per the structure,
-- but for a real system, granting BYPASSRLS to the 'admin' role might be more efficient
-- ALTER ROLE admin BYPASSRLS; -- This would be run by a superuser directly in PSQL.
-- Or, if 'admin' is a group role that users are members of:
-- ALTER ROLE your_admin_user_role BYPASSRLS;
-- The current policies provide a more granular, table-specific RLS approach if BYPASSRLS is not used.
