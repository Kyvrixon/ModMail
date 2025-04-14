import { Message } from "discord.js";
import db from "../../db.js";

type T = (client: Bot, message: Message) => Promise<void>;
export const editMessage: T = async (client, message) => {
	const mailData = (await db.groupRead("mails")) as Map<string, MailData>;
	if (!mailData) return;
	const userData = Array.from(mailData.values()).find(
		(mail) => mail.author === message.author.id && !mail.closed,
	);
	if (!userData) return;

	const cache = await db.read<any>("cache/messages/" + userData.channel);
	if (!cache) return;

	return;
};

export default editMessage;
