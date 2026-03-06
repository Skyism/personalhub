-- Create wants_trips table
CREATE TABLE wants_trips (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id uuid NOT NULL,
  wants_budget_id bigint NOT NULL REFERENCES wants_budgets(id) ON DELETE CASCADE,
  name text NOT NULL,
  destination text,
  start_date date NOT NULL,
  end_date date NOT NULL,
  budget_amount numeric(10,2) NOT NULL CHECK (budget_amount > 0),
  status text NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'active', 'completed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create wants_trip_transactions table
CREATE TABLE wants_trip_transactions (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id uuid NOT NULL,
  trip_id bigint NOT NULL REFERENCES wants_trips(id) ON DELETE CASCADE,
  wants_budget_id bigint NOT NULL REFERENCES wants_budgets(id) ON DELETE CASCADE,
  amount numeric(10,2) NOT NULL,
  note text,
  transaction_date date DEFAULT CURRENT_DATE,
  source text NOT NULL DEFAULT 'manual' CHECK (source IN ('manual', 'sms')),
  twilio_message_id text UNIQUE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for wants_trips
CREATE INDEX idx_wants_trips_user_id ON wants_trips(user_id);
CREATE INDEX idx_wants_trips_user_status ON wants_trips(user_id, status);

-- Partial unique index: only one active trip per user
CREATE UNIQUE INDEX idx_wants_trips_one_active ON wants_trips(user_id) WHERE status = 'active';

-- Create indexes for wants_trip_transactions
CREATE INDEX idx_wants_trip_transactions_user_trip ON wants_trip_transactions(user_id, trip_id);
CREATE INDEX idx_wants_trip_transactions_user_budget ON wants_trip_transactions(user_id, wants_budget_id);
CREATE INDEX idx_wants_trip_transactions_date ON wants_trip_transactions(transaction_date);
CREATE INDEX idx_wants_trip_transactions_twilio ON wants_trip_transactions(twilio_message_id) WHERE twilio_message_id IS NOT NULL;

-- Enable Row Level Security
ALTER TABLE wants_trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE wants_trip_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for wants_trips table
CREATE POLICY "Users can view their own trips"
  ON wants_trips FOR SELECT
  USING (user_id = '00000000-0000-0000-0000-000000000000'::uuid);

CREATE POLICY "Users can create their own trips"
  ON wants_trips FOR INSERT
  WITH CHECK (user_id = '00000000-0000-0000-0000-000000000000'::uuid);

CREATE POLICY "Users can update their own trips"
  ON wants_trips FOR UPDATE
  USING (user_id = '00000000-0000-0000-0000-000000000000'::uuid)
  WITH CHECK (user_id = '00000000-0000-0000-0000-000000000000'::uuid);

CREATE POLICY "Users can delete their own trips"
  ON wants_trips FOR DELETE
  USING (user_id = '00000000-0000-0000-0000-000000000000'::uuid);

-- RLS Policies for wants_trip_transactions table
CREATE POLICY "Users can view their own trip transactions"
  ON wants_trip_transactions FOR SELECT
  USING (user_id = '00000000-0000-0000-0000-000000000000'::uuid);

CREATE POLICY "Users can create their own trip transactions"
  ON wants_trip_transactions FOR INSERT
  WITH CHECK (user_id = '00000000-0000-0000-0000-000000000000'::uuid);

CREATE POLICY "Users can update their own trip transactions"
  ON wants_trip_transactions FOR UPDATE
  USING (user_id = '00000000-0000-0000-0000-000000000000'::uuid)
  WITH CHECK (user_id = '00000000-0000-0000-0000-000000000000'::uuid);

CREATE POLICY "Users can delete their own trip transactions"
  ON wants_trip_transactions FOR DELETE
  USING (user_id = '00000000-0000-0000-0000-000000000000'::uuid);
