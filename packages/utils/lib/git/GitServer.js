import path from 'node:path'
import fs from 'node:fs'
import { homedir } from 'node:os'
import { pathExistsSync } from 'path-exists'
import fse from 'fs-extra'
import { makePassword } from '../inquirer.js'
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

class GitServer {
    constructor(options) {
    }

    async init() {
        const tokenPath = createTokenPath()

        if (pathExistsSync(tokenPath)) {
            this.token = fse.readFileSync(tokenPath).toString()
            console.log(this.token)
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
        console.log('get Token')
        return makePassword({
            message: 'Please input your token:',
        })
    }
}

export {
    getGitPlatform,
    GitServer
}