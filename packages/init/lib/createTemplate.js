import { homedir } from "node:os";
import path from "node:path";
import { log, makeInput, makeList, getLatestVersion, request, printErrorLog } from "@asfor-cli/utils";

const ADD_TYPE_PROJECT = "project";
const ADD_TYPE_PAGE = "page";

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
    validate: (v) => {
      if (!v) {
        return "项目名称不能为空";
      }
      return true;
    },
  });
}

function getAddTemplate(list) {
  return makeList({
    choices: list,
    message: "请选择模板",
  });
}
function makeTargetPath() {
  return path.resolve(`${homedir()}/${TEMP_HOME}`, "addTemplate");
}

function getAddTeam(team) {
  return makeList({
    choices: team.map(item => ({ name: item, value: item })),
    message: '请选择团队',
  })
}


// 通过API获取项目模板
async function getTemplateFromAPI() {
  try {
    const data = await request({
      url: '/v1/project',
      method: 'get',
    });
    log.verbose('api template', data);
    return data;
  } catch (e) {
    printErrorLog(e);
    return null;
  }
} 

export default async function createTemplate(name, opts) {
  const ADD_TEMPLATE = await getTemplateFromAPI()
  const { type = null, template = null } = opts;
  log.verbose("name", name);
  log.verbose("opts", opts);
  const addType = type || await getAddType();
  log.verbose("addType", addType);

  if (addType === ADD_TYPE_PROJECT) {
    const addName = name || await getAddName();
    log.verbose("addName", addName);
    
    let teamList = ADD_TEMPLATE.map(_ => _.team)
    teamList = [...new Set(teamList)]
    const addTeam = await getAddTeam(teamList)
    log.verbose("addTeam", addTeam);
    
    const addTemplate = template || await getAddTemplate(ADD_TEMPLATE.filter(_ => _.team === addTeam));

    
    log.verbose("addTemplate", addTemplate);
    const selectTemplate = ADD_TEMPLATE.find((_) => _.value === addTemplate);

    if (!selectTemplate) {
      throw new Error("模板不存在");
    }
    // 获取最新版本号
    const latestVersion = await getLatestVersion(selectTemplate.npmName);
    log.verbose("latestVersion", latestVersion);
    selectTemplate.version = latestVersion;
    const targetPath = makeTargetPath(addName);

    return {
      type: addType,
      name: addName,
      template: selectTemplate,
      targetPath,
    };
  } else {
    throw new Error('暂不支持该功能')
  }
}
