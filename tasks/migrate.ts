import "std/dotenv/load.ts";
import { getDBConnection } from "../data/db.connection.ts";
import { MigrationManager } from "./migration.manager.ts";

const connection = await getDBConnection();

try {
  const migrationManager = new MigrationManager(connection);
  await migrationManager.setup();
  await migrationManager.applyPendingMigrations();
} catch (err) {
  console.error(err);
} finally {
  connection.release();
}
