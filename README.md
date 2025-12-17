<div align="center">

# Primal-Ape Bot

![Primal Ape]([./primal.jpeg](https://files.catbox.moe/n8h8fs.webp))

<p align="center">
  <a href="https://github.com/xodo2fast4u">
    <img src="https://img.shields.io/github/repo-size/xodo2fast4u/primal-ape?style=for-the-badge&logo=github&logoColor=white&label=Repo%20Size" alt="GitHub Repo Size">
  </a>
  <a href="https://www.npmjs.com/package/baileys-mod">
    <img src="https://img.shields.io/npm/v/baileys-mod?style=for-the-badge&logo=npm&logoColor=white&label=Baileys--Mod" alt="Baileys-Mod Version">
  </a>
  <a href="https://github.com/xodo2fast4u/primal-ape/stargazers">
    <img src="https://img.shields.io/github/stars/xodo2fast4u/primal-ape?style=for-the-badge&logo=github&logoColor=white&label=Stars" alt="GitHub Stars">
  </a>
  <a href="https://github.com/xodo2fast4u/primal-ape/blob/main/LICENSE">
    <img src="https://img.shields.io/github/license/xodo2fast4u/primal-ape?style=for-the-badge&logo=github&logoColor=white&label=License" alt="License">
  </a>
</p>

</div>

Primal Ape is a modular Node.js chat-bot that helps automate routine group tasks, boosts engagement with economy and entertainment features, and makes it easy to extend functionality with focused command modules.

Why this matters

- Saves moderators time by automating repetitive actions (moderation, link revocation, group settings).
- Keeps communities active with mini-games and economy features that encourage participation.
- Provides a clear structure that lowers the cost of adding features or fixing bugs.

## What it does

- Moderation: promote/demote, kick, ban, lock/unlock groups, and manage join requests.
- Economy & engagement: virtual currency, shop, daily rewards, leaderboards, and simple games.
- Utilities: stickers, media commands, profile management, search and developer tools.

## Repo layout

- `prime.js` — main entry point to start the bot.
- `use-sqlite-file-auth-state.js` — auth state helper (SQLite-backed storage).
- `commands/` — modular command files grouped by category (admin, chat, economy, group, info, maker, music, tools).
- `lib/` — shared utilities and helpers.

## Quick start

1. Install dependencies

```cmd
npm install
```

2. Start the bot

```cmd
node prime.js
```

If `prime.js` accepts flags or a config path, run `node prime.js --help` or open the file to confirm.

## Commands

Commands live inside `commands/` and follow a consistent handler pattern. Examples:

- `admin/` — moderation helpers
- `chat/` — profile and chat utilities
- `economy/` — balance, shop, daily, work, leaderboard
- `group/` — invite/link management and group info
- `maker/` — sticker and media generation
- `music/` — play, search, lyrics
- `tools/` — converters, HTTP tools, QR, TTS, and more

Open any command file to see the exact input/output contract for that handler.

## Contribution & expectations

When you contribute, explain the problem you solved and the value your change delivers.

Minimal checklist for contributions:

1. Open an issue for larger features or bugs (smaller fixes may go straight to a branch).
2. Create a branch: `git checkout -b feat/short-description`.
3. Implement your change and include tests if applicable.
4. Run project locally and verify the behavior.
5. Open a PR with a clear title and the checklist above.

See `CONTRIBUTING.md` for more detail on coding style, PR format, and how to describe impact in PRs.

## Troubleshooting

- If the bot doesn't start: check `prime.js` for missing environment variables or thrown errors logged to console.
- If commands behave unexpectedly: open the specific command file and check assumptions about `data/` files or permissions.
- Verify Node.js version if native modules or specific language features are used.

## License

This project is licensed under the [MIT License](LICENSE).
