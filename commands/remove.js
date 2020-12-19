const sendEmbed = require("../util/sendEmbed");

module.exports = {
  info: {
    name: "remove",
    description: "To remove song from the queue",
    usage: "<song_number>",
    aliases: ['delete'],
  },

  execute: async function (client, message, args) {
    if(!args[0]){
      sendEmbed({color:'BLUE',description:'You must give an song number to remove'},message.channel)
    }
   if(args[0]){
      let num = parseInt(args[0]) - 1
      console.log(num)
      if(num !== NaN){
      let r = client.player.remove(message, num)
      if(r) sendEmbed({color:'BLUE',description:`${r.title} has removed from queue`},message.channel)
      }
  }
  }
}

//remove using song name need to be added in the future