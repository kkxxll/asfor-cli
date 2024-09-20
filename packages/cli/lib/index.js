const commander = require("commander");
const { program } = commander;
const pkg = require("../package.json");

module.exports = function (args) {
  program
    .name(Object.keys(pkg.bin)[0])
    .usage("<command> [options]")
    .version(pkg.version)
    .option("-d, --debug", "是否开启调试模式", false);

  program
    .command("init <name>")
    .description("创建一个项目")
    .option("-f, --force", "是否强制创建", false)
    // .action(require("./create"));
    .action((name, opts) => {
      console.log(name, opts);
    });

  program.parse(process.argv);
};
