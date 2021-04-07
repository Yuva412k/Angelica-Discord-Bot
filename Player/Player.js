const ytdl = require('discord-ytdl-core')
const Discord = require('discord.js')
const ytsr = require('yt-search')
const spotify = require('spotify-url-info')
const soundcloud = require('soundcloud-scraper')
const { EventEmitter } = require('events')
const ytpl = require('ytpl')
const Track = require('./Track')
const Queue = require('./Queue')

const filters = require('../util/filters')
 

const defaultPlayerOptions = {
    leaveOnEnd: true,
    leaveOnStop: true,
    leaveOnEmpty: true,
    leaveOnEmptyCooldown:15000
}

class Player extends EventEmitter{

    constructor (client, options = {}) {
        if (!client) throw new SyntaxError('Invalid Discord client')
        super()

        this.client = client

        this.servers = new Discord.Collection()

        this.options = defaultPlayerOptions
        for (const prop in options) {
            this.options[prop] = options[prop]
        }

        this.filters = filters

        // Listener to check the Voice State
        client.on('voiceStateUpdate', (oldState, newState) => this._handleVoiceStateUpdate(oldState, newState))
    }

    _addTrackToQueue (message, track) {
        const server = this.getQueue(message)
        if (!server) throw new Error('NotPlaying')
        if (!track || !(track instanceof Track)) throw new Error('No track to add to the queue specified')
        server.tracks.push(track)
        return server
    }

    _addTracksToQueue (message, tracks) {
        const server = this.getQueue(message)
        if (!server) throw new Error('Cannot add tracks to queue because no song is currently played on the server.')
        server.tracks.push(...tracks)
        return server
    }

    isPlaying (message) {
        return this.servers.some((g) => g.guildID === message.guild.id)
    }
    
    isVoiceEmpty (channel) {
        return channel.members.filter((member) => !member.user.bot).size === 0
    }

    pause (message) {
        // Get guild queue
        const server =this.servers.find((g) => g.guildID === message.guild.id)
        if (!server) return this.emit('error', 'NotPlaying', message)
        // Pause the dispatcher
        server.voiceConnection.dispatcher.pause()
        server.paused = true
    }

    resume (message) {
        // Get guild queue
        const server =this.servers.find((g) => g.guildID === message.guild.id)
        if (!server) return this.emit('error', 'NotPlaying', message)
        // Pause the dispatcher
        server.voiceConnection.dispatcher.resume()
        server.paused = false
    }

    stop (message) {
        // Get guild queue
        const server =this.servers.find((g) => g.guildID === message.guild.id)
        if (!server) return this.emit('error', 'NotPlaying', message)
        // Stop the dispatcher
        server.stopped = true
        server.tracks = []
        if (server.stream) server.stream.destroy()
        server.voiceConnection.dispatcher.end()
        if (this.options.leaveOnStop) server.voiceConnection.channel.leave()
        this.servers.delete(message.guild.id)
    }

    setSeek (message, seek) {
        return new Promise((resolve, reject) => {
            // Get guild queue
            const server = this.servers.find((g) => g.guildID === message.guild.id)
            if (!server) return reject('NotPlaying')
            let totalTime = server.playing.durationMS
            console.log("total:"+totalTime)
            if(seek>totalTime || seek < 0){
                return reject('InvalidSeek')
            }
            this._playAudioStream(server, false, seek).then(() => {
                resolve()
            })
        }).catch((err)=>{
            this.emit('error',err,message)
        })
    }

    forward (message, forwardTime){
        const server = this.servers.find((g) => g.guildID === message.guild.id)
        if (!server) return this.emit('error','NotPlaying',message)
        let currentStreamTime = server.voiceConnection.dispatcher.streamTime + server.additionalStreamTime;
        let newStreamTime = currentStreamTime + forwardTime
        this.setSeek(message, newStreamTime)
    }

