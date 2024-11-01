import { Client, GatewayIntentBits,Partials } from 'discord.js';
import dotenv from 'dotenv';
dotenv.config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildEmojisAndStickers,
        GatewayIntentBits.GuildScheduledEvents,
        GatewayIntentBits.GuildEmojisAndStickers,
        GatewayIntentBits.GuildPresences,
    ],
    partials: [Partials.Channel],
});

const TOKEN = process.env.TOKEN;

// Log in to Discord with your app's token
client.login(TOKEN);

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

// Export the client to be used in other scripts
export default client;