import "std/dotenv/load.ts";
import { DBConnection, setupDB } from "../data/db.connection.ts";
import { MigrationManager } from "./migration.manager.ts";

await setupDB();

const migrationManager = new MigrationManager(DBConnection);
await migrationManager.setup();
await migrationManager.applyPendingMigrations();

DBConnection.release();
