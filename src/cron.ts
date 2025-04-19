import cron from "node-cron";

cron.schedule(
	"* * * * *",
	() => {
		for (const [key, value] of messageCooldowns) {
			if (value.time < Date.now()) {
				messageCooldowns.delete(key);
			}
			continue;
		}
		return;
	},
	{
		name: "Message cooldown removal",
	},
);

cron.schedule(
	"* * * * *",
	() => {
		for (const [key, value] of ticketCooldowns) {
			if (value.time < Date.now()) {
				ticketCooldowns.delete(key);
			}
			continue;
		}
		return;
	},
	{
		name: "Ticket cooldown removal",
	},
);
