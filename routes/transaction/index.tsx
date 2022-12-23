import { Head } from "$fresh/runtime.ts";
import type { Handlers, PageProps } from "$fresh/server.ts";
import { getDBConnection } from "../../data/db.connection.ts";

interface Transaction {
  money_transaction_id: string;
  created_at: Date;
  updated_at: Date;
  deleted_at?: null;
  transaction_date: Date;
  ignore: boolean;
  type: "INCOME" | "EXPENSE";
  value: number;
  description: string;
  original_description?: string;
  notes?: string;
  category_id: number;
  category_name: string;
  category_required: boolean;
}

export const handler: Handlers = {
  async GET(_, ctx) {
    const connection = await getDBConnection();
    const result = await connection.queryObject(
      `SELECT "money_transaction".*, "money_transaction_category"."name" as "category_name", "money_transaction_category"."required" as "category_required" FROM "money_transaction" LEFT JOIN "money_transaction_category" ON "money_transaction"."category_id" = "money_transaction_category"."category_id" WHERE EXTRACT(MONTH FROM "money_transaction"."transaction_date") = $1 ORDER BY "money_transaction"."transaction_date";`,
      [10]
    );
    connection.release();

    return ctx.render!({ transactions: result.rows });
  },
};

export default function Home({
  data,
}: PageProps<{ transactions: Transaction[] }>) {
  return (
    <>
      <Head>
        <title>Fresh App</title>
      </Head>
      <div class="p-4 mx-auto max-w-screen-md">
        {data.transactions.map((transaction) => {
          return <p>{JSON.stringify(transaction)}</p>;
        })}
      </div>
    </>
  );
}
