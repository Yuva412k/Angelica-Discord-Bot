const Discord = require('discord.js');
const fs = require('fs');
const ready = require('./events/ready');
const sendEmbed = require('./util/sendEmbed')

const client = new Discord.Client();
const Player = require('./Player/Player')

const player = new Player(client)

client.player = player

client.commands = new Discord.Collection();

client.prefix = '!';

client.server = new Map()

fs.readdir("./commands/", (err, files) => {
  if (err) return console.error(err);
  files.forEach((file) => {
    if (!file.endsWith(".js")) return;
    let props = require(`./commands/${file}`);
    let commandName = file.split(".")[0];
    client.commands.set(commandName, props);
    console.log("Loading Command: "+commandName)
  });
});


client.on('ready',()=>{
    ready(client);
});

// Then add some messages that will be sent when the events will be triggeRED
client.player

// Send a message when a track starts
.on('trackStart',(message, track)=>sendEmbed({color:'BLUE',description:`Now playing [${track.title}](${track.url}) [${track.duration}]`},message.channel))
// Send a message when something is added to the queue
.on('searchResults', (message, query, tracks) => {
const embed = new Discord.MessageEmbed()
.setAuthor(`Here are your search results for ${query}!`)
.setDescription(tracks.map((t, i) => `${i+1}. ${t.title}`))
.setFooter('Send the number of the song you want to play!')
message.channel.send(embed);
})
.on('collectedTracks', (message, query, tracks) => {
  const embed = new Discord.MessageEmbed()
  .setAuthor(`These are the Tracks you selected`)
  .setDescription(tracks.map((t, i) => `${i+1}. ${t.title}`))
  message.channel.send(embed);
  })
.on('searchInvalidResponse', (message, query, tracks) => sendEmbed({color:'RED',description:`You must send a valid number between 1 and ${tracks.length}!`},message.channel))
.on('searchCancel', (message, query, tracks) => sendEmbed({color:'RED',description:'You did not provide a valid response... Please send the command again!'},message.channel))
.on('musicStop',(message,queue)=>sendEmbed({color:'RED',description:`Music has been stopped`},message.channel))
.on('trackAdd', (message, queue, track) => sendEmbed({color:'BLUE',description:`[${track.title}](${track.url}) has been added to the queue!`},message.channel))
.on('playlistAdd', (message, queue, playlist) => sendEmbed({color:'BLUE',description:`${playlist.title} has been added to the queue (${playlist.items.length} songs)!`},message.channel))
// Send a message when the music is stopped
.on('queueEnd', (message, queue) => sendEmbed({color:'BLUE',description:'Music stopped as there is no more music in the queue!'},message.channel))
.on('channelEmpty', (message, queue) => sendEmbed({color:'RED',description:'Music stopped as there is no more member in the voice channel!'},message.channel))
.on('botDisconnect', (message) => sendEmbed({color:'RED',description:'Music stopped as I have been disconnected from the channel!'},message.channel))
.on('invalidIndex', (message, max) => sendEmbed({color:'RED',description:`You must send a valid number between 1 and ${max}!`},message.channel))

// Error handling
.on('error', (error, message) => {
  console.log(error)
    switch(error){
        case 'NotPlaying':
            sendEmbed({color:'RED',description:'There is no music being played on this server!'},message.channel)
            break;
        case 'NotConnected':
            sendEmbed({color:'RED',description:'You are not connected in any voice channel!'},message.channel)
            break;
        case 'UnableToJoin':
            sendEmbed({color:'RED',description:'I am not able to join your voice channel, please check my permissions!'},message.channel)
            break;
       case 'InvalidSeek':
            sendEmbed({color:'RED',description:'You must provide a valid time duration!'},message.channel)
            break;
       case 'InvalidTrack':
            sendEmbed({color:'RED',description:'You cannot remove a track that currently playing.!'},message.channel)
            break;
        
        default:
            sendEmbed({color:'RED',description:`Something went wrong... Error: ${error}`},message.channel)
    }
})

client.on('message', async(message)=>{
    if(message.author.bot) return;
    if(!message.content.startsWith(client.prefix)) return;
    const args = message.content.slice(client.prefix.length).split(/ +/);
    const command = args.shift().toLowerCase();
    if (command === 'ping') {
     return message.channel.send('Loading data...').then (async (msg) =>{
        msg.delete()
        sendEmbed({color:'BLUE',description:`🏓Latency is ${msg.createdTimestamp - message.createdTimestamp}ms. API Latency is ${Math.round(client.ws.ping)}ms`},message.channel);
      })
    }

  //Searching a command
  const cmd = client.commands.get(command);
  //Searching a command aliases
  const aliases = client.commands.find(x => x.info.aliases.includes(command))

  if(message.channel.type === "dm")return message.channel.send("None of the commands work in DMs. So please use commands in server!")

  //Executing the codes when we get the command or aliases
  if(cmd){
    cmd.execute(client, message, args);
  }else if(aliases){
    aliases.execute(client, message, args);
  }else return
})

client.login(process.env.TOKEN)
