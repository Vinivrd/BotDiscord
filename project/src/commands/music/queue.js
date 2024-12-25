const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { useQueue } = require('../../utils/musicQueue');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('queue')
        .setDescription('Mostra a fila de reprodução atual'),

    async execute(interaction) {
        const queue = useQueue(interaction.guildId);

        if (!queue.isPlaying) {
            return interaction.reply('Não há nenhuma música tocando no momento!');
        }

        const embed = new EmbedBuilder()
            .setTitle('🎵 Fila de Reprodução')
            .setColor('#FF0000');

        // Adiciona a música atual
        if (queue.currentTrack) {
            embed.addFields({
                name: '▶️ Tocando agora:',
                value: `${queue.currentTrack.title}`
            });
        }

        // Adiciona as próximas músicas
        if (queue.queue.length) {
            const nextSongs = queue.queue
                .slice(0, 5)
                .map((track, index) => `${index + 1}. ${track.title}`)
                .join('\n');

            embed.addFields({
                name: '📑 Próximas músicas:',
                value: nextSongs
            });

            if (queue.queue.length > 5) {
                embed.setFooter({ 
                    text: `E mais ${queue.queue.length - 5} músicas na fila...`
                });
            }
        }

        interaction.reply({ embeds: [embed] });
    },
}; 