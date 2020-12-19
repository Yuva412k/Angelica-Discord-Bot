const Discord = require('discord.js')
const Player = require('./Player')

class Track {

    constructor (videoData, user, player) {
        /**
         * The player instantiating the track
         * @type {Player}
         */
        this.player = player
        /**
         * The track title
         * @type {string}
         */
        this.title = videoData.title
        /**
         * The Youtube URL of the track
         * @type {string}
         */
        this.url = videoData.url
        /**
         * The video duration (formatted).
         * @type {string}
         */
        this.duration = videoData.duration ||
        `${Math.floor(parseInt(videoData.lengthSeconds) / 60)}:${parseInt(videoData.lengthSeconds) % 60}`

        /**
         * The video views
         * @type {?number}
         */
        this.views = parseInt(videoData.views)
        /**
         * The video channel
         * @type {string}
         */
        this.author = videoData.channel
            ? videoData.channel.name
            : videoData.author.name
        /**
         * The user who requested the track
         * @type {Discord.User?}
         */
        this.requestedBy = user
        
        /**
         * Whether the track was added from a playlist
         * @type {boolean}
         */
        this.fromPlaylist = videoData.fromPlaylist || false
    }

    /**
     * The track duration
     * @type {number}
     */
    get durationMS() {
        console.log(this.duration)
        let args 
        try{
            args = this.duration.timestamp.split(':')
         }catch(err) {
            args = this.duration.split(':')   
         }
        switch (args.length) {
        case 3: return parseInt(args[0]) * 60 * 60 * 1000 + parseInt(args[1]) * 60 * 1000 + parseInt(args[2]) * 1000
        case 2: return parseInt(args[0]) * 60 * 1000 + parseInt(args[1]) * 1000
        default: return parseInt(args[0]) * 1000
        }
    }
}

module.exports = Track
