const Packetizer = require('./Packetizer');

class Protocol {
  constructor(client) {
    /**
     * Client that instantiated this protocol
     * @type {Client}
     * @public
     */
    this.client = client;

    /**
     * Local handlers
     * @type {Object}
     * @protected
     */
    this.localHandlers = {};

    /**
     * Remote handlers
     * @type {Object}
     * @protected
     */
    this.remoteHandlers = {};

    /**
     * Local packet delimiter
     * @type {Packetizer}
     * @public
     */
    this.localPacketizer = new Packetizer();

    /**
     * Remote packet delimiter
     * @type {Packetizer}
     * @public
     */
    this.remotePacketizer = new Packetizer();
  }

  /**
   * Returns the logger instance
   * @readonly
   */
  get logger() {
    return this.client.server.logger;
  }

  /**
   * Connection type
   * @returns {Object}
   * @readonly
   */
  get type() {
    return {
      LOCAL: 0,
      REMOTE: 1,
    };
  }

  /**
   * Packet types
   * @returns {Object}
   * @readonly
   */
  get packetType() {
    return {
      XML: 0,
      XT: 1,
      JSON: 2,
      UNDEFINED: 3,
    };
  }

  /**
   * Handles incoming/outgoing packets
   * @param {number} type Packet type
   * @param {Packet} packet Incoming/outgoing packet
   */
  handle(type, packet) {
    switch (type) {
      case this.type.LOCAL:
        if (this.localHandlers[packet.type]) this.localHandlers[packet.type].handle(packet);
        break;

      case this.type.REMOTE:
        if (this.remoteHandlers[packet.type]) this.remoteHandlers[packet.type].handle(packet);
        break;
    }
  }

  /**
   * Handles remote data chucks
   * @param {Buffer} data Data chuck to handle
   * @public
   */
  onRemoteData(data) {
    this.remotePacketizer.append(data);

    while (this.remotePacketizer.indexOf(NULL_DELIMITER) !== -1) {
      const packet = this.remotePacketizer.sliceDelimiter(NULL_DELIMITER);

      const constructed = this.constructPacket(packet);
      if (constructed) {
        constructed.parse();

        this.handle(this.type.REMOTE, constructed);
        this.client.server.plugins.dispatcher.remote(this.client, constructed);

        if (constructed.send) this.local(constructed);
      }
      this.remotePacketizer.remove(packet.length + 1);
    }
  }

  /**
   * Handles local data chucks
   * @param {Buffer} data Data chuck to handle
   * @public
   */
  onLocalData(data) {
    this.localPacketizer.append(data);

    while (this.localPacketizer.indexOf(NULL_DELIMITER) !== -1) {
      const packet = this.localPacketizer.sliceDelimiter(NULL_DELIMITER);

      const constructed = this.constructPacket(packet);
      if (constructed) {
        constructed.parse();

        this.handle(this.type.LOCAL, constructed);
        this.client.server.plugins.dispatcher.local(this.client, constructed);

        if (constructed.send) this.remote(constructed);
      }
      this.localPacketizer.remove(packet.length + 1);
    }
  }

  /**
   * Regsiters a local handler
   * @param {string|number} event Event type
   * @param {Handler} handler Handler to regsiter
   */
  regsiterLocalHandler(event, handler) {
    this.localHandlers[event] = new handler(this);
  }

  /**
   * Regsiters a remote handler
   * @param {string|number} event Event type
   * @param {Handler} handler Handler to regsiter
   */
  regsiterRemoteHandler(event, handler) {
    this.remoteHandlers[event] = new handler(this);
  }

  /**
   * Writes to the remote connection
   * @param {any} packet Packet to write
   * @abstract
   */
  remote() {
    throw new Error('Method not implemented.');
  }

  /**
   * Writes to the local connection
   * @param {any} packet Packet to write
   * @abstract
   */
  local() {
    throw new Error('Method not implemented.');
  }

  /**
   * Constructs the local packet
   * @param {string} packet Packet to construct
   * @abstract
   */
  constructPacket() {
    throw new Error('Method not implemented.');
  }
}

const NULL_DELIMITER = '\x00';

module.exports = Protocol;
