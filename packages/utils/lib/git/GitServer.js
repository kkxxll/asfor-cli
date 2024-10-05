import path from 'node:path'
import fs from 'node:fs'
import { homedir } from 'node:os'
import { pathExistsSync } from 'path-exists'
import fse from 'fs-extra'
import { makePassword } from '../inquirer.js'
import { execa } from 'execa'
import log from '../log.js'

const TEMP_HOME = '.asfor'
const TEMP_TOKEN = '.token'
const TEMP_PLATFORM = '.git_platform'

function createTokenPath() {
    return path.resolve(homedir(), TEMP_HOME, TEMP_TOKEN)
}
function createPlatformPath() {
    return path.resolve(homedir(), TEMP_HOME, TEMP_PLATFORM)
}

function getGitPlatform() {
    if (pathExistsSync(createPlatformPath())) {
        return fs.readFileSync(createPlatformPath()).toString()
    }
    return null
}

function getProjectPath(cwd, fullName) {
    const projectName = fullName.split('/')[1]; // vuejs/vue => vue
    return path.resolve(cwd, projectName);
}

function getPackageJson(cwd, fullName) {
    const projectPath = getProjectPath(cwd, fullName);
    const pkgPath = path.resolve(projectPath, 'package.json');
    if (pathExistsSync(pkgPath)) {
        return fse.readJsonSync(pkgPath);
    }
    return null;
}

class GitServer {
    constructor(options) {
    }

    async init() {
        const tokenPath = createTokenPath()
        if (pathExistsSync(tokenPath)) {
            this.token = fse.readFileSync(tokenPath).toString()
        } else {
            this.token = await this.getToken()
            fs.writeFileSync(tokenPath, this.token)
        }
        log.verbose('token', this.token)
        log.verbose('token path', tokenPath)

    }

    savePlatform(platform) {
        this.platform = platform
        fs.writeFileSync(createPlatformPath(), platform)
    }

    getPlatform() {
        return this.platform
    }

    getToken() {
        return makePassword({
            message: 'Please input your token:',
        })
    }


    saveOwn(own) {
        this.own = own;
        fs.writeFileSync(createOwnPath(), own);
    }

    saveLogin(login) {
        // this.login = login;
        // fs.writeFileSync(createLoginPath(), login);
    }



    getOwn() {
        return this.own;
    }

    getLogin() {
        return this.login;
    }

    cloneRepo(fullName, tag) {
        if (tag) {
            return execa('git', ['clone', this.getRepoUrl(fullName), '-b', tag]);
        } else {
            return execa('git', ['clone', this.getRepoUrl(fullName)]);
        }
    }

    installDependencies(cwd, fullName) {
        const projectPath = getProjectPath(cwd, fullName);
        if (pathExistsSync(projectPath)) {
            // return execa('npm', ['install', '--registry=https://registry.npmmirror.com'], { cwd: projectPath });
            return execa('cnpm', ['install'], { cwd: projectPath });
        }
        return null;
    }

    async runRepo(cwd, fullName) {
        const projectPath = getProjectPath(cwd, fullName);
        const pkg = getPackageJson(cwd, fullName);
        if (pkg) {
            const { scripts, bin, name } = pkg;
            if (bin) {
                await execa('npm',
                    ['install', '-g', name, '--registry=https://registry.npmmirror.com'],
                    { cwd: projectPath, stdout: 'inherit' }
                );
            }
            if (scripts && scripts.dev) {
                return execa('npm', ['run', 'dev'], { cwd: projectPath, stdout: 'inherit' });
            } else if (scripts && scripts.start) {
                return execa('npm', ['start'], { cwd: projectPath, stdout: 'inherit' });
            } else {
                log.warn('未找到启动命令');
            }
        }
    }

    // getUser() {
    //     throw new Error('getUser must be implemented!');
    // }

    // getOrg() {
    //     throw new Error('getOrg must be implemented!');
    // }

    // createRepo() {
    //     throw new Error('createRepo must be implemented!');
    // }
}

export {
    getGitPlatform,
    GitServer
}