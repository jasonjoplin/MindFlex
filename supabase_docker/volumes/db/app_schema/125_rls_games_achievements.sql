-- RLS for public.games
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Games_SELECT_authenticated_users" ON public.games
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Games_INSERT_admin_only" ON public.games
  FOR INSERT WITH CHECK (public.is_user_role(auth.uid(), 'admin'));

CREATE POLICY "Games_UPDATE_admin_only" ON public.games
  FOR UPDATE USING (public.is_user_role(auth.uid(), 'admin'))
  WITH CHECK (public.is_user_role(auth.uid(), 'admin'));

CREATE POLICY "Games_DELETE_admin_only" ON public.games
  FOR DELETE USING (public.is_user_role(auth.uid(), 'admin'));

-- RLS for public.game_scores
ALTER TABLE public.game_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "GameScores_Patient_manage_own" ON public.game_scores
  FOR ALL USING (public.is_user_role(auth.uid(), 'patient') AND auth.uid() = patient_user_id)
  WITH CHECK (public.is_user_role(auth.uid(), 'patient') AND auth.uid() = patient_user_id);

CREATE POLICY "GameScores_Caregiver_manage_linked_patients" ON public.game_scores
  FOR ALL USING (
    public.is_user_role(auth.uid(), 'caregiver') AND
    public.is_active_caregiver_for_patient(auth.uid(), patient_user_id)
  )
  WITH CHECK (
    public.is_user_role(auth.uid(), 'caregiver') AND
    public.is_active_caregiver_for_patient(auth.uid(), patient_user_id)
  );

CREATE POLICY "GameScores_ADMIN_all_access" ON public.game_scores
  FOR ALL USING (public.is_user_role(auth.uid(), 'admin'));

-- RLS for public.achievements
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Achievements_SELECT_authenticated_users" ON public.achievements
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Achievements_INSERT_admin_only" ON public.achievements
  FOR INSERT WITH CHECK (public.is_user_role(auth.uid(), 'admin'));

CREATE POLICY "Achievements_UPDATE_admin_only" ON public.achievements
  FOR UPDATE USING (public.is_user_role(auth.uid(), 'admin'))
  WITH CHECK (public.is_user_role(auth.uid(), 'admin'));

CREATE POLICY "Achievements_DELETE_admin_only" ON public.achievements
  FOR DELETE USING (public.is_user_role(auth.uid(), 'admin'));

-- RLS for public.user_achievements
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "UserAchievements_Patient_manage_own" ON public.user_achievements
  FOR ALL USING (public.is_user_role(auth.uid(), 'patient') AND auth.uid() = patient_user_id)
  WITH CHECK (public.is_user_role(auth.uid(), 'patient') AND auth.uid() = patient_user_id);
  -- Note: INSERT might be handled by a trigger or function based on game/score events rather than direct user insert.
  -- DELETE might not be allowed for users to preserve history.

CREATE POLICY "UserAchievements_Caregiver_view_linked_patients" ON public.user_achievements
  FOR SELECT USING (
    public.is_user_role(auth.uid(), 'caregiver') AND
    public.is_active_caregiver_for_patient(auth.uid(), patient_user_id)
  );

CREATE POLICY "UserAchievements_ADMIN_all_access" ON public.user_achievements
  FOR ALL USING (public.is_user_role(auth.uid(), 'admin'));
