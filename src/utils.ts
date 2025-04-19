import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	ComponentType,
	DMChannel,
	EmbedBuilder,
	GuildMember,
	MessageFlags,
	ModalBuilder,
	TextChannel,
	TextInputBuilder,
	TextInputStyle,
} from "discord.js";

export const formatSeconds: Utils["formatSeconds"] = (seconds, options) => {
	const { includeZeroUnits, onlyUnits, format } = options ?? {
		includeZeroUnits: true,
		format: "long",
	};

	if (typeof seconds === "string") {
		seconds = parseInt(seconds as string);
	}

	seconds = Math.ceil(seconds);

	const unitsToDisplay =
		onlyUnits && Array.isArray(onlyUnits) && onlyUnits.length > 0
			? onlyUnits
			: ["y", "w", "d", "h", "m", "s"];

	const units = [
		{ value: 365 * 24 * 60 * 60, labels: ["year", "y"] },
		{ value: 7 * 24 * 60 * 60, labels: ["week", "w"] },
		{ value: 24 * 60 * 60, labels: ["day", "d"] },
		{ value: 60 * 60, labels: ["hour", "h"] },
		{ value: 60, labels: ["minute", "m"] },
		{ value: 1, labels: ["second", "s"] },
	];

	let remaining = seconds;
	const parts: string[] = [];

	for (const { value, labels } of units) {
		const shortLabel = labels[1];

		if (!unitsToDisplay.includes(shortLabel)) continue;

		const count = Math.floor(remaining / value);
		remaining %= value;

		if (
			count > 0 ||
			(includeZeroUnits && unitsToDisplay.includes(shortLabel))
		) {
			if (format === "short") {
				parts.push(`${count}${shortLabel}`);
			} else {
				const label = count === 1 ? labels[0] : `${labels[0]}s`;
				parts.push(`${count} ${label}`);
			}
		} else if (includeZeroUnits && unitsToDisplay.includes(shortLabel)) {
			if (format === "short") {
				parts.push(`0${shortLabel}`);
			} else {
				const label = shortLabel === "s" ? "second" : `${shortLabel}s`;
				parts.push(`0 ${label}`);
			}
		}
	}

	if (parts.length === 0 && unitsToDisplay.length > 0) {
		return unitsToDisplay.map((unit) => `0 ${unit}`).join(", ");
	}

	let output = "";

	if (format === "long") {
		output =
			parts.length === 1
				? parts[0]
				: parts.slice(0, -1).join(", ") + " and " + parts.slice(-1);
	} else {
		output = parts.join(" ");
	}

	return output.trim();
};

export const delay: Utils["delay"] = (ms) => {
	return new Promise((resolve) => setTimeout(resolve, ms));
};

export const footer: Utils["footer"] = (text, pic) => {
	return {
		text: `${text || ""}\n© 2025 Kyvrixon`,
		icon_url: pic || undefined,
	};
};

export const genId: Utils["genId"] = (length: number): string => {
	const characters =
		"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	let result = "";
	for (let i = 0; i < length; i++) {
		const randomIndex = Math.floor(Math.random() * characters.length);
		result += characters[randomIndex];
	}
	return result;
};

