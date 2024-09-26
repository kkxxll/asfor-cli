import { homedir } from "node:os";
import path from "node:path";
import { log, makeInput, makeList, getLatestVersion } from "@asfor-cli/utils";

const ADD_TYPE_PROJECT = "project";
const ADD_TYPE_PAGE = "page";
const ADD_TEMPLATE = [
  {
    name: "vue3",
    npmName: "@asfor-cli/template-vue3",
    value: "template-vue3",
    version: "0.0.1",
  },
  {
    name: "react18",
    npmName: "@asfor-cli/template-react18",
    value: "template-react18",
    version: "0.0.1",
  },
];
const ADD_TYPE = [
  {
    name: "项目",
    value: ADD_TYPE_PROJECT,
  },
  {
    name: "页面",
    value: ADD_TYPE_PAGE,
  },
];
// 缓存目录
const TEMP_HOME = ".asfor";

function getAddType() {
  return makeList({
    choices: ADD_TYPE,
    message: "请选择初始化类型",
    defaultValue: ADD_TYPE_PROJECT,
  });
}

function getAddName() {
  return makeInput({
    message: "请输入项目名称",
    defaultValue: "",
  });
}

function getAddTemplate() {
  return makeList({
    choices: ADD_TEMPLATE,
    message: "请选择模板",
  });
}
function makeTargetPath() {
  return path.resolve(`${homedir()}/${TEMP_HOME}`, "addTemplate");
}

export default async function createTemplate(name, opts) {
  const addType = await getAddType();
  log.verbose("addType", addType);

  if (addType === ADD_TYPE_PROJECT) {
    const addName = await getAddName();
    log.verbose("addName", addName);
    const addTemplate = await getAddTemplate();
    log.verbose("addTemplate", addTemplate);
    const selectTemplate = ADD_TEMPLATE.find((_) => _.value === addTemplate);
    log.verbose("selectTemplate", selectTemplate);

    // 获取最新版本号
    const latestVersion = await getLatestVersion(selectTemplate.npmName);
    log.verbose("latestVersion", latestVersion);
    selectTemplate.version = latestVersion;
    const targetPath = makeTargetPath(name);

    return {
      type: addType,
      name: addName,
      template: selectTemplate,
      targetPath,
    };
  }
}
