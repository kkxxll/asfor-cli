#!/usr/bin/env node

import importLocal from "import-local";
import { log } from "@asfor-cli/utils";
import { filename } from "dirname-filename-esm";

import { fileURLToPath } from "node:url";

import entry from "../lib/index.js";

const __filename = filename(import.meta);

if (importLocal(__filename)) {
  log.info("cli", "using local version of cli");
} else {
  entry(process.argv.slice(2));
}
