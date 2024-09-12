#!/usr/bin/env node

const yargs = require("yargs");
const { hideBin } = require("yargs/helpers");
const lib = require("asfor-lib");

console.log("test", lib());

yargs(hideBin(process.argv))
  .demandCommand(1) // 至少一个参数
  .command('init [name]', 'create a new project', (yargs) => {
    yargs.options('name', {
      type: 'string',
      describe: 'project name'
    })
  }, (argv) => {
    console.log(argv)
  })
  .recommendCommands() // 提示命令 如 ini -> init
  .help("h")
  .alias("h", "help")
  .parse()
