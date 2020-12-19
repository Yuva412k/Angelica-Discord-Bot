
module.exports = {
  info: {
    name: "fix",
    description: "To fix the music problem",
    usage: "",
    aliases: ['check'],
  },

  execute: async function (client, message, args) {
    const channel = message.member.voice.channel;
    
    const permissions = channel.permissionsFor(message.client.user);
    if (!permissions.has("CONNECT"))return sendEmbed({color:'RED',description:"I cannot connect to your voice channel, make sure I have the proper permissions!"}, message.channel);
    if (!permissions.has("SPEAK"))return sendEmbed({color:'RED',description:"I cannot speak in this voice channel, make sure I have the proper permissions!"}, message.channel);

    client.player.fix(message)
  }
};
