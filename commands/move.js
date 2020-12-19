const sendEmbed = require("../util/sendEmbed");

module.exports = {
  info: {
    name: "move",
    description: "To move song from the queue",
    usage: "<from_index> <new_index>",
    aliases: [],
  },

  execute: async function (client, message, args) {
    if(!args[0]){
      sendEmbed({color:'RED',description:'You must give an song number to remove'},message.channel)
    }
   if(args[0]){
      let num1 = parseInt(args[0]) - 1
      let num2;
      if(args[1]){
         num2 = parseInt(args[1]) - 1
      }else {
        num2 = 0
      }
      if(num1 !== NaN && num2 !== NaN){
      let r = client.player.move(message, num1, num2)
      if(r) sendEmbed({color:'BLUE',description:`${r.title} has been moved `},message.channel)
      }
  }
  }
}
