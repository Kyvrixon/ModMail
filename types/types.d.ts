/* eslint-disable */
import {
	ActionRowBuilder,
	AutocompleteInteraction,
	ButtonBuilder,
	ButtonInteraction,
	ButtonStyle,
	ChatInputCommandInteraction,
	Client,
	Collection,
	ColorResolvable,
	ComponentEmojiResolvable,
	Guild,
	SlashCommandBuilder,
	SlashCommandOptionsOnlyBuilder,
	Snowflake,
	WebhookClient,
} from "discord.js";

declare global {
	/** Styles structure */
	type StylesConfig = {
		[key: string]: any;
	};
	/** Message cache */
	type CacheMessage = {
		id: string;
		author: string;
	};

	/**Configuration for initialization.*/
	type InitConfig = {
		/** devs */
		devs: Array<string>;
		/** Relating to your bot */
		bot: {
			/**Bot token used for authentication.*/
			token: string;
			/**Bot ID.*/
			id: Snowflake;
			/**Bot name.*/
			name: string;
		};
		/**Guild ID.*/
		guildId: string;
		/**Category ID.*/
		categoryId: string;
		/**Roles for staff with permissions.*/
		supportRoles: Array<{
			/**Role ID.*/
			id: string;
			/**Role name.*/
			name: string;
			/**Whether the role is allowed.*/
			allowed: boolean;
			/** Ping this role when a ticket is made */
			ping: boolean;
			/**Permissions for the role.*/
			perms: Array<{
				/**Allowed permissions.*/
				y: Array<string | bigint> | [];
				/**Disallowed permissions.*/
				n: Array<string | bigint> | [];
			}>;
		}>;
		/**Log channel ID.*/
		logChannel: string;
		/**Error channel ID.*/
		errorChannel: string;
		/**Whether to ping staff roles.*/
		pingStaffRoles: boolean;
		/**Message cooldown in milliseconds.*/
		msgCooldown: number;
		/**Ticket cooldown in milliseconds.*/
		ticketCooldown: number;
		/**Frequently asked questions.*/
		faq: Array<{
			/**Question.*/
			q: string;
			/**Answer.*/
			a: string;
		}>;
		/**Autoresponders configuration.*/
		autoresponders: Array<{
			/**Trigger phrase for the autoresponder.*/
			trigger: string;

			/**Message sent by the autoresponder.*/
			message: string;
		}>;
		/** Bot status configurations.*/
		status: Array<{
			/** Status name. */
			name: string;
			/** Status type. */
			type: number;
		}>;
	};

	type _Embed = {
		title?: string;
		desc?: string;
		color?: ColorResolvable;
		image?: string;
		thumbnail?: string;
		timestamp?: number;
		footer?: {
			text: string;
			iconURL?: string;
		};
		author?: {
			name: string;
			iconURL?: string;
		};
		footer?: {
			text: string;
			iconURL?: string;
		};
		fields?: Array<{
			name: string;
			value: string;
			inline?: boolean;
		}>;
	};

	/** Blacklist entry structure */
	type DB_Blacklist = {
		/** ID of this entry */
		ID: string;
		/** User ID */
		user: string;
		/** Reason for the blacklist */
		reason: string;
		/** User ID of who made the blacklist */
		mod: string;
		/** When the blacklist was made */
		time: number;
		/** (optional) When this blacklist expires */
		expires?: number;
		/** Evidence of stuff */
		evidence?:
			| Array<string | object | Buffer | File>
			| string
			| object
			| Buffer
			| File;
	};

	/**Represents the data structure for a mail object.*/
	type MailData = {
		/** Author of the mail */
		author: string;

		/** Channel ID where the mail was created */
		channel: string;

		/** Reason for the mail */
		reason: string;

		/** (Optional) Attachments related to the mail */
		attachments?: Array<{
			name: string;
			buffer: string;
		}>;

		/** Unique identifier for the mail */
		ID: string;

		/** Timestamp of when the mail was created */
		createdAt: number | Date;

		/** Flag if the current mail is closed */
		closed: boolean;

		/** Count information related to the mail */
		count: {
			/** Number of messages in the mail */
			messages: number;

			/** List of contributors to the mail */
			contributors: Array<{
				/** Contributor's user ID */
				id: string;

				/** Number of contributions made by the user */
				count: number;
			}>;
		};
	};

	/** Bot event structure */
	type BotEvent = {
		/** Name of the event */
		name: string;
		/** Should emit only once? */
		once: boolean;
		/** Event logic */
		run: (client: Bot, ...args: any) => Promise<any>;
	};

	/** Bot command structure */
	type BotCommand = {
		/** Is only available to the dev and server owner */
		isDev: boolean;
		/** SlashCommandBuilder instance */
		data: SlashCommandBuilder | SlashCommandOptionsOnlyBuilder;
		/** Command logic */
		execute: (
			client: Bot,
			interaction: ChatInputCommandInteraction,
		) => Promise<void>;
		/** Command autocomplete logic */
		autocomplete?: (
			client: Bot,
			interaction: AutocompleteInteraction,
		) => Promise<void>;
	};

	type AddonEvent = (client: Bot) => Promise<void>;
	type AddonCommand = (
		client: Bot,
		interaction: ChatInputCommandInteraction,
	) => Promise<void>;
}

export {};
