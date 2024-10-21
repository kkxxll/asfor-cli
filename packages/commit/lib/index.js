import path from 'node:path';
import fs from 'node:fs';
import fse from 'fs-extra';
import SimpleGit from 'simple-git';
import semver from 'semver'
import Command from '@asfor-cli/command';
import { log, printErrorLog, makeList, initGitServer, initGitType, clearCache, createRemoteRepo, makeInput } from '@asfor-cli/utils';

class CommitCommand extends Command {
  get command() {
    return 'commit';
  }

  get description() {
    return 'commit project';
  }

  get options() {
    return [
      ['-c, --clear', '清空缓存', false],
      ['-p, --publish', '发布', false],
    ];
  }

  async action([{ clear, publish }]) {
    log.verbose('params', clear);
    if (clear) {
      clearCache();
    }

    await this.createRemoteRepo();
    await this.initLocal();
    await this.commit()

    if (publish) {
      await this.publish()
    }
  }



  // 阶段1：创建远程仓库
  async createRemoteRepo() {
    // 1. 实例化Git对象
    this.gitAPI = await initGitServer();
    // 2. 仓库类型选择
    await initGitType(this.gitAPI);
    // 3. 创建远程仓库
    // 获取项目名称
    const dir = process.cwd();
    const pkg = fse.readJsonSync(path.resolve(dir, 'package.json'));
    this.name = pkg.name;
    this.version = pkg.version || '1.0.0'
    await createRemoteRepo(this.gitAPI, this.name);
    // 4. 生成.gitignore
    const gitIgnorePath = path.resolve(dir, '.gitignore');
    if (!fs.existsSync(gitIgnorePath)) {
      log.info('.gitignore不存在，开始创建');
      fs.writeFileSync(gitIgnorePath, `.DS_Store
node_modules
/dist


# local env files
.env.local
.env.*.local

# Log files
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*

# Editor directories and files
.idea
.vscode
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?`);
      log.success('.gitignore创建成功');
    }
  }

  // 阶段2：git本地初始化
  async initLocal() {
    // 生成git remote地址
    const remoteUrl = this.gitAPI.getRepoUrl(`${this.gitAPI.login}/${this.name}`);
    // 初始化git对象
    this.git = SimpleGit(process.cwd());
    // 判断当前项目是否进行git初始化
    const gitDir = path.resolve(process.cwd(), '.git');
    if (!fs.existsSync(gitDir)) {
      // 实现git初始化
      await this.git.init();
      log.success('完成git初始化');
    }
    // 获取所有的remotes
    const remotes = await this.git.getRemotes();
    if (!remotes.find(remote => remote.name === 'origin')) {
      this.git.addRemote('origin', remoteUrl);
      log.success('添加git remote', remoteUrl);
      // 检查未提交的代码
      await this.checkNotCommitted()

      // 检查远程master分支是否存在
      const tags = await this.git.listRemote(['--refs'])
      log.verbose('listRemote', tags)
      if (tags.indexOf('refs/heads/master') > -1) {
        // 拉取远程master分支，实现代码同步
        await this.pullRemoteRepo('master', {
          // 防止.git被删除之后，无法提交，这里允许不相关的历史记录
          '--allow-unrelated-histories': null
        })
      } else {
        // 直接推送当前到master分支
        await this.pushRemoteRepo('master')
      }
    }


  }

  // 阶段3：代码自动化提交
  async commit() {
    // 自动生成版本号
    await this.getCorrectVersion()

    await this.checkStash()
    await this.checkConflicted()
    await this.checkNotCommitted()
    await this.checkoutBranch(this.branch)
    await this.pullRemoteMasterAndBranch()
    await this.pushRemoteRepo(this.branch)
  }

  // 阶段4: 代码发布
  async publish() {
    await this.checkTag()
    await this.checkoutBranch('master')
    await this.mergeBranchToMaster()
    await this.pushRemoteRepo('master')
    await this.deleteLocalBranch()
    await this.deleteRemoteBranch()
  }

  async deleteLocalBranch() {
    log.info('删除本地分支')
    await this.git.deleteLocalBranch(this.branch)
    log.success('删除本地分支成功')
  }

  async deleteRemoteBranch() {
    log.info('删除远程分支')
    await this.git.push(['origin', '--delete', this.branch])
    log.success('删除远程分支成功')
  }

  async mergeBranchToMaster() {
    log.info(`[${this.branch}] -> [master]`)
    await this.git.mergeFromTo(this.branch, 'master')
    log.success(`合并成功 [${this.branch}] -> [master]`)
  }


  async checkTag() {
    log.info('获取远程 tag 列表')
    const tag = `release/${this.version}`
    const tagList = await this.getRemoteBranchList('release')
    log.verbose('tagList', tagList, this.version)
    if (tagList.includes(this.version)) {
      log.info(`远程${tag} 已存在`)
      // 删除tag也是通过push命令
      await this.git.push(['origin', `:refs/tags/${tag}`])
      log.success(`删除远程 ${tag} 成功`)
    } else {
      log.success(`${tag} 不存在，可以发布`)
    }
    const localTagList = await this.git.tags()
    if (localTagList.all.includes(tag)) {
      log.info(`本地tag ${tag} 已存在`)
      await this.git.tag(['-d', tag])
      log.success('删除本地 tag 成功')
    }
    await this.git.addTag(tag)
    log.success(`创建本地 tag ${tag} 成功`)
    await this.git.pushTags('origin')
    log.success(`推送远程 tag ${tag} 成功`)
  }

