const { Events } = require('discord.js');

module.exports = {
    name: Events.Error,
    execute(error) {
        console.error('Erro no bot:', error);
    },
}; 