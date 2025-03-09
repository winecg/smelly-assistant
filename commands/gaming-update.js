const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("gamingupdate")
        .setDescription("shows a user's gaming activity")
        .addUserOption(option => 
            option
                .setName("target")
                .setDescription("the user to get a gaming update on")
                .setRequired(true)
        ),

    async execute(interaction) {
        await interaction.deferReply();

        const user = interaction.options.getUser("target");
        const member = await interaction.guild.members.fetch(user.id);

        if(!member.presence || member.presence.activities.length === 0) {
            return interaction.editReply(`${user.username} is nort gaming!`);
        }

        const gaming = member.presence.activities.find(a => a.type === 0);
        if(!gaming) {
            return interaction.editReply(`${user.username} is nort gaming!`);
        }

        let response = `${user.username} has been playing **${gaming.name}**`;

        if(gaming.timestamps?.start) {
            const startTime = gaming.timestamps.start;
            const totalTime = Date.now() - startTime;

            const hours = Math.floor(totalTime / 1000 / 60 / 60);
            const minutes = Math.floor((totalTime / 1000 / 60) % 60);
            
            if(hours > 0) {
                response += ` for **${hours} hours and ${minutes} minutes**`;
            }
            else {
                response += ` for **${minutes} minutes**`;
            }
        }

        await interaction.editReply(response);
    }
}