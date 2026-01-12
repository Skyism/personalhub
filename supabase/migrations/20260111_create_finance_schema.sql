-- Create budgets table
CREATE TABLE budgets (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  month text NOT NULL,
  total_budget numeric(10,2) NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, month)
);

-- Create categories table
CREATE TABLE categories (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  color text,
  created_at timestamptz DEFAULT now()
);

-- Create transactions table
CREATE TABLE transactions (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  budget_id bigint NOT NULL REFERENCES budgets(id) ON DELETE CASCADE,
  category_id bigint REFERENCES categories(id) ON DELETE SET NULL,
  amount numeric(10,2) NOT NULL,
  note text,
  transaction_date timestamptz NOT NULL DEFAULT now(),
  source text NOT NULL DEFAULT 'manual',
  created_at timestamptz DEFAULT now()
);

-- Create indexes on foreign keys
CREATE INDEX idx_budgets_user_id ON budgets(user_id);
CREATE INDEX idx_categories_user_id ON categories(user_id);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_budget_id ON transactions(budget_id);
CREATE INDEX idx_transactions_category_id ON transactions(category_id);

-- Enable Row Level Security
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for budgets table
CREATE POLICY "Users can view their own budgets"
  ON budgets FOR SELECT
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can create their own budgets"
  ON budgets FOR INSERT
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update their own budgets"
  ON budgets FOR UPDATE
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can delete their own budgets"
  ON budgets FOR DELETE
  USING ((SELECT auth.uid()) = user_id);

-- RLS Policies for categories table
CREATE POLICY "Users can view their own categories"
  ON categories FOR SELECT
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can create their own categories"
  ON categories FOR INSERT
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update their own categories"
  ON categories FOR UPDATE
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can delete their own categories"
  ON categories FOR DELETE
  USING ((SELECT auth.uid()) = user_id);

-- RLS Policies for transactions table
CREATE POLICY "Users can view their own transactions"
  ON transactions FOR SELECT
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can create their own transactions"
  ON transactions FOR INSERT
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update their own transactions"
  ON transactions FOR UPDATE
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can delete their own transactions"
  ON transactions FOR DELETE
  USING ((SELECT auth.uid()) = user_id);