    rewind (message, rewindTime){
        const server = this.servers.find((g) => g.guildID === message.guild.id)
        if (!server) return this.emit('error','NotPlaying',message)
        let currentStreamTime = server.voiceConnection.dispatcher.streamTime + server.additionalStreamTime;
        let newStreamTime = currentStreamTime - rewindTime
        this.setSeek(message, newStreamTime)
    }
    
    setFilters (message, newFilters) {
        return new Promise((resolve, reject) => {
            // Get guild queue
            const server = this.servers.find((g) => g.guildID === message.guild.id)
            if (!server) return reject('NotPlaying')
            Object.keys(newFilters).forEach((filterName) => {
                server.filters[filterName] = newFilters[filterName]
            })
            this._playAudioStream(server, true).then(() => {
                resolve()
            })
        }).catch(()=>{})
    }

    getFilters (message){
        const server = this.servers.find((g) => g.guildID === message.guild.id)
        if (!server){ 
            this.emit('error', 'NotPlaying', message)
            return null
        }
        
        return server.filters
    }

    setVolume (message, percent) {
        // Get guild queue
        const server =this.servers.get(message.guild.id)
        if (!server) return this.emit('error', 'NotPlaying', message)
        // Update volume
        server.volume = percent
        server.voiceConnection.dispatcher.setVolumeLogarithmic(server.calculatedVolume / 200)
    }

    getQueue (message) {
        // Gets guild queue
        const server =this.servers.get(message.guild.id)
        if (!server) {
            this.emit('error', 'NotPlaying', message)
            return null
        }    
        return server
    }

    clearQueue (message) {
        // Get guild queue
        const server =this.servers.get(message.guild.id)
        if (!server) return this.emit('error', 'NotPlaying', message)
        // Clear queue
        server.tracks = []
    }

    skip (message) {
        // Get guild queue
        const server =this.servers.get(message.guild.id)
        if (!server) {
            this.emit('error', 'NotPlaying', message)
            return null
        }
        // End the dispatcher
        server.voiceConnection.dispatcher.end()
        // Return the queue
        return server
    }
    previous (message) {
        // Get guild queue
        const server =this.servers.get(message.guild.id)
        if (!server) return this.emit('error', 'NotPlaying', message)
        // End the dispatcher
        server.voiceConnection.dispatcher.end()
        server.trackCount--;
        server.lastSkipped = true
        // Return the queue
        return server
    }

    nowPlaying (message) {
        // Get guild queue
        const server =this.servers.get(message.guild.id)
        if (!server) {
            this.emit('error', 'NotPlaying', message)
            return null 
        }
        const currentTrack = server.tracks[server.trackCount]
        currentTrack.currentStreamTime = server.voiceConnection.dispatcher.streamTime + server.additionalStreamTime
        // Return the current track
        return currentTrack
    }

    setRepeatMode (message, enabled) {
        // Get guild queue
        // true for single // 2 for All //false for no repeat
        const server =this.servers.get(message.guild.id)
        if (!server) {
            this.emit('error', 'NotPlaying', message)
            return null 
        }// Enable/Disable repeat mode
        server.repeatMode = enabled
        // Return the repeat mode
        return server.repeatMode
    }

    getRepeatMode(message){
        const server =this.servers.get(message.guild.id)
        if (!server) {
            this.emit('error', 'NotPlaying', message)
            return null 
        }
        return server.repeatMode
    }


    shuffle (message) {
        // Get guild queue
        const server =this.servers.get(message.guild.id)
        if (!server) return this.emit('error', 'NotPlaying', message)
        // Shuffle the queue (except the first track)
        let track = server.tracks[server.trackCount];
        if(!track) return this.emit('error','Shuffle Command',message)
        const currentTrack = server.tracks.filter((t) => t !== track)
        server.tracks = currentTrack.sort(() => Math.random() - 0.5)
        server.tracks.unshift(track)
        server.trackCount = 0;
        // Return the queue
        return server
    }

