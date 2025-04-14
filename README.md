> [!IMPORTANT]
> This project is still incomplete and not ready for public use _just yet_! Do leave a star on this repository if you wish, it would mean so much to me! 💖

<h1 align="center">

<img alt="Static Badge" src="https://img.shields.io/badge/version-not_yet!-red" />

No bloat, Discord Modmail

</h1>

A fast, efficient, zero bloat DM-based ModMail system for Discord!

I made this bot originally on commission but it was so good I decided to further work on it and make it open source for everyone looking for a better option to a million configurations or features you don't need!

<h2 align="center">✨ Features</h2>

- `🚀` **DM-first ticket system** – no threads or clutter
- `📁` **Transcript logging** – stored in Discord _and_ locally
- `🚫` **Blacklist** – block users with reasons and timers
- `⏳` **Cooldowns** – prevent message or ticket spam
- `💪` **Typed, modular config** – `config.ts` at root, no surprises
- `📨` **Autoresponders** – easy, quick message snippets!
- `🪶` **Lightweight** – fast, low dependency, no bloat codebase!

<h2 align="center">📦 Installation</h2>

> [!NOTE]
> Recommended to use latest Node LTS versions (v22.14.0 at time of writing)

```bash <br />
npm install --force
npm run start
```

<h2 align="center">⚙️ Config</h2>

Rename `config.ts.example` → `config.ts`, then fill in values. Types will help prevent misconfig errors.

<h2 align="center">🪄 Slash Commands</h2>

🛠️ = Coming soon

| Command | Description |
| --- | --- |
| `/blacklist` 🛠️ | Block users from contacting the bot with timers & reason |
| `/mails` 🛠️ | Lookup open/closed mail history |
| `/appeal` 🛠️ | Appeal a blacklist |
| `/update` 🛠️ | Check if the bot has an update or refresh configs |

<h2 align="center">🔨 Moderation Features</h2>

- `✅` Blacklist system with timers & reasons
- `🧾` Appeals system _(coming soon)_
- `⌛` Cooldowns between messages and ticket creation
- `🪪` Identity toggle for mod replies _(planned)_
- `✏️` Ability to edit previously sent messages _(soon)_
- `📝` Transcripts stored in Discord and locally as `.html` with media

<h2 align="center">🔐 Permissions</h2>

> [!WARNING]
> Best used with **administrator** permission.
> Full permission checks are under development and currently will cause errors without.

<h2 align="center">🧑‍💻 Contributing</h2>

- `1️⃣` Fork this repo, it makes it so much easier
- `2️⃣` No bugs: please test your code fully
- `3️⃣` Pass `eslint` and `prettier` checks
- `4️⃣` Comment and document everything you do and **why**
- `5️⃣` Keep it modular
- `6️⃣` Keep commits relevant

<h2 align="center">💡 Roadmap</h2>

- [ ] More configs
- [ ] Permission checks
- [ ] Identity toggling for staff
- [ ] (?) Plugin support
- [ ] Embed and message style configuration
  - [ ] (?) Possible language support

<h2 align="center">❓ FAQ</h2>

**What if my config errors?**<br />

> It’s likely you gave a value the wrong type. The config is strongly typed. Read the comments and try again.

**Is there a config template?**<br />

> Yes! See `config.ts.example` in the root directory.

**Where are the logs stored?**<br />

> In a Discord log channel and also in `src/db/transcripts`.

<h2 align="center">📜 License</h2>

Licensed under the **AGPL-3.0** license.<br />
You are free to contribute, fork, and modify, but you **must**:

- Provide proper **attribution**
- Keep your modifications **open source**
- Include the original license in any forks

⚠️ **All and any violations will incur legal action!**

Read the [`LICENSE`](./LICENCE) file for full legal details.
