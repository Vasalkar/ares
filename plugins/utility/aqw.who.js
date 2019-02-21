class Who extends Plugin {
  constructor(server) {
    super(server, {
      name: 'who',
      author: 'spirtiks',
      protocol: 'aqw',
      commands: [
        {
          name: 'who',
          description: 'Display\'s information about a player',
          execute: ({ client, parameters }) => this.who(client, parameters),
        },
      ],
    });
  }

  /**
   * Sends the who command to AdventureQuest 3D
   * @param {Client} client Client instance
   * @param {Array} parameters Command parameters
   * @returns {Promise<void>}
   * @public
   */
  who(client, parameters) {
    const player = parameters.join(' ');
    return client.remoteWrite(`%xt%zm%cmd%0%who%${player}%`);
  }
}

module.exports = Who;
