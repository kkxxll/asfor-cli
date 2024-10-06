import path from 'node:path';
import fs from 'node:fs';
import fse from 'fs-extra';
import Command from '@asfor-cli/command';
import { log, printErrorLog, makeList } from '@asfor-cli/utils';
import { ESLint } from 'eslint';
import ora from 'ora';
import vueConfig from './eslint/vueConfig.js';
import { execa } from 'execa';
// import jest from 'jest';
// import Mocha from 'mocha';

class LintCommand extends Command {
  get command() {
    return 'lint';
  }

  get description() {
    return 'lint project';
  }

  get options() {
    return [];
  }

  extractESLint(resultText, type) {
    const problems = /[0-9]+ problems/;
    const warnings = /([0-9]+) warnings/;
    const errors = /([0-9]+) errors/;
    switch (type) {
      case 'problems':
        return resultText.match(problems)[0].match(/[0-9]+/)[0];
      case 'warnings':
        return resultText.match(warnings)[0].match(/[0-9]+/)[0];
      case 'errors':
        return resultText.match(errors)[0].match(/[0-9]+/)[0];
      default:
        return null;
    }
  }

  parseESLintResult(resultText) {
    const problems = this.extractESLint(resultText, 'problems');
    const errors = this.extractESLint(resultText, 'errors');
    const warnings = this.extractESLint(resultText, 'warnings');
    return {
      problems: +problems || 0,
      errors: +errors || 0,
      warnings: +warnings || 0,
    };
  }

  async eslint() {
    // 1. eslint
    // 准备工作，安装依赖
    const spinner = ora('正在安装依赖').start();
    try {
      await execa('cnpm', ['install', '-D', 'eslint-plugin-vue']);
      await execa('cnpm', ['install', '-D', 'eslint-config-airbnb-base']);
      await execa('cnpm', ['install', '-D', 'eslint-plugin-import']);
    } catch (e) {
      printErrorLog(e);
    } finally {
      spinner.stop();
    }
    log.info('正在执行eslint检查');
    // 执行工作，eslint
    const cwd = process.cwd();
    const eslint = new ESLint({
      cwd,
      overrideConfig: vueConfig,
    });
    const results = await eslint.lintFiles(['./src/**/*.js', './src/**/*.vue']);
    const formatter = await eslint.loadFormatter('stylish');
    const resultText = formatter.format(results);
    console.log(resultText);
    const eslintResult = this.parseESLintResult(resultText);
    log.verbose('eslintResult', eslintResult);
    log.success('eslint检查完毕', '错误: ' + eslintResult.errors, '，警告: ' + eslintResult.warnings);
  }

  async autoTest() {
    // 执行自动化测试之前，让用户选择采用哪种方法进行测试
    // const cwd = process.cwd();
    // let testMode;
    // const imoocConfigFile = path.resolve(cwd, '.cli-imooc');
    // let config;
    // if (fs.existsSync(imoocConfigFile)) {
    //   config = fse.readJsonSync(imoocConfigFile);
    //   testMode = config.testMode;
    //   if (!testMode) {
    //     testMode = await makeList({
    //       message: '请选择自动化测试方法',
    //       choices: [
    //         { name: 'jest', value: 'jest' },
    //         { name: 'mocha', value: 'mocha' },
    //       ]
    //     });
    //     config.testMode = testMode;
    //     fse.writeJsonSync(imoocConfigFile, config);
    //   }
    // } else {
    //   testMode = await makeList({
    //     message: '请选择自动化测试方法',
    //     choices: [
    //       { name: 'jest', value: 'jest' },
    //       { name: 'mocha', value: 'mocha' },
    //     ]
    //   });
    //   fse.writeJsonSync(imoocConfigFile, {
    //     testMode,
    //   });
    // }
    // if (testMode === 'jest') {
    //   // 2. jest
    //   log.info('自动执行jest测试');
    //   await jest.run('test');
    //   log.success('jest测试执行完毕');
    // } else {
    //   // 3. mocha
    //   log.info('自动执行mocha测试');
    //   const mochaInstance = new Mocha();
    //   mochaInstance.addFile(path.resolve(cwd, '__tests__/mocha_test.js'));
    //   mochaInstance.run(() => {
    //     log.success('mocha测试执行完毕');
    //   });
    // }
  }

  async action() {
    log.verbose('lint');
    await this.eslint();
    // await this.autoTest();
  }
}

function Lint(instance) {
  return new LintCommand(instance);
}

export default Lint;
