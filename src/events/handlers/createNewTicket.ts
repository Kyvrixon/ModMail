import {
	ActionRowBuilder,
	AttachmentBuilder,
	ButtonBuilder,
	ButtonStyle,
	ChannelType,
	EmbedBuilder,
	Message,
	PermissionFlagsBits,
	TextChannel,
} from "discord.js";
import db from "../../db.js";
import { footer, genId } from "../../utils.js";

type T = (client: Bot, message: Message) => Promise<void>;

const createNewTicket: T = async (client, message) => {
	try {
		const { author } = message;
		const { displayName } = author;

		let guild = client.guilds.cache.get(client.c.guildId);
		if (!guild) {
			guild = await client.guilds.fetch(client.c.guildId)!;
		}

		type SupportRolePerms = Array<{
			id: string;
			allow: Array<bigint>;
			deny: Array<bigint>;
		}>;

		const staffRolePerms: SupportRolePerms = Array.from(
			client.c.supportRoles.values(),
		)
			.filter((role) => role.allowed)
			.map((role) => ({
				id: role.id,
				allow: role.perms.flatMap((x) =>
					x.y.map((perm) =>
						typeof perm === "string"
							? PermissionFlagsBits[perm as keyof typeof PermissionFlagsBits]
							: perm,
					),
				),
				deny: role.perms.flatMap((x) =>
					x.n.map((perm) =>
						typeof perm === "string"
							? PermissionFlagsBits[perm as keyof typeof PermissionFlagsBits]
							: perm,
					),
				),
			}));

		const newChannel = await guild!.channels.create({
			reason: "New ticket created for " + author.username,
			name: `mail-${displayName}`,
			nsfw: false,
			type: ChannelType.GuildText,
			parent: client.c.categoryId,
			permissionOverwrites: [
				{
					id: client.c.guildId,
					deny: [PermissionFlagsBits.ViewChannel],
				},
				...staffRolePerms,
			],
		});

		const embed = new EmbedBuilder()
			.setFooter(footer())
			.setDescription(`**Creator:** ${author}`)
			.addFields({
				name: `Message`,
				value: message.content?.length > 0 ? message.content : " ",
				inline: true,
			})
			.setColor("#f7b5d7");

		const atts = [];
		const imageAttachments = message.attachments
			.filter((a) => a.width)
			.map((a) => new AttachmentBuilder(a.url, { name: a.name }));
		atts.push(...imageAttachments);

		const staffRolePings: Array<string> = [];
		for (const role of client.c.supportRoles.values()) {
			if (role.allowed && role.ping) {
				staffRolePings.push(`<@&${role.id}>`);
			}
		}

		await newChannel
			.send({
				files: atts,
				content: staffRolePings.join("|"),
				embeds: [embed],
				components: [
					new ActionRowBuilder<ButtonBuilder>()
						.addComponents(
							new ButtonBuilder()
								.setCustomId("tutorial")
								.setLabel("How to use me (soon)")
								.setStyle(ButtonStyle.Secondary)
								.setDisabled(true),
						)
						.addComponents(
							new ButtonBuilder()
								.setCustomId("autoresponder")
								.setLabel("View autoresponders (soon)")
								.setStyle(ButtonStyle.Secondary)
								.setDisabled(true),
						),
					new ActionRowBuilder<ButtonBuilder>().addComponents(
						new ButtonBuilder()
							.setCustomId("mail-close")
							.setLabel("Close ticket")
							.setEmoji("<:bow:1350757435895320636>")
							.setStyle(ButtonStyle.Danger)
							.setDisabled(true),
					),
				],
			})
			.then(async (sent) => await sent.pin());

		const logChannel = guild.channels.cache.get(client.c.logChannel);
		const logEmbed = new EmbedBuilder()
			.setTitle("New ticket created")
			.setDescription(
				`**Author**: ${author} (\`${author.id}\`)\n**Date**: <t:${Date.now()}:f> (<t:${Date.now()}:R>`,
			)
			.setColor(0xf7b5d7)
			.setFooter(footer());

		await (logChannel as TextChannel)!.send({
			embeds: [logEmbed],
		});

		const db_atts: Array<{
			name: string;
			buffer: string;
		}> = [];

		await Promise.all(
			message.attachments
				.filter((a) => a.width)
				.map(async (a) => {
					try {
						const response = await fetch(a.url);
						const buffer = await response.arrayBuffer();
						db_atts.push({
							name: a.name,
							buffer: Buffer.from(buffer).toString("base64"),
						});
					} catch (error) {
						console.error("Error downloading image attachment:", a.url, error);
					}
				}),
		);

		const _id = genId(6);
		const body: MailData = {
			author: author.id,
			channel: newChannel.id,
			reason: message.content ?? undefined,
			attachments: db_atts,
			ID: _id,
			createdAt: Date.now(),
			closed: false,
			count: {
				messages: 0,
				contributors: [],
			},
		};

		await db.write("mails/" + _id, body);
		await db.write("cache/messages/" + _id, {});

		return;
	} catch (e) {
		throw e;
	}
};

export default createNewTicket;
