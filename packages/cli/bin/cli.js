#!/usr/bin/env node

import importLocal from "import-local";
import { log } from "@asfor-cli/utils";

import { fileURLToPath } from "node:url";

import entry from "../lib/index.js";

const __filename = fileURLToPath(import.meta.url);

if (importLocal(__filename)) {
  log.info("cli", "using local version of cli");
} else {
  console.log('1', __filename)
  entry(process.argv.slice(2));
}
