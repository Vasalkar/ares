const { PROTOCOL_TYPE } = require('../../util/Constants');
const Room = require('../Room');

class Player {
  constructor(client, { id, username, token }) {
    /**
     * Client that instantiated this player
     * @type {Client}
     * @public
     */
    this._client = client;

    /**
     * Id that instantiated this player
     * @type {number}
     * @public
     */
    this.id = id;

    /**
     * Username that instantiated this player
     * @type {string}
     * @public
     */
    this.username = username || null;

    /**
     * Token that instantiated this player
     * @type {string}
     * @public
     */
    this.token = token;

    /**
     * Chat channel for AdventureQuest 3D
     * @type {number}
     * @public
     */
    this.channel = null;

    /**
     * Player room
     * @type {Room}
     * @public
     */
    this.room = new Room();
  }

  /**
   * Sends a message to the server
   * @param {string} text Message text to send
   * @returns {Promise<void>}
   * @public
   */
  message(text) {
    return this._client.protocol.message(text);
  }

  /**
   * Loads a shop by id
   * @param {number} id Shop id
   * @returns {Promise<void>}
   */
  shop(id) {
    return this._client.protocol.shop(parseInt(id));
  }
}

module.exports = Player;
