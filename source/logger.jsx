const TAG = 'GRAPHER'

class Logger {
  error(content) {
    console.error(`[${TAG}]: ${content}`)
  }
  info(content) {
    console.info(`[${TAG}]: ${content}`)
  }
}

export default Logger