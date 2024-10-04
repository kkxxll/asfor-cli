import createCLI from "./createCLI.js";
import createInitCommand from "@asfor-cli/init";
import installCommand from "@asfor-cli/install";
import "./exception.js";

export default function (args) {
  const program = createCLI();
  createInitCommand(program);
  installCommand(program);
  program.parse(process.argv)
}
