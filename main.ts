/// <reference no-default-lib="true" />
/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
/// <reference lib="dom.asynciterable" />
/// <reference lib="deno.ns" />

import { start } from "$fresh/server.ts";
import manifest from "./fresh.gen.ts";

import twindPlugin from "$fresh/plugins/twind.ts";
import { setupDB } from "./data/db.connection.ts";
import twindConfig from "./twind.config.ts";

await setupDB();

await start(manifest, {
  plugins: [twindPlugin(twindConfig)],
  port: +Deno.env.get("PORT")! || 3000,
});
