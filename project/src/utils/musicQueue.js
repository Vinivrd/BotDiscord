const { Player } = require('discord-player');
const { Client } = require('discord.js');
const { createAudioPlayer, AudioPlayerStatus, VoiceConnectionStatus, NoSubscriberBehavior, createAudioResource } = require('@discordjs/voice');
const { YouTubeExtractor } = require('@discord-player/extractor');
const play = require('play-dl');

class MusicQueue {
    constructor(guildId, player) {
        this.guildId = guildId;
        this.player = player;
        this.queue = [];
        this.currentTrack = null;
        this.connection = null;
        this.voiceChannel = null;
        this.audioPlayer = createAudioPlayer({
            behaviors: {
                noSubscriber: NoSubscriberBehavior.Play
            }
        });
        this.isPlaying = false;

        // Configurar listeners do audioPlayer
        this.setupAudioPlayerListeners();
    }

    setupAudioPlayerListeners() {
        this.audioPlayer.on(AudioPlayerStatus.Idle, () => {
            console.log('AudioPlayer ficou Idle, tocando próxima música...');
            this.playNext();
        });

        this.audioPlayer.on('error', (error) => {
            console.error('Erro no AudioPlayer:', error);
            this.isPlaying = false;
            this.playNext();
        });

        this.audioPlayer.on(AudioPlayerStatus.Playing, () => {
            console.log('AudioPlayer começou a tocar');
        });

        this.audioPlayer.on(AudioPlayerStatus.Buffering, () => {
            console.log('AudioPlayer está bufferizando');
        });
    }

    setupConnectionListeners() {
        if (!this.connection) {
            console.error('Tentativa de setup de listeners sem conexão');
            return;
        }

        this.connection.on(VoiceConnectionStatus.Disconnected, async (oldState, newState) => {
            console.log('Conexão desconectada. Tentando reconectar...');
            try {
                await Promise.race([
                    this.connection.destroy(),
                    new Promise(resolve => setTimeout(resolve, 5000))
                ]);
            } catch (error) {
                console.error('Erro ao lidar com desconexão:', error);
                this.connection.destroy();
            }
        });

        this.connection.on('error', error => {
            console.error('Erro detalhado na conexão de voz:', error);
        });

        this.connection.on(VoiceConnectionStatus.Ready, () => {
            console.log('Conexão de voz pronta e estabelecida');
        });

        this.connection.on(VoiceConnectionStatus.Connecting, () => {
            console.log('Iniciando conexão com o canal de voz...');
        });
    }

    setVoiceChannel(channel) {
        this.voiceChannel = channel;
    }

    addTrack(track) {
        console.log('Adicionando música à fila:', track.title);
        this.queue.push(track);
    }

    async play() {
        if (!this.queue.length || this.isPlaying) {
            console.log('Não há músicas na fila ou já está tocando');
            return;
        }

        if (!this.voiceChannel) {
            console.error('Canal de voz não definido');
            return;
        }

        this.isPlaying = true;
        this.currentTrack = this.queue.shift();
        
        try {
            console.log('Tentando tocar:', this.currentTrack.title);
            console.log('URL da música:', this.currentTrack.url);

            // Usa play-dl para obter o stream
            console.log('Obtendo stream da música...');
            const stream = await play.stream(this.currentTrack.url);
            console.log('Stream obtido com sucesso');

            console.log('Criando recurso de áudio...');
            const resource = createAudioResource(stream.stream, {
                inputType: stream.type,
                inlineVolume: true
            });

            if (!resource) {
                console.error('Não foi possível criar o recurso de áudio');
                this.playNext();
                return;
            }

            console.log('Recurso de áudio criado com sucesso');
            resource.volume?.setVolume(0.5); // 50% do volume

            console.log('Iniciando reprodução...');
            this.audioPlayer.play(resource);

            if (!this.connection) {
                console.error('Conexão não encontrada!');
                return;
            }

            console.log('Inscrevendo player no canal de voz...');
            this.connection.subscribe(this.audioPlayer);
            
            console.log('Música começou a tocar');
        } catch (error) {
            console.error('Erro detalhado ao tocar música:', error);
            this.isPlaying = false;
            this.playNext();
        }
    }

    playNext() {
        console.log('Chamando playNext');
        this.isPlaying = false;
        this.currentTrack = null;
        this.play();
    }

    stop() {
        this.queue = [];
        this.currentTrack = null;
        this.isPlaying = false;
        if (this.audioPlayer) {
            this.audioPlayer.stop();
        }
        if (this.connection) {
            this.connection.destroy();
        }
    }

    skip() {
        if (this.audioPlayer) {
            this.audioPlayer.stop();
        }
    }

    pause() {
        if (this.audioPlayer) {
            this.audioPlayer.pause();
        }
    }

    resume() {
        if (this.audioPlayer) {
            this.audioPlayer.unpause();
        }
    }
}

const queues = new Map();
let player = null;

async function initializePlayer(client) {
    if (!player) {
        try {
            // Configura o play-dl com configurações básicas
            await play.setToken({
                useragent: ['Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36']
            });

            player = new Player(client, {
                ytdlOptions: {
                    quality: 'highestaudio',
                    highWaterMark: 1 << 25,
                    dlChunkSize: 0,
                },
                connectionTimeout: 30000
            });
            
            await player.extractors.register(YouTubeExtractor, {});

            player.events.on('error', (queue, error) => {
                console.error('Erro no Player:', error);
            });

            player.events.on('playerError', (queue, error) => {
                console.error('Erro na reprodução:', error);
            });

            player.events.on('connectionError', (queue, error) => {
                console.error('Erro na conexão:', error);
            });

            player.events.on('debug', (message) => {
                console.log('Player Debug:', message);
            });

            player.events.on('playerStart', (queue, track) => {
                console.log('Começando a tocar:', track.title);
            });

            console.log('Player inicializado com sucesso!');
        } catch (error) {
            console.error('Erro ao inicializar o player:', error);
            throw error;
        }
    }
    return player;
}

function useQueue(guildId) {
    if (!queues.has(guildId)) {
        queues.set(guildId, new MusicQueue(guildId, player));
    }
    return queues.get(guildId);
}

module.exports = { useQueue, initializePlayer }; 