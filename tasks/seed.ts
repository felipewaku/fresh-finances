import "std/dotenv/load.ts";
import { getDBConnection } from "../data/db.connection.ts";
import * as pg from "pg/mod.ts";

interface Category {
  name: string;
  required: boolean;
}

const SEED_CATEGORIES: Category[] = [
  { name: "Moradia", required: true },
  { name: "Imposto", required: true },
  { name: "Internet", required: true },
  { name: "Saúde", required: true },
  { name: "Mercado", required: true },
  { name: "Transporte", required: true },
  { name: "Remuneração", required: false },
  { name: "Bônus", required: false },
  { name: "Rendimentos", required: false },
  { name: "Compras", required: false },
  { name: "Restaurantes", required: false },
  { name: "Serviços", required: false },
  { name: "Presentes", required: false },
  { name: "Outros", required: false },
];

interface Transaction {
  transactionDate: string;
  type: "INCOME" | "EXPENSE";
  value: number;
  description: string;
  notes?: string;
  category: string;
}

const SEED_TRANSACTION: Transaction[] = [
  {
    transactionDate: "2022-11-06",
    type: "EXPENSE",
    description: "Pao de Acucar-0361",
    value: 9965,
    category: "Mercado",
  },
  {
    transactionDate: "2022-11-05",
    type: "INCOME",
    description: "Remuneração",
    value: 1000000,
    category: "Remuneração",
  },
  {
    transactionDate: "2022-11-04",
    type: "EXPENSE",
    description: "Faisca Pizza",
    value: 9680,
    category: "Restaurantes",
  },
  {
    transactionDate: "2022-11-03",
    type: "EXPENSE",
    description: "Amazon.Com.Br",
    value: 29900,
    category: "Compras",
  },
  {
    transactionDate: "2022-11-02",
    type: "EXPENSE",
    description: "Pagamento efetuado - MACIEL AQUARIUS",
    value: 223574,
    category: "Moradia",
  },
  {
    transactionDate: "2022-11-01",
    type: "EXPENSE",
    description: "Cards e Games Comercio",
    value: 25426,
    category: "Compras",
  },
  {
    transactionDate: "2022-10-06",
    type: "EXPENSE",
    description: "Pao de Acucar-0361",
    value: 9965,
    category: "Mercado",
  },
  {
    transactionDate: "2022-10-05",
    type: "INCOME",
    description: "Remuneração",
    value: 1000000,
    category: "Remuneração",
  },
  {
    transactionDate: "2022-09-10",
    type: "EXPENSE",
    description: "Pao de Acucar-0361",
    value: 9965,
    category: "Mercado",
  },
  {
    transactionDate: "2022-10-25",
    type: "INCOME",
    description: "Remuneração",
    value: 1000000,
    category: "Remuneração",
  },
];

async function seedCategories(connection: pg.PoolClient) {
  const query = `INSERT INTO "money_transaction_category" ("name", "required") VALUES ($1, $2);`;
  for (const category of SEED_CATEGORIES) {
    await connection.queryObject(query, [category.name, category.required]);
  }
}

async function seedTestTransactions(connection: pg.PoolClient) {
  const categoryQuery = `SELECT "category_id" as "id", "name" FROM "money_transaction_category"`;
  const result = await connection.queryObject<{ id: number; name: string }>(
    categoryQuery
  );
  const categoryMapper: Record<string, number> = result.rows.reduce(
    (previousValue: Record<string, number>, { id, name }) => {
      previousValue[name] = id;
      return previousValue;
    },
    {}
  );
  const query = `INSERT INTO "money_transaction" ("transaction_date", "type", "value", "description", "notes", "category_id") VALUES ($1, $2, $3, $4, $5, $6);`;
  for (const transaction of SEED_TRANSACTION) {
    await connection.queryObject(query, [
      transaction.transactionDate,
      transaction.type,
      transaction.value,
      transaction.description,
      transaction.notes,
      categoryMapper[transaction.category],
    ]);
  }
}

const connection = await getDBConnection();

try {
  await seedCategories(connection);
  await seedTestTransactions(connection);
} catch (err) {
  console.error(err);
} finally {
  connection.release();
}
