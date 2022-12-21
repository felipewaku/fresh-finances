CREATE TABLE IF NOT EXISTS "money_transaction" (
  "money_transaction_id" SERIAL PRIMARY KEY,
  "created_at" TIMESTAMP NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
  "deleted_at" TIMESTAMP,
  "transaction_date" TIMESTAMP NOT NULL,
  "value" integer
);
