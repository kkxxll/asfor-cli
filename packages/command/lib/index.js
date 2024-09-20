class Command {
  constructor(instance) {
    if (!instance) {
      throw new Error("command instance is required");
    }

    this.program = instance;
    const cmd = this.program.command(this.command);

    cmd.description(this.description);
    

    if (this.options?.length > 0) {
      this.options.forEach((option) => {
        cmd.option(...option);
      });
    }

    
    cmd.action((name, opts) => {
      console.log(name, opts);
    });
  }

  get command() {
    // command 必须实现
    console.log(arguments)
    throw new Error("command must be implemented");
  }
  get description() {
    throw new Error("description must be implemented");
  }

  get options() {
    return [
      ["-f, --force", "是否强制创建", false],
    ];
  }

  get action() {
    throw new Error("action must be implemented");
  }
}

module.exports = Command;
