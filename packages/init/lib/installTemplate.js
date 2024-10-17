import path from "node:path";
import fse from "fs-extra";
import { pathExistsSync } from "path-exists";
import { log, makeList, makeInput } from "@asfor-cli/utils";
import ora from "ora";
import glob from 'glob'
import ejs from 'ejs'

function getCacheFilePath(targetPath, template) {
  return path.resolve(targetPath, "node_modules", template.npmName, 'template');
}

function getPluginFilePath(targetPath, template) {
  return path.resolve(targetPath, 'node_modules', template.npmName, 'plugins', 'index.js');
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

async function ejsRender(targetPath, installDir, template, name) {
  log.verbose('ejsRender', installDir, template);
  const { ignore } = template;
  // 执行插件
  let data = {};
  const pluginPath = getPluginFilePath(targetPath, template);
  
  // TODO windows报错
  if (pathExistsSync(pluginPath)) {
    const pluginFn = (await import(pluginPath)).default;
    const api = {
      makeList,
      makeInput,
    }
    data = await pluginFn(api);
  }
  const ejsData = {
    data: {
      name, // 项目名称
      ...data,
    }
  }
  glob('**', {
    cwd: installDir,
    nodir: true,
    ignore: [
      ...ignore,
      '**/node_modules/**',
    ],
  }, (err, files) => {
    files.forEach(file => {
      const filePath = path.join(installDir, file);
      log.verbose('filePath', filePath);
      ejs.renderFile(filePath, ejsData, (err, result) => {
        if (!err) {
          fse.writeFileSync(filePath, result);
        } else {
          log.error(err);
        }
      });
    });
  });
  
  glob('**', {
    cwd: installDir,
    nodir: true,
    ignore: [
      ...ignore,
      '**/node_modules/**',
    ],
  }, (err, files) => {
    files.forEach(file => {
      const filePath = path.join(installDir, file);
      log.verbose('filePath', filePath);
      ejs.renderFile(filePath, ejsData, (err, result) => {
        if (!err) {
          fse.writeFileSync(filePath, result);
        } else {
          log.error(err);
        }
      });
    });
  });
}

export default async function installTemplate(selectedTemplate, opts) {
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

  await ejsRender(targetPath, installDir, template, name)

}
