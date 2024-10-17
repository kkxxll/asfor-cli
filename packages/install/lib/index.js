"use strict";
import ora from 'ora'
import Command from "@asfor-cli/command";
import { log, makeList, makeInput, printErrorLog, initGitServer } from "@asfor-cli/utils";

const PREV_PAGE = '${prev_page}'
const NEXT_PAGE = '${next_page}'
const SEARCH_MODE_REPO = 'search_repo'
const SEARCH_MODE_CODE = 'search_code'

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
    log.verbose('full_name', this.keyword);

    if (!this.keyword) {
      return
    }

    await this.selectTags()
    log.verbose('selected_tag', this.selectedTag);

    if (!this.selectedTag) {
      return
    }

    await this.downloadRepo();
    await this.installDependencies();
    await this.runRepo();
  }

  async runRepo() {
    await this.gitAPI.runRepo(process.cwd(), this.keyword);
  }

  async downloadRepo() {
    const spinner = ora(`正在下载: ${this.keyword}(${this.selectedTag})`).start();
    try {
      await this.gitAPI.cloneRepo(this.keyword, this.selectedTag);
      spinner.stop();
      log.success(`下载成功: ${this.keyword}(${this.selectedTag})`);
    } catch (e) {
      spinner.stop();
      printErrorLog(e);
    }
  }

  async installDependencies() {
    const spinner = ora(`正在安装依赖: ${this.keyword}(${this.selectedTag})`).start();
    try {
      const ret = await this.gitAPI.installDependencies(process.cwd(), this.keyword, this.selectedTag);
      spinner.stop();
      if (!ret) {
        log.error(`依赖安装失败: ${this.keyword}(${this.selectedTag})`);
      } else {
        log.success(`依赖安装成功: ${this.keyword}(${this.selectedTag})`);
      }
    } catch (e) {
      spinner.stop();
      printErrorLog(e);
    }
  }

  async generrateAPI() {
    this.gitAPI = await initGitServer();
  }
  async doSearch() {
    let searchResult
    let count = 0
    let list = []
    const platform = this.gitAPI.getPlatform()
    if (platform === 'github') {
      const params = {
        q: this.q + (this.language ? `+language:${this.language}` : ''),
        order: 'desc',
        sort: 'stars',
        per_page: this.perPage,
        page: this.page,
      }
      log.verbose('search params:', params)
      // github
      if (this.mode === SEARCH_MODE_REPO) {
        searchResult = await this.gitAPI.searchRepositories(params)
        list = searchResult.items.map(item => ({
          name: `${item.full_name}(${item.description})`,
          value: item.full_name
        }))
      } else {
        searchResult = await this.gitAPI.searchCode(params)
        list = searchResult.items.map(item => ({
          name: item.repository.full_name + (item.repository.description ? `(${item.repository.description})` : ''),
          value: item.repository.full_name
        }))
      }
      count = searchResult.total_count; // 整体数据量
    } else {
      // gitee
      const params = {
        q: this.q,
        order: 'desc',
        // sort: 'stars_count',
        per_page: this.perPage,
        page: this.page,
      };
      if (this.language) {
        params.language = this.language; // 注意输入格式：JavaScript
      }
      log.verbose('search params', params);
      searchResult = await this.gitAPI.searchRepositories(params);
      count = 9999999;
      
      log.verbose('searchResult', searchResult);
      
      list = searchResult.map(item => ({
        name: `${item.full_name}(${item.description})`,
        value: item.full_name
      }))
    }

    // 判断当前页面，已经是否到达最大页数
    if ((platform === 'github' && this.page * this.perPage < count) || list.length > 0) {
      list.push({
        name: '下一页',
        value: NEXT_PAGE,
      });
    }
    if (this.page > 1) {
      list.unshift({
        name: '上一页',
        value: PREV_PAGE,
      });
    }

    if (count > 0 && list.length) {
      const keyword = await makeList({
        message: platform === 'github' ? `请选择要下载的项目（共${count}条数据）` : '请选择要下载的项目',
        choices: list,
      });

      if (keyword === NEXT_PAGE) {
        await this.nextPage();
      } else if (keyword === PREV_PAGE) {
        await this.prevPage();
      } else {
        // 下载项目
        this.keyword = keyword;
      }
    }
  }

  async searchGitAPI() {
    const platform = this.gitAPI.getPlatform()

    if (platform === 'github') {
      this.mode = await makeList({
        message: '请选择搜索模式',
        choices: [
          {
            name: '仓库',
            value: SEARCH_MODE_REPO
          },
          {
            name: '代码',
            value: SEARCH_MODE_CODE
          }
        ]
      })
    } else {
      this.mode = SEARCH_MODE_REPO
    }

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

    log.verbose('search keyword:', this.q, this.language, platform)


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
  async selectTags() {
    this.tagPage = 1;
    this.tagPerPage = 30;
    await this.doSelectTags();
  }

  async doSelectTags() {
    const platform = this.gitAPI.getPlatform();
    let tagsListChoices = [];
    if (platform === 'github') {
      const params = {
        page: this.tagPage,
        per_page: this.tagPerPage,
      };
      const tagsList = await this.gitAPI.getTags(this.keyword, params);
      tagsListChoices = tagsList.map(item => ({
        name: item.name,
        value: item.name,
      }));
      if (tagsList.length > 0) {
        tagsListChoices.push({
          name: '下一页',
          value: NEXT_PAGE,
        });
      }
      if (this.tagPage > 1) {
        tagsListChoices.unshift({
          name: '上一页',
          value: PREV_PAGE,
        });
      }
    } else {
      const tagsList = await this.gitAPI.getTags(this.keyword);
      tagsListChoices = tagsList.map(item => ({
        name: item.name,
        value: item.name,
      }));
    }
    const selectedTag = await makeList({
      message: '请选择tag',
      choices: tagsListChoices,
    });

    if (selectedTag === NEXT_PAGE) {
      await this.nextTags();
    } else if (selectedTag === PREV_PAGE) {
      await this.prevTags();
    } else {
      this.selectedTag = selectedTag;
    }
  }

  async nextTags() {
    this.tagPage++;
    await this.doSelectTags();
  }

  async prevTags() {
    this.tagPage--;
    await this.doSelectTags();
  }
}

function Install(instance) {
  return new InstallCommand(instance);
}

export default Install;
