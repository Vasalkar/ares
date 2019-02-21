const Server = require('./network/Server');
const Plugin = require('./plugin');
const logger = require('./Logger');
const Config = require('./config');

/**
 * Config
 */
Config.load();

/**
 * Global config
 */
global.Config = Config;

/**
 * Global plugin
 */
global.Plugin = Plugin;

/**
 * Spawn
 */
Server.spawn()
  .then(() => logger.info('Successfully initialized!'))
  .catch(error => logger.error(`Failed to spawn servers.. Reason: ${error.message}`));
