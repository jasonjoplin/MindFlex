-- Conversations table to store chat history
CREATE TABLE caregiver_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  caregiver_id UUID REFERENCES auth.users NOT NULL,
  patient_id UUID REFERENCES patients,
  title TEXT NOT NULL DEFAULT 'Untitled Conversation',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages table to store individual messages
CREATE TABLE conversation_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES caregiver_conversations ON DELETE CASCADE,
  sender TEXT NOT NULL CHECK (sender IN ('user', 'assistant')),
  message TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX conversation_messages_conversation_id_idx ON conversation_messages(conversation_id);
CREATE INDEX caregiver_conversations_caregiver_id_idx ON caregiver_conversations(caregiver_id);
CREATE INDEX caregiver_conversations_patient_id_idx ON caregiver_conversations(patient_id);

-- RLS (Row Level Security) policies to ensure caregivers can only access their own conversations
ALTER TABLE caregiver_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_messages ENABLE ROW LEVEL SECURITY;

-- Caregiver can only see their own conversations
CREATE POLICY caregiver_conversations_policy ON caregiver_conversations
  FOR ALL USING (caregiver_id = auth.uid());
  
-- Messages are visible if the user has access to the parent conversation
CREATE POLICY conversation_messages_policy ON conversation_messages
  FOR ALL USING (
    conversation_id IN (
      SELECT id FROM caregiver_conversations WHERE caregiver_id = auth.uid()
    )
  );

-- Create caregiver-patient relationship table
CREATE TABLE caregiver_patient_relationships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  caregiver_id UUID REFERENCES auth.users NOT NULL,
  patient_id UUID REFERENCES patients NOT NULL,
  relationship_type TEXT NOT NULL, -- primary, secondary, family, professional, etc.
  can_view_medical BOOLEAN DEFAULT true,
  can_edit_medical BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(caregiver_id, patient_id)
);

-- Create index for better query performance
CREATE INDEX caregiver_patient_rel_caregiver_idx ON caregiver_patient_relationships(caregiver_id);
CREATE INDEX caregiver_patient_rel_patient_idx ON caregiver_patient_relationships(patient_id);

-- Enable RLS for the relationships table
ALTER TABLE caregiver_patient_relationships ENABLE ROW LEVEL SECURITY;

-- Caregivers can only see their own relationships
CREATE POLICY caregiver_relationships_policy ON caregiver_patient_relationships
  FOR ALL USING (caregiver_id = auth.uid());

-- Context table to store information about patients that can be used by the AI
CREATE TABLE patient_context (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES patients NOT NULL,
  context_type TEXT NOT NULL,  -- medication, behavior, preference, etc.
  context_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX patient_context_patient_id_idx ON patient_context(patient_id);

-- RLS for patient context
ALTER TABLE patient_context ENABLE ROW LEVEL SECURITY;

-- Caregivers can only access context for patients they care for
CREATE POLICY patient_context_policy ON patient_context
  FOR ALL USING (
    patient_id IN (
      SELECT patient_id FROM caregiver_patient_relationships 
      WHERE caregiver_id = auth.uid()
    )
  ); 