    move (message, newIndex , oldIndex){

        const server = this.servers.get(message.guild.id)
        if(!server) {
            this.emit('error','NotPlaying', message)
            return null        
        }
        let temp;
        if(oldIndex>=server.tracks.length || oldIndex<0){ 
            this.emit('invalidIndex',message,server.tracks.length) 
            return null
        }
        if(newIndex>=server.tracks.length || newIndex<0){
            this.emit('invalidIndex',message,server.tracks.length)
            return null
        }
        if(oldIndex === server.trackCount){server.trackCount = newIndex;console.log(server.trackCount)}
        else if(newIndex === server.trackCount){server.trackCount = oldIndex;console.log(server.trackCount)}
        temp = server.tracks[oldIndex]
        server.tracks[oldIndex] = server.tracks[newIndex]
        server.tracks[newIndex] = temp

        return server.tracks[newIndex]
    }

    remove (message, track) {
        // Get guild queue
        const serverQueue =this.servers.get(message.guild.id)
        if (!serverQueue) {this.emit('error', 'NotPlaying', message);return null}
        // Remove the trackFoundtrack from the queue
        let trackFound = null
        if (typeof track === 'number') {
            trackFound = serverQueue.tracks[track]
            if(serverQueue.trackCount == track) { this.emit("error","InvalidTrack",message);return null}
            if (trackFound) {
                serverQueue.tracks = serverQueue.tracks.filter((t) => t !== trackFound)
            }
        } else {
            trackFound = serverQueue.tracks.find((s) => s === track)
            if (trackFound) {
                serverQueue.tracks = serverQueue.tracks.filter((s) => s !== trackFound)
            }
        }
        // Resolve
        return trackFound
    }

    fix(message){
        const server = this.servers.get(message.guild.id)
        message.member.voice.channel.leave()

        if(!server) return this.emit('error','NotPlaying',message)
        server.stopped = true
        server.tracks = []
        if (server.stream) server.stream.destroy()
        
        // Remove the guild from the guilds list
        this.servers.delete(server.guildID)
    }

    _handleVoiceStateUpdate (oldState, newState) {
        // Search for a server for this channel
        const server = this.servers.find((data) => data.guildID === oldState.guild.id)
        if (!server) return

        // if the bot has been kicked from the channel, destroy ytdl stream and remove the queue
        if (newState.member.id === this.client.user.id && !newState.channelID) {
            server.stream.destroy()
            this.servers.delete(newState.guild.id)
            this.emit('botDisconnect', server.firstMessage)
        }

        // process leaveOnEmpty checks
        if (!this.options.leaveOnEmpty) return
        // If the member leaves a voice channel
        if (!oldState.channelID || newState.channelID) return

        // If the channel is not empty
        if (!this.isVoiceEmpty(server.voiceConnection.channel)) return
        setTimeout(() => {
            if (!this.isVoiceEmpty(server.voiceConnection.channel)) return
            // Disconnect from the voice channel
            server.voiceConnection.channel.leave()
            // Delete the server
            this.servers.delete(server.guildID)
            // Emit end event
            this.emit('channelEmpty', server.firstMessage, server)
        }, this.options.leaveOnEmptyCooldown || 0)
    }
    async _resolveUrl(url){
        const spotifySongRegex = (/https?:\/\/(?:embed\.|open\.)(?:spotify\.com\/)(?:track\/|\?uri=spotify:track:)((\w|-){22})/) 
        if(spotifySongRegex.test(url)){
            return 'spotify'
        }
        if(soundcloud.validateURL(url)){
            return 'sound-cloud'
        }
        if(ytpl.validateID(url)){
            return 'youtube-playlist'
        }else if(ytdl.validateURL(url)){
            return 'youtube-video'
        }else{
            return 'youtube-search'
        }
    }
    
