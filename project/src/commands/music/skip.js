const { SlashCommandBuilder } = require('discord.js');
const { useQueue } = require('../../utils/musicQueue');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('skip')
        .setDescription('PPULADO HEHEHE'),

    async execute(interaction) {
        const queue = useQueue(interaction.guildId);

        if (!queue.isPlaying) {
            return interaction.reply('Ta chapando? tem nada tocando po !');
        }

        queue.skip();
        interaction.reply('⏭️ Vc foi pulado amigão!');
    },
}; 