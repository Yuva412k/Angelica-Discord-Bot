const { MessageEmbed } = require('discord.js')

module.exports = {
    info: {
        name: "help",
        description: "To show all commands",
        usage: "[command]",
        aliases: ["commands", "help me", "pls help"]
    },

    execute: async function(client, message, args){

        if(!args[0]){
        var allcmds = "";

        client.commands.forEach(cmd => {
            let cmdinfo = cmd.info
            allcmds+="``"+client.prefix+cmdinfo.name+" "+cmdinfo.usage+"`` ~ "+cmdinfo.description+"\n"
        })

        let embed = new MessageEmbed()
        .setTitle("Commands of "+client.user.username)
        .setColor("BLUE")
        .setDescription(allcmds)
        .setFooter(`To get info of each command you can do ${client.prefix}help [command] `)
        return message.channel.send(embed)
        }
        else {
            let cmd = args[0]
            let command = client.commands.get(cmd)
            if(!command) command = client.commands.find(x => x.info.aliases.includes(cmd))
            if(!command) return message.channel.send("Unknown Command")
            let commandinfo = new MessageEmbed()
            .setTitle("Command: "+command.info.name+" info")
            .setColor("YELLOW")
            .setDescription(`
Name: ${command.info.name}
Description: ${command.info.description}
Usage: \`\`${client.prefix}${command.info.name} ${command.info.usage}\`\`
Aliases: ${command.info.aliases.join(", ")}
`)
            message.channel.send(commandinfo)
        }
    }
}
