const sendEmbed = require("../util/sendEmbed");

module.exports = {
  info: {
    name: "seek",
    description: "To seek the music",
    usage: "1:00 | 0:10",
    aliases: [],
  },

  execute: async function (client, message, args) {
    const channel = message.member.voice.channel;
    if (!channel)return sendEmbed({color:'RED',description:"I'm sorry but you need to be in a voice channel to use this command"}, message.channel);
   
    if(!args[0]){
      return sendEmbed({color:'RED',description:'You must provide vaild time'},message.channel)
    }
    console.log(args[0])
    let seek
    let n = args[0].split(':')
    switch (n.length) {
      case 3: seek= parseInt(n[0]) * 60 * 60 * 1000 + parseInt(n[1]) * 60 * 1000 + parseInt(n[2]) * 1000;break;
      case 2: seek= parseInt(n[0]) * 60 * 1000 + parseInt(n[1]) * 1000;break;
      default: seek = parseInt(n[0]) * 1000;break;
     }
    console.log(seek)
    if(!seek != NaN) client.player.setSeek(message,seek)

  }
};
