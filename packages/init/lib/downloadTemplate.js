import path from "node:path";
import { pathExistsSync } from "path-exists";
import fse from "fs-extra";
import ora from "ora";
import { execa } from "execa";
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

async function downloadAddTemplate(targetPath, selectTemplate) {
  const { npmName, version } = selectTemplate;
  const installCommand = "cnpm";
  // const installCommand = "npm";
  const installArgs = ["install", `${npmName}@${version}`];
  const cwd = targetPath;
  log.verbose("installArgs", installArgs);
  log.verbose("cwd", cwd);
  const subProcess = execa(installCommand, installArgs, { cwd });
  await subProcess;
}

export default async function downloadTemplate(selectTemplate) {
  const { targetPath, template } = selectTemplate;
  makeCacheDir(targetPath);
  const spinner = ora("download template...").start();
  try {
    await downloadAddTemplate(targetPath, template);

    spinner.stop();
    log.success("download success");
  } catch (error) {
    spinner.stop();
    printErrorLog(error);
  }
}
