const { MessageEmbed } = require("discord.js")

module.exports = async (data,channel)=>{
    await channel.send({ embed: data });
}