#!/usr/bin/env -S deno run -A --watch=static/,routes/

import dev from "$fresh/dev.ts";
import { load } from "std/dotenv/mod.ts";

const config = await load();

Object.entries(config).forEach(([key, value]) => {
  Deno.env.set(key, value);
});

await dev(import.meta.url, "./main.ts");
