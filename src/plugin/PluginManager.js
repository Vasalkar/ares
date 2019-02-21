const { PROTOCOL_TYPE } = require('../util/Constants');
const Dispatcher = require('./Dispatcher');
const logger = require('../Logger');
const { isArray } = require('util');
const fse = require('fs-extra');
const Plugin = require('./');
const path = require('path');

class PluginManager {
  constructor(server) {
    /**
     * Server that instantiated this plugin manager
     * @type {TCPServer}
     * @public
     */
    this.server = server;

    /**
     * Plugin dispatcher
     * @type {Dispatcher}
     * @public
     */
    this.dispatcher = new Dispatcher(this);

    /**
     * Stores all of the plugins in-memory
     * @type {Map<string, Plugin>}
     * @public
     */
    this.plugins = new Map();

    /**
     * Stores all of the command in-memory
     * @type {Map<string, Function>}
     * @public
     */
    this.commands = new Map();

    /**
     * Stores all of the local packet hooks in-memory
     * @type {Map<Function, Array>}
     * @public
     */
    this.localPacketHooks = new Map();

    /**
     * Stores all of the remote packet hooks in-memory
     * @type {Map<Function, Array>}
     * @public
     */
    this.remotePacketHooks = new Map();
  }

  /**
   * Iterates the plguins array and stores the plugins in-memory
   * @param {string} directory Directory
   * @returns {Array<string>}
   * @static
   */
  static loadAll(directory) {
    const result = [];

    (function read(dir) {
      const files = fse.readdirSync(dir);
      for (const file of files) {
        const filePath = path.join(dir, file);
        if (fse.statSync(filePath).isDirectory()) read(filePath);
        else result.push(filePath);
      }
    }(directory));
    return result;
  }

  /**
   * Loads all of the plugins
   * @public
   */
  loadAll() {
    logger.info(`Loading plugins...`);

    const pluginPath = path.join(__dirname, '..', '..', 'plugins');
    if (!fse.existsSync(pluginPath)) {
      fse.emptyDirSync(pluginPath);
      logger.error(`Plugin directory not found! Creating one...`);
      process.exit(0);
    }

    const plugins = this.constructor.loadAll(pluginPath);
    for (const plugin of plugins) this._registerPlugin(require(plugin));
    logger.info(`Loaded ${this.plugins.size} plugin(s)!`);
  }

  /**
   * Registers a single plugin
   * @param {Plugin} plugin Plugin constructor
   * @private
   */
  _registerPlugin(plugin) {
    if (typeof plugin === 'function') plugin = new plugin(this.server);
    if (!(plugin instanceof Plugin)) throw new Error(`Invalid plugin object ${plugin}`);

    if (!plugin.protocol) throw new Error('No protocol specified');
    if (this.plugins.has(plugin.name)) throw new Error(`A plugin with the name ${plugin.name} already exists`);
    if (!PROTOCOL_TYPES.includes(plugin.protocol.toLowerCase())) throw new Error('Invalid protocol type');

    if (plugin.protocol === this.server.protocol || plugin.protocol === PROTOCOL_TYPE.ANY) {
      this.plugins.set(plugin.name, plugin);

      if (plugin.commands.length) this._registerCommands(plugin.commands);
      if (plugin.hooks.length) this._registerHooks(plugin.hooks);
      plugin.initialize();
    }
  }

  /**
   * Registers all of the commands
   * @param {Array} commands Commands in the plugin
   * @private
   */
  _registerCommands(commands) {
    if (!isArray(commands)) throw new Error('Commands must be a typeof array');

    for (const command of commands) this._registerCommand(command);
  }

  /**
   * Registers all of the hooks
   * @param {Array} hooks Hooks in the plugin
   * @private
   */
  _registerHooks(hooks) {
    if (!isArray(hooks)) throw new Error('Hooks must be a typeof array');

    for (const hook of hooks) this._registerhook(hook);
  }

  /**
   * Registers a single command
   * @param {Object} command Command object
   * @private
   */
  _registerCommand(command) {
    if (typeof command.name !== 'string') throw new Error('Command name must be a typeof string');
    if (typeof command.description !== 'string') throw new Error('Command description must be a typeof string');
    if (typeof command.execute !== 'function') throw new Error('Command execute callback must be a typeof function');

    if (this.commands.has(command.name)) throw new Error(`Command with the name ${command.name} already exists`);

    const { execute, description } = command;
    this.commands.set(command.name, { execute, description });
  }

  /**
   * Registers a single hook
   * @param {Object} hook Hook object
   * @private
   */
  _registerhook(hook) {
    // eslint-disable-next-line max-len
    if (typeof hook.packet !== 'string' && typeof hook.packet !== 'number') throw new Error('Hook type must be a typeof string or number');
    if (typeof hook.type !== 'string') throw new Error('Hook type must be a typeof string');
    if (typeof hook.execute !== 'function') throw new Error('Hook execute callback must be a typeof function');

    if (!PACKET_HOOK_TYPES.includes(hook.type.toLowerCase())) {
      throw new Error('Invalid packet hook type. Type must be either local or remote');
    }

    if (hook.type === 'local') this._registerLocalHook(hook);
    else if (hook.type === 'remote') this._registerRemoteHook(hook);
  }

  /**
   * Registers a local packet hook
   * @param {Object} hook Hook object
   */
  _registerLocalHook(hook) {
    if (this.localPacketHooks.has(hook.execute)) this.localPacketHooks.get(hook.execute).push(hook.packet);
    else this.localPacketHooks.set(hook.execute, [hook.packet]);
  }

  /**
   * Registers a remote packet hook
   * @param {Object} hook Hook object
   */
  _registerRemoteHook(hook) {
    if (this.remotePacketHooks.has(hook.execute)) this.remotePacketHooks.get(hook.execute).push(hook.packet);
    else this.remotePacketHooks.set(hook.execute, [hook.packet]);
  }
}

/**
 * Packet hook types
 * @type {Array}
 * @constant
 */
const PACKET_HOOK_TYPES = [
  'local',
  'remote',
];

/**
 * Protocol types
 * @type {Array}
 * @constant
 */
const PROTOCOL_TYPES = [
  'aq3d',
  'aqw',
  'any',
];

module.exports = PluginManager;
