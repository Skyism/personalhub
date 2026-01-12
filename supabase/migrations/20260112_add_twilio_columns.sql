-- Add Twilio-specific columns to transactions table for SMS integration
ALTER TABLE transactions
ADD COLUMN twilio_message_id text,
ADD COLUMN twilio_from text;

-- Create index on twilio_message_id for idempotency checks
CREATE INDEX idx_transactions_twilio_message_id ON transactions(twilio_message_id);

-- Add unique constraint to prevent duplicate message processing
ALTER TABLE transactions
ADD CONSTRAINT unique_twilio_message_id UNIQUE (twilio_message_id);
