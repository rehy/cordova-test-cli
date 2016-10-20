import path from 'path'

import {spawn} from 'child-process-promise'
import sh from 'shelljs'
import tmp from 'tmp'

import {exec, logger} from 'cordova-paramedic/lib/utils'
import {ParamedicRunner} from 'cordova-paramedic/lib/paramedic'
import ParamedicConfig from 'cordova-paramedic/lib/ParamedicConfig'

export class Runner extends ParamedicRunner {
  constructor({tmpDir, ...config} = {}) {
    const testPlugin = path.join(__dirname, '..', 'test-plugin')
    const paramedicConfig = new ParamedicConfig({
      platform: 'android',
      action: 'build',
      args: '',
      plugins: [testPlugin, process.cwd()],
      verbose: true,
      cleanUpAfterRun: true,
      ...config,
    })
    super(paramedicConfig, null)

    if (tmpDir) {
      this.tempFolder = {
        name: tmpDir,
      }
    }
  }

  createTempProject() {
    this.tempFolder = this.tempFolder ? this.tempFolder : tmp.dirSync()
    tmp.setGracefulCleanup();
    logger.info(`cordova-test-cli: creating temp project at ${this.tempFolder.name}`)
    exec(`cordova create ${this.tempFolder.name}`)
  }

  prepareProjectToRunTests() {
    super.prepareProjectToRunTests()
    exec('cordova prepare')
  }

  runTests() {
    const platform = this.config.getPlatformId()
    sh.pushd(path.join(this.tempFolder.name, 'platforms', platform))
    logger.info(`cordova-test-cli: running ${platform} unit tests`)
    switch (platform) {
      case 'android':
        exec('./gradlew test')
        break
    }
    sh.popd()
    return super.runTests()
  }
}
