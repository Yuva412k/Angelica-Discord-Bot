const sendEmbed = require("../util/sendEmbed");
const play = require("./play");

module.exports = {
  info: {
    name: "repeat",
    description: "To repeat the current song in the server",
    usage: "<single> | <all> | <off>",
    aliases: ["loop"],
  },

  execute: async function (client, message, args) {
    const channel = message.member.voice.channel;
    if (!channel)return sendEmbed({color:'RED',description:"I'm sorry but you need to be in a voice channel to use this command"}, message.channel);
   
    let val = !args[0] ? null : args[0].toLowerCase()
    if(!args[0] || (val==='on' || val==='single')){
        client.player.setRepeatMode(message,true) 
        return sendEmbed({color:'BLUE',description:`[${message.author}] set Repeat Mode SINGLE`},message.channel)
    }
    else if(val==='all'){ 
        client.player.setRepeatMode(message, 2)
        return sendEmbed({color:'BLUE',description:`[${message.author}] set Repeat Mode ALL`},message.channel)
    }
    else if(val ==='off'){
         client.player.setRepeatMode(message, false)
        return sendEmbed({color:'BLUE',description:`[${message.author}] set Repeat Mode OFF`},message.channel)
    }else{
      return sendEmbed({color:'RED',description:`[${message.author}] Invalid command`},message.channel)
    }
  }
};
