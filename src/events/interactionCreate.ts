import { AutocompleteInteraction, Interaction, MessageFlags } from "discord.js";
import handleButton from "./ints/buttons.js";
//import handleModal from "./ints/modals.js";

const event: BotEvent = {
	name: "interactionCreate",
	once: false,
	run: async (client: Bot, interaction: Interaction): Promise<any> => {
		if (interaction.isChatInputCommand()) {
			const cmd = client.commands.get(interaction.commandName) as BotCommand;

			if (!cmd) {
				return interaction.reply({
					content: "This command does not exist. Please contact the developer.",
					flags: MessageFlags.Ephemeral,
				});
			} else if (cmd.isDev && interaction.user.id !== "981755777754755122") {
				return interaction.reply({
					content:
						"Only **kyvrixon** (<@981755777754755122>) can use this command!",
					flags: MessageFlags.Ephemeral,
				});
			} else if (interaction.guild && !cmd.places.includes("guild")) {
				return interaction.reply({
					content: "This command is not available in DMs.",
					flags: MessageFlags.Ephemeral,
				});
			} else if (!interaction.guild && !cmd.places.includes("dm")) {
				return interaction.reply({
					content:
						"This command is not available in the server. Please use in DMs with me instead.",
					flags: MessageFlags.Ephemeral,
				});
			}

			if (interaction.isAutocomplete()) {
				await cmd.autocomplete!(client, interaction as AutocompleteInteraction);
				return;
			}

			try {
				await cmd.execute(client, interaction);
			} catch (e) {
				throw e;
			}
		} else if (
			interaction.isButton() &&
			!interaction.customId.startsWith("dm_")
		) {
			return await handleButton(client, interaction);
		} else if (interaction.isModalSubmit()) {
			// handle modals
		}
	},
};

export default event;
