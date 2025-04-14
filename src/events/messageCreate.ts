import {
	ActionRowBuilder,
	AttachmentBuilder,
	BaseMessageOptions,
	ButtonBuilder,
	ButtonStyle,
	DMChannel,
	EmbedBuilder,
	GuildChannel,
	GuildMember,
	Message,
	TextChannel,
	User,
	WebhookClient,
	WebhookType,
} from "discord.js";
import db from "../db.js";
import { footer, formatSeconds } from "../utils.js";
import handleButton from "./ints/buttons.js";

const autoRespondersMap = new Map<string, string>(
	client.c.autoresponders.map((a) => [
		a.trigger as string,
		a.message as string,
	]),
);

const event: BotEvent = {
	name: "messageCreate",
	once: false,
	run: async (client, message: Message) => {
		const originalContent = message.content;
		try {
			if (
				message.author.bot ||
				message.author.system ||
				message.webhookId ||
				![0, 19].includes(message.type) ||
				(message.guild &&
					!((message.channel as GuildChannel).parentId === client.c.categoryId))
			)
				return;

			if (processLock.has(message.author.id)) {
				await (message.channel as DMChannel).send({
					content: `I am still processing your previous message, please wait a few seconds and try again!`,
				});
				return;
			}

			processLock.add(message.author.id);

			const isOnCooldown = messageCooldowns.get(message.author.id);
			if (isOnCooldown && Date.now() < isOnCooldown.time) {
				const seconds = formatSeconds((isOnCooldown.time - Date.now()) / 1000, {
					format: "short",
					includeZeroUnits: false,
					onlyUnits: ["s"],
				});

				try {
					await (message.channel as DMChannel).send({
						content: `Slow down! You can send a message again in **${seconds}**.`,
					});
				} catch (e) {
					console.error("Failed to send message cooldown reminder: ", e);
				}

				processLock.delete(message.author.id);
				return;
			}

			messageCooldowns.set(message.author.id, { time: client.c.msgCooldown });

			if (await autoresponseCheck(message)) {
				processLock.delete(message.author.id);
				return;
			}

			let isForward: boolean = false;
			if (message.messageSnapshots?.size > 0) {
				isForward = true;
				message.messageSnapshots.forEach((m) => {
					message.embeds = m.embeds;
					message.content = m.content;
					message.attachments = m.attachments;
					message.components = m.components;
				});
			}

			if (!message.guild) {
				if (confirmations.has(message.author.id)) {
					await message.reply("Please press yes or no");
					processLock.delete(message.author.id);
					return;
				}

				const mailData = (await db.groupRead("mails")) as Map<string, MailData>;
				const userData = Array.from(mailData.values()).find(
					(mail) => mail.author === message.author.id && mail.closed === false,
				);

				if (userData) {
					if (!Server) {
						console.log("Server doesnt exist yet");
						processLock.delete(message.author.id);
						return;
					}

					const channel = Server.channels.cache.get(userData.channel);

					async function getWebhook(): Promise<WebhookClient> {
						const existingWebhook = (
							await (channel as TextChannel).fetchWebhooks()
						).find(
							(wh) =>
								wh.owner?.id === client.user?.id &&
								wh.type === WebhookType.Incoming,
						);

						if (existingWebhook) {
							return new WebhookClient({ url: existingWebhook.url! });
						}

						const newWebhook = await (channel as TextChannel).createWebhook({
							name: message.author.username,
							avatar: message.author.displayAvatarURL(),
							reason: "Webhook refresh",
						});

						return new WebhookClient({ url: newWebhook.url! });
					}

					if (channel) {
						const wc = await getWebhook();

						const payload: BaseMessageOptions = {
							embeds:
								message.embeds.length > 0 ? message.embeds.map((x) => x) : [],
							files: message.attachments.map(
								(a) => new AttachmentBuilder(a.url, { name: a.name }),
							),
							content: isForward
								? `-# *This message was forwarded.*\n\n${message.content}`
								: originalContent,
							components:
								message.components.length > 0
									? message.components.map((x) => x)
									: [],
							allowedMentions: { parse: [] },
						};

						try {
							await wc.send(payload);
						} catch (e) {
							const errMsg = `There was an error sending your message. Please contact **@kyvrixon** (<@981755777754755122>).\n\n${(e as Error).message}`;
							await (message.channel as DMChannel).send(errMsg);
						}
					} else {
						userData.closed = true;
						await db.write("mails/" + userData.ID, userData);
						const msg =
							"Seems like I cannot find the channel for this mail.\n\nYour ticket has been closed.";
						await (message.channel as DMChannel).send(msg);
					}

					processLock.delete(message.author.id);
				} else {
					// No open ticket
					const cooldown = ticketCooldowns.get(message.author.id);
					if (cooldown && Date.now() < cooldown.time) {
						const timeLeft = formatSeconds(
							(cooldown.time - Date.now()) / 1000,
							{
								format: "short",
								includeZeroUnits: false,
								onlyUnits: ["m", "s"],
							},
						);

						await (message.channel as DMChannel).send({
							content: `Slow down! You can open another ticket in **${timeLeft}**.`,
						});
						processLock.delete(message.author.id);
						return;
					}

					try {
						const confirmationMsg = await message.reply({
							embeds: [
								new EmbedBuilder()
									.setDescription(
										`You are about to create a new ticket with the above message. Are you sure you want to continue?\n\n> Expires in <t:${Math.floor((Date.now() + 15 * 1000) / 1000)}:R>`,
									)
									.setTitle("✉️ Information")
									.setColor("#f3b3c3"),
							],
							components: [
								new ActionRowBuilder<ButtonBuilder>().addComponents(
									new ButtonBuilder()
										.setCustomId("dm_mail_yes")
										.setStyle(ButtonStyle.Success)
										.setLabel("Yes"),
									new ButtonBuilder()
										.setCustomId("dm_mail_no")
										.setStyle(ButtonStyle.Danger)
										.setLabel("No"),
								),
							],
						});

						const collector = confirmationMsg.createMessageComponentCollector({
							filter: (i) => i.user.id === message.author.id,
							time: 15 * 1000,
							componentType: 2,
						});

						confirmations.add(message.author.id);

						collector.on("end", async (collected) => {
							if (collected.size === 0) {
								confirmations.delete(message.author.id);
								await confirmationMsg.edit({
									embeds: [
										new EmbedBuilder()
											.setDescription(
												`~~You are about to create a new ticket with the above message. Are you sure you want to continue?~~\n\n> ~~Expires in <t:${Math.floor((Date.now() + 15 * 1000) / 1000)}:R>~~`,
											)
											.setTitle("~~✉️ Information~~")
											.setColor("#f3b3c3"),
									],
									components: [
										new ActionRowBuilder<ButtonBuilder>().addComponents(
											new ButtonBuilder()
												.setCustomId("ghaldgralrgadg412412")
												.setStyle(ButtonStyle.Secondary)
												.setLabel("Operation cancelled.")
												.setDisabled(true),
										),
									],
								});
							}
						});

						collector.on("collect", async (i) => {
							collector.stop();
							confirmations.delete(message.author.id);
							await handleButton(client, i, message);
							return;
						});

						processLock.delete(message.author.id);
						return;
					} catch (err: unknown) {
						console.error("Failed to create ticket: ", err);
						const error = err as Error;
						const errorMsg =
							`An error occured while trying to create a new ticket for you: \n` +
							`> \`${error.message}\`\n` +
							`-# Please contact **kyvrixon** (<@981755777754755122>) about this error!`;
						await (message.channel as DMChannel).send({ content: errorMsg });

						ticketCooldowns.delete(message.author.id);
						processLock.delete(message.author.id);
					}
				}
			} else {
				// Guild message
				const mailData_raw = (await db.groupRead("mails")) as Map<
					string,
					MailData
				>;
				if (!mailData_raw) {
					processLock.delete(message.author.id);
					return;
				}

				const mailData = Array.from(mailData_raw.values()).find(
					(mail) =>
						mail.channel === message.channel.id && mail.closed === false,
				) as MailData;

				if (!mailData) {
					// Ticket no longer exists in DB
					processLock.delete(message.author.id);
					return;
				}

				let user: User = client.users.cache.get(mailData.author)!;
				if (!user) {
					user = await client.users.fetch(mailData.author);
					if (!user) {
						mailData.closed = true;
						await Promise.all([
							db.write("mails/" + mailData.ID, mailData),
							message.reply(
								"I am unable to find the user for this ticket 💔\n-# This ticket has now been closed. Feel free to delete this channel!",
							),
						]);
					}
				}

				const permissionsCalculator = (member: GuildMember) => {
					const staffRoles = client.c.supportRoles;

					if (!staffRoles || staffRoles.length === 0) {
						return "Staff";
					}

					const sortedRoles = member.roles.cache
						.sort((a, b) => b.position - a.position)
						.map((role) => role.id);

					const highestRole = staffRoles.find((role) =>
						sortedRoles.includes(role.id),
					);

					const result = highestRole ? highestRole.name : "Staff";
					return result;
				};

				const perms = permissionsCalculator(message.member as GuildMember);

				const embed = new EmbedBuilder()
					.setAuthor({
						name: message.member!.nickname
							? `${message.member!.nickname} (${message.author.username})`
							: message.author.globalName!.toLowerCase() ===
										message.author.username.toLowerCase() ||
								  message.author.displayName.toLowerCase() ===
										message.author.username.toLowerCase()
								? `${message.author.username}`
								: `${message.author.displayName} (${message.author.username})`,
						iconURL: message.author.displayAvatarURL(),
					})
					.setDescription(message.content)
					.setFooter(footer("﹒" + perms))
					.setColor("#f7b5d7");

				const payload: BaseMessageOptions = {
					embeds:
						message.embeds.length > 0 ? message.embeds.map((x) => x) : [embed],
					files: message.attachments.map(
						(a) => new AttachmentBuilder(a.url, { name: a.name }),
					),
					content: isForward
						? `-# *This message was forwarded.*\n\n${message.content}`
						: undefined,
					components:
						message.components.length > 0
							? message.components.map((x) => x)
							: [],
					allowedMentions: { parse: [] },
				};

				try {
					const dm = await user.createDM();
					if (!dm) {
						throw new Error("Unable to create DM");
					}

					mailData.count.messages++;

					const existing = mailData.count.contributors.find(
						(x) => x.id === message.author.id,
					);

					if (existing) {
						existing.count++;
					} else {
						mailData.count.contributors.push({
							id: message.author.id,
							count: 1,
						});
					}

					const cacheBody: CacheMessage = {
						id: message.id,
						author: message.author.id,
					};

					await Promise.all([
						db.write("mails/" + mailData.ID, mailData),
						db.write("cache/messages/" + mailData.channel, cacheBody),
					]);

					await (dm as DMChannel).send(payload);
				} catch (e) {
					console.log(e); // cannot send empty message
					await message.reply({
						content: "The user has their DMs closed, or they blocked me!",
					});
				}

				processLock.delete(message.author.id);
			}
		} catch (e) {
			console.error("messageCreate: Failure: ", e);
			processLock.delete(message.author.id);
		}

		processLock.delete(message.author.id);
	},
};

async function autoresponseCheck(message: Message): Promise<true | void> {
	const triggerMessage = autoRespondersMap.get(message.content);
	if (triggerMessage) {
		await message.reply(triggerMessage);
	}
}

export default event;
