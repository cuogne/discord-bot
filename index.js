import { Client, GatewayIntentBits, Events } from 'discord.js';
import 'dotenv/config';

import { initializeREST, registerCommands } from './handlers/initHandler.js';
import { handleInteractions } from './handlers/interactionHandler.js';
import { handleMessages } from './handlers/msgHandler.js';
import { connectDBAndMonitorNews } from './handlers/fitNewsHandler.js';

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

const rest = initializeREST(process.env.BOT_TOKEN);

client.once(Events.ClientReady, async () => {
    console.log(`Tên bot: ${client.user.tag}!`);
    await registerCommands(client, rest);
    await connectDBAndMonitorNews(client);
});

client.on('interactionCreate', (interaction) => handleInteractions(interaction));
client.on('messageCreate', (message) => handleMessages(client, message));

client.login(process.env.BOT_TOKEN);