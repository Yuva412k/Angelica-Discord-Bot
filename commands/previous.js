const sendEmbed = require("../util/sendEmbed");

module.exports = {
  info: {
    name: "previous",
    description: "To play the previously played music",
    usage: "",
    aliases: ["prev"],
  },

  execute: async function (client, message, args) {
    const channel = message.member.voice.channel;
    if (!channel)return sendEmbed({color:'RED',description:"I'm sorry but you need to be in a voice channel to use this command"}, message.channel);
     const repeatMode = client.player.getRepeatMode(message)
    if(repeatMode === true){
      return sendEmbed({color:'RED',description:"You can\'t able to play previous song when repeat mode is on"}, message.channel);
    }
    if(!repeatMode) return
    client.player.previous(message)
    message.react("✅")
  }
};



