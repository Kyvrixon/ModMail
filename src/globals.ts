import { WebhookClient } from "discord.js";
import path from "path";
import url from "url";

globalThis.getDirname = (): string =>
	path.dirname(url.fileURLToPath(import.meta.url));

globalThis.webhookCache = new Map<string, WebhookClient>();
globalThis.messageCooldowns = new Map<string, { time: number }>();
globalThis.ticketCooldowns = new Map<string, { time: number }>();
globalThis.processLock = new Set<string>();
globalThis.confirmations = new Set<string>();
