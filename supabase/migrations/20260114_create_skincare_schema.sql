-- Create skincare_settings table for SMS reminder configuration
CREATE TABLE skincare_settings (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  morning_enabled boolean NOT NULL DEFAULT true,
  morning_message text NOT NULL,
  morning_time time NOT NULL DEFAULT '08:00:00',
  night_enabled boolean NOT NULL DEFAULT true,
  night_time time NOT NULL DEFAULT '22:30:00',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Create night_messages table for rotating night reminder messages
CREATE TABLE night_messages (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create index on night_messages.user_id for query performance
CREATE INDEX idx_night_messages_user_id ON night_messages(user_id);

-- Enable Row Level Security
ALTER TABLE skincare_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE night_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for skincare_settings
CREATE POLICY "Users can view their own skincare settings"
  ON skincare_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own skincare settings"
  ON skincare_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own skincare settings"
  ON skincare_settings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own skincare settings"
  ON skincare_settings FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for night_messages
CREATE POLICY "Users can view their own night messages"
  ON night_messages FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own night messages"
  ON night_messages FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own night messages"
  ON night_messages FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own night messages"
  ON night_messages FOR DELETE
  USING (auth.uid() = user_id);
