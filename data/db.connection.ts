import * as pg from "pg/mod.ts";

let pool: pg.Pool;

export function getDBConnection(): Promise<pg.PoolClient> {
  if (!pool) {
    const databaseUrl = Deno.env.get("DATABASE_URL");
    pool = new pg.Pool(databaseUrl, 10, true);
  }

  return pool.connect();
}
