const { ADVENTUREQUEST_3D_PACKETS, ADVENTUREQUEST_WORLDS_PACKETS } = require('../util/Constants');

class Dispatcher {
  constructor(manager) {
    /**
     * Manager that instantiated this dispatcher
     * @type {PluginManager}
     * @private
     */
    this._manager = manager;
  }

  /**
   * Dispatches all local hooks
   * @param {Client} client Client instance
   * @param {Packet} packet Packet instance
   * @returns {Promise<void>}
   */
  async local(client, packet) {
    if (packet.type === ADVENTUREQUEST_WORLDS_PACKETS.MESSAGE || packet.type === ADVENTUREQUEST_3D_PACKETS.CHAT) {
      const message = packet.object.msg ? packet.object.msg : packet.object[5];

      if (message.startsWith(this._manager.server.prefix)) {
        packet.send = false;

        this.message(client, message);
        return;
      }
    }

    const promises = [];
    for (const [key, value] of this._manager.localPacketHooks) {
      if (value.includes(packet.type)) promises.push(key({ client, packet }));
    }
    await Promise.all(promises);
  }

  /**
   * Dispatches all remote hooks
   * @param {Client} client Client instance
   * @param {Packet} packet Packet instance
   * @returns {Promise<void>}
   */
  async remote(client, packet) {
    const promises = [];

    for (const [key, value] of this._manager.remotePacketHooks) {
      if (value.includes(packet.type)) promises.push(key({ client, packet }));
    }
    await Promise.all(promises);
  }

  /**
   * Dispatches a command
   * @param {Client} client Client instance
   * @param {string} message Command message
   * @returns {Promise<void>}
   */
  async message(client, message) {
    const parameters = message.split(' ');
    const cmd = parameters.shift().substr(1);
    if (!cmd) return;

    const command = this._manager.commands.get(cmd);
    if (command) await command.execute({ client, parameters });
    else client.commandNotFound(cmd);
  }
}

module.exports = Dispatcher;
