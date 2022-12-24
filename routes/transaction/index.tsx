import { Head } from "$fresh/runtime.ts";
import type { Handlers, PageProps } from "$fresh/server.ts";
import { format } from "std/datetime/mod.ts";
import {
  Transaction,
  TransactionDatasource,
} from "../../data/transaction.datasource.ts";

export const handler: Handlers = {
  async GET(req, ctx) {
    const datasource = new TransactionDatasource();
    const url = new URL(req.url);
    const month = +url.searchParams.get("month")! || (new Date().getMonth() + 1);
    const transactions = await datasource.listTransactionsByMonth(month);

    return ctx.render!({ transactions: transactions, month });
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
                <td>{format(transaction.transactionDate, "dd/MM/yyyy")}</td>
                <td>{(transaction.value / 100).toFixed(2)}</td>
                <td>{transaction.description}</td>
                <td>{transaction.category}</td>
                <td>{transaction.notes}</td>
              </tr>
            );
          })}
        </table>
      </div>
    </>
  );
}
