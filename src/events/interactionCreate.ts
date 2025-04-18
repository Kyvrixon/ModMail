import {
	AutocompleteInteraction,
	ChatInputCommandInteraction,
	Interaction,
	MessageFlags,
} from "discord.js";
import handleButton from "./ints/buttons.js";
import AddonsManager from "../addonManager.js";
import handleModal from "./ints/modals.js";

const event: BotEvent = {
	name: "interactionCreate",
	once: false,
	run: async (client: Bot, interaction: Interaction) => {
		const cmd =
			client.commands.get(
				(interaction as ChatInputCommandInteraction).commandName,
			) ||
			AddonsManager.list("commands").get(
				(interaction as ChatInputCommandInteraction).commandName,
			);

		if (!cmd) {
			return await (interaction as ChatInputCommandInteraction).reply({
				content: "This command does not exist. Please contact the developer.",
				flags: MessageFlags.Ephemeral,
			});
		}

		if (
			cmd.isDev &&
			interaction.user.id !== "981755777754755122" &&
			Server.ownerId !== interaction.user.id &&
			!client.c.devs.includes(interaction.user.id)
		) {
			return await (interaction as ChatInputCommandInteraction).reply({
				content: "You are not authorised to use this command.",
				flags: MessageFlags.Ephemeral,
			});
		}

		if (interaction.isButton()) {
			return handleButton(client, interaction);
		}

		if (interaction.isAutocomplete() && cmd.autocomplete) {
			return cmd.autocomplete(client, interaction as AutocompleteInteraction);
		}

		if (interaction.isModalSubmit()) {
			return handleModal(client, interaction);
		}

		return cmd.execute(client, interaction as ChatInputCommandInteraction);
	},
};

export default event;
