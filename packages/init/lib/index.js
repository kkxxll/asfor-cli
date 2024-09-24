"use strict";

import Command from "@asfor-cli/command";
import { log } from "@asfor-cli/utils";

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

  action([name, opts]) {
    log.verbose('init', name, opts)
  }
}

function Init(instance) {
  return new InitCommand(instance);
}

export default Init;
