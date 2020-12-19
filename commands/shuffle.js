const sendEmbed = require("../util/sendEmbed")

module.exports = {
    info: {
      name: "shuffle",
      description: "To randomly shuffle the songs list ",
      usage: "",
      aliases: ["collapse"]  
    },execute: async function (client, message, args) {
       let tracks = client.player.shuffle(message)
       if(tracks) return sendEmbed({color:"BLUE",description:"Songs list has been shuffled!"},message.channel)
    }
}