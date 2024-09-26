import path from "node:path";
import { pathExistsSync } from "path-exists";
import fse from "fs-extra";
import ora from "ora";
function getCacheDir(targetPath) {
  return path.resolve(targetPath, "node_modules");
}

function makeCacheDir(targetPath) {
  const cacheDir = getCacheDir(targetPath);
  if (!pathExistsSync(cacheDir)) {
    try {
      fse.mkdirSync(cacheDir);
    } catch (error) {
      console.log(error)
    }
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
  } catch (error) {
    spinner.stop();

  }
}
