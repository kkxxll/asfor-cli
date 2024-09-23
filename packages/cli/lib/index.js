const commander = require("commander");
const { program } = commander;
const pkg = require("../package.json");
const createInitCommand = require("@asfor-cli/init");
const { log } = require("@asfor-cli/utils");

module.exports = function (args) {
  log.success('version', pkg.version)
  program
    .name(Object.keys(pkg.bin)[0])
    .usage("<command> [options]")
    .version(pkg.version)
    .option("-d, --debug", "是否开启调试模式", false);

  createInitCommand(program);

  program.parse(process.argv);
};
