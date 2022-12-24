import { getDBConnection } from "./db.connection.ts";

export interface Transaction {
  transactionDate: Date;
  ignore: boolean;
  type: "INCOME" | "EXPENSE";
  value: number;
  description: string;
  notes?: string;
  category: string;
  required: boolean;
}

interface SaveTransactionInput {
  transactionDate: Date;
  type: "INCOME" | "EXPENSE";
  value: number;
  description: string;
  notes?: string;
  category: number;
  required: boolean;
}

export class TransactionDatasource {
  async listTransactionsByMonth(month: number) {
    let transactions: Transaction[];
    const connection = await getDBConnection();
    try {
      const result = await connection.queryObject<Transaction>(
        `
SELECT
  "money_transaction"."transaction_date" as "transactionDate", 
  "money_transaction"."value" as "value",
  "money_transaction"."description" as "description",
  "money_transaction"."notes" as "notes",
  "money_transaction_category"."name" as "category",
  "money_transaction_category"."required" as "required"
FROM "money_transaction"
LEFT JOIN "money_transaction_category" 
  ON "money_transaction"."category_id" = "money_transaction_category"."category_id" 
    AND "money_transaction_category"."deleted_at" IS NULL
WHERE EXTRACT(MONTH FROM "money_transaction"."transaction_date") = $1
  AND "money_transaction"."deleted_at" IS NULL
  AND "money_transaction_category"."category_id" IS NOT NULL
ORDER BY "money_transaction"."transaction_date";`,
        [month]
      );
      transactions = result.rows;
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      connection.release();
    }

    return transactions;
  }

  async saveTransaction(transaction: SaveTransactionInput): Promise<void> {
    const connection = await getDBConnection();
    try {
      await connection.queryObject<Transaction>(
        `INSERT INTO "money_transaction" ("transaction_date", "type", "value", "description", "notes", "category_id") VALUES ($1, $2, $3, $4, $5, $6);`,
        [
          transaction.transactionDate,
          transaction.type,
          transaction.value,
          transaction.description,
          transaction.notes,
          transaction.category,
        ]
      );
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      connection.release();
    }
  }
}
