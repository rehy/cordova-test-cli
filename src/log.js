import { logger } from 'cordova-paramedic-runner/lib/utils'

export default msg => {
  logger.info(`cordova-test-cli: ${msg}`)
}
