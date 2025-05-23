-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Function to automatically update 'updated_at' timestamp (if not already created)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Table for Chat Rooms
CREATE TABLE public.chat_rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT, -- e.g., "Caregiver Support Group", "Patient-Caregiver for John Doe"
    room_type TEXT NOT NULL, -- e.g., 'group', 'direct_message_patient_caregiver', 'direct_message_user'
    created_by_user_id UUID REFERENCES public.profiles(user_id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER chat_rooms_updated_at_trigger
BEFORE UPDATE ON public.chat_rooms
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;
-- RLS: Users can see rooms they are participants in.
CREATE POLICY "Users can access chat rooms they are part of"
ON public.chat_rooms FOR SELECT
USING (EXISTS (
    SELECT 1 FROM public.chat_room_participants crp
    WHERE crp.room_id = public.chat_rooms.id AND crp.user_id = auth.uid()
));
-- RLS: Users can create rooms.
CREATE POLICY "Authenticated users can create chat rooms"
ON public.chat_rooms FOR INSERT
WITH CHECK (auth.role() = 'authenticated');
-- RLS: Room creator can update room details.
CREATE POLICY "Room creators can update their rooms"
ON public.chat_rooms FOR UPDATE
USING (auth.uid() = created_by_user_id)
WITH CHECK (auth.uid() = created_by_user_id);


-- Table for Chat Room Participants
CREATE TABLE public.chat_room_participants (
    room_id UUID NOT NULL REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    last_read_at TIMESTAMPTZ,
    PRIMARY KEY (room_id, user_id)
);

ALTER TABLE public.chat_room_participants ENABLE ROW LEVEL SECURITY;
-- RLS: Users can see their own participation record.
CREATE POLICY "Users can view their own participation"
ON public.chat_room_participants FOR SELECT
USING (auth.uid() = user_id);
-- RLS: Users can join rooms (application logic will handle invitations/direct add).
CREATE POLICY "Users can insert their own participation record"
ON public.chat_room_participants FOR INSERT
WITH CHECK (auth.uid() = user_id);
-- RLS: Users can update their own last_read_at.
CREATE POLICY "Users can update their own last_read_at"
ON public.chat_room_participants FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);


-- Table for Chat Messages
CREATE TABLE public.chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID NOT NULL REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
    sender_user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE RESTRICT, -- Keep message even if sender profile is deleted
    content_type TEXT NOT NULL DEFAULT 'text', -- e.g., 'text', 'image_url', 'file_url'
    content_text TEXT,
    content_url TEXT, -- For images, files, etc.
    sent_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB -- e.g., read_receipts, reactions, edits
);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
-- RLS: Users can see messages in rooms they are participants in.
CREATE POLICY "Participants can view messages in their rooms"
ON public.chat_messages FOR SELECT
USING (EXISTS (
    SELECT 1 FROM public.chat_room_participants crp
    WHERE crp.room_id = public.chat_messages.room_id AND crp.user_id = auth.uid()
));
-- RLS: Users can send messages in rooms they are participants in.
CREATE POLICY "Participants can send messages in their rooms"
ON public.chat_messages FOR INSERT
WITH CHECK (EXISTS (
    SELECT 1 FROM public.chat_room_participants crp
    WHERE crp.room_id = public.chat_messages.room_id AND crp.user_id = auth.uid() AND crp.user_id = sender_user_id
));
-- RLS: Senders can edit/delete their own messages (consider time limits or soft delete in app logic).
CREATE POLICY "Senders can edit/delete their own messages"
ON public.chat_messages FOR UPDATE -- Or DELETE
USING (auth.uid() = sender_user_id)
WITH CHECK (auth.uid() = sender_user_id);


-- Indexes
CREATE INDEX idx_chat_rooms_room_type ON public.chat_rooms(room_type);
CREATE INDEX idx_chat_messages_room_id_sent_at ON public.chat_messages(room_id, sent_at DESC);
CREATE INDEX idx_chat_messages_sender_id ON public.chat_messages(sender_user_id);
