-- RLS for public.chat_rooms
ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ChatRooms_SELECT_participant" ON public.chat_rooms
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.chat_room_participants crp
    WHERE crp.room_id = public.chat_rooms.id AND crp.user_id = auth.uid()
  ));

CREATE POLICY "ChatRooms_INSERT_authenticated" ON public.chat_rooms
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "ChatRooms_UPDATE_creator_or_admin" ON public.chat_rooms
  FOR UPDATE USING (auth.uid() = created_by_user_id OR public.is_user_role(auth.uid(), 'admin'))
  WITH CHECK (auth.uid() = created_by_user_id OR public.is_user_role(auth.uid(), 'admin'));

CREATE POLICY "ChatRooms_DELETE_creator_or_admin" ON public.chat_rooms
  FOR DELETE USING (auth.uid() = created_by_user_id OR public.is_user_role(auth.uid(), 'admin'));

-- RLS for public.chat_room_participants
ALTER TABLE public.chat_room_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ChatRoomParticipants_SELECT_own_or_admin" ON public.chat_room_participants
  FOR SELECT USING (auth.uid() = user_id OR public.is_user_role(auth.uid(), 'admin'));

CREATE POLICY "ChatRoomParticipants_INSERT_self_or_admin" ON public.chat_room_participants
  FOR INSERT WITH CHECK (auth.uid() = user_id OR public.is_user_role(auth.uid(), 'admin'));
  -- More complex logic for adding others to a room would typically be handled by a SECURITY DEFINER function.

CREATE POLICY "ChatRoomParticipants_DELETE_self_or_admin" ON public.chat_room_participants
  FOR DELETE USING (auth.uid() = user_id OR public.is_user_role(auth.uid(), 'admin'));
  -- Similar to INSERT, removing others would typically be handled by a function.

-- RLS for public.chat_messages
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ChatMessages_SELECT_participant" ON public.chat_messages
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.chat_room_participants crp
    WHERE crp.room_id = public.chat_messages.room_id AND crp.user_id = auth.uid()
  ));

CREATE POLICY "ChatMessages_INSERT_participant_sender" ON public.chat_messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_user_id AND
    EXISTS (
        SELECT 1 FROM public.chat_room_participants crp
        WHERE crp.room_id = public.chat_messages.room_id AND crp.user_id = auth.uid()
    )
  );

CREATE POLICY "ChatMessages_UPDATE_sender_or_admin" ON public.chat_messages
  FOR UPDATE USING (auth.uid() = sender_user_id OR public.is_user_role(auth.uid(), 'admin'))
  WITH CHECK (auth.uid() = sender_user_id OR public.is_user_role(auth.uid(), 'admin'));

CREATE POLICY "ChatMessages_DELETE_sender_or_admin" ON public.chat_messages
  FOR DELETE USING (auth.uid() = sender_user_id OR public.is_user_role(auth.uid(), 'admin'));
