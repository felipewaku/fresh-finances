import { Head } from "$fresh/runtime.ts";
import type { Handlers, PageProps } from "$fresh/server.ts";
import {
  Category,
  CategoryDatasource,
} from "../../data/category.datasource.ts";
import { format } from "std/datetime/mod.ts";

export const handler: Handlers = {
  async GET(_, ctx) {
    const datasource = new CategoryDatasource();
    const categories = await datasource.listCategories();
    return ctx.render!({ categories });
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
          <form action="/api/transaction" method="post">
            <label htmlFor="transaction_date">Date</label>
            <br />
            <input
              type="date"
              name="transaction_date"
              value={format(new Date(), "yyyy-MM-dd")}
            />
            <br />
            <label htmlFor="value">value</label>
            <br />
            <input type="number" name="value" step={0.01} min={0} />
            <br />
            <label htmlFor="description">Description</label>
            <br />
            <input type="text" name="description" />
            <br />
            <fieldset name="type">
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
            <input list="category" />
            <datalist id="category">
              {data.categories.map((category) => (
                <option value={category.id}>
                  {category.name} {category.required ? "*" : ""}
                </option>
              ))}
            </datalist>
            <br />
            <button type="submit">Submit</button>
          </form>
        </div>
      </main>
    </>
  );
}
