import path from 'path'

import _ from 'lodash'
import {spawn} from 'child-process-promise'
import sh from 'shelljs'
import tmp from 'tmp'

import {exec, execPromise} from 'cordova-paramedic/lib/utils'
import {ParamedicRunner} from 'cordova-paramedic/lib/paramedic'
import ParamedicConfig from 'cordova-paramedic/lib/ParamedicConfig'

import log from './log'

async function runUnitTests({platform, tempFolder}) {
  const platformDir = path.join(tempFolder.name, 'platforms', platform)
  sh.pushd(platformDir)
  log(`running ${platform} unit tests`)
  switch (platform) {
    case 'android':
      await execPromise('./gradlew test')
      break
    case 'ios':
      break
  }
  sh.popd()
}

export class Runner extends ParamedicRunner {
  constructor(opts = {}) {
    const {tmpDir} = opts
    const config = _.omit(opts, 'tmpDir')
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

  get platform() {
    return this.config.getPlatformId()
  }

  createTempProject() {
    this.tempFolder = this.tempFolder ? this.tempFolder : tmp.dirSync()
    tmp.setGracefulCleanup()
    log(`creating temp project at ${this.tempFolder.name}`)
    exec(`cordova create ${this.tempFolder.name}`)
  }

  prepareProjectToRunTests() {
    return super.prepareProjectToRunTests()
      .then(async (result) => {
        log(`preparing project to run tests`)
        await execPromise(`cordova build ${this.platform}`)
        return result
      })
  }

  runTests() {
    return runUnitTests(this).then(() => super.runTests())
  }
}
