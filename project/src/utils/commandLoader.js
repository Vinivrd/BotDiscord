const fs = require('fs');
const path = require('path');

function loadCommandsFromDir(client, dir) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            // Se for um diretório, carrega recursivamente
            loadCommandsFromDir(client, filePath);
        } else if (file.endsWith('.js')) {
            // Se for um arquivo .js, carrega o comando
            const command = require(filePath);
            if ('data' in command && 'execute' in command) {
                client.commands.set(command.data.name, command);
                console.log(`Comando carregado: ${command.data.name}`);
            }
        }
    }
}

function loadCommands(client) {
    const commandsPath = path.join(__dirname, '..', 'commands');
    loadCommandsFromDir(client, commandsPath);
}

module.exports = { loadCommands };



