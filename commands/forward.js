const sendEmbed = require("../util/sendEmbed");

module.exports = {
  info: {
    name: "forward",
    description: "To forward the music player",
    usage: "<seconds>",
    aliases: [],
  },

  execute: async function (client, message, args) {
    const channel = message.member.voice.channel;
    if (!channel)return sendEmbed({color:'RED',description:"I'm sorry but you need to be in a voice channel to use this command"}, message.channel);
    let forward = parseInt(args[0])*1000

    if(!args[0] || forward == NaN){
      return sendEmbed({color:'RED',description:'You must provide vaild number'},message.channel)
    }
    console.log(args[0])
    console.log(forward)
    client.player.forward(message,forward)
  }
};
