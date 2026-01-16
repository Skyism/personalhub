-- Create wants_budgets table
CREATE TABLE wants_budgets (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id uuid NOT NULL,
  period_start date NOT NULL,
  period_end date NOT NULL,
  total_amount numeric(10,2) NOT NULL CHECK (total_amount > 0),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, period_start)
);

-- Create wants_transactions table
CREATE TABLE wants_transactions (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id uuid NOT NULL,
  wants_budget_id bigint NOT NULL REFERENCES wants_budgets(id) ON DELETE CASCADE,
  amount numeric(10,2) NOT NULL,
  note text,
  transaction_date date DEFAULT CURRENT_DATE,
  source text NOT NULL DEFAULT 'manual' CHECK (source IN ('manual', 'sms')),
  twilio_message_id text UNIQUE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_wants_budgets_user_id ON wants_budgets(user_id);
CREATE INDEX idx_wants_transactions_user_budget ON wants_transactions(user_id, wants_budget_id);
CREATE INDEX idx_wants_transactions_date ON wants_transactions(transaction_date);
CREATE INDEX idx_wants_transactions_twilio ON wants_transactions(twilio_message_id) WHERE twilio_message_id IS NOT NULL;

-- Enable Row Level Security
ALTER TABLE wants_budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE wants_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for wants_budgets table
CREATE POLICY "Users can view their own wants budgets"
  ON wants_budgets FOR SELECT
  USING (user_id = '00000000-0000-0000-0000-000000000000'::uuid);

CREATE POLICY "Users can create their own wants budgets"
  ON wants_budgets FOR INSERT
  WITH CHECK (user_id = '00000000-0000-0000-0000-000000000000'::uuid);

CREATE POLICY "Users can update their own wants budgets"
  ON wants_budgets FOR UPDATE
  USING (user_id = '00000000-0000-0000-0000-000000000000'::uuid)
  WITH CHECK (user_id = '00000000-0000-0000-0000-000000000000'::uuid);

CREATE POLICY "Users can delete their own wants budgets"
  ON wants_budgets FOR DELETE
  USING (user_id = '00000000-0000-0000-0000-000000000000'::uuid);

-- RLS Policies for wants_transactions table
CREATE POLICY "Users can view their own wants transactions"
  ON wants_transactions FOR SELECT
  USING (user_id = '00000000-0000-0000-0000-000000000000'::uuid);

CREATE POLICY "Users can create their own wants transactions"
  ON wants_transactions FOR INSERT
  WITH CHECK (user_id = '00000000-0000-0000-0000-000000000000'::uuid);

CREATE POLICY "Users can update their own wants transactions"
  ON wants_transactions FOR UPDATE
  USING (user_id = '00000000-0000-0000-0000-000000000000'::uuid)
  WITH CHECK (user_id = '00000000-0000-0000-0000-000000000000'::uuid);

CREATE POLICY "Users can delete their own wants transactions"
  ON wants_transactions FOR DELETE
  USING (user_id = '00000000-0000-0000-0000-000000000000'::uuid);
