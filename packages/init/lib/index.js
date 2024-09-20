"use strict";

const Command = require("@asfor-cli/command");

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
    console.log('init', name, opts)
  }
}

function Init(instance) {
  return new InitCommand(instance);
}

module.exports = Init;
