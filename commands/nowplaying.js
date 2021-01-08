const {MessageEmbed} = require('discord.js')
module.exports = {
  info: {
    name: "nowplaying",
    description: "To show the music which is currently playing in this server",
    usage: "",
    aliases: ["np","currentsong"],
  },

  execute: async function (client, message, args) {
    const currentTrack = client.player.nowPlaying(message)
    if(!currentTrack) return    
    let embed = new MessageEmbed()
      .setTitle("Current Track Info!")
      .setColor("BLUE")
      .addField("Name", currentTrack.title, true)
      .addField("Duration", currentTrack.duration , true)
      .addField("Requested by", `[${currentTrack.requestedBy}]`, true)
      .setFooter(`Views: ${currentTrack.views}`)
      message.channel.send(embed);
  },
};
