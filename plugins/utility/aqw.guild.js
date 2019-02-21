class Guild extends Plugin {
  constructor(server) {
    super(server, {
      name: 'guild',
      author: 'spirtiks',
      protocol: 'aqw',
      commands: [
        {
          name: 'guild',
          description: 'Attempts to create a guild name that is taken',
          execute: ({ client, parameters }) => {
            const guild = parameters.join(' ');
            return this.guild(client, guild);
          },
        },
      ],
      hooks: [
        {
          packet: 'gc',
          type: 'remote',
          execute: ({ client, packet }) => this.onGuildCreated(client, packet),
        },
      ],
    });

    /**
     * Guild creating check
     * @type {boolean}
     * @private
     */
    this._attempting = false;

    /**
     * Guild attempt interval
     * @type {Interval}
     * @private
     */
    this._interval = null;

    /**
     * Index of the array
     * @type {number}
     * @private
     */
    this._index = 0;

    /**
     * Special characters
     * @type {Array}
     * @private
     */
    this._characters = [
      '\x0e',
      '\x01',
      '\x02',
      '\x03',
      '\x04',
      '\x05',
      '\x06',
      '\x07',
      '\x08',
      '\x1a',
      '\x1b',
      '\x1c',
      '\x1d',
      '\x1e',
      '\x1f',
    ];
  }

  /**
   * Returns a characters
   * @returns {mixed}
   * @readonly
   */
  get character() {
    return this._characters[this._index++];
  }

  /**
   * Returns the characters array length
   * @returns {number}
   * @readonly
   */
  get charactersLength() {
    return this._characters.length;
  }

  /**
   * Attempts to create a guild
   * @param {Client} client Client instance
   * @param {string} guild Guild name
   * @returns {Promise<void>}
   * @public
   */
  async guild(client, guild) {
    if (this._interval) {
      this.clear(client, this._interval);
      return;
    }

    this._attempting = true;
    await client.general(`Attempting to create a guild called ${guild}`);
    this._interval = client.setInterval(() => this.create(client, guild), 600);
  }

  /**
   * Handles guild created packet
   * @param {Client} client Client instance
   * @param {Client} packet Pakcet instance
   * @returns {Promise<void>}
   * @public
   */
  onGuildCreated(client, packet) {
    if (this._attempting) {
      const { success } = packet.object.b.o;
      if (success) {
        this.clear(client, this._interval);
        return client.general('Guild created!');
      }
    }
    return Promise.resolve();
  }

  /**
   * Sends the guild create packet
   * @param {client} client Client instance
   * @param {string} guild Guild name
   * @returns {Promise<void>}
   * @public
   */
  create(client, guild) {
    if (this._index + 1 >= this.charactersLength) this.clear(client, this._interval);

    return client.remoteWrite(`%xt%zm%guild%1%gc%${guild}${this.character}%`);
  }

  /**
   * Reset the interval and everything else
   * @param {Client} client Client instance
   * @param {Interval} interval Interval to clear
   * @public
   */
  clear(client, interval) {
    client.clearInterval(interval);
    this._interval = null;
    this._attempting = false;
    this._index = 0;
  }
}

module.exports = Guild;
