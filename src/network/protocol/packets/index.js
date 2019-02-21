class Packet {
  constructor(packet) {
    this.object = packet;

    /**
     * Packet send
     * @type {boolean}
     * @public
     */
    this.send = true;
  }

  /**
   * Parses the packet
   * @abstract
   */
  parse() {
    throw new Error('Method not implemented.');
  }

  /**
   * Converts the packet to string
   * @abstract
   */
  toPacket() {
    throw new Error('Method not implemented.');
  }
}

module.exports = Packet;
