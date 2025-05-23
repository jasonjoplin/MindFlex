-- Seed initial roles if they don't exist.
-- 'system' role was also in 010_roles_and_profiles.sql, including it here for completeness of this script's purpose.
INSERT INTO public.roles (name) VALUES ('patient'), ('caregiver'), ('admin'), ('system')
ON CONFLICT (name) DO NOTHING;
