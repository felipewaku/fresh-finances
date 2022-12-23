import { Head } from "$fresh/runtime.ts";
import type { Handlers, PageProps } from "$fresh/server.ts";
import { getDBConnection } from "../../data/db.connection.ts";
import { Button } from "../../components/Button.tsx";
import { format } from "std/datetime/mod.ts";

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
  async GET(req, ctx) {
    const url = new URL(req.url);
    const month = url.searchParams.get("month") ?? new Date().getMonth();

    const connection = await getDBConnection();
    const result = await connection.queryObject(
      `SELECT "money_transaction".*, "money_transaction_category"."name" as "category_name", "money_transaction_category"."required" as "category_required" FROM "money_transaction" LEFT JOIN "money_transaction_category" ON "money_transaction"."category_id" = "money_transaction_category"."category_id" WHERE EXTRACT(MONTH FROM "money_transaction"."transaction_date") = $1 ORDER BY "money_transaction"."transaction_date";`,
      [month]
    );
    connection.release();

    return ctx.render!({ transactions: result.rows, month });
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
        <h1>Transações</h1>
        <a href="/transaction/new">Nova transação</a>
        <div class="m-8" />
        <table>
          <tr>
            <th>transaction_date</th>
            <th>value</th>
            <th>description</th>
            <th>category</th>
            <th>notes</th>
          </tr>
          {data.transactions.map((transaction) => {
            return (
              <tr>
                <td>{format(transaction.transaction_date, "dd/MM/yyyy")}</td>
                <td>{(transaction.value / 100).toFixed(2)}</td>
                <td>{transaction.description}</td>
                <td>{transaction.category_name}</td>
                <td>{transaction.notes}</td>
              </tr>
            );
          })}
        </table>
      </div>
    </>
  );
}