    async _searchQuery(message,query,isCollector,typeofUrl){

        if(!query) return console.log('Query is empty')
        
        console.log(query)
        
        let tracks = []
        let newQuery = null
        if(typeofUrl==='spotify'){
            let spotifyData = await spotify.getPreview(query).catch(() => {})
            if (spotifyData) {
                newQuery = `${spotifyData.artist} - ${spotifyData.track}`
                typeofUrl = 'youtube-search'
            }
        }else if(typeofUrl==='sound-cloud'){
            let scData = await soundcloud.getSongInfo(query) 
            newQuery = `${scData.title} - ${scData.author}`
            typeofUrl = 'youtube-search'
        }

        if(typeofUrl==='youtube-search'){
            await ytsr.search(newQuery || query).then((results) => {
                if (results.length !== 0) {
                    tracks = results.videos.map((data) => new Track(data, message.author, this))
                }
            }).catch(() => {})
        }

        if (tracks.length === 0) return this.emit('noResults', message, query)

        if(!isCollector){
            let song = await tracks.shift()
            if (this.isPlaying(message)) {
                const server = this._addTrackToQueue(message, song)
                this.emit('trackAdd', message, server, server.tracks[server.tracks.length - 1])
            } else {
                const server = await this._spawnPlayer(message, song).catch((e) => this.emit('error', e, message))
                if(server) this.emit('trackStart', message, server.tracks[0])
            }
          }else{
            this.emit('searchResults', message, query, tracks)
            let selectedSongs = []
            const collector = message.channel.createMessageCollector((m) =>m.author.id === message.author.id,{time:60000,errors: ['time']})
            collector.on('collect', ({content})=> {
                console.log(`Collected ${content}`);
                if (!isNaN(content) && parseInt(content) >= 1 && parseInt(content) <= tracks.length){
                    selectedSongs.push(tracks[content-1])
                }else if(content === 'stop' || content == 'Stop'){
                    collector.stop()
                }
                else{
                   this.emit('searchInvalidResponse', message, query, tracks)
                }
            });
            
            collector.on('end', async (collected,reason) => {
                console.log(`Collected ${collected.size} items`);
                 if (reason === 'time') {
                    this.emit('searchCancel', message, query, tracks)
                 }
                if(selectedSongs.length !== 0){
                    if (this.isPlaying(message)) {
                        const queue =this._addTracksToQueue(message, selectedSongs)
                    } else {
                        const track = selectedSongs[0]
                        const queue = await this._spawnPlayer(message, track).catch((e) => this.emit('error', e, message))
                        if(queue){
                        this.emit('trackStart', message, queue.tracks[0])
                        this._addTracksToQueue(message, selectedSongs)
                        }
                    }
                    this.emit('collectedTracks',message, query, selectedSongs)
                }
            });
          }
    }

    async _playlistHandler (message, query) {
        const playlist = await ytpl(query)
        if (!playlist) return this.emit('noResults', message, query)
        console.log("playlist");
        playlist.tracks = playlist.videos.map((item) => new Track(item, message.author))
        playlist.duration = playlist.tracks.reduce((prev, next) => prev + next.duration, 0)
        playlist.requestedBy = message.author
        if (this.isPlaying(message)) {
            const queue =this._addTracksToQueue(message, playlist.tracks)
            this.emit('playlistAdd', message, queue, playlist)
        } else {
            const track = playlist.tracks.shift()
            const queue = await this._spawnPlayer(message, track).catch((e) => this.emit('error', e, message))
            this.emit('trackStart', message, queue.tracks[0])
            this._addTracksToQueue(message, playlist.tracks)
        }
    }

    async play (message, query,isCollector) {
        const isPlaying = this.isPlaying(message)
        if (!query) return 
        let trackToPlay
        let typeofUrl = await this._resolveUrl(query)
        
        if (query instanceof Track) {
            trackToPlay = query
        }
        else if(typeofUrl === 'youtube-playlist'){
           return this._playlistHandler(message,query)
        }
        else if(typeofUrl ==='youtube-video'){  
            const videoData = await ytdl.getBasicInfo(query)
             trackToPlay = new Track({
                title: videoData.videoDetails.title,
                url: videoData.videoDetails.video_url,
                views: videoData.videoDetails.viewCount,
                duration: false,
                lengthSeconds: videoData.videoDetails.lengthSeconds,
                author: {
                    name: videoData.videoDetails.author.name
                }
            }, message.author, this)
        }else {
            return this._searchQuery(message, query,isCollector,typeofUrl)
        }
        if (trackToPlay) {
            if (this.isPlaying(message)) {
                const server = this._addTrackToQueue(message, trackToPlay)
                this.emit('trackAdd', message, server, server.tracks[server.tracks.length - 1])
            } else {
                const server = await this._spawnPlayer(message, trackToPlay)
                this.emit('trackStart', message, server.tracks[0])
            }
        }
    }

