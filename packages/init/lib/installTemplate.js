import path from "node:path";
import fse from "fs-extra";
import { pathExistsSync } from "path-exists";
import { log } from "@asfor-cli/utils";
import ora from "ora";

function getCacheFilePath(targetPath, template) {
  return path.resolve(targetPath, "node_modules", template.npmName, 'template');
}
function copyFile(targetPath, template, installDir) {
  const originFile = getCacheFilePath(targetPath, template);
  const fileList = fse.readdirSync(originFile)
  const spinner = ora('copy template').start()
  fileList.map(file => {
    fse.copySync(`${originFile}/${file}`, `${installDir}/${file}`)
  })
  spinner.stop()
  spinner.succeed('copy template success')
}

export default function installTemplate(selectedTemplate, opts) {
  const { force = false } = opts;
  const { targetPath, template, name } = selectedTemplate;
  const rootDir = process.cwd();

  log.verbose("rootDir", rootDir);

  fse.ensureDirSync(targetPath);

  const installDir = path.resolve(`${rootDir}/${name}`);
  log.verbose("installDir", installDir);

  if (pathExistsSync(installDir)) {
    if (!force) {
      log.error(`${name} already exists, please use --force to overwrite.`);
      return;
    } else {
      // 先移除再安装
      fse.removeSync(installDir);
      fse.ensureDirSync(installDir);
    }
  } else {
    fse.ensureDirSync(installDir);
  }
  copyFile(targetPath, template, installDir);
}
