-- Skincare Routine Schema
-- Stores weekly skincare routines with morning and night steps for each day

CREATE TABLE IF NOT EXISTS skincare_routines (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  day_of_week int NOT NULL CHECK (day_of_week BETWEEN 1 AND 7), -- 1=Monday, 7=Sunday (ISO 8601)
  time_of_day text NOT NULL CHECK (time_of_day IN ('morning', 'night')),
  steps jsonb NOT NULL DEFAULT '[]'::jsonb, -- Array of step objects: [{"order": 1, "text": "Cleanser", "id": "uuid"}]
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, day_of_week, time_of_day) -- One routine per user per day per time
);

-- Index for efficient queries by user and day
CREATE INDEX idx_skincare_routines_user_day ON skincare_routines(user_id, day_of_week);

-- Enable Row Level Security
ALTER TABLE skincare_routines ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own routines
CREATE POLICY "Users can view their own routines"
  ON skincare_routines FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own routines"
  ON skincare_routines FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own routines"
  ON skincare_routines FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own routines"
  ON skincare_routines FOR DELETE
  USING (auth.uid() = user_id);
