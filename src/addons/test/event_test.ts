const event: BotEvent = {
	name: "ready",
	once: true,
	run: async (client: Bot) => {
		client.on("messageCreate", async (message) => {
			if (message.author.bot) return;

			if (
				message.content.startsWith("=test") &&
				client.c.devs.includes(message.author.id)
			) {
				await message.reply("`2` entries. (1 base + 1 addon)");
				return;
			}
		});
	},
};

export default event;
