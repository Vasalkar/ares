const Packet = require('../');

class XtPacket extends Packet {
  parse() {
    this.object = this.object.split('%');
  }

  get zm() {
    return this.object[2] === 'zm';
  }

  get type() {
    const index = this.zm ? 3 : 2;
    return this.object[index];
  }

  get params() {
    const index = this.zm ? 5 : 4;
    return this.object.slice(index);
  }

  get areaid() {
    const index = this.zm ? 4 : 3;
    return parseInt(this.object.slice(index));
  }

  toPacket() {
    return this.object.join('%');
  }
}

module.exports = XtPacket;
