"use strict";

const Command = require("@asfor-cli/command");

class InitCommand extends Command {
  get command() {
    return 'init [name]'
  }
  get description() {
    return 'init project'
  }
  
}

function Init(instance) {
  return new InitCommand(instance);
}

module.exports = Init;
