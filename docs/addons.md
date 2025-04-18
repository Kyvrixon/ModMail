[`👈 Back to home`](../README.md)

# 🕹️ Addons

This bot comes with easy and near infinite addon support! Below is two examples of commands and events for you to use, just within a few rules:

- 👉 Each addon and their relevent files must be inside of their own folder at `addons/myAddon`.
  - Doesn't matter what the folder name is!
- 👉 Command file names must start with `cmd_`.
- 👉 Event file names must start with `event_`.

Addon files can be in normal TypeScript or in vanilla JavaScript!

### Command

```typescript
import { SlashCommandBuilder } from "discord.js";

const cmd: BotCommand = {
	/* Restrict to developer(s) only? */
	isDev: true,
	/**
	 * Where this command is allowed to be used.
	 *
	 * `"dm"` - Allowed in dms.
	 * `"guild"` - Allowed in guilds.
	 */
	data: new SlashCommandBuilder()
		.setName("") // name of the command
		.setDescription("") // description

		/* Set where this command can be used.*/
		.setContexts([
			/* Just comment out a number to remove it */
			0, // guilds,
			1, // dms
		])

		/* Command options */
		.addStringOption((option) =>
			option
				.setName("string")
				.setDescription("a string option")
				.setRequired(true)
				.setAutocomplete(false) // keep off if your command does not use autocomplete.
				.addChoices([
					{
						name: "", // Name - shows up to users
						value: "", // value - internal use only
					},
				]),
		)
		// whole numbers only
		.addIntegerOption((option) =>
			option
				.setName("integer")
				.setDescription("an integer option")
				.setRequired(true),
		)
		.addNumberOption((option) =>
			option
				.setName("number")
				.setDescription("a number option")
				.setRequired(true),
		)
		.addBooleanOption((option) =>
			option
				.setName("boolean")
				.setDescription("a boolean option")
				.setRequired(true),
		)
		.addUserOption((option) =>
			option.setName("user").setDescription("a user option").setRequired(true),
		)
		.addChannelOption((option) =>
			option
				.setName("channel")
				.setDescription("a channel option")
				.setRequired(true)
				.addChannelTypes([
					/**
					 * Please see the below link, only use the ID field, not the name
					 * https://discord.com/developers/docs/resources/channel#channel-object-channel-types
					 */
					0, // normal text
					2, // VC's
				]),
		)
		.addRoleOption((option) =>
			option.setName("role").setDescription("a role option").setRequired(true),
		)
		.addMentionableOption((option) =>
			option
				.setName("mentionable")
				.setDescription("a mentionable option")
				.setRequired(true),
		)
		.addAttachmentOption((option) =>
			option
				.setName("attachment")
				.setDescription("an attachment option")
				.setRequired(true),
		),
	execute: async (client, interaction) => {
		// Command logic
	},
	autocomplete: async (client, interaction) => {
		// option autocomplete logic for string options
	},
};

export default cmd;
```

### Event

Very very simple, this is just a function that gets executed once upon bot startup. A lot you can do here.

If you use any events from discord.js, **please ensure you add strong type checking** as I can only do so much to ensure addons dont conflict with base operation of the bot!

```typescript
const run: AddonEvent = async (client) => {
	// Event logic here
};

export default run;
```
