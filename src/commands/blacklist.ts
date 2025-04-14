import { SlashCommandBuilder } from "discord.js";

const cmd: BotCommand = {
	isDev: true,
	places: ["dm", "guild"],
	data: new SlashCommandBuilder()
		.setName("blacklist")
		.setDescription("🔒・Restrict a user from contacting me"),
	execute: async (client, interaction) => {
		await interaction.reply("✅");
	},
};

export default cmd;
