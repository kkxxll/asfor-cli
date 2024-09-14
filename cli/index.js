#!/usr/bin/env node

const commander = require("commander");

const pkg = require("../package.json");
const { options } = require("yargs");

// 获取 commander 实例
const { program } = commander;

// 创建一个实例
// const program = new commander.Command();

// 注册命令
const clone = program.command("clone <source> [destination]");
clone
  .description("clone a repository into a folder")
  .action((source, destination) => {
    console.log("123");
    console.log(source, destination);
  });

// 注册子命令
const service = program.command("service");
service
  .command("start [port]")
  .description("start service on port")
  .action((port) => {
    console.log("start", port);
  });

service
  .command("stop [port]")
  .description("stop service on port")
  .action((port) => {
    console.log("stop", port);
  });

// 命中所有命令
program
  .arguments("<cmd> [options")
  .description("执行命令", {
    cmd: "command to run",
    options: "options for command",
  })
  .action((cmd) => {
    console.log("command", cmd);
  });

// 自动拼接命令
program.command("install [name]", "install a package");

// 指定命令执行
program.command("test-install [name]", "install a package", {
  executableFile: "test-cli",
  isDefault: true, // 若命中多个命令，默认执行这个
  hide: true, // 隐藏，--help 时不会显示
});

program
  .name(Object.keys(pkg.bin)[0])
  .usage("<command> [options]")
  .version(pkg.version)
  .parse(process.agrv);
