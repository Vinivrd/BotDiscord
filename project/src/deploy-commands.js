const { REST, Routes, SlashCommandBuilder } = require('discord.js');
const { clientId, guildId, token } = require('./config/config');
const fs = require('node:fs');
const path = require('node:path');
require('dotenv').config();

// Array para armazenar os comandos
const commands = [];

// Carrega os comandos de música
const musicCommandsPath = path.join(__dirname, 'commands', 'music');
console.log(`Carregando comandos de música de: ${musicCommandsPath}`);

const musicFiles = fs.readdirSync(musicCommandsPath).filter(file => file.endsWith('.js'));
console.log(`Arquivos de música encontrados: ${musicFiles.join(', ')}`);

for (const file of musicFiles) {
    const filePath = path.join(musicCommandsPath, file);
    try {
        const command = require(filePath);
        if ('data' in command && 'execute' in command) {
            commands.push(command.data.toJSON());
            console.log(`✅ Comando carregado: ${command.data.name}`);
        } else {
            console.log(`❌ Arquivo ${file} não é um comando válido`);
        }
    } catch (error) {
        console.error(`❌ Erro ao carregar ${file}:`, error);
    }
}

// Mostra todos os comandos carregados
console.log('\nComandos carregados:');
console.log(commands.map(cmd => cmd.name).join(', '));

// Configura o REST client
const rest = new REST({ version: '10' }).setToken(token);

// Registra os comandos
console.log('\nIniciando atualização dos comandos...');

rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands })
    .then(() => console.log('Comandos atualizados com sucesso!'))
    .catch(error => console.error('Erro ao atualizar comandos:', error)); 


