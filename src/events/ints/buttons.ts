import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonInteraction,
	ButtonStyle,
	EmbedBuilder,
	Message,
	MessageFlags,
	TextChannel,
} from "discord.js";
import db from "../../db.js";
import { formatSeconds } from "../../utils.js";
import createNewTicket from "../handlers/createNewTicket.js";

const handleButton = async (
	client: Bot,
	interaction: ButtonInteraction,
	message?: Message,
): Promise<void> => {
	const userMsg = message;
	switch (interaction.customId) {
		// New ticket confirmaton - yes
		case "dm_mail_no": {
			await interaction.message.edit({
				embeds: [
					new EmbedBuilder()
						.setTitle("~~✉️ Information~~")
						.setDescription(
							"~~You are about to create a new ticket with the above message.~~\n\n~~**Do you want to continue?**\n> Auto cancels " +
								`<t:${Math.floor(Date.now() / 1000 + 15 * 1000)}:R>~~`,
						),
				],
				components: [
					new ActionRowBuilder<ButtonBuilder>().addComponents(
						new ButtonBuilder()
							.setCustomId("dm_mail_yes")
							.setStyle(ButtonStyle.Secondary)
							.setLabel("Cancelled")
							.setDisabled(true),
					),
				],
			});
			break;
		}

		// New ticket confirmaton - no
		case "dm_mail_yes": {
			const blacklistData = await db.read<DB_Blacklist>(
				"blacklists/" + interaction.user.id,
			);
			if (blacklistData) {
				const { expires, reason } = blacklistData;
				await interaction.message.edit({
					embeds: [
						new EmbedBuilder()
							.setColor("Red")
							.setTitle("⛔ Oh no!")
							.setDescription(
								"> It seems like you are blacklisted from using me!",
							)
							.addFields([
								{
									name: "🔎 Information",
									value: expires
										? `> **Expires in:** ${formatSeconds(expires, {
												format: "short",
												onlyUnits: ["d", "h", "m", "s"],
												includeZeroUnits: false,
											})}\n`
										: `` + `> **Reason:** ${reason.slice(0, 2000)}`,
									inline: false,
								},
							]),
					],
					components: [],
					content: undefined,
				});
				break;
			}

			await interaction.message.edit({
				embeds: [
					new EmbedBuilder().setDescription(
						"Creating your ticket. Please wait ...",
					),
				],
				components: [],
			});

			await createNewTicket(client, userMsg!);

			await interaction.message.edit({
				embeds: [
					new EmbedBuilder()
						.setTitle("✉️ New Mail Created!")
						.setDescription(
							"Thankyou for creating a ticket! Please wait patiently for a staff member to assist you!",
						),
				],
				components: [
					new ActionRowBuilder<ButtonBuilder>().addComponents(
						new ButtonBuilder()
							.setCustomId("tutorial")
							.setStyle(ButtonStyle.Secondary)
							.setLabel("How to use me (soon)")
							.setDisabled(true),
					),
				],
			});
			break;
		}

		case "ticket-close": {
			const data = await db.groupRead("mails");
			const maildata = (
				Array.from(data?.values() || []) as Array<MailData> | []
			).find(
				(mail) =>
					mail.closed === false && mail.channel === interaction.channel!.id,
			);
			if (!data) {
				await interaction.reply({
					content:
						"Seems like there was no data for this mail. Deleting channel in 5 seconds.",
					flags: MessageFlags.Ephemeral,
				});

				setTimeout(async () => {
					await (interaction.channel as TextChannel)
						.delete("Mail closed (No data found)")
						.catch(() => null);
				}, 5 * 1000);

				return;
			}
		}
		default: {
			break;
		}
	}

	return;
};

export default handleButton;
