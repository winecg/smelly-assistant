const { EmbedBuilder, SlashCommandBuilder } = require("discord.js");
const { getUsersCollection } = require("../database");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("leaderboard")
        .setDescription("shows the top scoring users on a leaderboard"),

    async execute(interaction) {
        try {
            const usersCollection = getUsersCollection();
            const topUsers = await usersCollection.find().sort({ xp: -1 }).limit(10).toArray(); 

            let leaderboard = topUsers.map((user, index) => 
                `${index + 1}. **${user.username}**\nLevel ${user.level}\n${user.xp} XP\n`
            ).join("\n");

            const leaderboardEmbed = new EmbedBuilder()
                .setColor(0xF9DE13)
                .setTitle("Leaderboard")
                .setDescription(leaderboard)
                .setTimestamp();

            interaction.reply({ embeds: [leaderboardEmbed] });
        }
        catch(error) {
            console.error("Error retrieving leaderboard:", error);
            await interaction.reply("An error occurred fetching the leaderboard")
        }
    }
}