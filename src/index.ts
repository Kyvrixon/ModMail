import "./globals.ts";
import "./cron.js";

import { blue, red, yellow } from "colorette";
import {
	Client,
	Collection,
	Events,
	GatewayIntentBits,
	Partials,
	REST,
	Routes,
	WebhookClient,
} from "discord.js";
import fs from "fs";
import path from "path";
import config from "../config.js";
import AddonManager from "./addonManager.js";
import url from "url";

globalThis.getDirname = (): string =>
	path.dirname(url.fileURLToPath(import.meta.url));

globalThis.webhookCache = new Map<string, WebhookClient>();
globalThis.messageCooldowns = new Map<string, { time: number }>();
globalThis.ticketCooldowns = new Map<string, { time: number }>();
globalThis.processLock = new Set<string>();
globalThis.confirmations = new Set<string>();

const dr = getDirname();

process.on("unhandledRejection", (reason /*, promise*/) => {
	console.error("Unhandled Rejection at:", (reason as Error).stack || reason);
});
process.on("uncaughtException", (error) => {
	console.error("Uncaught Exception:", error);
});

(async () => {
	try {
		const paths = [
			// Main DB folder
			path.join(dr, "db"),
			// Mails
			path.join(dr, "db", "mails"),
			// Main files folder
			path.join(dr, "db", "files"),
			// Transcripts
			path.join(dr, "db", "files", "transcripts"),
			// Cache
			path.join(dr, "db", "cache"),
			// Message cache
			path.join(dr, "db", "cache", "messages"),
		];

		for (const p of paths) {
			if (!fs.existsSync(p)) {
				await fs.promises.mkdir(p, { recursive: true });
			}
		}

		globalThis.client = new Client({
			intents: [
				GatewayIntentBits.Guilds,
				GatewayIntentBits.GuildMembers,
				GatewayIntentBits.GuildWebhooks,
				GatewayIntentBits.GuildMessages,
				GatewayIntentBits.GuildMessageReactions,
				GatewayIntentBits.DirectMessages,
				GatewayIntentBits.MessageContent,
			],
			partials: [
				Partials.Channel,
				Partials.GuildMember,
				Partials.Message,
				Partials.User,
			],
			presence: {
				activities: [
					{
						name: "🛠️ Under development!",
						type: 4,
					},
				],
			},
		}) as Bot;

		client.c = config;
		Object.freeze(client.c);

		client.commands = new Collection<string, BotCommand>();
		const commandsPath = path.join(dr, "./commands/");
		const commandFiles = await fs.promises.readdir(commandsPath);
		for (const file of commandFiles) {
			if (!file.endsWith(".js")) continue;
			try {
				const command_raw: any = await import(
					"file://" + path.join(commandsPath, file)
				);
				const command: BotCommand = command_raw.default;
				if (command.data.name) {
					client.commands.set(command.data.name, command);
				} else {
					console.warn(blue(`Skipping invalid command file: ${file}`));
				}
			} catch (error) {
				console.error(red(`Failed to load command file ${file}:`), error);
			}
			continue;
		}

		const rest = new REST({ version: "10" }).setToken(client.c.bot.token);
		await rest.put(
			Routes.applicationGuildCommands(client.c.bot.id, client.c.guildId),
			{ body: client.commands.map((c) => c.data.toJSON()) },
		);

		const eventsPath = path.join(dr, "./events/");
		const eventFiles = await fs.promises.readdir(eventsPath, {
			withFileTypes: true,
		});

		for await (const event of eventFiles) {
			if (event.isFile()) {
				if (
					!Object.values(Events).includes(
						event.name.replace(".js", "") as Events,
					)
				) {
					console.log(yellow(event + " is not a valid event name."));
					continue;
				}

				const eventModule_raw: any = await import(
					"file://" + path.join(eventsPath, `${event.name}`)
				);
				const eventModule: BotEvent = eventModule_raw.default;

				if (!eventModule) {
					console.warn(yellow("Event '" + event + "' has no default export."));
				}

				if (eventModule.once) {
					client.once(
						eventModule.name,
						async (...args) => await eventModule.run(client, ...args),
					);
				} else {
					client.on(
						eventModule.name,
						async (...args) => await eventModule.run(client, ...args),
					);
				}

				continue;
			} else {
				continue;
			}
		}

		await AddonManager.init();

		await client.login(client.c.bot.token);
	} catch (e) {
		const error = e as Error;
		console.error(error);
	}
})();
