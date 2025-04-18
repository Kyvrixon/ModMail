import { SlashCommandBuilder } from "discord.js";

const cmd: BotCommand = {
	isDev: true,
	data: new SlashCommandBuilder()
		.setName("test")
		.setDescription("test command"),
	execute: async (client, interaction) => {
		await interaction.reply("plugin works");
	},
};

export default cmd;
