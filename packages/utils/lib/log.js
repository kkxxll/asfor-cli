const log = require("npmlog");
const isDebug = require("./isDebug.js");

if (isDebug()) {
  log.level = "verbose";
} else {
  log.level = "info";
}

log.heading = "asfor";
log.addLevel("success", 2000, { fg: "green", bold: true });

module.exports = log;
