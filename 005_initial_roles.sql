-- Ensure this runs after 010_roles_and_profiles.sql creates the roles table
-- However, for initial setup, this should run *before* profiles are created if profiles depend on roles.
-- Given the dependency, this should be placed before 010 or roles table should allow NULL role_id temporarily.
-- For simplicity, we assume this runs after roles table exists and before profiles need it strictly.
-- If 010 creates roles, this script is redundant for those specific roles.
-- The prompt implies this is for *seeding* roles.

-- Seed initial roles if they don't exist.
-- 'system' role was also in 010_roles_and_profiles.sql, including it here for completeness of this script's purpose.
INSERT INTO public.roles (name) VALUES ('patient'), ('caregiver'), ('admin'), ('system')
ON CONFLICT (name) DO NOTHING;
