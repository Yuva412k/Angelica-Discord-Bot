
module.exports = {
  info: {
    name: "next",
    description: "To skip the current music",
    usage: "",
    aliases: ["s","skip"],
  },

  execute: async function (client, message, args) {
    const channel = message.member.voice.channel;
    if (!channel)return sendEmbed({color:'RED',description:"I'm sorry but you need to be in a voice channel to use this command"}, message.channel);
    const repeatMode = client.player.getRepeatMode(message)
    if(repeatMode === true){
       return sendEmbed({color:'RED',description:"You can\'t able to skip when repeat mode is on"}, message.channel);
    }
    client.player.skip(message)
    message.react("✅")
  }
};
