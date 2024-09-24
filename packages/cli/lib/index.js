const commander = require("commander");
const pkg = require("../package.json");
const semver = require("semver");
const chalk = require("chalk");
const { program } = commander;
const { log, isDebug } = require("@asfor-cli/utils");
const createInitCommand = require("@asfor-cli/init");

const LOWEST_NODE_VERSION = "20.0.0";

function checkNodeVersion() {
  log.verbose("node version", process.version);
  if (!semver.gte(process.version, LOWEST_NODE_VERSION)) {
    throw new Error(
      chalk.red(`node版本过低,需要安装${LOWEST_NODE_VERSION}以上版本}`)
    );
  }
}
function preAction() {
  // 检查node版本
  checkNodeVersion();
}

process.on("uncaughtException", (e) => {
  // 全局的异常捕获，只抛出异常信息里面的message
  if (isDebug()) {
    console.log(e);
  } else {
    console.log(e.message);
  }
});

module.exports = function (args) {
  log.success("version", pkg.version);
  program
    .name(Object.keys(pkg.bin)[0])
    .usage("<command> [options]")
    .version(pkg.version)
    .option("-d, --debug", "是否开启调试模式", false)
    .hook("preAction", preAction);

  createInitCommand(program);

  program.parse(process.argv);
};
