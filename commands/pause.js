const sendEmbed = require("../util/sendEmbed")
module.exports = {
  info: {
    name: "pause",
    description: "To pause the current music in the server",
    usage: "",
    aliases: [],
  },

  execute: async function (client, message, args) {
    const channel = message.member.voice.channel;
    if (!channel)return sendEmbed({color:'RED',description:"I'm sorry but you need to be in a voice channel to use this command"}, message.channel);
    client.player.pause(message)
    sendEmbed({color:'YELLOW',description:`[${message.author}] Paused the Music`},message.channel)
  }
};
