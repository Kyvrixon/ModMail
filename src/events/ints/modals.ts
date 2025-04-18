import { ModalSubmitInteraction } from "discord.js";

const handleModal = async (
	client: Bot,
	interaction: ModalSubmitInteraction,
	...args: any[]
): Promise<void> => {
	switch (interaction.customId) {
		default: {
			break;
		}
	}
	return;
};

export default handleModal;
