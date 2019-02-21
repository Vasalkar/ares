const { dumpAsciiLogo } = require('./util');
const logger = require('./Logger');
const path = require('path');

class Loader {
  constructor() {
    throw new Error(`The ${this.constructor.name} class may not be instantiated.`);
  }

  /**
   * Initializes Ares
   * @returns {Promise<void>}
   * @static
   */
  static async initialize() {
    dumpAsciiLogo();

    try {
      await this._express();
      await this._server();
    } catch (error) {
      logger.error(`Failed Initializing Ares! ${error.message}`);
    }
  }

  /**
   * Checks if the web server is enabled
   * @returns {Promise<void>}
   * @static
   */
  static async _express() {
    const { port, enabled } = Config.get('web.server');
    if (enabled) {
      const Express = require('./web');

      await Express(port);
      logger.info(`Express successfully listening ::${port}`, { label: 'Loader' });
    }
  }

  /**
   * Spawns the proxy server
   * @returns {Promise<void>}
   * @static
   */
  static async _server() {
    const Process = require('./Process');

    const process = new Process(path.join(__dirname, '.', 'Shard.js'));
    await process.spawn();
    logger.info('Sharding proxy server');
  }
}

module.exports = Loader;

