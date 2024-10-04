"use strict";
import Command from "@asfor-cli/command";
import { log, Github, Gitee, makeList, getGitPlatform, makeInput } from "@asfor-cli/utils";

const PREV_PAGE = '${prev_page}'
const NEXT_PAGE = '${next_page}'

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
    await this.generrateAPI()
    await this.searchGitAPI()
  }

  async generrateAPI() {
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
      gitAPI = new Gitee()
    }

    gitAPI.savePlatform(platform)
    await gitAPI.init()
    this.gitAPI = gitAPI
  }
  async doSearch() {

    let searchResult
    let count
    let list

    const platform = this.gitAPI.getPlatform()
    if (platform === 'github') {

      const params = {
        q: this.q + (this.language ? `+language:${this.language}` : ''),
        order: 'desc',
        sort: 'stars',
        per_page: this.perPage,
        page: this.page,
      }
      searchResult = await this.gitAPI.searchRepositories(params)
      log.verbose('search params:', params)
      count = searchResult.total_count
      list = searchResult.items.map(item => ({
        name: `${item.full_name}(${item.description})`,
        value: item.full_name
      }))
    }

    if (this.page * this.perPage < count) {
      list.push({
        name: '下一页',
        value: NEXT_PAGE
      })
    }
    if (this.page > 1) {
      list.unshift({
        name: '上一页',
        value: PREV_PAGE
      })
    }

    const keyword = await makeList({
      message: `请选择要下载的项目 （共 ${count}条数据）`,
      choices: list
    })

    if (keyword === NEXT_PAGE) {
      this.nextPage()
    } else if (keyword === PREV_PAGE) {
      this.prevPage()
    } else {
      // 下载
    }
  }

  async searchGitAPI() {

    this.q = await makeInput({
      message: '请输入搜索关键字',
      default: 'vue',
      validate(value) {
        if (!value.length) {
          return '请输入搜索关键字'
        }
        return true
      }
    })

    this.language = await makeInput({
      message: '请输入开发语言'
    })

    log.verbose('search keyword:', this.q, this.language)
    this.page = 1
    this.perPage = 10
    await this.doSearch()
  }

  async nextPage() {
    this.page++
    await this.doSearch()
  }

  async prevPage() {
    this.page--
    await this.doSearch()
  }
}

function Install(instance) {
  return new InstallCommand(instance);
}

export default Install;
