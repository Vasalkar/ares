const Packet = require('../');

class JsonPacket extends Packet {
  parse() {
    this.object = JSON.parse(this.object);
  }

  get type() {
    return this.object.type || 255;
  }

  get cmd() {
    return this.object.cmd || 255;
  }

  toPacket() {
    return JSON.stringify(this.object);
  }
}

module.exports = JsonPacket;
