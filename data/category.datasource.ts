import { getDBConnection } from "./db.connection.ts";

export interface Category {
  id: number;
  name: string;
  required: boolean;
}

export class CategoryDatasource {
  async listCategories() {
    let categories: Category[];
    const connection = await getDBConnection();
    try {
      const result = await connection.queryObject<Category>(
        `
SELECT
  "money_transaction_category"."category_id" as "id",
  "money_transaction_category"."name" as "name",
  "money_transaction_category"."required" as "required"
FROM "money_transaction_category"
WHERE "money_transaction_category"."deleted_at" IS NULL
ORDER BY "money_transaction_category"."required" DESC`
      );
      categories = result.rows;
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      connection.release();
    }

    return categories;
  }
}
