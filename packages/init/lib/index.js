"use strict";

import Command from "@asfor-cli/command";
import { log } from "@asfor-cli/utils";
import createTemplate from "./createTemplate.js";
import downloadTemplate from "./downloadTemplate.js";
import installTemplate from "./installTemplate.js";

class InitCommand extends Command {
  get command() {
    return "init [name]";
  }
  get description() {
    return "init project";
  }

  get options() {
    return [["-f, --force", "是否强制创建", false]];
  }

  async action([name, opts]) {
    log.verbose("init", name, opts);
    // 1.选模板 生成项目信息
    const selectTemplate = await createTemplate(name, opts);
    log.verbose("selectTemplate", selectTemplate);

    // 2.下载项目模板至缓存
    await downloadTemplate(selectTemplate);

    // 3.安装项目模板至项目目录
    await installTemplate(selectTemplate, opts)
  }
}

function Init(instance) {
  return new InitCommand(instance);
}

export default Init;
