const event: BotEvent = {
	name: "ready",
	once: true,
	run: async (client) => {
		console.log("Logged in!");

		globalThis.Server = await client.guilds.fetch(client.c.guildId);
	},
};

export default event;
