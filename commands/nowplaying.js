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
    let time = currentTrack.currentStreamTime
    function millisecondtoHMS( ms ) {

      var seconds = ms / 1000;
      var hours = parseInt( seconds / 3600 ); // 3,600 seconds in 1 hour
      seconds = seconds % 3600;
      var minutes = parseInt( seconds / 60 ); // 60 seconds in 1 minute
    
      // Keep only seconds not extracted to minutes:
      seconds = seconds % 60;
      hours =  hours;
      minutes = minutes;
      seconds = (seconds < 10) ? "0" + seconds : seconds;
      var hms
      if(hours === 0){
       hms = minutes+":"+seconds;
      }else{
       hms = hours+":"+minutes+":"+seconds;
      }
      return hms;
    }
    
    let embed = new MessageEmbed()
      .setTitle("Current Track Info!")
      .setColor("BLUE")
      .addField("Name", currentTrack.title+` [${millisecondtoHMS(time)}]`, true)
      .addField("Duration", currentTrack.duration, true)
      .addField("Requested by", `[${currentTrack.requestedBy}]`, true)
      .setFooter(`Views: ${currentTrack.views}`)
      message.channel.send(embed);
  },
};