  async pullRemoteMasterAndBranch() {
    log.info(`合并 [master] -> [${this.branch}]`)
    await this.pullRemoteRepo('master')
    log.success('合并远程 [master] 分支成功')
    log.info('检查远程分支')
    const remoteBranchList = await this.getRemoteBranchList()
    if (remoteBranchList.indexOf(this.version) >= 0) {
      log.info(`合并 [${this.branch}] -> [${this.branch}]`)
      await this.pullRemoteRepo(this.branch)
      log.success(`合并远程 [${this.branch}] 分支成功`)
      await this.checkConflicted()
    } else {
      log.success('不存在远程分支')
    }
  }

  async pullRemoteRepo(branch = 'master', options = {}) {
    // 拉取远程master分支，实现代码同步
    await this.git.pull('origin', branch, options).catch(err => {
      log.error(`git pull origin ${branch}`, err.message);
      if (err.message.indexOf('find remote ref master') >= 0) {
        log.warn('获取远程[master]分支失败');
      }
      // 正常的方式退出
      process.exit(0)
    });
  }

  // 自动切换分支
  async checkoutBranch(branchName) {
    const localBranchList = await this.git.branchLocal()
    if (localBranchList.all.indexOf(branchName) >= 0) {
      await this.git.checkout(branchName)
    } else {
      // 创建分支
      await this.git.checkoutLocalBranch(branchName)
    }

    log.success(`本地分支切换到 ${branchName}`)
  }

  async checkConflicted() {
    log.info('代码冲突检查')
    const status = await this.git.status()
    if (status.conflicted.length > 0) {
      throw new Error('代码冲突，请手动处理后再提交')
    }
    log.success('代码无冲突')
  }

  // 缓冲区的代码检查
  async checkStash() {
    log.info('检查 stash 记录')
    // 获取未提交的文件
    const stashList = await this.git.stashList();

    if (stashList && stashList.all.length > 0) {
      await this.git.stash(['pop'])
      log.success('stash pop 成功')
    }
  }



  async getCorrectVersion() {
    log.info('获取分支')
    const remoteBranchList = await this.getRemoteBranchList('release')

    let releaseVersion = ''
    if (remoteBranchList && remoteBranchList.length > 0) {
      releaseVersion = remoteBranchList[0]
    }

    const devVersion = this.version
    log.verbose('devVersion', devVersion)
    log.verbose('releaseVersion', releaseVersion)
    if (!releaseVersion) {
      this.branch = `dev/${devVersion}`
    } else if (semver.gt(devVersion, releaseVersion)) {
      log.info(`当前版本大于线上release版本，${devVersion} > ${releaseVersion}`)
      this.branch = `dev/${devVersion}`
    } else {
      log.info(`当前版本小于等于线上release版本，${devVersion} <= ${releaseVersion}`)
      const incType = await makeList({
        message: '请选择版本号',
        defaultValue: 'patch',
        // x,y,z
        // 'patch', 'minor', 'major'
        choices: [{
          name: `小版本(${releaseVersion}) -> ${semver.inc(releaseVersion, 'patch')}`,
          value: 'patch'
        }, {
          name: `中版本(${releaseVersion}) -> ${semver.inc(releaseVersion, 'minor')}`,
          value: 'minor'
        }, {
          name: `大版本(${releaseVersion}) -> ${semver.inc(releaseVersion, 'major')}`,
          value: 'major'
        }],
      })
      const incVersion = semver.inc(releaseVersion, incType)
      this.branch = `dev/${incVersion}`
      this.version = incVersion
      this.syncVersionToPackageJson()
    }
    log.success(`分支获取成功 ${this.branch}`)

  }

  syncVersionToPackageJson() {
    const dir = process.cwd()
    const pkgPath = path.resolve(dir, 'package.json')
    const pkg = fse.readJsonSync(pkgPath)
    if (pkg && pkg.version !== this.version) {
      pkg.version = this.version
      fse.writeJsonSync(pkgPath, pkg, { spaces: 2 })
    }
  }

  async getRemoteBranchList(type) {
    const remoteList = await this.git.listRemote(['--refs'])
    let reg
    if (type === 'release') {
      // release/0.0.1
      reg = /.+?refs\/tags\/release\/(\d+\.\d+\.\d+)/
    } else {
      // dev/0.0.1
      reg = /.+?refs\/tags\/dev\/(\d+\.\d+\.\d+)/
    }
    log.verbose('remoteList', remoteList)
    return remoteList.split('\n').map(remote => {
      const match = reg.exec(remote)
      if (match && semver.valid(match[1])) {
        return match[1]
      }
    }).filter(_ => _).sort((a, b) => {
      if (semver.lte(b, a)) {
        if (a === b) return 0
        return -1
      }
    })

  }

  async checkNotCommitted() {
    const status = await this.git.status();
    if (status.not_added.length > 0 ||
      status.created.length > 0 ||
      status.deleted.length > 0 ||
      status.modified.length > 0 ||
      status.renamed.length > 0) {
      log.verbose('status', status)
      await this.git.add(status.not_added)
      await this.git.add(status.created)
      await this.git.add(status.deleted)
      await this.git.add(status.modified)
      await this.git.add(status.renamed.map(item => item.to))
      let message
      while (!message) {
        message = await makeInput({
          message: '请输入提交信息',
        })
      }
      await this.git.commit(message)
      log.success('本地 commit 提交成功')
    }
  }

  async pushRemoteRepo(branchName) {
    log.info(`推送代码至远程分支：${branchName}`)
    await this.git.push('origin', branchName)
    log.success('推送成功')
  }

}

function Commit(instance) {
  return new CommitCommand(instance);
}

export default Commit;
