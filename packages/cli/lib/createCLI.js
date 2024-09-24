import { program } from "commander";
import path from "node:path";
import { dirname } from "dirname-filename-esm";
import fse from "fs-extra";
import semver from "semver";
import chalk from "chalk";
import { log } from "@asfor-cli/utils";


const __dirName = dirname(import.meta);
const pkgPath = path.resolve(__dirName, "../package.json");
const pkg = fse.readJSONSync(pkgPath);
const LOWEST_NODE_VERSION = "14.0.0";

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

export default function createCLI() {
  log.success("version", pkg.version);
  program
    .name(Object.keys(pkg.bin)[0])
    .usage("<command> [options]")
    .version(pkg.version)
    .option("-d, --debug", "是否开启调试模式", false)
    .hook("preAction", preAction);

  return program;
}
