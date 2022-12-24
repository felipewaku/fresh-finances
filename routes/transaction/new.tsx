import { Head } from "$fresh/runtime.ts";
import type { Handlers, PageProps } from "$fresh/server.ts";
import { format, parse } from "std/datetime/mod.ts";
import {
  Category,
  CategoryDatasource,
} from "../../data/category.datasource.ts";
import { TransactionDatasource } from "../../data/transaction.datasource.ts";

export const handler: Handlers = {
  async GET(_, ctx) {
    const datasource = new CategoryDatasource();
    const categories = await datasource.listCategories();
    return ctx.render!({ categories });
  },
  async POST(req: Request) {
    const datasource = new TransactionDatasource();
    const form = await req.formData();
    await datasource.saveTransaction({
      transactionDate: parse(
        form.get("transaction_date")! as string,
        "yyyy-MM-dd"
      ),
      value: parseFloat(form.get("value")! as string),
      type: form.get("type")! as "EXPENSE" | "INCOME",
      description: form.get("description")! as string,
      notes: form.get("notes")! as string,
      category: +(form.get("category")! as string),
      required: form.get("required") === "on",
    });
    console.log(Array.from(form.entries()));
    const url = new URL(req.url);
    url.pathname = "/transaction";
    return Response.redirect(url);
  },
};

export default function CreateTransaction({
  data,
}: PageProps<{ categories: Category[] }>) {
  return (
    <>
      <Head>
        <title>Nova transação</title>
      </Head>
      <main>
        <div class="p-4 mx-auto max-w-screen-md">
          <form action="/transaction/new" method="post">
            <label htmlFor="transaction_date">Date</label>
            <br />
            <input
              type="date"
              name="transaction_date"
              value={format(new Date(), "yyyy-MM-dd")}
              required
            />
            <br />
            <label htmlFor="value">value</label>
            <br />
            <input type="number" name="value" step={0.01} min={0} required />
            <br />
            <label htmlFor="description">Description</label>
            <br />
            <input type="text" name="description" required />
            <br />
            <fieldset name="type" required>
              <legend>Type:</legend>
              <div>
                <input
                  type="radio"
                  id="EXPENSE"
                  name="type"
                  value="EXPENSE"
                  checked
                />
                <label for="EXPENSE"> Expense</label>
              </div>
              <div>
                <input type="radio" id="INCOME" name="type" value="INCOME" />
                <label for="INCOME"> Income</label>
              </div>
            </fieldset>
            <label htmlFor="category">Category</label>
            <br />
            <input list="category" name="category" required />
            <datalist id="category">
              {data.categories.map((category) => (
                <option value={category.id}>
                  {category.name} {category.required ? "*" : ""}
                </option>
              ))}
            </datalist>
            <br />
            <label htmlFor="notes">Notes</label>
            <br />
            <textarea type="text" name="notes" />
            <br />
            <div>
              <input type="checkbox" id="required" name="required" />
              <label for="required"> Required</label>
            </div>
            <br />
            <button type="submit">Submit</button>
          </form>
        </div>
      </main>
    </>
  );
}
