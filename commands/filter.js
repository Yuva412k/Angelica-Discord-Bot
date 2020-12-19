const { MessageEmbed } = require('discord.js');
const filters = require('../util/filters')
module.exports = {
    info: {
        name: "filter",
        description: "set different filters",
        usage: "bassboost | 8D",
        aliases: ["f"]
    },
    execute: async function(client, message, args){
        const queue = client.player.getFilters(message);
        if(!queue) return 
        console.log(queue)
        if(!args[0]){
            var allfilters = "";
            Object.keys(filters).forEach((filter) => {
                allfilters+="``"+filter+"``  |  ";
            })
    
            let embed = new MessageEmbed()
            .setTitle("Commands of "+client.user.username)
            .setColor("BLUE")
            .setDescription(allfilters)
            .setFooter(`To set filter you can do ${client.prefix}filter [filter] `)
            return message.channel.send(embed)
        }else{
        let searchFilter = args[0];
        let newFilter = {}
        let bool = false
        if(searchFilter === 'clear'){
            Object.keys(queue).forEach((filterName) => {
                newFilter[filterName] = false
            });

        }else{

        Object.keys(filters).forEach((filterName) => {
            if(filterName === searchFilter){
            switch(filterName){
                    case 'bassboost' : bool = queue.bassboost ? false : true;break;
                    case '8D' : bool = queue["8D"] ? false : true;break;
                    case 'vaporwave' : bool = queue.vaporwave ? false : true ; break;
                    case 'nightcore' : bool = queue.nightcore ? false : true ; break;
                    case 'phaser': bool = queue.nightcore ? false : true ; break;
                    case 'tremolo': bool = filters.tremolo? false : true ; break;
                    case 'vibrato': bool = filters.vibrato? false : true ; break;
                    case 'reverse': bool = filters.reverse? false : true ; break;
                    case 'treble': bool = filters.treble ? false : true ; break;
                    case 'normalizer': bool = filters.normalizer ? false : true ; break;
                    case 'surrounding': bool = filters.surrounding ? false : true ; break;
                    case 'pulsator': bool = filters.pulsator ?  false : true ; break;
                    case 'subboost': bool = filters.subboost ? false : true ; break;
                    case 'karaoke' : bool = filters.karaoke ?  false : true ; break;
                    case 'flanger' : bool = filters.flanger ? false : true ; break;
                    case 'gate': bool =filters.gate ?  false : true ; break;
                    case 'haas':bool = filters.hass ?  false : true ; break;
                    case 'mcompand' :bool = filters.mcompand ? false : true ; break;
            }
            newFilter[filterName] = bool;
            console.log(newFilter,searchFilter,filterName,client.player.getFilters(message).bassboost)
            }   
        });
        }
        if(newFilter){
            client.player.setFilters(message,newFilter)
        }
     }
   }
}