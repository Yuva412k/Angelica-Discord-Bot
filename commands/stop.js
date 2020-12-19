
module.exports = {
  info: {
    name: "stop",
    description: "To stop the music and clear the queue",
    usage: "",
    aliases: ['leave','s'],
  },

  execute: async function (client, message, args) {
    client.player.stop(message)
  }
}; 
