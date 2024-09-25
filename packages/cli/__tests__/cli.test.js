import path from "node:path";
import execa from "execa";

const CLI = path.join(__dirname, "../bin/cli.js");
const bin = () => () => execa(CLI);

test("run error command", () => {
  bin()();
});
