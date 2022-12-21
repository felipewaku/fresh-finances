import "std/dotenv/load.ts";
import { DBConnection, setupDB } from "../data/db.connection.ts";
import { join } from "std/path/mod.ts";
import { crypto, toHashString } from "std/crypto/mod.ts";

await setupDB();

await DBConnection.queryObject(`CREATE TABLE IF NOT EXISTS "migration" (
  "migration_id" SERIAL PRIMARY KEY,
  "created_at" TIMESTAMP NOT NULL DEFAULT now(),
  "file_name" TEXT NOT NULL,
  "order" integer NOT NULL,
  "hash" TEXT NOT NULL
)`);

const decoder = new TextDecoder("utf-8");
const basePath = join("tasks", "migrations");

interface Migration {
  migration_id: number;
  createdAt: number;
  file_name: string;
  order: number;
  hash: string;
}

const migrations = await DBConnection.queryObject<Migration>(
  `SELECT * FROM "migration" ORDER BY "migration"."order" ASC`
);

let migrationFileIndex = 0;
const files = Array.from(Deno.readDirSync(basePath))
  .filter(
    (entry) =>
      entry.isFile &&
      entry.name.endsWith(".sql") &&
      !Number.isNaN(+entry.name.split(".")[0])
  )
  .map((entry) => entry.name)
  .sort((a, b) => +a.split(".")[0] - +b.split(".")[0]);

for (const migrationFile of files) {
  const fileContents = Deno.readFileSync(join(basePath, migrationFile));
  const fileHash = toHashString(await crypto.subtle.digest("SHA-512", fileContents));
  if (migrations.rows[migrationFileIndex]) {
    const migration = migrations.rows[migrationFileIndex];

    const areFileNamesEqual = migration.file_name === migrationFile;

    if (!areFileNamesEqual) {
      throw new Error(
        `Migration file name does not match! Expected: ${migration.file_name}, received: ${migrationFile}`
      );
    }

    const areHashesEqual = migration.hash === fileHash;

    if (!areHashesEqual) {
      throw new Error(`Migration file contents have changed!`);
    }
  } else {
    const transaction = DBConnection.createTransaction(migrationFile);
    try {
      await transaction.begin();
      const query = decoder.decode(fileContents);
      await transaction.queryObject(query);
      await transaction.queryObject(
        `INSERT INTO "migration" ("file_name", "order", "hash") VALUES ($1, $2, $3);`,
        [migrationFile, +migrationFile.split(".")[0], fileHash]
      );
      console.log(query);
      await transaction.commit();
    } catch (error) {
      console.error(error);
      await transaction.rollback();
    }
  }

  migrationFileIndex++;
}

DBConnection.release();
