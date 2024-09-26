import path from "node:path";
import { pathExistsSync } from "path-exists";
import fse from "fs-extra";
import ora from "ora";
import { printErrorLog, log } from "@asfor-cli/utils";
function getCacheDir(targetPath) {
  return path.resolve(targetPath, "node_modules");
}

function makeCacheDir(targetPath) {
  const cacheDir = getCacheDir(targetPath);
  if (!pathExistsSync(cacheDir)) {
    fse.mkdirpSync(cacheDir);
  }
}

export default function downloadTemplate(selectTemplate) {
  const { targetPath, template } = selectTemplate;
  makeCacheDir(targetPath);
  const spinner = ora("download template...").start();
  try {
    setTimeout(() => {
      spinner.stop();
    }, 2000);
    log.success("download success");
  } catch (error) {
    spinner.stop();
    printErrorLog(error);
  }
}
