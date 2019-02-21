const Config = require('./Config');
const Loader = require('./Loader');

/**
 * Config
 */
Config.load();

/**
 * Global config
 */
global.Config = Config;

/**
 * Loader
 */
Loader.initialize();
