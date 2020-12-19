const sendEmbed = require('../util/sendEmbed')

module.exports ={
  info: {
    name: "search",
    description: "To Search for the song",
    usage: "<song_name>",
    aliases: [],
  }, execute:  async function (client,message,args){
    const channel = message.member.voice.channel;
    if (!channel)return sendEmbed({color:'RED',description:"I'm sorry but you need to be in a voice channel to play music!"}, message.channel);

    const permissions = channel.permissionsFor(message.client.user);
    if (!permissions.has("CONNECT"))return sendEmbed({color:'RED',description:"I cannot connect to your voice channel, make sure I have the proper permissions!"}, message.channel);
    if (!permissions.has("SPEAK"))return sendEmbed({color:'RED',description:"I cannot speak in this voice channel, make sure I have the proper permissions!"}, message.channel);

        var query = null
        let isCollector = true
        query = args.join(' ')
        client.player.play(message,query,isCollector)        
    }
 }
