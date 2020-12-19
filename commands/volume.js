const sendEmbed = require('../util/sendEmbed')

module.exports = {
    info: {
      name: "volume",
      description: "To increase or decrease music volume",
      usage: "[number]",
      aliases: [],
    },
  
    execute: async function (client, message, args) {
      
    const channel = message.member.voice.channel;
    if (!channel)return sendEmbed({color:'RED',description:"I'm sorry but you need to be in a voice channel to use this command"}, message.channel);
    
    if(!args[0]) return sendEmbed({color:'RED',description:"You must give an number"}, message.channel);
      let num = parseInt(args[0])
      if(!num) return sendEmbed({color:'RED',description:"I'm sorry it is not a number"}, message.channel);
      if(num>100){
        return sendEmbed({color:'RED',description:"You should give number between 0 to 100"}, message.channel);
      }else if(num<0){
        return sendEmbed({color:'RED',description:"You should give number between 0 to 100"}, message.channel);
      }      const permissions = channel.permissionsFor(message.client.user);
      if (!permissions.has("CONNECT"))return sendEmbed({color:'RED',description:"I cannot connect to your voice channel, make sure I have the proper permissions!"}, message.channel);
      if (!permissions.has("SPEAK"))return sendEmbed({color:'RED',description:"I cannot speak in this voice channel, make sure I have the proper permissions!"}, message.channel);
  
 
      client.player.setVolume(message,num);
    }
  };
  