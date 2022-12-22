import * as pg from "pg/mod.ts";
import "std/dotenv/load.ts";
import { join } from "std/path/mod.ts";
import { crypto, toHashString } from "std/crypto/mod.ts";

interface Migration {
  migration_id: number;
  createdAt: number;
  file_name: string;
  order: number;
  hash: string;
}

export class MigrationManager {
  private basePath = join("tasks", "migrations");

  constructor(private readonly connection: pg.PoolClient) {}

  async setup() {
    await this.connection.queryObject(`CREATE TABLE IF NOT EXISTS "migration" (
      "migration_id" SERIAL PRIMARY KEY,
      "created_at" TIMESTAMP NOT NULL DEFAULT now(),
      "file_name" TEXT NOT NULL,
      "order" integer NOT NULL,
      "hash" TEXT NOT NULL
    )`);
  }

  async applyPendingMigrations() {
    const migrations = await this.getExecutedMigrations();
    const files = this.getMigrationScriptsFileNames();

    let migrationFileIndex = 0;
    for (const migrationFile of files) {
      const fileContents = Deno.readFileSync(
        join(this.basePath, migrationFile)
      );
      const fileHash = toHashString(
        await crypto.subtle.digest("SHA-512", fileContents)
      );
      if (migrations[migrationFileIndex]) {
        this.validatedExecutedMigration(
          migrations[migrationFileIndex],
          migrationFile,
          fileHash
        );
      } else {
        this.executeMigration(
          migrationFile,
          new TextDecoder().decode(fileContents),
          fileHash
        );
      }

      migrationFileIndex++;
    }
  }

  private async getExecutedMigrations(): Promise<Migration[]> {
    const result = await this.connection.queryObject<Migration>(
      `SELECT * FROM "migration" ORDER BY "migration"."order" ASC`
    );

    return result.rows;
  }

  private getMigrationScriptsFileNames(): string[] {
    return Array.from(Deno.readDirSync(this.basePath))
      .filter(
        (entry) =>
          entry.isFile &&
          entry.name.endsWith(".sql") &&
          !Number.isNaN(+entry.name.split(".")[0])
      )
      .map((entry) => entry.name)
      .sort((a, b) => +a.split(".")[0] - +b.split(".")[0]);
  }

  private validatedExecutedMigration(
    executedMigration: Migration,
    migrationFile: string,
    migrationHash: string
  ) {
    const areFileNamesEqual = executedMigration.file_name === migrationFile;

    if (!areFileNamesEqual) {
      throw new Error(
        `Migration file name does not match! Expected: ${executedMigration.file_name}, received: ${migrationFile}`
      );
    }

    const areHashesEqual = executedMigration.hash === migrationHash;

    if (!areHashesEqual) {
      throw new Error(`Migration file contents have changed!`);
    }

    console.log(`Skipping: ${migrationFile}`);
  }

  private async executeMigration(
    migrationFile: string,
    query: string,
    fileHash: string
  ) {
    console.log(`Running: ${migrationFile}`);
    const transaction = this.connection.createTransaction(migrationFile);
    try {
      await transaction.begin();
      await transaction.queryObject(query);
      await transaction.queryObject(
        `INSERT INTO "migration" ("file_name", "order", "hash") VALUES ($1, $2, $3);`,
        [migrationFile, +migrationFile.split(".")[0], fileHash]
      );
      await transaction.commit();
      console.log(`Migration succeded: ${migrationFile}`);
    } catch (error) {
      console.error(error);
      await transaction.rollback();
      throw error;
    }
  }
}
