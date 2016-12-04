#!/usr/bin/env node
import path from 'path'

import _ from 'lodash'
import chalk from 'chalk'
import tmp from 'tmp'
import yargs from 'yargs'

import ParamedicConfig from 'cordova-paramedic/lib/ParamedicConfig'

import {Runner} from '.'

function runTest(opts) {
  const {storedCWD} = opts
  const runnerOpts = _.omit(opts, 'storedCWD')
  const runner = new Runner(opts)
  runner.storedCWD = storedCWD
  return runner.run()
}

const parser = yargs
  .usage(`${chalk.bold('Usage:')} $0 ${chalk.blue('[options]')}`)
  .option('tmp-dir', {
    coerce: path.resolve,
    describe: 'Path to store the test project',
  })
  .option('stacktrace', {
    coerce: (opt) => opt ? '--stacktrace' : '',
  })
  .option('info', {
    coerce: (opt) => opt ? '--info' : '',
  })
  .option('debug', {
    coerce: (opt) => opt ? '--debug' : '',
  })
  .help('h')
  .version()
  .alias('h', 'help')
const opts = parser.argv
opts.gradleArgs = [opts.stacktrace, opts.info, opts.debug].join(' ')

const tmpDir = opts.tmpDir || tmp.dirSync().name
const storedCWD = process.cwd()
runTest({
  ...opts,
  storedCWD,
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
