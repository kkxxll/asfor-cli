"use strict";
import Command from "@asfor-cli/command";
import { log, Github, makeList, getGitPlatform } from "@asfor-cli/utils";

class InstallCommand extends Command {
  get command() {
    return 'install'
  }
  get description() {
    return 'install project'
  }

  get options() {
    return [];
  }

  async action([name, opts]) {
    let platform = getGitPlatform()
    if (!platform) {
      platform = await makeList({
        message: '请选择Git平台',
        choices: [
          {
            name: 'github',
            value: 'github'
          },
          {
            name: 'gitee',
            value: 'gitee'
          }
        ]
      })
    }
    log.verbose('platform', platform)
    let gitAPI
    if (platform === 'github') {
      gitAPI = new Github();
    } else {

    }

    gitAPI.savePlatform(platform)
    await gitAPI.init()
    const searchResult = await gitAPI.searchRepositories({
      q: 'vue+language:vue',
      order: 'desc',
      sort: 'stars',
      per_page: 5,
      page: 1
    })
    console.log('searchResult', searchResult)
  }
}

function Install(instance) {
  return new InstallCommand(instance);
}

export default Install;
