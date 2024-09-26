import path from "node:path";
import fse from "fs-extra";
import { pathExistsSync } from "path-exists";
import { log } from "@asfor-cli/utils";

export default function installTemplate(selectedTemplate, opts) {
  const { force = false } = opts;
  const { targetPath, template, name } = selectedTemplate;
  const rootDir = process.cwd();

  log.verbose("rootDir", rootDir);

  fse.ensureDirSync(targetPath);

  const installDirSync = path.resolve(`${rootDir}/${name}`);
  log.verbose("installDirSync", installDirSync);
  
  if (pathExistsSync(installDirSync)) {
    if (!force) {
      log.error(`${name} already exists, please use --force to overwrite.`);
      return;
    } else {
      // 先移除再安装
      fse.removeSync(installDirSync);
      fse.ensureDirSync(installDirSync);
    }
  } else {
    fse.ensureDirSync(installDirSync);
  }
}
