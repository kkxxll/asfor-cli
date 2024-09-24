import createCLI from "./createCLI.js";
import createInitCommand from "@asfor-cli/init";
import "./exception.js";

export default function (args) {
  const program = createCLI();
  createInitCommand(program);
}
