const requireAll = require('require-all');
const _ = require('lodash');
const path = require('path');

class Config {
  constructor() {
    throw new Error(`The ${this.constructor.name} class may not be instantiated.`);
  }

  /**
   * Loads the in-memory config store
   * If no configuration file found it will create one
   * @private
   */
  static load() {
    try {
      this._configuration = requireAll({
        dirname: FULL_PATH,
        filter: /(.*)\.js$/,
      });
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
  }

  /**
   * Returns the value if the given key is found
   * @param {string} key The object key
   * @param {Mixed} defaultValue The default value
   * @returns {Mixed}
   */
  static get(key, defaultValue) {
    return _.get(this._configuration, key, defaultValue);
  }
}

/**
 * Configuration path
 * @type {string}
 * @constant
 */
const FULL_PATH = path.join(__dirname, '..', 'config');

module.exports = Config;
