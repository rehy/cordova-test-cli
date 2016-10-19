#!/usr/bin/env node
import ParamedicConfig from 'cordova-paramedic/lib/ParamedicConfig'

import {Runner} from '.'

let storedCWD = storedCWD || process.cwd()
const runner = new Runner()
runner.storedCWD = storedCWD
runner.run()
.catch(function (error) {
  if (error && error.stack) {
    console.error(error.stack)
  } else if (error) {
    console.error(error)
  }
  process.exit(1)
})
.done((isTestPassed) => {
  const exitCode = isTestPassed ? 0 : 1
  process.exit(exitCode)
})
