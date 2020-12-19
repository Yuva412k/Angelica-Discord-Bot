const sendEmbed = require("../util/sendEmbed");

module.exports = {
  info: {
    name: "resume",
    description: "To resume the paused music",
    usage: "",
    aliases: [],
  },

  execute: async function (client, message, args) {
    const channel = message.member.voice.channel;
    if (!channel)return sendEmbed({color:'RED',description:"I'm sorry but you need to be in a voice channel to use this command"}, message.channel);
   
    client.player.resume(message)
    sendEmbed({color:'GREEN',description:`[${message.author}] Played the Music`},message.channel)

  }
};