    async _playTrack (server, firstPlay) {
        if (server.stopped) return this.emit('musicStop',server.firstMessage, server)
        // If there isn't next music in the queue
        if (server.tracks.length-1 <= server.trackCount && !server.repeatMode && !firstPlay) {
            // Leave the voice channel
            if (this.options.leaveOnEnd && !server.stopped) server.voiceConnection.channel.leave()
            // Remove the guild from the guilds list
            this.servers.delete(server.guildID)
            // Emit end event
            return this.emit('queueEnd', server.firstMessage, server)
        }
        // if the track needs to be the next one
        if(server.repeatMode === 2 && !firstPlay && !server.lastSkipped){
            server.trackCount++;
            if(server.trackCount >= server.tracks.length) server.trackCount = 0;
            else if(server.trackCount < 0) server.trackCount = server.tracks.length-1;
        }
        else if (!server.repeatMode && !firstPlay && !server.lastSkipped){
            server.trackCount++;
        }
        const track = server.playing
        // Reset lastSkipped state
        server.lastSkipped = false
        this._playAudioStream(server, false).then(() => {
            if (!firstPlay) this.emit('trackStart', server.firstMessage, track, server)
        })
    }

   _spawnPlayer(message, track) {
        return new Promise((resolve, reject) => {
            const channel = message.member.voice ? message.member.voice.channel : null
            if (!channel) return reject('NotConnected')
            const server = new Queue(message.guild.id, message, this.filters)
            this.servers.set(message.guild.id, server)
            channel.join().then((connection) => {
                server.voiceConnection = connection
                server.tracks.push(track)
                this.emit('queueCreate', message, server)
                resolve(server)
                this._playTrack(server, true)
            }).catch((err) => {
                console.error(err)
                this.servers.delete(message.guild.id)
                reject('UnableToJoin')
            })
        })
    }    
    
    _playAudioStream (server, updateFilter,seek = null) {
        return new Promise((resolve) => {
            let seekTime
            if(!seek){
                 seekTime = updateFilter ? server.voiceConnection.dispatcher.streamTime + server.additionalStreamTime : undefined
            }else{
                 seekTime = seek
            }
            if(updateFilter){
            console.log(seekTime, server.voiceConnection.dispatcher.streamTime)
            }
            const encoderArgsFilters = []
            Object.keys(server.filters).forEach((filterName) => {
                if (server.filters[filterName]) {
                    encoderArgsFilters.push(filters[filterName])
                }
            })
            let encoderArgs
            if (encoderArgsFilters.length < 1) {
                encoderArgs = []
            } else {
                encoderArgs = ['-af', encoderArgsFilters.join(',')]
            }
            const newStream = ytdl(server.playing.url, {
                filter: 'audioonly',
                opusEncoded: true,
                encoderArgs,
                seek: seekTime / 1000,
                highWaterMark: 1 << 25
            })
            setTimeout(() => {
                if (server.stream) server.stream.destroy()
                server.stream = newStream
                server.voiceConnection.play(newStream, {
                    type: 'opus',
                    bitrate: 'auto'
                })
                if (seekTime) {
                    server.additionalStreamTime = seekTime
                    console.log(server.additionalStreamTime)
                }
                server.voiceConnection.dispatcher.setVolumeLogarithmic(server.calculatedVolume / 200)
                // When the track starts
                server.voiceConnection.dispatcher.on('start', () => {
                    resolve()
                })
                // When the track ends
                server.voiceConnection.dispatcher.on('finish', () => {
                    // Reset streamTime
                    server.additionalStreamTime = 0
                    // Play the next track
                    return this._playTrack(server, false)
                })
            }, 1000)
        })
    }

}
module.exports = Player