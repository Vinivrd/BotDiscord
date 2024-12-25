const { SlashCommandBuilder } = require('discord.js');
const { useQueue } = require('../../utils/musicQueue');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pause')
        .setDescription('Pausa ou resume a música atual'),

    async execute(interaction) {
        const queue = useQueue(interaction.guildId);

        if (!queue.isPlaying) {
            return interaction.reply('Não há nenhuma música tocando no momento!');
        }

        if (queue.audioPlayer.state.status === 'paused') {
            queue.resume();
            return interaction.reply('▶️ Música resumida!');
        } else {
            queue.pause();
            return interaction.reply('⏸️ Música pausada!');
        }
    },
}; 