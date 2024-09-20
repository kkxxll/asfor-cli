#!/usr/bin/env node

const importLocal = require("import-local");
const log = require("npmlog");

const entry = require("../lib/index");

if (importLocal(__filename)) {
  log.info('cli', 'using local version of cli')
} else {
	entry(process.argv.slice(2));
}