export const createLeaderboard: Utils["createLeaderboard"] = async (
	title,
	list,
	interaction,
	pageCount = 5,
	footerText,
	ephemeral = false,
	metadata,
	extras,
) => {
	try {
		const uID = genId(6);

		if (list.length === 0) {
			if (!interaction.replied && !interaction.deferred) {
				return await interaction.reply({
					embeds: [
						new EmbedBuilder()
							.setTitle(title)
							.setDescription("No data to be shown.")
							.setColor("DarkButNotBlack")
							.setFooter(footer(footerText)),
					],
					flags: ephemeral ? MessageFlags.Ephemeral : undefined,
				});
			} else {
				return await interaction.editReply({
					embeds: [
						new EmbedBuilder()
							.setTitle(title)
							.setDescription("No data to be shown.")
							.setColor("DarkButNotBlack")
							.setFooter(footer(footerText)),
					],
				});
			}
		}

		if (pageCount <= 0) {
			throw new Error("pageCount must be greater than zero.");
		}
		const totalPages = Math.ceil(list.length / pageCount);
		let currentIndex = 0;

		const generateEmbed = (start: number) => {
			let data: _Embed = {};
			if (metadata && metadata.length > 0) {
				data = metadata[start] || {};
			}

			const embed = new EmbedBuilder().setFooter(
				footer(data.footer?.text || footerText),
			);

			if (data?.thumbnail && /^https?:\/\//.test(data.thumbnail)) {
				embed.setThumbnail(data.thumbnail);
			}

			// generics
			embed
				.setTitle(title)
				.setDescription(list.slice(start, start + pageCount).join("\n"))
				.setColor(data.color ?? "DarkButNotBlack");

			if (data?.author && data?.author?.name) {
				embed.setAuthor(data?.author);
			}

			if (data?.timestamp) {
				embed.setTimestamp(data?.timestamp !== null ? data?.timestamp : null);
			}

			if (
				data?.fields &&
				Array.isArray(data?.fields) &&
				data?.fields.length > 0
			) {
				embed.addFields(data?.fields);
			}

			return embed;
		};

		const getPaginationRow = (
			currentIndex: number,
		): Array<ActionRowBuilder<ButtonBuilder>> => {
			const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
				new ButtonBuilder()
					.setCustomId(`${uID}_back_button`)
					.setLabel("Prev")
					.setStyle(ButtonStyle.Secondary)
					.setDisabled(currentIndex === 0),
				new ButtonBuilder()
					.setCustomId(`${uID}_page_info`)
					.setLabel(`${Math.floor(currentIndex / pageCount) + 1}/${totalPages}`)
					.setStyle(ButtonStyle.Secondary)
					.setDisabled(totalPages === 1),
				new ButtonBuilder()
					.setCustomId(`${uID}_forward_button`)
					.setLabel("Next")
					.setStyle(ButtonStyle.Secondary)
					.setDisabled(currentIndex + pageCount >= list.length),
			);

			const row1 = extras?.[currentIndex];

			return row1 ? [row, row1] : [row];
		};

		try {
			if (!interaction.replied || !interaction.deferred) {
				await interaction
					.deferReply({
						withResponse: true,
						flags: ephemeral ? MessageFlags.Ephemeral : undefined,
					})
					.catch(() => null);
			}

			const b = generateEmbed(currentIndex);
			const c = getPaginationRow(currentIndex);
			await interaction.editReply({
				content: null,
				embeds: [b],
				components: c,
			});
		} catch (e) {
			throw new Error("Failed to generate pagination: " + (e as Error).message);
		}

		const collector = (
			interaction.channel as TextChannel | DMChannel
		).createMessageComponentCollector({
			componentType: ComponentType.Button,
			time: 60000,
		});

		collector.on("collect", async (btn) => {
			if (
				![
					uID + "_back_button",
					uID + "_page_info",
					uID + "_forward_button",
				].includes(btn.customId)
			) {
				return;
			}

			if (btn.user.id !== interaction.user.id) {
				collector.resetTimer();
				return btn.reply({
					content: "This ain't yours bucko, hands off!",
					flags: MessageFlags.Ephemeral,
				});
			}

			if (btn.customId === uID + "_page_info") {
				collector.resetTimer();
				const modal = new ModalBuilder()
					.setCustomId(uID + "_page_modal")
					.setTitle("Page Indexer")
					.addComponents(
						new ActionRowBuilder<TextInputBuilder>().addComponents(
							new TextInputBuilder()
								.setCustomId(uID + "_page_number")
								.setLabel("Enter page number")
								.setStyle(TextInputStyle.Short)
								.setRequired(true),
						),
					);

				await btn.showModal(modal);
				const modalSubmit = await btn
					.awaitModalSubmit({ time: 15000 })
					.catch(() => null);

				if (!modalSubmit) {
					collector.resetTimer();
					return btn.followUp({
						content: "Modal timed out. Please try again.",
						flags: MessageFlags.Ephemeral,
					});
				}

				await modalSubmit.deferUpdate();

				const pageNumber = parseInt(
					modalSubmit.fields.getTextInputValue(uID + "_page_number"),
					10,
				);

				if (isNaN(pageNumber) || pageNumber < 1 || pageNumber > totalPages) {
					collector.resetTimer();
					await modalSubmit.reply({
						content: `Invalid page number! Please choose a number between 1 and ${totalPages}.`,
						flags: MessageFlags.Ephemeral,
					});
					return;
				}

				currentIndex = (pageNumber - 1) * pageCount;
			} else {
				if (btn.customId === uID + "_back_button") {
					currentIndex = Math.max(0, currentIndex - pageCount);
				} else if (btn.customId === uID + "_forward_button") {
					currentIndex = Math.min(list.length - 1, currentIndex + pageCount);
				}

				await btn.deferUpdate().catch(() => null);
			}

			const b = generateEmbed(currentIndex);
			const c = getPaginationRow(currentIndex);
			await interaction.editReply({
				content: null,
				embeds: [b],
				components: c,
			});
		});

		collector.on("end", async () => {
			try {
				await interaction.editReply({
					components: [
						new ActionRowBuilder<ButtonBuilder>().addComponents(
							new ButtonBuilder()
								.setCustomId(uID + "_expired")
								.setLabel("Expired")
								.setStyle(ButtonStyle.Secondary)
								.setDisabled(true),
						),
					],
				});
			} catch { }
		});
	} catch (e) {
		console.error("Failed to generate pagination: " + (e as Error).message);
		return;
	}
};

export const permCalc: Utils["permCalc"] = (member: GuildMember) => {
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

export default {
	formatSeconds,
	delay,
	footer,
	permCalc
};
