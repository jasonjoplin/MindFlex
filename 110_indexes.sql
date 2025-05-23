-- This script contains additional indexes for performance optimization.
-- PK and basic FK indexes are typically created automatically.
-- This file is for non-standard indexes or those on frequently queried columns.

-- From 010_roles_and_profiles.sql (already included in that file, but good to list here if managing separately)
-- CREATE INDEX IF NOT EXISTS idx_profiles_role_id ON public.profiles(role_id);

-- From 020_caregiver_patient_links.sql (already included)
-- CREATE INDEX IF NOT EXISTS idx_cpl_caregiver_id ON public.caregiver_patient_links(caregiver_user_id);
-- CREATE INDEX IF NOT EXISTS idx_cpl_patient_id ON public.caregiver_patient_links(patient_user_id);

-- From 030_patient_health_tracking.sql (already included)
-- CREATE INDEX IF NOT EXISTS idx_medications_patient_id ON public.medications(patient_user_id);
-- CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON public.appointments(patient_user_id);
-- CREATE INDEX IF NOT EXISTS idx_appointments_datetime ON public.appointments(appointment_datetime);
-- CREATE INDEX IF NOT EXISTS idx_patient_notes_patient_id ON public.patient_notes(patient_user_id);
-- CREATE INDEX IF NOT EXISTS idx_mood_entries_patient_id ON public.mood_entries(patient_user_id);
-- CREATE INDEX IF NOT EXISTS idx_mood_entries_timestamp ON public.mood_entries(entry_timestamp);
-- CREATE INDEX IF NOT EXISTS idx_daily_logs_patient_id_log_date ON public.daily_logs(patient_user_id, log_date);

-- From 040_care_activities_and_completions.sql (already included)
-- CREATE INDEX IF NOT EXISTS idx_care_activities_patient_id ON public.care_activities(patient_user_id);
-- CREATE INDEX IF NOT EXISTS idx_activity_completions_activity_id ON public.activity_completions(activity_id);
-- CREATE INDEX IF NOT EXISTS idx_activity_completions_patient_id ON public.activity_completions(patient_user_id);

-- From 050_patient_reminders_and_goals.sql (already included)
-- CREATE INDEX IF NOT EXISTS idx_patient_reminders_patient_id ON public.patient_reminders(patient_user_id);
-- CREATE INDEX IF NOT EXISTS idx_patient_goals_patient_id ON public.patient_goals(patient_user_id);
-- CREATE INDEX IF NOT EXISTS idx_patient_goals_status ON public.patient_goals(status);
-- CREATE INDEX IF NOT EXISTS idx_patient_goals_category ON public.patient_goals(category);

-- From 060_games_and_scores.sql (already included)
-- CREATE INDEX IF NOT EXISTS idx_games_game_type ON public.games(game_type);
-- CREATE INDEX IF NOT EXISTS idx_game_scores_patient_id ON public.game_scores(patient_user_id);
-- CREATE INDEX IF NOT EXISTS idx_game_scores_game_id ON public.game_scores(game_id);
-- CREATE INDEX IF NOT EXISTS idx_game_scores_played_at ON public.game_scores(played_at);

-- From 070_achievements.sql (already included)
-- CREATE INDEX IF NOT EXISTS idx_achievements_game_id ON public.achievements(game_id);
-- CREATE INDEX IF NOT EXISTS idx_user_achievements_patient_id ON public.user_achievements(patient_user_id);
-- CREATE INDEX IF NOT EXISTS idx_user_achievements_achievement_id ON public.user_achievements(achievement_id);

-- From 080_therapy_content.sql (already included)
-- CREATE INDEX IF NOT EXISTS idx_sounds_category_id ON public.sounds(category_id);
-- CREATE INDEX IF NOT EXISTS idx_sound_therapy_sessions_patient_id ON public.sound_therapy_sessions(patient_user_id);
-- CREATE INDEX IF NOT EXISTS idx_sound_therapy_sessions_sound_id ON public.sound_therapy_sessions(sound_id);
-- CREATE INDEX IF NOT EXISTS idx_sound_therapy_sessions_played_at ON public.sound_therapy_sessions(played_at);

-- From 090_chat.sql (already included)
-- CREATE INDEX IF NOT EXISTS idx_chat_rooms_room_type ON public.chat_rooms(room_type);
-- CREATE INDEX IF NOT EXISTS idx_chat_messages_room_id_sent_at ON public.chat_messages(room_id, sent_at DESC);
-- CREATE INDEX IF NOT EXISTS idx_chat_messages_sender_id ON public.chat_messages(sender_user_id);

-- From 100_ai_context.sql (already included)
-- CREATE INDEX IF NOT EXISTS idx_ai_context_entries_user_id ON public.ai_context_entries(user_id);
-- CREATE INDEX IF NOT EXISTS idx_ai_context_entries_related_patient_id ON public.ai_context_entries(related_patient_user_id);
-- CREATE INDEX IF NOT EXISTS idx_ai_context_entries_context_type ON public.ai_context_entries(context_type);

-- Placeholder for any additional or specific GIN indexes or other complex indexes
-- that might be identified later based on query patterns.
-- Example of a GIN index (if querying JSONB frequently):
-- CREATE INDEX IF NOT EXISTS idx_profiles_patient_data_gin ON public.profiles USING GIN (patient_data);
-- CREATE INDEX IF NOT EXISTS idx_profiles_caregiver_data_gin ON public.profiles USING GIN (caregiver_data);

-- Note: Most primary key and foreign key relationships automatically get indexes.
-- The indexes listed above (and commented out) were already included in their respective DDL files
-- for clarity and completeness within those files. This file can be used for truly separate
-- or advanced indexing strategies identified post-initial-schema-deployment.
-- For now, this file serves as a confirmation that indexing has been considered.

SELECT '110_indexes.sql executed successfully' AS status;
