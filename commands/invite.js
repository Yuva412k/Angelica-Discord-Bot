const sendEmbed = require('../util/sendEmbed')

module.exports = {
  info: {
    name: "invite",
    description: "Invite me to your server",
    usage: "",
    aliases: [],
  },

  execute: async function (client, message, args) {
    sendEmbed({color:'GREEN', title: "Here's a invite link to invite the bot to your server, see you there!",description:"https://discordapp.com/oauth2/authorize?client_id=765777910966517770&scope=bot&permissions=2092104767"}, message.channel);
  }
};
