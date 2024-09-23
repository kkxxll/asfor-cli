class Command {
  constructor(instance) {
    if (!instance) {
      throw new Error("command instance is required");
    }

    this.program = instance;
    const cmd = this.program.command(this.command);

    cmd.description(this.description);

    cmd.hook("preAction", () => {
      this.preAction();
    });
    cmd.hook("postAction", () => {
      this.preAction();
    });

    if (this.options?.length > 0) {
      this.options.forEach((option) => {
        cmd.option(...option);
      });
    }

    cmd.action((...params) => {
      this.action(params);
    });
  }

  get command() {
    // command 必须实现
    console.log(arguments);
    throw new Error("command must be implemented");
  }
  get description() {
    throw new Error("description must be implemented");
  }

  get options() {
    return [];
  }

  action() {
    throw new Error("action must be implemented");
  }

  preAction() {
    // empty
  }
  
  postAction() {
    // empty
  }
}

module.exports = Command;
