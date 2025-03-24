require("dotenv").config();
const fs = require("node:fs");
const path = require("node:path");
const { ActivityType, Client, Collection, Events, GatewayIntentBits } = require("discord.js");
const { connectToDB, getUsersCollection } = require("./database");

connectToDB();

const discordClient = new Client({ 
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers, 
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildPresences, 
        GatewayIntentBits.MessageContent
    ] 
});

discordClient.commands = new Collection();

const foldersPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(foldersPath).filter(file => file.endsWith(".js"));

for(const file of commandFiles) {
    const command = require(path.join(__dirname, "commands", file));
    if ("data" in command && "execute" in command) {
        discordClient.commands.set(command.data.name, command);
    } 
    else {
        console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
    }
}

discordClient.on(Events.InteractionCreate, async interaction => {
    if(!interaction.isCommand()) return;

    const command = discordClient.commands.get(interaction.commandName);
    if(!command) return;

    try {
        await command.execute(interaction);
    }
    catch(error) {
        console.error(error);
        await interaction.reply({ content: "Error executing command.", ephemeral: true });
    }
});

discordClient.on("messageCreate", async (message) => {
    if(message.author.bot) return;
    if(message.content.length < 4 && !message.attachments) return;
    console.log("received message");

    const userId = message.author.id;
    const username = message.author.username;

    try {
        const usersCollection = getUsersCollection();
        const user = await usersCollection.findOne({ userId, username });

        if(!user) {
            await usersCollection.insertOne({ userId, username, level: 1, xp: 1 });
        }
        else {
            const newXP = user.xp + 1;
            let newLevel = user.level;

            const xpRatio = 1.33;
            const xpRequired = newLevel * 100 * xpRatio;
            if(newXP >= xpRequired) {
                newLevel++;
                message.channel.send(`<@${userId}> has leveled up to **Level ${newLevel}!**`);
            }

            await usersCollection.updateOne({ userId: userId, username: username }, { $set: { level: newLevel, xp: newXP }});
        }
    }
    catch(error) {
        console.error("Error updating user xp", error);
    }
});

discordClient.once(Events.ClientReady, () => {
    discordClient.user.setActivity("I'm back", { type: ActivityType.Custom })
    console.log("Logged in");
});

discordClient.login(process.env.TOKEN);
