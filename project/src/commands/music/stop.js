const { SlashCommandBuilder } = require('discord.js');
const { useQueue } = require('../../utils/musicQueue');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stop')
        .setDescription('Para a reprodução e limpa a fila'),

    async execute(interaction) {
        const queue = useQueue(interaction.guildId);

        if (!queue.isPlaying) {
            return interaction.reply('Não há nenhuma música tocando no momento!');
        }

        queue.stop();
        interaction.reply('⏹️ Reprodução parada e fila limpa!');
    },
}; 