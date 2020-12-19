const Discord = require('discord.js')
const { EventEmitter } = require('events')
const Track = require('./Track')
const Player = require('./Player')

/**
 * Represents a guild server.
 */
class Queue extends EventEmitter {

    constructor (guildID, message, filters) {
        super()

        this.guildID = guildID

        this.voiceConnection = null

        this.stream = null

        this.tracks = []

        this.stopped = false

        this.trackCount = 0

        this.volume = 100

        this.paused = this.voiceConnection && this.voiceConnection.dispatcher && this.voiceConnection.dispatcher.paused
    
        this.repeatMode = false
    
        this.filters = {}
        Object.keys(filters).forEach((filter) => {
            this.filters[filter] = false
        })

        this.additionalStreamTime = 0

        this.firstMessage = message
    }

    get playing () {
        return this.tracks[this.trackCount]
    }

    get calculatedVolume () {
        return this.filters.bassboost ? this.volume + 50 : this.volume
    }
}

module.exports = Queue
