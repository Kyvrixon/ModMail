import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	GuildMember,
	PartialGuildMember,
	TextChannel,
} from "discord.js";
import db from "../db.js";

const event: BotEvent = {
	name: "guildMemberRemove",
	once: false,
	run: async (client, member: GuildMember | PartialGuildMember) => {
		if (member.partial) {
			try {
				await member.fetch(true);
			} catch {}
		}

		const rawMailData =
			((await db.groupRead("mails")) as Map<string, MailData>) || undefined;
		if (!rawMailData) return;

		const data = Array.from(rawMailData.values()).filter(
			(mail) => mail.author === member.id,
		)[0];
		if (!data) return;

		const channel = Server.channels.cache.get(data.channel);
		if (!channel) return;

		await (channel as TextChannel).send({
			content:
				"Seems like the user left the server, do you want to close the ticket?\n-# If not, simply ignore this message.",
			components: [
				new ActionRowBuilder<ButtonBuilder>().addComponents(
					new ButtonBuilder()
						.setCustomId("mail_close")
						.setLabel("Yes")
						.setDisabled(false)
						.setStyle(ButtonStyle.Success),
				),
			],
		});
	},
};

export default event;
