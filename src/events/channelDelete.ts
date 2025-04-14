import {
	AuditLogEvent,
	DMChannel,
	EmbedBuilder,
	GuildChannel,
} from "discord.js";
import db from "../db.js";
import { footer } from "../utils.js";

const event: BotEvent = {
	name: "channelDelete",
	once: false,
	run: async (client, channel: DMChannel | GuildChannel) => {
		if (
			channel instanceof DMChannel ||
			channel.parent?.id !== client.c.categoryId ||
			!channel.name.startsWith("mail-")
		)
			return;

		const data =
			((await db.groupRead("mails")) as Map<string, MailData>) || undefined;
		if (!data) return;

		const validMail = Array.from(data.values()).filter(
			(mail) => mail.channel === channel.id && mail.closed === false,
		)[0];
		if (!validMail) return;

		validMail.closed = true;
		await db.write("mails/" + validMail.ID, validMail);

		ticketCooldowns.set(validMail.author, {
			time: client.c.ticketCooldown,
		});

		const user = await client.users.fetch(validMail.author);

		await user.createDM().catch(() => {
			return;
		});

		const audit = (
			await Server.fetchAuditLogs({
				type: AuditLogEvent.ChannelDelete,
				limit: 5,
			})
		).entries;
		if (!audit) return;

		const validAudit = audit.find(
			(a) => (a.target as GuildChannel).id === channel.id,
		);
		if (!validAudit) return;

		const { executor } = validAudit;

		let descText = "Thankyou for contacting us! Your mail has been closed";
		if (executor) {
			descText += ` by <@${executor.id}> (${executor.username})`;
		} else {
			descText += ".";
		}

		await user.send({
			// files: [transcriptFile],
			embeds: [
				new EmbedBuilder()
					.setTitle("✉️ Mail Closed")
					.setDescription(descText)
					.setFooter(
						footer(
							"You can open a new mail in 15 minutes from this being sent!",
						),
					),
			],
		});

		ticketCooldowns.set(validMail.author, {
			time: client.c.ticketCooldown,
		});
	},
};

export default event;
