require('dotenv').config();
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const { token } = require('./config/config');
const { loadCommands } = require('./utils/commandLoader');
const { loadEvents } = require('./utils/eventLoader');
const { initializePlayer } = require('./utils/musicQueue');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildPresences,
    ]
});

// Tratamento global de erros não capturados
process.on('unhandledRejection', error => {
    console.error('Erro não tratado (Promise):', error);
});

process.on('uncaughtException', error => {
    console.error('Erro não tratado:', error);
});

// Inicializa a Collection de comandos
client.commands = new Collection();

// Inicializa o bot
async function initializeBot() {
    try {
        // Inicializa o player de música
        await initializePlayer(client);
        console.log('Player de música inicializado com sucesso!');

        // Carrega comandos e eventos
        loadCommands(client);
        loadEvents(client);

        // Login usando o token do config
        await client.login(token);
        console.log('Bot iniciado com sucesso!');
    } catch (error) {
        console.error('Erro ao inicializar o bot:', error);
        process.exit(1);
    }
}

// Adiciona handler de erro para o client
client.on('error', error => {
    console.error('Erro no client do Discord:', error);
});

initializeBot();

