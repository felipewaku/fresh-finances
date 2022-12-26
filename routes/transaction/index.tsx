import { Head } from "$fresh/runtime.ts";
import type { Handlers, PageProps } from "$fresh/server.ts";
import { format } from "std/datetime/mod.ts";
import {
  Transaction,
  TransactionDatasource,
} from "../../data/transaction.datasource.ts";

function safeGetSearchParam(
  param: URLSearchParams,
  key: string,
  defaultValue: string
): string {
  const result = param.get(key);
  if (result === null) {
    return defaultValue;
  }
  return result;
}

export const handler: Handlers = {
  async GET(req, ctx) {
    const datasource = new TransactionDatasource();
    const url = new URL(req.url);
    const month = safeGetSearchParam(
      url.searchParams,
      "month",
      `${new Date().getMonth()}`
    );
    const year = safeGetSearchParam(
      url.searchParams,
      "year",
      `${new Date().getFullYear()}`
    );

    const transactions = await datasource.listTransactions(+month + 1, +year);

    return ctx.render!({ transactions: transactions, month, year });
  },
};

export default function Home({
  data,
}: PageProps<{ transactions: Transaction[]; month: number; year: number }>) {
  const currentMonth = new Date();
  currentMonth.setMonth(data.month);
  currentMonth.setUTCFullYear(data.year);

  const previousMonth = new Date(
    new Date(currentMonth).setMonth(currentMonth.getMonth() - 1)
  );
  const nextMonth = new Date(
    new Date(currentMonth).setMonth(currentMonth.getMonth() + 1)
  );

  return (
    <>
      <Head>
        <title>Fresh App</title>
      </Head>
      <div class="p-4 mx-auto max-w-screen-md">
        <h1>Transações</h1>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <a
            href={`/transaction?month=${previousMonth.getMonth()}&year=${previousMonth.getFullYear()}`}
          >
            {format(previousMonth, "MM/yyyy")}
          </a>
          <h2>{format(currentMonth, "MM/yyyy")}</h2>
          <a
            href={`/transaction?month=${nextMonth.getMonth()}&year=${nextMonth.getFullYear()}`}
          >
            {format(nextMonth, "MM/yyyy")}
          </a>
        </div>
        <div class="m-8" />
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <a
            href="/transaction/new"
            style={{
              padding: "8px",
              border: "1px solid",
              borderRadius: "5px",
            }}
          >
            Nova transação
          </a>
        </div>
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
