import { Guild, WebhookClient } from "discord.js";

/* eslint-disable */
declare global {
	/** __dirname value */
	var getDirname: () => string;
	/** Bot client */
	var client: Bot;
	var webhookCache: Map<string, WebhookClient>;
	var messageCooldowns: Map<string, { time: number }>;
	var ticketCooldowns: Map<string, { time: number }>;
	var processLock: Set<string>;
	var confirmations: Set<string>;
	var Server: Guild;
	var styles: StylesConfig;
	var addonCommands: Collection<string, AddonCommand>;
}

export {};
