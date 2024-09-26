"use strict";

import Command from "@asfor-cli/command";
import { log } from "@asfor-cli/utils";
import createTemplate from "./createTemplate.js";

class InitCommand extends Command {
  get command() {
    return 'init [name]'
  }
  get description() {
    return 'init project'
  }

  get options() {
    return [
      ["-f, --force", "是否强制创建", false],
    ];
  }

  async action([name, opts]) {
    log.verbose('init', name, opts)
    await createTemplate(name, opts);
    // 选模板 生成项目信息
    // 下载项目模板至缓存
    // 安装项目模板至项目目录
  }
}

function Init(instance) {
  return new InitCommand(instance);
}

export default Init;
