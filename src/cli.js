#!/usr/bin/env node
import tmp from 'tmp'
import ParamedicConfig from 'cordova-paramedic/lib/ParamedicConfig'

import {Runner} from '.'

function runTest({storedCWD, ...opts}) {
  const runner = new Runner(opts)
  runner.storedCWD = storedCWD
  return runner.run()
}

const storedCWD = process.cwd()
const tmpDir = tmp.dirSync().name
runTest({
  storedCWD,
  tmpDir,
  platform: 'android',
}).catch(error => {
  if (error && error.stack) {
    console.error(error.stack)
  } else if (error) {
    console.error(error)
  }
  process.exit(1)
}).done(isTestPassed => {
  const exitCode = isTestPassed ? 0 : 1
  process.exit(exitCode)
})
