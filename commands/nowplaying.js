const {MessageEmbed} = require('discord.js')
module.exports = {
  info: {
    name: "nowplaying",
    description: "To show the music which is currently playing in this server",
    usage: "",
    aliases: ["np","currentsong"],
  },

  execute: async function (client, message, args) {
    const track = client.player.nowPlaying(message)
    if(!track) return
    let embed = new MessageEmbed()
      .setTitle("Current track Info!")
      .setColor("BLUE")
      .addField("Name", track.title, true)
      .addField("Duration", track.duration, true)
      .addField("Requested by", `[${track.requestedBy}]`, true)
      .setFooter(`Views: ${track.views}`)
      message.channel.send(embed);
  },
};
