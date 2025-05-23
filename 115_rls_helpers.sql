-- Helper function to check a user's role
CREATE OR REPLACE FUNCTION public.get_user_role_name(p_user_id UUID)
RETURNS TEXT AS $$
BEGIN
  RETURN (SELECT r.name FROM public.profiles pr JOIN public.roles r ON pr.role_id = r.id WHERE pr.user_id = p_user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if a user has a specific role
CREATE OR REPLACE FUNCTION public.is_user_role(p_user_id UUID, p_role_name TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM public.profiles pr JOIN public.roles r ON pr.role_id = r.id WHERE pr.user_id = p_user_id AND r.name = p_role_name);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if a user is an active caregiver for a specific patient
CREATE OR REPLACE FUNCTION public.is_active_caregiver_for_patient(p_caregiver_user_id UUID, p_patient_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.caregiver_patient_links cpl
    WHERE cpl.caregiver_user_id = p_caregiver_user_id
      AND cpl.patient_user_id = p_patient_user_id
      AND cpl.status = 'active'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Example of a more granular permission check (can be expanded)
-- This assumes 'permissions' is a JSONB field in caregiver_patient_links like {"can_edit_medications": true}
CREATE OR REPLACE FUNCTION public.can_caregiver_perform_action(p_caregiver_user_id UUID, p_patient_user_id UUID, p_action_permission TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  link_permissions JSONB;
BEGIN
  SELECT permissions INTO link_permissions FROM public.caregiver_patient_links cpl
  WHERE cpl.caregiver_user_id = p_caregiver_user_id
    AND cpl.patient_user_id = p_patient_user_id
    AND cpl.status = 'active';

  IF link_permissions IS NULL THEN
    RETURN FALSE; -- No link or no permissions set
  END IF;

  RETURN (link_permissions->>p_action_permission)::BOOLEAN = TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
