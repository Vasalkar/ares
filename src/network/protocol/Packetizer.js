class Packetizer {
  constructor(size = 1024) {
    /**
     * Packet buffer
     * @type {Buffer}
     * @private
     */
    this._buffer = Buffer.allocUnsafe(size);

    /**
     * Buffer index
     * @type {number}
     * @private
     */
    this._index = 0;
  }

  /**
   * Returns the buffer length
   * @returns {number}
   * @readonly
   */
  get length() {
    return this._index;
  }

  /**
   * Returns the buffer
   * @returns {Buffer}
   * @readonly
   */
  get buffer() {
    return this._buffer.slice(0, this._index);
  }


  /**
   * Clears the buffer index
   * @public
   */
  clear() {
    this._index = 0;
  }

  /**
   * Slice the buffer
   * @param {number} start Start index
   * @param {number} end End index
   * @returns {Buffer}
   * @public
   */
  slice(start, end) {
    return this._buffer.slice(start, end);
  }

  /**
   * Removes bytes from the buffer
   * @param {number} amount Number of bytes to remove from the buffer
   * @public
   */
  remove(amount) {
    const available = this._index;

    if (amount > available) throw new RangeError('Invalid range!');

    this._buffer.copy(this._buffer, 0, amount);
    this._index -= amount;
  }

  /**
   * Returns the index of the first occurrence of a the buffers
   * @param {mixed} value Value to check
   * @returns {number}
   */
  indexOf(value) {
    const index = this._buffer.indexOf(value);
    if (index >= this._index) return -1;
    return index;
  }

  /**
   * Appends chuck of the packet to the buffer
   * @param {Buffer} buffer Packet buffer
   * @public
   */
  append(buffer) {
    const available = this._buffer.length - this._index;

    if (available < buffer.length) {
      const newBuffer = Buffer.allocUnsafe((this._buffer.length * 2) + buffer.length);
      this._buffer.copy(newBuffer);
      this._buffer = newBuffer;
    }

    buffer.copy(this._buffer, this._index, 0, buffer.length);
    this._index += buffer.length;
  }

  /**
   * Reads the buffer until the given value is found
   * @param {mixed} value Value to read
   * @returns {Buffer}
   * @public
   */
  sliceDelimiter(value) {
    const index = this.indexOf(value);

    if (index < 0) throw new RangeError('Invalid range!');
    return this.slice(0, index);
  }
}

module.exports = Packetizer;
