CREATE TYPE "public"."money_transaction_type_enum" AS ENUM('INCOME', 'EXPENSE');

CREATE TABLE IF NOT EXISTS "money_transaction" (
  "money_transaction_id" SERIAL PRIMARY KEY,
  "created_at" TIMESTAMP NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
  "deleted_at" TIMESTAMP,
  "transaction_date" DATE NOT NULL,
  "ignore" BOOLEAN NOT NULL DEFAULT FALSE,
  "type" "public"."money_transaction_type_enum" NOT NULL DEFAULT 'INCOME',
  "value" integer NOT NULL,
  "original_description" TEXT,
  "notes" TEXT,
  "category_id" integer NOT NULL
);

CREATE TABLE IF NOT EXISTS "money_transaction_category" (
  "category_id" SERIAL PRIMARY KEY,
  "created_at" TIMESTAMP NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
  "deleted_at" TIMESTAMP,
  "name" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "required" BOOLEAN NOT NULL
);



ALTER TABLE "money_transaction" ADD CONSTRAINT "money_transaction_category_key" FOREIGN KEY ("category_id") REFERENCES "money_transaction_category"("category_id") ON DELETE NO ACTION ON UPDATE NO ACTION;