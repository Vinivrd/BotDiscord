const { SlashCommandBuilder } = require('discord.js');
const { joinVoiceChannel } = require('@discordjs/voice');
const { QueryType } = require('discord-player');
const { useQueue } = require('../../utils/musicQueue');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Toca uma música do YouTube')
        .addStringOption(option =>
            option.setName('query')
                .setDescription('Nome ou URL da música')
                .setRequired(true)),

    async execute(interaction) {
        try {
            await interaction.deferReply();
            console.log('Comando play iniciado');

            const query = interaction.options.getString('query');
            const voiceChannel = interaction.member.voice.channel;

            console.log('Query recebida:', query);
            console.log('Canal de voz do usuário:', voiceChannel?.name);

            if (!voiceChannel) {
                return interaction.editReply('Você precisa estar em um canal de voz para usar este comando!');
            }

            const queue = useQueue(interaction.guildId);
            queue.setVoiceChannel(voiceChannel);

            try {
                console.log('Verificando conexão existente...');
                if (!queue.connection) {
                    console.log('Criando nova conexão com o canal de voz...');
                    queue.connection = joinVoiceChannel({
                        channelId: voiceChannel.id,
                        guildId: interaction.guildId,
                        adapterCreator: interaction.guild.voiceAdapterCreator,
                    });
                    queue.setupConnectionListeners();
                    console.log('Conexão criada e listeners configurados');
                }

                // Determina o tipo de busca baseado na query
                let searchEngine = QueryType.AUTO;
                if (query.includes('youtube.com') || query.includes('youtu.be')) {
                    searchEngine = QueryType.YOUTUBE_VIDEO;
                }

                console.log(`Iniciando busca: "${query}" usando ${searchEngine}`);
                const searchResult = await queue.player.search(query, {
                    requestedBy: interaction.user,
                    searchEngine: searchEngine
                });

                console.log('Resultado da busca:', JSON.stringify(searchResult, null, 2));

                if (!searchResult?.tracks?.length) {
                    return interaction.editReply('Nenhum resultado encontrado! Tente usar um link do YouTube ou um termo de busca diferente.');
                }

                const track = searchResult.tracks[0];
                console.log('Música encontrada:', track.title);
                console.log('Detalhes da música:', {
                    title: track.title,
                    url: track.url,
                    duration: track.duration,
                    author: track.author
                });

                queue.addTrack(track);

                if (!queue.isPlaying) {
                    console.log('Iniciando reprodução da música...');
                    await queue.play();
                    return interaction.editReply(`🎵 Começando a tocar: **${track.title}**\nDuração: ${track.duration}`);
                } else {
                    return interaction.editReply(`🎵 Adicionado à fila: **${track.title}**\nDuração: ${track.duration}`);
                }

            } catch (error) {
                console.error('Erro detalhado ao processar comando play:', error);
                return interaction.editReply('Ocorreu um erro ao tentar tocar a música. Tente novamente.');
            }
        } catch (error) {
            console.error('Erro geral no comando play:', error);
            if (interaction.deferred) {
                await interaction.editReply('Ocorreu um erro inesperado.');
            } else {
                await interaction.reply('Ocorreu um erro inesperado.');
            }
        }
    },
}; 