/* eslint-disable */
import { Client, Collection } from "discord.js";

declare global {
	/** The bot */
	interface Bot extends Client {
		/** Bot commands. */
		commands: Collection<string, BotCommand>;
		/** Config */
		c: InitConfig;
	}

	interface Utils {
		/** Gets the directory path of the called file. */
		getDirname: () => string;
		/** Format seconds to a readable format. */
		formatSeconds: (
			/** Seconds */
			seconds: number | string,
			/** Options */
			options?: {
				/** Output format */
				format?: "long" | "short";
				/** Units of time to show */
				onlyUnits?: Array<"y" | "w" | "d" | "h" | "m" | "s">;
				/** Include 0m, 0s, etc */
				includeZeroUnits?: boolean;
			},
		) => string;
		/** Wait a certain amount of time */
		delay: (
			/** Time in milliseconds */
			ms: number,
		) => Promise<any>;
		/** Footer for embeds */
		footer: (
			text?: string,
			pic?: string,
		) => { text: string; icon_url?: string };
		/** Generate a random ID */
		genId: (length: number) => string;
		/** Create a pagination */
		createLeaderboard: (
			title: string,
			list: Array<string>,
			interaction: ChatInputCommandInteraction | ButtonInteraction | Message,
			pageCount?: number = 5,
			footerText?: string,
			ephemeral?: boolean,
			metadata?: Array<_Embed>,
			extras?: Array<ActionRowBuilder<any>>,
		) => Promise<void>;
		/** Calculate permissions for a member */
		permCalc: (member: GuildMember) => string;
	}

	/** Database interface.*/
	interface Database {
		/** The path to the database folder.*/
		dbPath: string;
		/**Set of paths currently being written to.*/
		currentlyWriting: Set<string>;
		/**Reads a file and returns its contents.*/
		read: (p: string) => Promise<MailData | null>;
		/**Write data to a file, merging with existing data if needed.*/
		write: (p: string, data: object) => Promise<any>;
		/*Reads all files in a folder and returns their contents.*/
		groupRead: (f: string) => Promise<Map<string, any> | undefined>;
	}
}

export {};
