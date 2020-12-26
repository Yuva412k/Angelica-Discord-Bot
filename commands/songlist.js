const { MessageEmbed } = require("discord.js");

module.exports = {
  info: {
    name: "songlist",
    description: "To show the server songs queue",
    usage: "",
    aliases: ["q", "queue", "list"],
  },

  execute: async function (client, message, args) {
        
    let server = await client.player.getQueue(message)
    if(!server) return 
    let tracks = server.tracks.slice(0, 10);
    if(!tracks) return
    let playing = await client.player.nowPlaying(message)
    let embed = new MessageEmbed()  
    .setTitle("Server Songs List:")
    .setColor("BLUE")
    .addField("Now Playing", playing.title, true)
    .addField("Text Channel", message.channel.name, true)
    .addField("Voice Channel", message.member.voice.channel.name, true)
    .setDescription(tracks.map((song,i) => {
      return `**${i+1}** ${song.title}`
    }).join("\n"))
    if(tracks.length === 1)embed.setDescription(`No songs to play next add songs by \`\`${client.prefix}play <song_name>\`\``)
    message.channel.send(embed)
  }
};