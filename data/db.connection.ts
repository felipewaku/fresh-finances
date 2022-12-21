import * as pg from "pg/mod.ts";

export let DBConnection: pg.PoolClient;

export async function setupDB(): Promise<void> {
  const databaseUrl = Deno.env.get("DATABASE_URL");
  DBConnection = await new pg.Pool(databaseUrl, 10, true).connect();
}
