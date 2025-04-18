import { blue, red, yellow } from "colorette";
import { Collection, REST, Routes } from "discord.js";
import fs from "fs";
import path from "path";

class AddonManager {
	commands = new Collection<string, BotCommand>();
	events = [] as Array<string>;
	private dr = getDirname();

	constructor() {}

	private async loadEvents(eventsPath: string, dir?: string): Promise<void> {
		try {
			const eventFiles = await fs.promises.readdir(eventsPath, {
				withFileTypes: true,
				recursive: true,
			});

			for await (const event of eventFiles) {
				if (event.isDirectory()) {
					return this.loadEvents(
						path.join(event.parentPath, event.name),
						event.name,
					);
				}

				if (event.name.endsWith(".js") && event.name.startsWith("event_")) {
					const eventModule_raw: any = await import(
						"file://" + path.join(eventsPath, event.name)
					);
					const eventModule: BotEvent = eventModule_raw.default;

					if (!eventModule) {
						console.warn(
							yellow(
								"[AddonManager] Event '" +
									(eventModule as BotEvent).name +
									"' is invalid",
							),
						);
						continue;
					}

					try {
						await eventModule.run(client);
						this.events.push(
							`${dir}/${event.name}`.slice(0, -3) || event.name.slice(0, -3),
						);
					} catch (e) {
						console.warn(
							yellow("[AddonManager] WARN: Error test running event: " + event),
							e,
						);
					}
				} else {
					continue;
				}
			}
		} catch (error) {
			throw error;
		}
	}

	private async loadCommands(commandsPath: string): Promise<void> {
		try {
			const commandFiles = await fs.promises.readdir(commandsPath, {
				withFileTypes: true,
				recursive: true,
			});

			if (commandFiles.length === 0) {
				return;
			}

			for (const file of commandFiles) {
				if (file.isDirectory()) {
					return this.loadCommands(path.join(file.parentPath, file.name));
				}

				if (!file.name.endsWith(".js") || !file.name.startsWith("cmd_"))
					continue;
				try {
					const command_raw: any = await import(
						"file://" + path.join(commandsPath, file.name)
					);
					const command: BotCommand = command_raw.default;

					if (command.data.name) {
						if (client.commands.has(command.data.name)) {
							console.warn(
								yellow(
									"[AddonManager] WARN: Duplicate command name: " +
										command.data.name,
								),
							);
							continue;
						}
						this.commands.set(command.data.name, command);
					} else {
						console.warn(
							blue(
								`[AddonManager] WARN: Skipping invalid command file: ${file}`,
							),
						);
					}
				} catch (error) {
					console.error(
						red(`[AddonManager] ERROR: Failed to load command file ${file}:`),
						error,
					);
				}
				continue;
			}

			if (this.commands.size === 0) {
				return;
			}

			const rest = new REST({ version: "10" }).setToken(client.c.bot.token);
			for await (const command of this.commands.map((command) =>
				command.data.toJSON(),
			)) {
				await rest.post(
					Routes.applicationGuildCommands(client.c.bot.id, client.c.guildId),
					{
						body: command,
					},
				);
			}
		} catch (e) {
			throw e;
		}
	}

	async init() {
		try {
			await this.loadCommands(path.resolve(this.dr, "./addons"));
			await this.loadEvents(path.resolve(this.dr, "./addons"));
			return true;
		} catch (e) {
			throw e as Error;
		}
	}

	list(type: "commands"): Collection<string, BotCommand>;
	list(type: "events"): Array<string>;
	list(
		type: "commands" | "events",
	): Collection<string, BotCommand> | Array<string> {
		switch (type) {
			case "commands": {
				return this.commands;
			}
			case "events": {
				return this.events;
			}
		}
	}
}

const AddonsManager = new AddonManager();
export default AddonsManager;
